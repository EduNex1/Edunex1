
const ALGO = { name: 'HMAC', hash: 'SHA-256' };
const enc = new TextEncoder();

async function signJWT(payload, secret) {
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), ALGO, false, ['sign']);
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    payload.exp = Math.floor(Date.now() / 1000) + 86400; // 24h
    const body = btoa(JSON.stringify(payload));
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`));
    return `${header}.${body}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}

async function verifyJWT(token, secret) {
    try {
        const [header, body, sig] = token.split('.');
        const key = await crypto.subtle.importKey('raw', enc.encode(secret), ALGO, false, ['verify']);
        const sigBuf = Uint8Array.from(atob(sig), c => c.charCodeAt(0));
        const valid = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(`${header}.${body}`));
        if (!valid) return null;
        const payload = JSON.parse(atob(body));
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch { return null; }
}

const DEFAULT_ALLOWED_ORIGINS = [
    'https://edunex1.vercel.app',
    'https://crm.edunex1.com',
];

function json(data, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' } });
}

const loginAttempts = new Map();
function checkLoginRateLimit(ip) {
    const now = Date.now();
    const key = ip || 'unknown';
    const entry = loginAttempts.get(key);
    if (entry && now - entry.start < 900000) { // 15 min window
        if (entry.count >= 10) return false; // max 10 attempts per 15 min
        entry.count++;
    } else {
        loginAttempts.set(key, { start: now, count: 1 });
    }
    if (loginAttempts.size > 1000) {
        for (const [k, v] of loginAttempts) { if (now - v.start > 900000) loginAttempts.delete(k); }
    }
    return true;
}

function toAbsoluteFileUrl(request, value) {
    if (!value || typeof value !== 'string') return value;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/api/files/')) return new URL(value, request.url).toString();
    return value;
}

function normalizePhotoUrls(request, record) {
    if (record && typeof record === 'object' && 'photo_url' in record) {
        record.photo_url = toAbsoluteFileUrl(request, record.photo_url);
    }
    return record;
}

function generatePassword(len = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => chars[b % chars.length]).join('');
}

const PASSWORD_HASH_PREFIX = 'pbkdf2_sha256';
const PASSWORD_HASH_ITERATIONS = 100000;

function toBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value) {
    return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}

function timingSafeEqual(a, b) {
    if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array) || a.length !== b.length) {
        return false;
    }
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
}

async function hashPassword(password, iterations = PASSWORD_HASH_ITERATIONS) {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    const key = await crypto.subtle.importKey('raw', enc.encode(String(password || '')), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt,
        iterations
    }, key, 256);
    return `${PASSWORD_HASH_PREFIX}$${iterations}$${toBase64(salt)}$${toBase64(bits)}`;
}

async function verifyPassword(password, storedHash) {
    if (!storedHash) return false;
    if (!storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
        return String(password || '') === storedHash;
    }
    const parts = storedHash.split('$');
    if (parts.length !== 4) return false;
    const iterations = Number(parts[1]);
    const salt = fromBase64(parts[2]);
    const expected = fromBase64(parts[3]);
    const key = await crypto.subtle.importKey('raw', enc.encode(String(password || '')), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt,
        iterations
    }, key, expected.length * 8);
    return timingSafeEqual(new Uint8Array(bits), expected);
}

function getJwtSecret(env) {
    return env.WORKER_JWT_SECRET || env.JWT_SECRET || '';
}

async function upgradePasswordHashIfNeeded(env, userId, password, storedHash) {
    if (!storedHash || storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`)) return;
    try {
        const nextHash = await hashPassword(password);
        await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(nextHash, userId).run();
    } catch (error) {
        console.warn('Password hash upgrade skipped:', error && error.message ? error.message : error);
    }
}

function roundCurrency(value) {
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

async function getStudentSlabs(env, branchId, classId, category, session) {
    const cat = category || 'Default';
    const sess = session || '';

    let { results: slabs } = await env.DB.prepare(
        `SELECT fs.amount, fp.months FROM fee_slabs fs LEFT JOIN fee_particulars fp ON fs.particular_id=fp.id WHERE fs.branch_id=? AND fs.class_id=? AND fs.category=? AND fs.session=? AND (fp.is_transport IS NULL OR fp.is_transport=0)`
    ).bind(branchId, classId, cat, sess).all();

    if (!slabs.length && sess) {
        ({ results: slabs } = await env.DB.prepare(
            `SELECT fs.amount, fp.months FROM fee_slabs fs LEFT JOIN fee_particulars fp ON fs.particular_id=fp.id WHERE fs.branch_id=? AND fs.class_id=? AND fs.category=? AND (fs.session IS NULL OR fs.session='') AND (fp.is_transport IS NULL OR fp.is_transport=0)`
        ).bind(branchId, classId, cat).all());
    }

    if (!slabs.length) {
        ({ results: slabs } = await env.DB.prepare(
            `SELECT fs.amount, fp.months FROM fee_slabs fs LEFT JOIN fee_particulars fp ON fs.particular_id=fp.id WHERE fs.branch_id=? AND fs.class_id=? AND fs.category='Default' AND (fs.session=? OR fs.session IS NULL OR fs.session='') AND (fp.is_transport IS NULL OR fp.is_transport=0)`
        ).bind(branchId, classId, sess).all());
    }
    return slabs;
}

function computeSlabAnnual(slabs) {
    return slabs.reduce((s, r) => {
        let mc = 12;
        try { const mp = typeof r.months === 'string' && r.months ? JSON.parse(r.months) : null; if (Array.isArray(mp)) mc = mp.length; } catch(e) {}
        return s + Number(r.amount || 0) * mc;
    }, 0);
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function monthNameToNumber(monthName) {
    const index = MONTH_NAMES.findIndex(m => m.toLowerCase() === String(monthName || '').toLowerCase());
    return index >= 0 ? String(index + 1).padStart(2, '0') : null;
}

function parseJsonObject(value) {
    if (!value) return {};
    if (typeof value === 'object') return value;
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function sumNumericValues(obj) {
    return roundCurrency(Object.values(obj || {}).reduce((sum, value) => sum + Number(value || 0), 0));
}

async function getOptionSettingsMap(env, branchId) {
    const { results } = await env.DB.prepare('SELECT setting_key, setting_value FROM option_settings WHERE branch_id=?').bind(branchId).all();
    return results.reduce((acc, row) => {
        acc[row.setting_key] = row.setting_value;
        return acc;
    }, {});
}

function getLatePenaltyFraction(penalty) {
    if (penalty === 'half') return 0.5;
    if (penalty === 'full') return 1;
    return 0.25;
}

async function getStaffAttendanceSummary(env, branchId, staffId, monthName, year) {
    const monthNo = monthNameToNumber(monthName);
    if (!monthNo || !year) return null;
    const prefix = `${year}-${monthNo}`;
    const { results } = await env.DB.prepare(
        'SELECT status, COUNT(*) as count FROM staff_attendance WHERE branch_id=? AND staff_id=? AND date LIKE ? GROUP BY status'
    ).bind(branchId, staffId, `${prefix}%`).all();
    if (!results.length) return null;
    const summary = { absent_days: 0, late_days: 0, half_days: 0 };
    results.forEach(row => {
        const count = Number(row.count || 0);
        if (row.status === 'A') summary.absent_days = count;
        if (row.status === 'L') summary.late_days = count;
        if (row.status === 'HD') summary.half_days = count;
    });
    return summary;
}

class Router {
    constructor() { this.routes = []; }
    add(method, path, handler) {
        const pattern = path
            .replace(/:(\w+)\+/g, '(?<$1>.+)')
            .replace(/:(\w+)/g, '(?<$1>[^/]+)');
        this.routes.push({ method, regex: new RegExp(`^${pattern}$`), handler });
    }
    get(p, h) { this.add('GET', p, h); }
    post(p, h) { this.add('POST', p, h); }
    put(p, h) { this.add('PUT', p, h); }
    delete(p, h) { this.add('DELETE', p, h); }
    match(method, path) {
        for (const r of this.routes) {
            if (r.method !== method) continue;
            const m = path.match(r.regex);
            if (m) return { handler: r.handler, params: m.groups || {} };
        }
        return null;
    }
}

async function authenticate(request, env) {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return verifyJWT(auth.slice(7), getJwtSecret(env));
}

async function getUserAssignedBranchIds(env, userId, fallbackBranchId) {
    const fallback = fallbackBranchId ? [Number(fallbackBranchId)] : [];
    try {
        const { results } = await env.DB.prepare('SELECT branch_id FROM user_branch_assignments WHERE user_id = ? ORDER BY is_primary DESC, id ASC').bind(userId).all();
        const ids = (results || []).map(r => Number(r.branch_id)).filter(Boolean);
        return ids.length ? ids : fallback;
    } catch {
        return fallback;
    }
}

function uniqueBranchIds(ids) {
    return Array.from(new Set((ids || []).map(v => Number(v)).filter(Boolean)));
}

async function setUserBranchAssignments(env, userId, branchIds, primaryBranchId) {
    const ids = uniqueBranchIds(branchIds && branchIds.length ? branchIds : [primaryBranchId]);
    if (!ids.length) return;
    try {
        await env.DB.prepare('DELETE FROM user_branch_assignments WHERE user_id = ?').bind(userId).run();
        for (const bid of ids) {
            await env.DB.prepare('INSERT OR REPLACE INTO user_branch_assignments (user_id, branch_id, is_primary) VALUES (?,?,?)')
                .bind(userId, bid, Number(bid) === Number(primaryBranchId) ? 1 : 0).run();
        }
    } catch {
    }
}

async function logActivity(env, entry) {
    const branchId = entry.branch_id || null;
    const userId = entry.user_id || null;
    const userName = entry.user_name || '';
    const activity = entry.activity || '';
    const ipAddress = entry.ip_address || 'unknown';
    const actionType = entry.action_type || 'other';
    if (!activity) return;
    try {
        await env.DB.prepare('INSERT INTO activity_log (branch_id, user_id, user_name, activity, ip_address, action_type) VALUES (?,?,?,?,?,?)')
            .bind(branchId, userId, userName, activity, ipAddress, actionType).run();
    } catch {
        await env.DB.prepare('INSERT INTO activity_log (branch_id, user_id, user_name, activity, ip_address) VALUES (?,?,?,?,?)')
            .bind(branchId, userId, userName, activity, ipAddress).run();
    }
}

function isAdminRole(user) {
    return ['super_admin', 'branch_admin'].includes(user.role);
}


async function getEffectiveBranchId(req, env, user) {
    const url = new URL(req.url);
    const requested = url.searchParams.get('branch_id');
    if (user.role === 'super_admin') return requested || '';
    if (!requested) return user.branch_id;

    const assignedIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
    if (assignedIds.map(String).includes(String(requested))) return requested;
    return user.branch_id;
}

async function getWritableBranchId(req, env, user, explicitBranchId) {
    const requested = Number(explicitBranchId || new URL(req.url).searchParams.get('branch_id') || 0);
    if (user.role === 'super_admin') {
        return requested || Number(user.branch_id || 0) || 1;
    }
    const assignedIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
    if (requested && assignedIds.map(Number).includes(requested)) {
        return requested;
    }
    return Number(user.branch_id || assignedIds[0] || 1);
}

async function userCanAccessBranch(env, user, branchId) {
    const targetBranchId = Number(branchId || 0);
    if (!user || !targetBranchId) return false;
    if (user.role === 'super_admin') return true;
    const assignedIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
    return assignedIds.map(Number).includes(targetBranchId);
}

function normalizeExamName(value) {
    return String(value || '').trim();
}

async function syncBranchExamsFromMaster(env, branchId) {
    const resolvedBranchId = Number(branchId || 0);
    if (!resolvedBranchId) return [];
    const { results: masterRows } = await env.DB.prepare(
        'SELECT id, name FROM exam_names WHERE branch_id=? ORDER BY id ASC'
    ).bind(resolvedBranchId).all();
    if (!masterRows.length) return [];

    const { results: examRows } = await env.DB.prepare(
        'SELECT id, name FROM exams WHERE branch_id=?'
    ).bind(resolvedBranchId).all();
    const existingNames = new Set(
        (examRows || [])
            .map(row => normalizeExamName(row.name).toLowerCase())
            .filter(Boolean)
    );

    const inserts = [];
    for (const master of masterRows) {
        const examName = normalizeExamName(master.name);
        if (!examName) continue;
        const key = examName.toLowerCase();
        if (existingNames.has(key)) continue;
        existingNames.add(key);
        inserts.push(
            env.DB.prepare('INSERT INTO exams (branch_id, name, group_id, session) VALUES (?,?,?,?)')
                .bind(resolvedBranchId, examName, null, '')
        );
    }

    if (inserts.length) {
        await env.DB.batch(inserts);
    }

    const { results } = await env.DB.prepare(
        'SELECT * FROM exams WHERE branch_id=? ORDER BY id DESC'
    ).bind(resolvedBranchId).all();
    return results || [];
}

function getAllowedOrigins(env) {
    const configured = String(env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    return new Set(configured.length ? configured : DEFAULT_ALLOWED_ORIGINS);
}

async function getFileAccessUser(request, env) {
    const authUser = await authenticate(request, env);
    if (authUser) return authUser;
    const token = new URL(request.url).searchParams.get('auth_token');
    if (!token) return null;
    return verifyJWT(token, getJwtSecret(env));
}

async function ensureBranchAccess(env, user, table, id) {
    const record = await env.DB.prepare(`SELECT branch_id FROM ${table} WHERE id=?`).bind(id).first();
    if (!record) return { error: 'Not found', status: 404 };
    if (!(await userCanAccessBranch(env, user, record.branch_id))) {
        return { error: 'Forbidden', status: 403 };
    }
    return record;
}

function textResponse(body, status = 200) {
    return new Response(body, {
        status,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-store'
        }
    });
}

function normalizeDeviceSerial(value) {
    return String(value || '').trim();
}

function formatAdmsDateTime(date = new Date()) {
    const ist = new Date(date.getTime() + 330 * 60000);
    return ist.toISOString().slice(0, 19).replace('T', ' ');
}

function nowSql() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function isOnlineLastSeen(value) {
    if (!value) return false;
    const parsed = Date.parse(String(value).replace(' ', 'T') + 'Z');
    if (Number.isNaN(parsed)) return false;
    return Date.now() - parsed <= 10 * 60 * 1000;
}

function getRequestSerial(req) {
    const url = new URL(req.url);
    return normalizeDeviceSerial(url.searchParams.get('SN') || url.searchParams.get('sn') || url.searchParams.get('SerialNumber') || '');
}

async function getDeviceBySerial(env, serial) {
    if (!serial) return null;
    return env.DB.prepare('SELECT * FROM devices WHERE serial_number=?').bind(serial).first();
}

async function logUnknownDevice(env, req, serial, payload = '') {
    try {
        const url = new URL(req.url);
        await env.DB.prepare('INSERT INTO unknown_device_logs (serial_number, endpoint, method, query_string, payload) VALUES (?,?,?,?,?)')
            .bind(serial || '', url.pathname, req.method, url.searchParams.toString(), String(payload || '').slice(0, 8000)).run();
    } catch {}
}

function getRequestIp(req) {
    return String(req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || '').split(',')[0].trim();
}

async function logAdmsRequest(env, req, serial, device, payload = '') {
    try {
        const url = new URL(req.url);
        await env.DB.prepare(`INSERT INTO adms_request_logs
            (serial_number, device_id, endpoint, method, query_string, user_agent, ip_address, payload_preview)
            VALUES (?,?,?,?,?,?,?,?)`)
            .bind(
                serial || '',
                device && device.id ? device.id : null,
                url.pathname,
                req.method,
                url.searchParams.toString(),
                String(req.headers.get('User-Agent') || '').slice(0, 500),
                getRequestIp(req),
                String(payload || '').slice(0, 1000)
            ).run();
    } catch {}
}

async function markDeviceSeen(env, serial) {
    if (!serial) return null;
    const device = await getDeviceBySerial(env, serial);
    if (!device) return null;
    await env.DB.prepare("UPDATE devices SET last_seen=datetime('now'), status='online', updated_at=datetime('now') WHERE serial_number=?")
        .bind(serial).run();
    device.last_seen = nowSql();
    device.status = 'online';
    return device;
}

function parseKeyValueParts(line) {
    const map = {};
    String(line || '').split(/\t|&/).forEach(part => {
        const idx = part.indexOf('=');
        if (idx <= 0) return;
        const key = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        if (key) map[key.toLowerCase()] = value;
    });
    return map;
}

function parseDeviceCmdResults(body) {
    const rows = String(body || '').split(/\r?\n/).map(v => v.trim()).filter(Boolean);
    if (!rows.length && String(body || '').trim()) rows.push(String(body).trim());
    return rows.map(row => parseKeyValueParts(row)).filter(row => row.id || row.return !== undefined || row.cmd);
}

function normalizeZkTime(value) {
    const raw = String(value || '').trim();
    if (!raw) return nowSql();
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(raw)) return raw.slice(0, 19);
    if (/^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}/.test(raw)) return raw.replace(/\//g, '-').slice(0, 19);
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 19).replace('T', ' ');
    return nowSql();
}

function parseAttendanceLine(line) {
    const text = String(line || '').trim();
    if (!text) return null;
    if (text.startsWith('~')) return null;
    const kv = parseKeyValueParts(text);
    const pin = kv.pin || kv.userpin || kv.userid || kv.user_id || '';
    if (pin) {
        const time = kv.time || kv.punchtime || kv.punch_time || kv.datetime || kv.eventtime || '';
        return {
            pin: normalizeDeviceSerial(pin),
            punch_time: normalizeZkTime(time),
            punch_type: normalizePunchType(kv.status || kv.inoutstatus || kv.punchtype || kv.event || ''),
            verify_type: kv.verify || kv.verifytype || '',
            work_code: kv.workcode || '',
            raw_payload: text
        };
    }
    const parts = text.split('\t');
    if (parts.length >= 2 && parts[0] && /\d{4}[-/]\d{2}[-/]\d{2}/.test(parts[1])) {
        return {
            pin: normalizeDeviceSerial(parts[0]),
            punch_time: normalizeZkTime(parts[1]),
            punch_type: normalizePunchType(parts[2] || ''),
            verify_type: parts[3] || '',
            work_code: parts[4] || '',
            raw_payload: text
        };
    }
    return null;
}

function normalizePunchType(value) {
    const raw = String(value || '').trim().toUpperCase();
    if (['1', 'OUT', 'CHECKOUT', 'CHECK-OUT', 'CLOCKOUT', 'CLOCK-OUT'].includes(raw)) return 'OUT';
    return 'IN';
}

function punchMinute(value) {
    return normalizeZkTime(value).slice(0, 16);
}

function zktecoPinFor(userType, userId) {
    const id = Number(userId || 0);
    if (!id) return '';
    return String((userType === 'staff' ? 200000 : 100000) + id);
}

async function resolveZkPin(env, serial, pin) {
    const cleanPin = normalizeDeviceSerial(pin);
    if (!cleanPin) return { user_id: '', user_type: 'unknown' };
    const reg = await env.DB.prepare(
        "SELECT user_id, user_type FROM face_registrations WHERE device_serial=? AND target_pin=? AND registration_status='success' ORDER BY id DESC LIMIT 1"
    ).bind(serial, cleanPin).first();
    if (reg) return { user_id: String(reg.user_id), user_type: reg.user_type };

    const numeric = Number(cleanPin);
    if (Number.isInteger(numeric) && numeric >= 200000) {
        const staffId = numeric - 200000;
        const staff = await env.DB.prepare('SELECT id FROM staff WHERE id=?').bind(staffId).first();
        if (staff) return { user_id: String(staff.id), user_type: 'staff' };
    }
    if (Number.isInteger(numeric) && numeric >= 100000) {
        const studentId = numeric - 100000;
        const student = await env.DB.prepare('SELECT id FROM students WHERE id=?').bind(studentId).first();
        if (student) return { user_id: String(student.id), user_type: 'student' };
    }

    const student = await env.DB.prepare('SELECT id FROM students WHERE admission_no=? OR id=?').bind(cleanPin, Number(cleanPin) || 0).first();
    if (student) return { user_id: String(student.id), user_type: 'student' };
    const staff = await env.DB.prepare('SELECT id FROM staff WHERE employee_id=? OR id=?').bind(cleanPin, Number(cleanPin) || 0).first();
    if (staff) return { user_id: String(staff.id), user_type: 'staff' };
    return { user_id: cleanPin, user_type: 'unknown' };
}

async function getAttendanceStatusFromTime(env, branchId, punchTime) {
    const settings = await getOptionSettingsMap(env, branchId);
    const lateDeadline = settings.face_att_late_deadline || '08:30';
    const hhmm = String(punchTime || '').slice(11, 16);
    return hhmm && hhmm > lateDeadline ? 'L' : 'P';
}

async function syncLegacyAttendanceFromDevice(env, branchId, resolved, record) {
    if (!branchId || !resolved || !['student', 'staff'].includes(resolved.user_type)) return;
    const date = String(record.punch_time || '').slice(0, 10);
    if (!date || record.punch_type !== 'IN') return;
    const status = await getAttendanceStatusFromTime(env, branchId, record.punch_time);
    if (resolved.user_type === 'student') {
        await env.DB.prepare(
            "INSERT INTO student_attendance (branch_id, student_id, date, status, remark, marked_by) VALUES (?,?,?,?,?,NULL) ON CONFLICT(student_id, date) DO UPDATE SET status=CASE WHEN student_attendance.status='A' THEN excluded.status ELSE student_attendance.status END, remark=CASE WHEN student_attendance.status='A' THEN excluded.remark ELSE student_attendance.remark END"
        ).bind(branchId, resolved.user_id, date, status, 'ZKTeco device').run();
    } else {
        await env.DB.prepare(
            "INSERT INTO staff_attendance (branch_id, staff_id, date, status, remark) VALUES (?,?,?,?,?) ON CONFLICT(staff_id, date) DO UPDATE SET status=CASE WHEN staff_attendance.status='A' THEN excluded.status ELSE staff_attendance.status END, remark=CASE WHEN staff_attendance.status='A' THEN excluded.remark ELSE staff_attendance.remark END"
        ).bind(branchId, resolved.user_id, date, status, 'ZKTeco device').run();
    }
}

async function saveDeviceAttendanceRecords(env, device, serial, rawBody) {
    const lines = String(rawBody || '').split(/\r?\n/);
    let saved = 0, duplicates = 0;
    for (const line of lines) {
        const record = parseAttendanceLine(line);
        if (!record || !record.pin) continue;
        const resolved = await resolveZkPin(env, serial, record.pin);
        const result = await env.DB.prepare(
            'INSERT OR IGNORE INTO attendance_logs (user_id, user_type, device_serial, branch_id, school_id, punch_time, punch_minute, punch_type, zk_pin, verify_type, work_code, raw_payload) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
        ).bind(
            resolved.user_id || record.pin,
            resolved.user_type || 'unknown',
            serial,
            device ? device.branch_id : null,
            device ? (device.school_id || device.branch_id || null) : null,
            record.punch_time,
            punchMinute(record.punch_time),
            record.punch_type,
            record.pin,
            record.verify_type || '',
            record.work_code || '',
            record.raw_payload || ''
        ).run();
        if (result.meta && result.meta.changes) {
            saved++;
            if (device) await syncLegacyAttendanceFromDevice(env, device.branch_id, resolved, record);
        } else {
            duplicates++;
        }
    }
    return { saved, duplicates };
}

function admsOptionsResponse(serial) {
    const stamp = Math.floor(Date.now() / 1000);
    return [
        `GET OPTION FROM: ${serial || 'UNKNOWN'}`,
        `Stamp=${stamp}`,
        `OpStamp=${stamp}`,
        `PhotoStamp=${stamp}`,
        'ErrorDelay=10',
        'Delay=5',
        'TransTimes=00:00;14:00',
        'TransInterval=1',
        'TransFlag=111111111111',
        'TimeZone=+05:30',
        'Realtime=1',
        'Encrypt=0',
        'Timeout=60',
        'SyncTime=3600',
        'ServerVer=2.4.1',
        'ATTLOGStamp=0',
        'OPERLOGStamp=0',
        'ATTPHOTOStamp=0',
        `DateTime=${formatAdmsDateTime()}`
    ].join('\n');
}

function getR2KeyFromFileUrl(value) {
    const raw = String(value || '');
    const marker = '/api/files/';
    const index = raw.indexOf(marker);
    if (index >= 0) return decodeURIComponent(raw.slice(index + marker.length).split(/[?#]/)[0]);
    return '';
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

async function readPhotoBase64(env, photoPath) {
    const raw = String(photoPath || '');
    if (!raw) throw new Error('Face photo missing');
    const dataMatch = raw.match(/^data:image\/[a-z0-9.+-]+;base64,(.+)$/i);
    if (dataMatch) return dataMatch[1];
    const key = getR2KeyFromFileUrl(raw);
    if (key && env.UPLOADS) {
        const obj = await env.UPLOADS.get(key);
        if (!obj) throw new Error('Face photo file not found');
        return arrayBufferToBase64(await obj.arrayBuffer());
    }
    const fetched = await fetch(raw);
    if (!fetched.ok) throw new Error('Face photo could not be downloaded');
    return arrayBufferToBase64(await fetched.arrayBuffer());
}

function buildUserInfoCommand(pin, person) {
    const name = String(person && person.name ? person.name : pin).replace(/[\t\r\n]/g, ' ').trim().slice(0, 40);
    return `DATA UPDATE USERINFO PIN=${pin}\tName=${name}\tPri=0\tPrivilege=0\tPasswd=\tCard=\tGrp=1\tTZ=0000000100000000\tVerify=0`;
}

async function buildFacePhotoCommand(env, registration) {
    const base64 = await readPhotoBase64(env, registration.photo_path);
    const pin = registration.target_pin;
    return `DATA UPDATE BIOPHOTO PIN=${pin}\tFileName=${pin}.jpg\tType=9\tNo=0\tIndex=0\tSize=${base64.length}\tContent=${base64}`;
}

function buildFaceDeleteCommand(pin) {
    return `DATA DELETE BIOPHOTO PIN=${pin}\tType=9`;
}

async function queueDeviceCommand(env, data) {
    let existing = null;
    if (data.face_registration_id) {
        existing = await env.DB.prepare(
            "SELECT id FROM device_commands WHERE face_registration_id=? AND command_type=? AND status IN ('queued','sent') ORDER BY id DESC LIMIT 1"
        ).bind(data.face_registration_id, data.command_type).first();
    } else if (data.command_text) {
        existing = await env.DB.prepare(
            "SELECT id FROM device_commands WHERE device_serial=? AND command_type=? AND command_text=? AND status IN ('queued','sent') ORDER BY id DESC LIMIT 1"
        ).bind(data.device_serial, data.command_type || 'generic', data.command_text).first();
    }
    if (existing) return existing.id;
    const result = await env.DB.prepare(
        'INSERT INTO device_commands (device_serial, branch_id, school_id, face_registration_id, command_type, command_text) VALUES (?,?,?,?,?,?)'
    ).bind(
        data.device_serial,
        data.branch_id || null,
        data.school_id || null,
        data.face_registration_id || null,
        data.command_type || 'generic',
        data.command_text || ''
    ).run();
    return result.meta.last_row_id;
}

async function clearPendingFaceCommands(env, registration) {
    if (!registration) return;
    await env.DB.prepare(`DELETE FROM device_commands
        WHERE status IN ('queued','sent')
          AND (
            face_registration_id=?
            OR (device_serial=? AND command_type='face_userinfo' AND command_text LIKE ?)
          )`)
        .bind(registration.id, registration.device_serial, `%PIN=${registration.target_pin}%`).run();
}

async function getPersonForFaceRegistration(env, userType, userId) {
    if (userType === 'student') {
        return env.DB.prepare('SELECT id, branch_id, name, photo_url FROM students WHERE id=?').bind(userId).first();
    }
    return env.DB.prepare('SELECT id, branch_id, name, photo_url FROM staff WHERE id=?').bind(userId).first();
}

async function getStaffRegistrationBranchIds(env, staffId, primaryBranchId) {
    const ids = new Set([Number(primaryBranchId)].filter(Boolean));
    const { results: users } = await env.DB.prepare("SELECT id, branch_id FROM users WHERE linked_id=? AND role IN ('teacher','staff')").bind(staffId).all();
    for (const u of users || []) {
        if (u.branch_id) ids.add(Number(u.branch_id));
        const assigned = await getUserAssignedBranchIds(env, u.id, u.branch_id);
        assigned.forEach(id => ids.add(Number(id)));
    }
    return Array.from(ids).filter(Boolean);
}

async function getDevicesForFaceTarget(env, userType, person, explicitBranchId, explicitDeviceSerial) {
    const binds = [];
    let q = "SELECT * FROM devices WHERE 1=1";
    if (explicitDeviceSerial) {
        q += ' AND serial_number=?';
        binds.push(explicitDeviceSerial);
    } else {
        let branchIds = [];
        if (userType === 'staff') branchIds = await getStaffRegistrationBranchIds(env, person.id, person.branch_id);
        else branchIds = [Number(explicitBranchId || person.branch_id)].filter(Boolean);
        if (explicitBranchId) branchIds = branchIds.filter(id => Number(id) === Number(explicitBranchId));
        if (!branchIds.length) return [];
        q += ` AND branch_id IN (${branchIds.map(() => '?').join(',')})`;
        binds.push(...branchIds);
    }
    q += ' ORDER BY branch_id, device_name';
    const { results } = binds.length ? await env.DB.prepare(q).bind(...binds).all() : await env.DB.prepare(q).all();
    return results || [];
}

async function upsertFaceRegistrationForDevice(env, person, userType, device, photoPath) {
    const pin = zktecoPinFor(userType, person.id);
    const row = await env.DB.prepare('SELECT * FROM face_registrations WHERE user_id=? AND user_type=? AND device_serial=?')
        .bind(person.id, userType, device.serial_number).first();
    if (row) {
        await clearPendingFaceCommands(env, row);
        await env.DB.prepare("UPDATE face_registrations SET photo_path=?, branch_id=?, school_id=?, target_pin=?, registration_status='pending', registered_at=NULL, last_error='', updated_at=datetime('now') WHERE id=?")
            .bind(photoPath || person.photo_url || '', device.branch_id, device.school_id || device.branch_id || null, pin, row.id).run();
        return row.id;
    }
    const result = await env.DB.prepare(
        "INSERT INTO face_registrations (user_id, user_type, photo_path, device_serial, branch_id, school_id, target_pin, registration_status) VALUES (?,?,?,?,?,?,?,'pending')"
    ).bind(person.id, userType, photoPath || person.photo_url || '', device.serial_number, device.branch_id, device.school_id || device.branch_id || null, pin).run();
    return result.meta.last_row_id;
}

async function queueFaceRegistrationCommands(env, registrationId, person, device) {
    const reg = await env.DB.prepare('SELECT * FROM face_registrations WHERE id=?').bind(registrationId).first();
    if (!reg) return;
    await queueDeviceCommand(env, {
        device_serial: device.serial_number,
        branch_id: device.branch_id,
        school_id: device.school_id || device.branch_id || null,
        face_registration_id: null,
        command_type: 'face_userinfo',
        command_text: buildUserInfoCommand(reg.target_pin, person)
    });
    await queueDeviceCommand(env, {
        device_serial: device.serial_number,
        branch_id: device.branch_id,
        school_id: device.school_id || device.branch_id || null,
        face_registration_id: registrationId,
        command_type: 'face_photo',
        command_text: 'FACE_PHOTO'
    });
}

async function registerFaceForUser(env, options) {
    const userType = String(options.user_type || '').trim();
    const userId = Number(options.user_id || 0);
    if (!['student', 'staff'].includes(userType) || !userId) return { error: 'Invalid user' };
    const person = await getPersonForFaceRegistration(env, userType, userId);
    if (!person) return { error: 'User not found' };
    let devices = await getDevicesForFaceTarget(env, userType, person, options.branch_id, options.device_serial);
    if (Array.isArray(options.allowed_branch_ids) && options.allowed_branch_ids.length) {
        const allowed = new Set(options.allowed_branch_ids.map(Number));
        devices = devices.filter(device => allowed.has(Number(device.branch_id)));
    }
    const rows = [];
    for (const device of devices) {
        const registrationId = await upsertFaceRegistrationForDevice(env, person, userType, device, options.photo_path || person.photo_url || '');
        await queueFaceRegistrationCommands(env, registrationId, person, device);
        rows.push(await env.DB.prepare('SELECT * FROM face_registrations WHERE id=?').bind(registrationId).first());
    }
    return { rows, total: rows.length };
}

async function queuePendingFaceRegistrationsForDevice(env, serial) {
    const { results } = await env.DB.prepare("SELECT fr.*, d.device_name, d.location FROM face_registrations fr JOIN devices d ON fr.device_serial=d.serial_number WHERE fr.device_serial=? AND fr.registration_status='pending'")
        .bind(serial).all();
    for (const reg of results || []) {
        const pending = await env.DB.prepare("SELECT id FROM device_commands WHERE face_registration_id=? AND command_type='face_photo' AND status IN ('queued','sent') LIMIT 1")
            .bind(reg.id).first();
        if (pending) continue;
        const person = await getPersonForFaceRegistration(env, reg.user_type, reg.user_id);
        const device = await getDeviceBySerial(env, serial);
        if (person && device) await queueFaceRegistrationCommands(env, reg.id, person, device);
    }
}

async function buildQueuedDeviceCommands(env, serial) {
    await env.DB.prepare("UPDATE device_commands SET status='queued', updated_at=datetime('now') WHERE device_serial=? AND status='sent' AND attempts < 3 AND sent_at IS NOT NULL AND datetime(sent_at) < datetime('now','-5 minutes')")
        .bind(serial).run();
    const { results } = await env.DB.prepare("SELECT * FROM device_commands WHERE device_serial=? AND status='queued' ORDER BY id LIMIT 5")
        .bind(serial).all();
    const lines = [];
    for (const cmd of results || []) {
        let commandText = cmd.command_text;
        if (cmd.command_type === 'face_photo') {
            const reg = await env.DB.prepare('SELECT * FROM face_registrations WHERE id=?').bind(cmd.face_registration_id).first();
            try {
                commandText = await buildFacePhotoCommand(env, reg);
            } catch (error) {
                await env.DB.prepare("UPDATE device_commands SET status='failed', result_text=?, updated_at=datetime('now') WHERE id=?")
                    .bind(error.message || 'Photo command build failed', cmd.id).run();
                await env.DB.prepare("UPDATE face_registrations SET registration_status='failed', last_error=?, updated_at=datetime('now') WHERE id=?")
                    .bind(error.message || 'Photo command build failed', cmd.face_registration_id).run();
                continue;
            }
        }
        lines.push(`C:${cmd.id}:${commandText}`);
        await env.DB.prepare("UPDATE device_commands SET status='sent', attempts=attempts+1, sent_at=datetime('now'), updated_at=datetime('now') WHERE id=?")
            .bind(cmd.id).run();
        if (cmd.face_registration_id) {
            await env.DB.prepare("UPDATE face_registrations SET last_push_at=datetime('now'), updated_at=datetime('now') WHERE id=?")
                .bind(cmd.face_registration_id).run();
        }
    }
    return lines.join('\n') + (lines.length ? '\n' : '');
}

async function applyDeviceCommandResults(env, serial, body) {
    const results = parseDeviceCmdResults(body);
    let updated = 0;
    for (const result of results) {
        const id = Number(result.id || 0);
        if (!id) continue;
        const returnCode = result.return ?? result.Return ?? '';
        const ok = String(returnCode) === '0';
        const existing = await env.DB.prepare('SELECT * FROM device_commands WHERE id=? AND device_serial=?').bind(id, serial).first();
        await env.DB.prepare("UPDATE device_commands SET status=?, result_code=?, result_text=?, updated_at=datetime('now') WHERE id=? AND device_serial=?")
            .bind(ok ? 'success' : 'failed', String(returnCode), JSON.stringify(result).slice(0, 1000), id, serial).run();
        if (existing && existing.face_registration_id) {
            if (existing.command_type === 'face_remove' && ok) {
                await env.DB.prepare('DELETE FROM face_registrations WHERE id=?').bind(existing.face_registration_id).run();
            } else {
                await env.DB.prepare("UPDATE face_registrations SET registration_status=?, registered_at=CASE WHEN ?='success' THEN datetime('now') ELSE registered_at END, last_error=?, updated_at=datetime('now') WHERE id=?")
                    .bind(ok ? 'success' : 'failed', ok ? 'success' : 'failed', ok ? '' : JSON.stringify(result).slice(0, 500), existing.face_registration_id).run();
            }
        }
        updated++;
    }
    return updated;
}

function normalizeSmsPhoneNumber(phone, countryCode = '91') {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10) return `${countryCode}${digits}`;
    if (digits.length >= 11 && digits.length <= 15) return digits;
    return '';
}




async function getAccessibleStudentIdsForUser(env, user) {
    if (user.role === 'student') return user.linked_id ? [Number(user.linked_id)] : [];
    if (user.role === 'parent') {
        const { results } = await env.DB.prepare('SELECT id FROM students WHERE phone = ? AND status = ?').bind(user.login_id, 'Active').all();
        return results.map(r => Number(r.id));
    }
    return [];
}

async function getTeacherAssignments(env, user) {
    if (!user || user.role !== 'teacher' || !user.linked_id || !user.branch_id) return [];
    const { results } = await env.DB.prepare(`SELECT tp.class_id, tp.section_id, tp.subject_id, sec.name as section_name
        FROM teacher_permissions tp
        LEFT JOIN sections sec ON tp.section_id = sec.id
        WHERE tp.branch_id = ? AND tp.staff_id = ?`)
        .bind(user.branch_id, user.linked_id).all();
    return results.map(row => ({
        class_id: Number(row.class_id),
        section_id: row.section_id ? Number(row.section_id) : null,
        subject_id: row.subject_id ? Number(row.subject_id) : null,
        section_name: String(row.section_name || '').trim()
    }));
}

function normalizeSectionValue(value) {
    return String(value || '').trim().toLowerCase();
}

function teacherHasAssignment(assignments, classId, section, subjectId) {
    const normalizedSection = normalizeSectionValue(section);
    return assignments.some(assignment => {
        if (Number(assignment.class_id) !== Number(classId)) return false;
        if (normalizedSection && normalizeSectionValue(assignment.section_name || assignment.section_id) !== normalizedSection) return false;
        if (subjectId !== undefined && subjectId !== null && subjectId !== '' && Number(assignment.subject_id || 0) !== Number(subjectId)) return false;
        return true;
    });
}

function buildTeacherAssignmentClause(assignments, classField, sectionField, subjectField) {
    if (!assignments.length) return { clause: '1=0', binds: [] };
    const conditions = [];
    const binds = [];
    assignments.forEach(assignment => {
        const sectionName = assignment.section_name || '';
        if (subjectField) {
            conditions.push(`(${classField}=? AND ${sectionField}=? AND ${subjectField}=?)`);
            binds.push(assignment.class_id, sectionName, assignment.subject_id || 0);
        } else {
            conditions.push(`(${classField}=? AND ${sectionField}=?)`);
            binds.push(assignment.class_id, sectionName);
        }
    });
    return { clause: conditions.join(' OR '), binds };
}

async function getStudentForCertificate(env, user, studentId) {
    const student = await env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(studentId).first();
    if (!student) return null;
    if (!(await userCanAccessBranch(env, user, student.branch_id))) return null;
    return student;
}

function isValidISODate(value) {
    return !!value && !Number.isNaN(new Date(value).getTime());
}

async function getNextId(db, branchId, type, year) {
    const updateStmt = db.prepare('UPDATE counters SET last_serial = last_serial + 1 WHERE branch_id = ? AND counter_type = ? AND year = ?')
        .bind(branchId, type, year);
    const selectStmt = db.prepare('SELECT last_serial FROM counters WHERE branch_id = ? AND counter_type = ? AND year = ?')
        .bind(branchId, type, year);
    const [, selectResult] = await db.batch([updateStmt, selectStmt]);
    const row = selectResult.results && selectResult.results[0];
    if (!row) {
        await db.prepare('INSERT INTO counters (branch_id, counter_type, year, last_serial) VALUES (?, ?, ?, 1)')
            .bind(branchId, type, year).run();
        return 1;
    }
    return row.last_serial;
}

async function createFeeDepositRecord(env, branchId, data) {
    const totalAmount = roundCurrency(data.total_amount || 0);
    const lateFee = roundCurrency(data.late_fee || 0);
    const concession = roundCurrency(data.concession || 0);
    const grandTotal = roundCurrency(data.grand_total || 0);
    const receivedAmount = roundCurrency(data.received_amount || 0);
    const balance = roundCurrency(data.balance || 0);
    if (!data.student_id || !data.month || !data.date) return { error: 'student_id, month and date are required', status: 400 };
    if (!data.payment_mode) return { error: 'Payment mode is required', status: 400 };
    if (totalAmount < 0 || lateFee < 0 || concession < 0 || grandTotal < 0 || receivedAmount < 0 || balance < 0) {
        return { error: 'Fee amounts cannot be negative', status: 400 };
    }

    const student = await env.DB.prepare('SELECT id, branch_id, old_balance FROM students WHERE id=?').bind(data.student_id).first();
    if (!student) return { error: 'Student not found', status: 404 };
    if (Number(student.branch_id) !== Number(branchId)) return { error: 'Forbidden', status: 403 };

    const derivedOldBalance = roundCurrency(grandTotal - (totalAmount + lateFee - concession));
    if (derivedOldBalance < 0) return { error: 'Grand total cannot be less than fee total minus concession', status: 400 };
    const expectedBalance = roundCurrency(grandTotal - receivedAmount);
    if (balance !== expectedBalance) return { error: 'Balance mismatch', status: 400 };
    if (receivedAmount > grandTotal) return { error: 'Received amount cannot exceed grand total', status: 400 };

    const branch = await env.DB.prepare('SELECT code FROM branches WHERE id=?').bind(branchId).first();
    const yr = new Date().getFullYear();
    const serial = await getNextId(env.DB, branchId, 'receipt', yr);
    const receiptNo = `${branch.code}-REC${yr}${String(serial).padStart(4, '0')}`;

    const r = await env.DB.prepare(`INSERT INTO fee_deposits (branch_id, receipt_no, date, student_id, month, total_amount, late_fee, concession, grand_total, received_amount, balance, payment_mode, category, remarks, session) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(branchId, receiptNo, data.date, data.student_id, data.month, totalAmount, lateFee, concession, grandTotal, receivedAmount, balance, data.payment_mode, data.category || 'Old', data.remarks || '', data.session || '').run();

    const currentOldBal = roundCurrency(student ? (student.old_balance || 0) : 0);
    const paidTowardsCurrent = Math.min(receivedAmount, roundCurrency(totalAmount + lateFee - concession));
    const paidTowardsOld = Math.max(0, roundCurrency(receivedAmount - paidTowardsCurrent));
    const newOldBal = Math.max(0, roundCurrency(currentOldBal - paidTowardsOld));
    await env.DB.prepare('UPDATE students SET fee_paid = fee_paid + ?, old_balance = ? WHERE id = ?').bind(receivedAmount, newOldBal, data.student_id).run();

    const depositId = r.meta.last_row_id;
    if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
            const particular = await env.DB.prepare('SELECT id FROM fee_particulars WHERE id=? AND branch_id=?').bind(item.particular_id, branchId).first();
            if (!particular) return { error: 'Invalid fee particular in deposit items', status: 400 };
            if (Number(item.amount || 0) < 0) return { error: 'Invalid fee item amount', status: 400 };
            await env.DB.prepare('INSERT INTO fee_deposit_items (deposit_id, particular_id, amount) VALUES (?,?,?)')
                .bind(depositId, item.particular_id, item.amount || 0).run();
        }
    }

    return { id: depositId, receipt_no: receiptNo };
}

const router = new Router();

router.post('/api/auth/login', async (req, env) => {
    const clientIP = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown';
    if (!checkLoginRateLimit(clientIP)) return json({ error: 'Too many login attempts. Please try again after 15 minutes.' }, 429);

    const { login_id, password, role } = await req.json();
    if (!login_id || !password) return json({ error: 'Login ID and password required' }, 400);

    const user = await env.DB.prepare('SELECT u.*, b.code as branch_code, b.school_name FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE u.login_id = ? AND u.is_active = 1')
        .bind(login_id).first();

    if (!user || !(await verifyPassword(password, user.password_hash))) {
        return json({ error: 'Invalid credentials' }, 401);
    }
    await upgradePasswordHashIfNeeded(env, user.id, password, user.password_hash);
    if (role && user.role !== role && !(role === 'admin' && user.role === 'branch_admin')) {
        return json({ error: 'Invalid role for this user' }, 401);
    }

    const token = await signJWT({ id: user.id, login_id: user.login_id, role: user.role, branch_id: user.branch_id, linked_id: user.linked_id }, getJwtSecret(env));
    await env.DB.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').bind(user.id).run();
    const branchIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);

    let userName = null;
    if (user.role === 'parent') {
        const firstChild = await env.DB.prepare('SELECT father_name, mother_name FROM students WHERE phone = ? AND status = ? ORDER BY id LIMIT 1').bind(user.login_id, 'Active').first();
        if (firstChild) userName = firstChild.father_name || firstChild.mother_name || null;
    } else if (user.role === 'teacher' || user.role === 'staff') {
        if (user.linked_id) {
            const staff = await env.DB.prepare('SELECT name FROM staff WHERE id = ?').bind(user.linked_id).first();
            if (staff) userName = staff.name;
        }
    } else if (user.role === 'student') {
        if (user.linked_id) {
            const stu = await env.DB.prepare('SELECT name FROM students WHERE id = ?').bind(user.linked_id).first();
            if (stu) userName = stu.name;
        }
    }

    await logActivity(env, {
        branch_id: user.branch_id,
        user_id: user.id,
        user_name: user.login_id,
        activity: 'Login successful',
        ip_address: clientIP,
        action_type: 'login'
    });

    return json({ token, user: { id: user.id, login_id: user.login_id, name: userName, role: user.role, branch_id: user.branch_id, branch_ids: branchIds, linked_id: user.linked_id, branch_code: user.branch_code, school_name: user.school_name } });
});

router.get('/api/auth/me', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const dbUser = await env.DB.prepare('SELECT u.id, u.login_id, u.role, u.branch_id, u.linked_id, u.is_active, u.last_login, b.code as branch_code, b.school_name, b.name as branch_name FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE u.id = ?')
        .bind(user.id).first();
    if (dbUser) dbUser.branch_ids = await getUserAssignedBranchIds(env, dbUser.id, dbUser.branch_id);
    return json({ user: dbUser });
});

router.get('/api/branches', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (user.role === 'super_admin') {
        const { results } = await env.DB.prepare('SELECT * FROM branches ORDER BY id').all();
        return json(results);
    }
    if (['branch_admin', 'teacher', 'staff', 'student', 'parent'].includes(user.role)) {
        const branchIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
        if (!branchIds.length) return json([]);
        const placeholders = branchIds.map(() => '?').join(',');
        const { results } = await env.DB.prepare(`SELECT * FROM branches WHERE id IN (${placeholders}) ORDER BY id`).bind(...branchIds).all();
        return json(results);
    }
    return json({ error: 'Forbidden' }, 403);
});

router.post('/api/branches', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || user.role !== 'super_admin') return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (!d.name || !d.name.trim()) return json({ error: 'Branch name is required' }, 400);
    let code = d.code;
    if (code) {
        code = code.trim().toUpperCase();
        if (!/^[A-Z]{3}$/.test(code)) return json({ error: 'Branch code must be exactly 3 uppercase letters' }, 400);
        const existing = await env.DB.prepare('SELECT id FROM branches WHERE code=?').bind(code).first();
        if (existing) return json({ error: 'Branch code already exists' }, 409);
    } else {
        const baseCode = (d.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || 'BRN');
        code = baseCode;
        let suffix = 2;
        while (true) {
            const existing = await env.DB.prepare('SELECT id FROM branches WHERE code=?').bind(code).first();
            if (!existing) break;
            code = `${baseCode}${suffix}`;
            suffix += 1;
        }
    }
    try {
        const r = await env.DB.prepare('INSERT INTO branches (name, code, address, phone, email, school_name, principal_name, board, affiliation_no, school_code) VALUES (?,?,?,?,?,?,?,?,?,?)')
            .bind(d.name.trim(), code, d.address || '', d.phone || '', d.email || '', d.school_name || d.name.trim(), d.principal_name || '', d.board || 'CBSE', d.affiliation_no || '', d.school_code || '').run();
        const yr = new Date().getFullYear();
        await env.DB.prepare('INSERT INTO counters (branch_id, counter_type, year, last_serial) VALUES (?,?,?,0),(?,?,?,0),(?,?,?,0)')
            .bind(r.meta.last_row_id, 'admission', yr, r.meta.last_row_id, 'employee', yr, r.meta.last_row_id, 'receipt', yr).run();
        return json({ id: r.meta.last_row_id, name: d.name.trim(), code }, 201);
    } catch(e) {
        if (e.message && e.message.includes('UNIQUE')) return json({ error: 'A branch with this code already exists' }, 409);
        return json({ error: 'Failed to create branch' }, 500);
    }
});

router.put('/api/branches/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role === 'branch_admin' && Number(params.id) !== Number(user.branch_id)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const allowed = ['name','code','address','phone','email','school_name','principal_name','board','affiliation_no','school_code','logo_url','signing_authority_name','signing_authority_designation','signing_authority_signature_url'];
    const sets = []; const vals = [];
    for (const k of allowed) {
        if (d[k] !== undefined) { sets.push(`${k}=?`); vals.push(d[k]); }
    }
    if (!sets.length) return json({ error: 'No fields to update' }, 400);
    vals.push(params.id);
    await env.DB.prepare(`UPDATE branches SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
    return json({ success: true });
});

router.delete('/api/branches/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || user.role !== 'super_admin') return json({ error: 'Forbidden' }, 403);
    const branchId = params.id;
    try {
        await env.DB.prepare('DELETE FROM counters WHERE branch_id=?').bind(branchId).run();
        await env.DB.prepare('DELETE FROM branches WHERE id=?').bind(branchId).run();
        return json({ success: true });
    } catch (e) {
        if (e.message && e.message.includes('FOREIGN KEY')) {
            return json({ error: 'Cannot delete branch because records are linked to it. Remove linked users/data first.' }, 409);
        }
        return json({ error: 'Failed to delete branch' }, 500);
    }
});

router.get('/api/users', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (user.role === 'super_admin') {
        const url = new URL(req.url);
        const branchId = url.searchParams.get('branch_id');
        let usersQ = 'SELECT u.id, u.login_id, u.role, u.branch_id, u.is_active, u.last_login, u.created_at, b.name as branch_name FROM users u LEFT JOIN branches b ON u.branch_id = b.id';
        const usersBinds = [];
        if (branchId) { usersQ += ' WHERE u.branch_id=?'; usersBinds.push(branchId); }
        usersQ += ' ORDER BY u.created_at DESC';
        const { results } = usersBinds.length ? await env.DB.prepare(usersQ).bind(...usersBinds).all() : await env.DB.prepare(usersQ).all();
        for (const row of results || []) {
            row.branch_ids = await getUserAssignedBranchIds(env, row.id, row.branch_id);
        }
        return json(results);
    } else if (user.role === 'branch_admin') {
        const branchIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
        if (!branchIds.length) return json([]);
        const placeholders = branchIds.map(() => '?').join(',');
        const { results } = await env.DB.prepare(`SELECT u.id, u.login_id, u.role, u.branch_id, u.is_active, u.last_login, u.created_at, b.name as branch_name FROM users u LEFT JOIN branches b ON u.branch_id = b.id WHERE u.branch_id IN (${placeholders}) ORDER BY u.created_at DESC`).bind(...branchIds).all();
        for (const row of results || []) {
            row.branch_ids = await getUserAssignedBranchIds(env, row.id, row.branch_id);
        }
        return json(results);
    }
    return json({ error: 'Forbidden' }, 403);
});

router.post('/api/users', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    let branchId = await getWritableBranchId(req, env, user, d.branch_id);
    if (!branchId) return json({ error: 'branch_id is required' }, 400);
    if (user.role === 'branch_admin' && d.role === 'super_admin') return json({ error: 'Cannot create super admin' }, 403);

    let requestedBranchIds = Array.isArray(d.branch_ids) && d.branch_ids.length ? d.branch_ids.map(Number).filter(Boolean) : [branchId];
    if (user.role === 'branch_admin') {
        const creatorBranchIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
        if (!creatorBranchIds.includes(branchId)) return json({ error: 'Forbidden branch assignment' }, 403);
        if (requestedBranchIds.some(id => !creatorBranchIds.includes(id))) return json({ error: 'Cannot assign branches outside your access' }, 403);
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE login_id = ?').bind(d.login_id).first();
    if (existing) return json({ error: 'Login ID already exists' }, 409);
    const pwd = d.password || generatePassword();
    const pwdHash = await hashPassword(pwd);
    const inserted = await env.DB.prepare('INSERT INTO users (login_id, password_hash, role, branch_id, linked_id, is_active) VALUES (?,?,?,?,?,1)')
        .bind(d.login_id, pwdHash, d.role, branchId, d.linked_id || null).run();
    const newUserId = inserted.meta.last_row_id;
    await setUserBranchAssignments(env, newUserId, requestedBranchIds, branchId);
    await logActivity(env, {
        branch_id: branchId,
        user_id: user.id,
        user_name: user.login_id,
        activity: `Created user: ${d.login_id} (${d.role})`,
        ip_address: req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown',
        action_type: 'edit'
    });
    return json({ success: true, password: pwd }, 201);
});

router.put('/api/users/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const target = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(params.id).first();
    if (!target) return json({ error: 'Not found' }, 404);
    let adminAllowedBranchIds = [];
    if (user.role === 'branch_admin') {
        adminAllowedBranchIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
        if (!adminAllowedBranchIds.includes(Number(target.branch_id))) return json({ error: 'Forbidden' }, 403);
    }
    const sets = []; const vals = [];
    if (d.is_active !== undefined) { sets.push('is_active=?'); vals.push(d.is_active); }
    if (d.password) { sets.push('password_hash=?'); vals.push(await hashPassword(d.password)); }
    if (d.role && ['super_admin','branch_admin'].includes(user.role)) {
        if (user.role === 'branch_admin' && d.role === 'super_admin') return json({ error: 'Cannot assign super admin role' }, 403);
        sets.push('role=?'); vals.push(d.role);
    }
    if (d.branch_id !== undefined && ['super_admin','branch_admin'].includes(user.role)) {
        const newPrimary = Number(d.branch_id) || null;
        if (user.role === 'branch_admin' && newPrimary && !adminAllowedBranchIds.includes(newPrimary)) return json({ error: 'Forbidden branch assignment' }, 403);
        sets.push('branch_id=?'); vals.push(newPrimary);
    }
    if (sets.length > 0) {
        vals.push(params.id);
        await env.DB.prepare(`UPDATE users SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
    } else if (!Array.isArray(d.branch_ids)) {
        return json({ error: 'Nothing to update' }, 400);
    }
    if (Array.isArray(d.branch_ids) && ['super_admin','branch_admin'].includes(user.role)) {
        const branchIds = d.branch_ids.map(Number).filter(Boolean);
        if (user.role === 'branch_admin' && branchIds.some(id => !adminAllowedBranchIds.includes(id))) {
            return json({ error: 'Cannot assign branches outside your access' }, 403);
        }
        const primaryBranch = d.branch_id !== undefined ? Number(d.branch_id) : Number(target.branch_id);
        await setUserBranchAssignments(env, Number(params.id), branchIds, primaryBranch);
    }
    return json({ success: true });
});

router.delete('/api/users/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const target = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(params.id).first();
    if (!target) return json({ error: 'Not found' }, 404);
    if (target.role === 'super_admin') return json({ error: 'Cannot delete super admin' }, 403);
    if (user.role === 'branch_admin') {
        const adminAllowedBranchIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
        if (!adminAllowedBranchIds.includes(Number(target.branch_id))) return json({ error: 'Forbidden' }, 403);
    }
    await env.DB.prepare('DELETE FROM user_branch_assignments WHERE user_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM user_permissions WHERE user_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM users WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.post('/api/change-password', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const d = await req.json();
    if (!d.current_password || !d.new_password) return json({ error: 'current_password and new_password required' }, 400);
    if (d.new_password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
    const me = await env.DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(user.id).first();
    if (!me || !(await verifyPassword(d.current_password, me.password_hash))) return json({ error: 'Current password is incorrect' }, 400);
    const nextHash = await hashPassword(d.new_password);
    await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(nextHash, user.id).run();
    return json({ success: true });
});

router.post('/api/admin-reset-password', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (!d.type || !d.linked_id || !d.new_password) return json({ error: 'type, linked_id and new_password required' }, 400);
    if (d.new_password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
    const linkedId = d.linked_id;
    const type = d.type; // 'staff' or 'student' or 'parent'
    let roleFilter;
    if (type === 'staff') {
        if (user.role === 'branch_admin') {
            const access = await ensureBranchAccess(env, user, 'staff', linkedId);
            if (access.error) return json({ error: access.error }, access.status);
        }
        roleFilter = "u.role IN ('teacher','staff')";
    } else if (type === 'student') {
        if (user.role === 'branch_admin') {
            const access = await ensureBranchAccess(env, user, 'students', linkedId);
            if (access.error) return json({ error: access.error }, access.status);
        }
        roleFilter = "u.role = 'student'";
    } else if (type === 'parent') {
        const student = await env.DB.prepare('SELECT phone, branch_id FROM students WHERE id = ?').bind(linkedId).first();
        if (!student || !student.phone) return json({ error: 'Student has no phone for parent login' }, 404);
        if (user.role === 'branch_admin' && !(await userCanAccessBranch(env, user, student.branch_id))) return json({ error: 'Forbidden' }, 403);
        const parentUser = await env.DB.prepare("SELECT id FROM users WHERE login_id = ? AND role = 'parent'").bind(student.phone).first();
        if (!parentUser) return json({ error: 'Parent user not found' }, 404);
        await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(await hashPassword(d.new_password), parentUser.id).run();
        return json({ success: true });
    } else {
        return json({ error: 'Invalid type. Use staff, student, or parent' }, 400);
    }
    const targetUser = await env.DB.prepare(`SELECT u.id FROM users u WHERE u.linked_id = ? AND ${roleFilter}`).bind(linkedId).first();
    if (!targetUser) return json({ error: 'User account not found for this ' + type }, 404);
    await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(await hashPassword(d.new_password), targetUser.id).run();
    return json({ success: true });
});

router.get('/api/me', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const me = await env.DB.prepare('SELECT id, login_id, name, email, role, branch_id, is_active FROM users WHERE id = ?').bind(user.id).first();
    if (!me) return json({ error: 'Not found' }, 404);
    return json(me);
});

router.put('/api/me', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const d = await req.json();
    const sets = []; const vals = [];
    if (d.name !== undefined) { sets.push('name=?'); vals.push(d.name.trim()); }
    if (d.email !== undefined) { sets.push('email=?'); vals.push(d.email.trim()); }
    if (sets.length === 0) return json({ error: 'Nothing to update' }, 400);
    vals.push(user.id);
    await env.DB.prepare(`UPDATE users SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
    return json({ success: true });
});

router.get('/api/super-admins', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || user.role !== 'super_admin') return json({ error: 'Forbidden' }, 403);
    const { results } = await env.DB.prepare("SELECT id, login_id, name, email, is_active, created_at FROM users WHERE role = 'super_admin' ORDER BY id").all();
    return json(results || []);
});

router.post('/api/super-admins', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || user.role !== 'super_admin') return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (!d.login_id || !d.name) return json({ error: 'login_id and name required' }, 400);
    const existing = await env.DB.prepare('SELECT id FROM users WHERE login_id = ?').bind(d.login_id.trim()).first();
    if (existing) return json({ error: 'Login ID already exists' }, 409);
    const password = typeof generatePassword === 'function' ? generatePassword() : 'Admin@123';
    const passwordHash = await hashPassword(password);
    await env.DB.prepare("INSERT INTO users (login_id, password_hash, name, email, role, is_active) VALUES (?,?,?,?,'super_admin',1)")
        .bind(d.login_id.trim(), passwordHash, d.name.trim(), d.email ? d.email.trim() : '').run();
    return json({ success: true, login_id: d.login_id.trim(), password });
});

router.get('/api/user-credentials/:type/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const type = params.type; // 'staff' or 'student'
    const linkedId = params.id;
    if (type === 'staff') {
        if (user.role === 'branch_admin') {
            const access = await ensureBranchAccess(env, user, 'staff', linkedId);
            if (access.error) return json({ error: access.error }, access.status);
        }
        const row = await env.DB.prepare("SELECT u.login_id FROM users u WHERE u.linked_id = ? AND u.role IN ('teacher','staff')").bind(linkedId).first();
        if (!row) return json({ login_id: null, password_retrievable: false });
        return json({ login_id: row.login_id, password_retrievable: false });
    } else if (type === 'student') {
        if (user.role === 'branch_admin') {
            const access = await ensureBranchAccess(env, user, 'students', linkedId);
            if (access.error) return json({ error: access.error }, access.status);
        }
        const student = await env.DB.prepare('SELECT admission_no, phone FROM students WHERE id = ?').bind(linkedId).first();
        if (!student) return json({ error: 'Not found' }, 404);
        const studentUser = await env.DB.prepare("SELECT u.login_id FROM users u WHERE u.linked_id = ? AND u.role = 'student'").bind(linkedId).first();
        const parentUser = student.phone ? await env.DB.prepare("SELECT u.login_id FROM users u WHERE u.login_id = ? AND u.role = 'parent'").bind(student.phone).first() : null;
        return json({
            student_login_id: studentUser ? studentUser.login_id : null,
            parent_login_id: parentUser ? parentUser.login_id : null,
            password_retrievable: false
        });
    }
    return json({ error: 'Invalid type' }, 400);
});

router.get('/api/user-permissions', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    let q = 'SELECT * FROM user_permissions WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id=?'; b.push(effBranch); }
    if (userId) { q += ' AND user_id=?'; b.push(userId); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/user-permissions', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const { user_id, permissions } = await req.json();
    const targetUser = await env.DB.prepare('SELECT id, branch_id FROM users WHERE id = ?').bind(user_id).first();
    if (!targetUser) return json({ error: 'User not found' }, 404);
    if (user.role === 'branch_admin' && !(await userCanAccessBranch(env, user, targetUser.branch_id))) return json({ error: 'Forbidden' }, 403);

    if (user.role === 'branch_admin' && user_id === user.id) return json({ error: 'Cannot edit own permissions' }, 403);

    let filteredPermissions = permissions;
    if (user.role === 'branch_admin') {
        const { results: myPerms } = await env.DB.prepare('SELECT module FROM user_permissions WHERE user_id = ? AND access = 1').bind(user.id).all();
        const myAccessSet = new Set(myPerms.map(p => p.module));
        filteredPermissions = permissions.filter(p => myAccessSet.has(p.module));
    }
    const bid = targetUser.branch_id || user.branch_id || 0;
    if (bid) {
        await env.DB.prepare('DELETE FROM user_permissions WHERE branch_id=? AND user_id=?').bind(bid, user_id).run();
    } else {
        await env.DB.prepare('DELETE FROM user_permissions WHERE user_id=?').bind(user_id).run();
    }
    for (const p of filteredPermissions) {
        await env.DB.prepare('INSERT INTO user_permissions (branch_id, user_id, module, access, modify, can_delete) VALUES (?,?,?,?,?,?)')
            .bind(bid, user_id, p.module, p.access ? 1 : 0, p.modify ? 1 : 0, p.can_delete ? 1 : 0).run();
    }
    return json({ success: true });
});

router.get('/api/my-children', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (user.role === 'parent') {
        const { results } = await env.DB.prepare('SELECT s.*, c.name as class_name, tr.name as route_name, tr.fee as transport_fee FROM students s LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN transport_routes tr ON s.route_id = tr.id WHERE s.phone = ? AND s.status = ? ORDER BY s.name').bind(user.login_id, 'Active').all();
        results.forEach(r => normalizePhotoUrls(req, r));
        return json(results);
    }
    if (user.role === 'student') {
        const s = await env.DB.prepare('SELECT s.*, c.name as class_name, tr.name as route_name, tr.fee as transport_fee FROM students s LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN transport_routes tr ON s.route_id = tr.id WHERE s.id = ?').bind(user.linked_id).first();
        normalizePhotoUrls(req, s);
        return json(s ? [s] : []);
    }
    return json([]);
});

router.get('/api/students', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const classId = url.searchParams.get('class_id');
    const section = url.searchParams.get('section');
    const status = url.searchParams.get('status') || 'Active';
    let q = 'SELECT s.*, c.name as class_name, tr.name as route_name, COALESCE(tr.fee,0) as transport_fee FROM students s LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN transport_routes tr ON s.route_id = tr.id WHERE 1=1';
    const binds = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND s.branch_id = ?'; binds.push(effBranch); }
    if (classId && classId !== 'All') { q += ' AND s.class_id = ?'; binds.push(classId); }
    if (section && section !== 'All') { q += ' AND s.section = ?'; binds.push(section); }
    if (status !== 'All') { q += ' AND s.status = ?'; binds.push(status); }
    const category = url.searchParams.get('category');
    if (category && category !== 'All' && category !== '') { q += ' AND s.category = ?'; binds.push(category); }
    const session = url.searchParams.get('session');
    if (session && session !== 'All') { q += ' AND s.session = ?'; binds.push(session); }
    if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json([]);
        const { clause, binds: assignmentBinds } = buildTeacherAssignmentClause(assignments, 's.class_id', 's.section');
        q += ` AND (${clause})`;
        binds.push(...assignmentBinds);
    }
    q += ' ORDER BY s.name';
    const stmt = env.DB.prepare(q);
    const { results } = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
    if (results.length > 0) {
        const ids = results.map(s => s.id);
        const placeholders = ids.map(() => '?').join(',');
        const { results: subRows } = await env.DB.prepare(`SELECT student_id, subject_id FROM student_subjects WHERE student_id IN (${placeholders})`).bind(...ids).all();
        const subMap = {};
        for (const r of subRows) {
            if (!subMap[r.student_id]) subMap[r.student_id] = [];
            subMap[r.student_id].push(r.subject_id);
        }
        for (const s of results) { s.subjects = JSON.stringify(subMap[s.id] || []); }
    }
    results.forEach(s => normalizePhotoUrls(req, s));
    return json(results);
});

router.get('/api/students/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const s = await env.DB.prepare('SELECT s.*, c.name as class_name, tr.name as route_name, COALESCE(tr.fee,0) as transport_fee FROM students s LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN transport_routes tr ON s.route_id = tr.id WHERE s.id = ?').bind(params.id).first();
    if (!s) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, s.branch_id))) return json({ error: 'Forbidden' }, 403);
    normalizePhotoUrls(req, s);
    return json(s);
});

router.post('/api/students', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const branchId = await getWritableBranchId(req, env, user, d.branch_id);
    const branch = await env.DB.prepare('SELECT code FROM branches WHERE id = ?').bind(branchId).first();
    const code = branch ? branch.code : 'SCH';
    const yr = new Date().getFullYear();
    const serial = await getNextId(env.DB, branchId, 'admission', yr);
    const admNo = `${code}${yr}${String(serial).padStart(3, '0')}`;

    let rollNo = d.roll_no || null;
    if (!rollNo && d.class_id && d.section) {
        const maxRollRow = await env.DB.prepare(
            'SELECT MAX(roll_no) as max_roll FROM students WHERE branch_id=? AND class_id=? AND section=? AND session=?'
        ).bind(branchId, d.class_id, d.section, d.session || '').first();
        rollNo = (maxRollRow && maxRollRow.max_roll) ? maxRollRow.max_roll + 1 : 1;
    }

    const r = await env.DB.prepare(`INSERT INTO students (branch_id, admission_no, photo_url, name, father_name, mother_name, dob, gender, category, religion, phone, email, address, aadhar_no, class_id, section, session, roll_no, route_id, admission_date, id_type, status, fee_amount, fee_paid, extra_data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(branchId, admNo, d.photo_url || '', d.name, d.father_name || '', d.mother_name || '', d.dob || '', d.gender || '', d.category || '', d.religion || '', d.phone || '', d.email || '', d.address || '', d.aadhar_no || '', d.class_id || null, d.section || '', d.session || '', rollNo, d.route_id || null, d.admission_date || new Date().toISOString().slice(0, 10), d.id_type || 'Aadharshila ID', 'Active', d.fee_amount || 0, 0, d.extra_data || '{}').run();

    const studentId = r.meta.last_row_id;

    try {
        const finalSlabs = await getStudentSlabs(env, branchId, d.class_id, d.category, d.session);
        const slabAnnual = computeSlabAnnual(finalSlabs);
        const route = d.route_id ? await env.DB.prepare('SELECT fee FROM transport_routes WHERE id=?').bind(d.route_id).first() : null;
        const tFee = route ? Number(route.fee||0)*12 : 0;
        const computedFee = roundCurrency(slabAnnual + tFee);
        if (computedFee > 0) {
            await env.DB.prepare('UPDATE students SET fee_amount=? WHERE id=?').bind(computedFee, studentId).run();
        }
    } catch(e) {  }
    const studentPwd = generatePassword();
    const studentPwdHash = await hashPassword(studentPwd);
    await env.DB.prepare('INSERT INTO users (login_id, password_hash, role, branch_id, linked_id) VALUES (?,?,?,?,?)')
        .bind(admNo, studentPwdHash, 'student', branchId, studentId).run();
    let parentPwd = null;
    if (d.phone) {
        const existing = await env.DB.prepare('SELECT id FROM users WHERE login_id = ?').bind(d.phone).first();
        if (!existing) {
            parentPwd = generatePassword();
            const parentPwdHash = await hashPassword(parentPwd);
            await env.DB.prepare('INSERT INTO users (login_id, password_hash, role, branch_id, linked_id) VALUES (?,?,?,?,?)')
                .bind(d.phone, parentPwdHash, 'parent', branchId, studentId).run();
        }
    }
    try {
        if (d.email) {
            await tryAutoEmail(env, branchId, 'enable_admission_email', d.email, d.name,
                'Admission Confirmed \u2014 ' + admNo,
                '<p>Dear <strong>' + d.name + '</strong>,</p><p>Admission confirmed. Admission No: <strong>' + admNo + '</strong></p><p>Student Login: <strong>' + admNo + '</strong> | Password: <strong>' + studentPwd + '</strong></p>' + (parentPwd ? '<p>Parent Login: <strong>' + (d.phone||'') + '</strong> | Password: <strong>' + parentPwd + '</strong></p>' : '') + '<p>Welcome!</p>');
        }
    } catch(e) {}
    return json({ id: studentId, admission_no: admNo, student_password: studentPwd, parent_password: parentPwd }, 201);
});

router.put('/api/students/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const existing = await env.DB.prepare('SELECT * FROM students WHERE id = ?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare(`UPDATE students SET photo_url=?, name=?, father_name=?, mother_name=?, dob=?, gender=?, category=?, religion=?, phone=?, email=?, address=?, aadhar_no=?, class_id=?, section=?, session=?, roll_no=?, route_id=?, id_type=?, status=?, fee_amount=?, extra_data=? WHERE id=?`)
        .bind(
            d.photo_url ?? existing.photo_url ?? '',
            d.name ?? existing.name ?? '',
            d.father_name ?? existing.father_name ?? '',
            d.mother_name ?? existing.mother_name ?? '',
            d.dob ?? existing.dob ?? '',
            d.gender ?? existing.gender ?? '',
            d.category ?? existing.category ?? '',
            d.religion ?? existing.religion ?? '',
            d.phone ?? existing.phone ?? '',
            d.email ?? existing.email ?? '',
            d.address ?? existing.address ?? '',
            d.aadhar_no ?? existing.aadhar_no ?? '',
            d.class_id ?? existing.class_id ?? null,
            d.section ?? existing.section ?? '',
            d.session ?? existing.session ?? '',
            d.roll_no ?? existing.roll_no ?? null,
            d.route_id ?? existing.route_id ?? null,
            d.id_type ?? existing.id_type ?? 'Aadharshila ID',
            d.status ?? existing.status ?? 'Active',
            d.fee_amount ?? existing.fee_amount ?? 0,
            d.extra_data ?? existing.extra_data ?? '{}',
            params.id
        ).run();

    const finalClassId = d.class_id ?? existing.class_id;
    const finalRouteId = d.route_id ?? existing.route_id;
    const finalCategory = d.category ?? existing.category ?? 'Default';
    const finalSession = d.session ?? existing.session ?? '';
    if (d.fee_amount === undefined && finalClassId) {
        try {
            const bid = existing.branch_id;
            const finalSlabs = await getStudentSlabs(env, bid, finalClassId, finalCategory, finalSession);
            const slabAnnual = computeSlabAnnual(finalSlabs);
            const route = finalRouteId ? await env.DB.prepare('SELECT fee FROM transport_routes WHERE id=?').bind(finalRouteId).first() : null;
            const tFee = route ? Number(route.fee||0)*12 : 0;
            const computedFee = roundCurrency(slabAnnual + tFee);
            await env.DB.prepare('UPDATE students SET fee_amount=? WHERE id=?').bind(computedFee, params.id).run();
        } catch(e) {  }
    }
    return json({ success: true });
});

router.post('/api/students/recompute-fees', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const effBranch = await getEffectiveBranchId(req, env, user);
    const branchId = effBranch ? Number(effBranch) : Number(user.branch_id);
    const { results: students } = await env.DB.prepare(
        `SELECT s.id, s.class_id, s.category, s.session, s.route_id FROM students s WHERE s.branch_id=? AND s.status='Active'`
    ).bind(branchId).all();
    let updated = 0;
    for (const stu of students) {
        try {
            const finalSlabs = await getStudentSlabs(env, branchId, stu.class_id, stu.category, stu.session);
            const slabAnnual = computeSlabAnnual(finalSlabs);
            const route = stu.route_id ? await env.DB.prepare('SELECT fee FROM transport_routes WHERE id=?').bind(stu.route_id).first() : null;
            const tFee = route ? Number(route.fee||0)*12 : 0;
            const computedFee = roundCurrency(slabAnnual + tFee);
            await env.DB.prepare('UPDATE students SET fee_amount=? WHERE id=?').bind(computedFee, stu.id).run();
            updated++;
        } catch(e) {  }
    }
    return json({ success: true, updated, total: students.length });
});

router.delete('/api/students/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role === 'branch_admin') {
        const access = await ensureBranchAccess(env, user, 'students', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM student_attendance WHERE student_id=?').bind(params.id).run();
    const { results: deposits } = await env.DB.prepare('SELECT id FROM fee_deposits WHERE student_id=?').bind(params.id).all();
    if (deposits.length) {
        const depositIds = deposits.map(d => d.id);
        const phd = depositIds.map(() => '?').join(',');
        await env.DB.prepare(`DELETE FROM fee_deposit_items WHERE deposit_id IN (${phd})`).bind(...depositIds).run();
    }
    await env.DB.prepare('DELETE FROM fee_deposits WHERE student_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM exam_results WHERE student_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM student_subjects WHERE student_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM book_issues WHERE student_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM fee_discounts WHERE student_id=?').bind(params.id).run();
    await env.DB.prepare("DELETE FROM face_descriptors WHERE person_type='student' AND person_id=?").bind(params.id).run();
    await env.DB.prepare('DELETE FROM students WHERE id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM users WHERE linked_id=? AND role="student"').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/staff', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin','teacher','staff'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    let q = 'SELECT * FROM staff WHERE 1=1';
    const binds = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id = ?'; binds.push(effBranch); }
    const status = url.searchParams.get('status');
    if (status && status !== 'All') { q += ' AND status = ?'; binds.push(status); }
    const designation = url.searchParams.get('designation');
    if (designation && designation !== 'All') { q += ' AND designation = ?'; binds.push(designation); }
    q += ' ORDER BY name';
    const { results } = binds.length ? await env.DB.prepare(q).bind(...binds).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.get('/api/staff/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const s = await env.DB.prepare(`SELECT s.*, u.login_id
        FROM staff s
        LEFT JOIN users u ON u.linked_id = s.id AND u.role IN ('teacher','staff')
        WHERE s.id = ?`).bind(params.id).first();
    if (!s) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, s.branch_id))) return json({ error: 'Forbidden' }, 403);
    return json(s);
});

router.post('/api/staff', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const branchId = await getWritableBranchId(req, env, user, d.branch_id);
    const branch = await env.DB.prepare('SELECT code FROM branches WHERE id = ?').bind(branchId).first();
    const code = branch ? branch.code : 'SCH';
    const yr = new Date().getFullYear();
    const serial = await getNextId(env.DB, branchId, 'employee', yr);
    const empId = `${code}-EMP${yr}${String(serial).padStart(3, '0')}`;

    const r = await env.DB.prepare(`INSERT INTO staff (branch_id, employee_id, photo_url, name, father_name, dob, gender, designation, qualification, phone, email, address, aadhar_no, joining_date, basic_salary, bank_name, account_no, ifsc_code, pan_no, status, extra_data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(branchId, empId, d.photo_url || '', d.name, d.father_name || '', d.dob || '', d.gender || '', d.designation || '', d.qualification || '', d.phone || '', d.email || '', d.address || '', d.aadhar_no || '', d.joining_date || '', d.basic_salary || 0, d.bank_name || '', d.account_no || '', d.ifsc_code || '', d.pan_no || '', 'Active', d.extra_data || '{}').run();

    const staffId = r.meta.last_row_id;
    const staffRole = (d.designation === 'Teacher' || d.designation === 'Vice Principal') ? 'teacher' : 'staff';
    const staffPwd = generatePassword();
    const staffPwdHash = await hashPassword(staffPwd);
    await env.DB.prepare('INSERT INTO users (login_id, password_hash, role, branch_id, linked_id) VALUES (?,?,?,?,?)')
        .bind(empId, staffPwdHash, staffRole, branchId, staffId).run();
    return json({ id: staffId, employee_id: empId, password: staffPwd }, 201);
});

router.put('/api/staff/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin', 'teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const existing = await env.DB.prepare('SELECT * FROM staff WHERE id = ?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (user.role !== 'teacher' && !(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (user.role === 'teacher') {
        if (Number(user.linked_id) !== Number(params.id)) return json({ error: 'Forbidden' }, 403);
        await env.DB.prepare('UPDATE staff SET photo_url=?, phone=?, email=?, address=? WHERE id=?')
            .bind(
                d.photo_url ?? existing.photo_url ?? '',
                d.phone ?? existing.phone ?? '',
                d.email ?? existing.email ?? '',
                d.address ?? existing.address ?? '',
                params.id
            ).run();
        return json({ success: true });
    }
    await env.DB.prepare(`UPDATE staff SET photo_url=?, name=?, father_name=?, dob=?, gender=?, designation=?, qualification=?, phone=?, email=?, address=?, aadhar_no=?, joining_date=?, basic_salary=?, bank_name=?, account_no=?, ifsc_code=?, pan_no=?, status=?, extra_data=? WHERE id=?`)
        .bind(
            d.photo_url ?? existing.photo_url ?? '',
            d.name ?? existing.name,
            d.father_name ?? existing.father_name ?? '',
            d.dob ?? existing.dob ?? '',
            d.gender ?? existing.gender ?? '',
            d.designation ?? existing.designation ?? '',
            d.qualification ?? existing.qualification ?? '',
            d.phone ?? existing.phone ?? '',
            d.email ?? existing.email ?? '',
            d.address ?? existing.address ?? '',
            d.aadhar_no ?? existing.aadhar_no ?? '',
            d.joining_date ?? existing.joining_date ?? '',
            d.basic_salary ?? existing.basic_salary ?? 0,
            d.bank_name ?? existing.bank_name ?? '',
            d.account_no ?? existing.account_no ?? '',
            d.ifsc_code ?? existing.ifsc_code ?? '',
            d.pan_no ?? existing.pan_no ?? '',
            d.status ?? existing.status ?? 'Active',
            d.extra_data ?? existing.extra_data ?? '{}',
            params.id
        ).run();
    return json({ success: true });
});

router.delete('/api/staff/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const existing = await env.DB.prepare('SELECT * FROM staff WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM generated_salaries WHERE staff_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM staff_attendance WHERE staff_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM teacher_permissions WHERE staff_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM salary_settings WHERE staff_id=?').bind(params.id).run();
    await env.DB.prepare("DELETE FROM face_descriptors WHERE person_type='staff' AND person_id=?").bind(params.id).run();
    await env.DB.prepare('DELETE FROM staff WHERE id=?').bind(params.id).run();
    await env.DB.prepare("DELETE FROM users WHERE linked_id=? AND role IN ('teacher','staff')").bind(params.id).run();
    return json({ success: true });
});

const SAFE_COL_RE = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
function sanitizeCols(keys) {
    return keys.filter(k => k !== 'id' && k !== 'branch_id' && SAFE_COL_RE.test(k));
}

function masterCRUD(table, nameField = 'name') {
    router.get(`/api/${table}`, async (req, env) => {
        const user = await authenticate(req, env);
        if (!user) return json({ error: 'Unauthorized' }, 401);
        const bid = await getEffectiveBranchId(req, env, user);
        const q = bid ? `SELECT * FROM ${table} WHERE branch_id = ? ORDER BY id` : `SELECT * FROM ${table} ORDER BY id`;
        const { results } = bid ? await env.DB.prepare(q).bind(bid).all() : await env.DB.prepare(q).all();
        return json(results);
    });
    router.post(`/api/${table}`, async (req, env) => {
        const user = await authenticate(req, env);
        if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
        const d = await req.json();
        const bid = await getWritableBranchId(req, env, user, d.branch_id);
        const cols = sanitizeCols(Object.keys(d));
        if (!cols.length) return json({ error: 'No valid fields' }, 400);
        const vals = cols.map(k => d[k]);
        const r = await env.DB.prepare(`INSERT INTO ${table} (branch_id, ${cols.join(',')}) VALUES (?, ${cols.map(() => '?').join(',')})`)
            .bind(bid, ...vals).run();
        return json({ id: r.meta.last_row_id, ...d }, 201);
    });
    router.put(`/api/${table}/:id`, async (req, env, params) => {
        const user = await authenticate(req, env);
        if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
        const d = await req.json();
        const cols = sanitizeCols(Object.keys(d));
        if (!cols.length) return json({ error: 'No valid fields' }, 400);
        const sets = cols.map(k => `${k}=?`);
        const vals = cols.map(k => d[k]);
        if (user.role !== 'super_admin') {
            const access = await ensureBranchAccess(env, user, table, params.id);
            if (access.error) return json({ error: access.error }, access.status);
        }
        await env.DB.prepare(`UPDATE ${table} SET ${sets.join(',')} WHERE id=?`).bind(...vals, params.id).run();
        return json({ success: true });
    });
    router.delete(`/api/${table}/:id`, async (req, env, params) => {
        const user = await authenticate(req, env);
        if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
        if (user.role !== 'super_admin') {
            const access = await ensureBranchAccess(env, user, table, params.id);
            if (access.error) return json({ error: access.error }, access.status);
        }
        const result = await env.DB.prepare(`DELETE FROM ${table} WHERE id=?`).bind(params.id).run();
        if (!result.meta.changes) return json({ error: 'Not found' }, 404);
        return json({ success: true });
    });
}

['classes', 'sections', 'subjects', 'designations', 'fee_particulars', 'expense_heads', 'income_heads',
    'deduction_heads', 'allowance_heads', 'transport_routes', 'vehicles', 'book_types', 'exam_names',
    'exam_groups', 'periods', 'homework_types', 'houses', 'streams', 'grading_system',
    'notices', 'holidays', 'academic_sessions', 'admit_card_instructions', 'syllabi', 'sms_templates'].forEach(t => masterCRUD(t));

router.get('/iclock/cdata', async (req, env) => {
    const serial = getRequestSerial(req);
    const device = await markDeviceSeen(env, serial);
    await logAdmsRequest(env, req, serial, device);
    if (!device) await logUnknownDevice(env, req, serial);
    return textResponse(admsOptionsResponse(serial));
});

router.post('/iclock/cdata', async (req, env) => {
    const serial = getRequestSerial(req);
    const body = await req.text();
    const device = await markDeviceSeen(env, serial);
    await logAdmsRequest(env, req, serial, device, body);
    if (!device) {
        await logUnknownDevice(env, req, serial, body);
        return textResponse(`OK\nDateTime=${formatAdmsDateTime()}`);
    }
    const url = new URL(req.url);
    const table = String(url.searchParams.get('table') || url.searchParams.get('tablename') || '').toUpperCase();
    const shouldParseAttendance = !table || ['ATTLOG', 'ATTLOGS', 'CHECKINOUT'].includes(table);
    const result = shouldParseAttendance
        ? await saveDeviceAttendanceRecords(env, device, serial, body)
        : { saved: 0, duplicates: 0 };
    return textResponse(`OK: ${result.saved}\nDateTime=${formatAdmsDateTime()}`);
});

router.get('/iclock/getrequest', async (req, env) => {
    const serial = getRequestSerial(req);
    const device = await markDeviceSeen(env, serial);
    await logAdmsRequest(env, req, serial, device);
    if (!device) {
        await logUnknownDevice(env, req, serial);
        return textResponse(`OK\nDateTime=${formatAdmsDateTime()}`);
    }
    await queuePendingFaceRegistrationsForDevice(env, serial);
    const commands = await buildQueuedDeviceCommands(env, serial);
    return textResponse(commands || `OK\nDateTime=${formatAdmsDateTime()}`);
});

router.post('/iclock/devicecmd', async (req, env) => {
    const serial = getRequestSerial(req);
    const body = await req.text();
    const device = await markDeviceSeen(env, serial);
    await logAdmsRequest(env, req, serial, device, body);
    if (!device) {
        await logUnknownDevice(env, req, serial, body);
        return textResponse('OK');
    }
    await applyDeviceCommandResults(env, serial, body);
    return textResponse('OK');
});

router.get('/api/devices', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    let q = `SELECT d.*, b.name as branch_name, b.school_name,
        (SELECT ar.endpoint FROM adms_request_logs ar WHERE ar.serial_number=d.serial_number ORDER BY ar.id DESC LIMIT 1) as last_adms_endpoint,
        (SELECT ar.method FROM adms_request_logs ar WHERE ar.serial_number=d.serial_number ORDER BY ar.id DESC LIMIT 1) as last_adms_method,
        (SELECT ar.user_agent FROM adms_request_logs ar WHERE ar.serial_number=d.serial_number ORDER BY ar.id DESC LIMIT 1) as last_adms_user_agent,
        (SELECT ar.ip_address FROM adms_request_logs ar WHERE ar.serial_number=d.serial_number ORDER BY ar.id DESC LIMIT 1) as last_adms_ip,
        (SELECT ar.received_at FROM adms_request_logs ar WHERE ar.serial_number=d.serial_number ORDER BY ar.id DESC LIMIT 1) as last_adms_received_at,
        CASE WHEN d.last_seen IS NOT NULL AND datetime(d.last_seen) >= datetime('now','-10 minutes') THEN 'online' ELSE 'offline' END as computed_status
        FROM devices d LEFT JOIN branches b ON d.branch_id=b.id WHERE 1=1`;
    const binds = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND d.branch_id=?'; binds.push(effBranch); }
    if (status && status !== 'All') {
        if (status === 'online') q += " AND d.last_seen IS NOT NULL AND datetime(d.last_seen) >= datetime('now','-10 minutes')";
        if (status === 'offline') q += " AND (d.last_seen IS NULL OR datetime(d.last_seen) < datetime('now','-10 minutes'))";
    }
    q += ' ORDER BY b.name, d.device_name';
    const { results } = binds.length ? await env.DB.prepare(q).bind(...binds).all() : await env.DB.prepare(q).all();
    return json((results || []).map(row => ({ ...row, status: row.computed_status || row.status || 'offline' })));
});

router.post('/api/devices', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const branchId = await getWritableBranchId(req, env, user, d.branch_id);
    if (!branchId) return json({ error: 'branch_id required' }, 400);
    const serial = normalizeDeviceSerial(d.serial_number);
    const name = String(d.device_name || '').trim();
    if (!serial || !name) return json({ error: 'Device name and serial number are required' }, 400);
    try {
        const result = await env.DB.prepare(
            "INSERT INTO devices (device_name, serial_number, branch_id, school_id, location, status) VALUES (?,?,?,?,?,'offline')"
        ).bind(name, serial, branchId, d.school_id || branchId, String(d.location || '').trim()).run();
        return json({ id: result.meta.last_row_id, device_name: name, serial_number: serial, branch_id: branchId, location: d.location || '', status: 'offline' }, 201);
    } catch (error) {
        if (String(error.message || '').includes('UNIQUE')) return json({ error: 'This serial number is already linked to another branch' }, 409);
        throw error;
    }
});

router.put('/api/devices/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const existing = await env.DB.prepare('SELECT * FROM devices WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const serial = normalizeDeviceSerial(d.serial_number ?? existing.serial_number);
    const name = String(d.device_name ?? existing.device_name ?? '').trim();
    const location = String(d.location ?? existing.location ?? '').trim();
    if (!serial || !name) return json({ error: 'Device name and serial number are required' }, 400);
    try {
        await env.DB.prepare("UPDATE devices SET device_name=?, serial_number=?, location=?, updated_at=datetime('now') WHERE id=?")
            .bind(name, serial, location, params.id).run();
        if (serial !== existing.serial_number) {
            await env.DB.prepare('UPDATE face_registrations SET device_serial=? WHERE device_serial=?').bind(serial, existing.serial_number).run();
            await env.DB.prepare('UPDATE device_commands SET device_serial=? WHERE device_serial=?').bind(serial, existing.serial_number).run();
        }
        return json({ success: true });
    } catch (error) {
        if (String(error.message || '').includes('UNIQUE')) return json({ error: 'This serial number is already linked to another branch' }, 409);
        throw error;
    }
});

router.delete('/api/devices/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const existing = await env.DB.prepare('SELECT * FROM devices WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM device_commands WHERE device_serial=?').bind(existing.serial_number).run();
    await env.DB.prepare('DELETE FROM face_registrations WHERE device_serial=?').bind(existing.serial_number).run();
    await env.DB.prepare('DELETE FROM devices WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/face-registrations', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin', 'branch_admin', 'teacher', 'staff'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    const userType = url.searchParams.get('user_type');
    const userId = url.searchParams.get('user_id');
    let q = `SELECT fr.*, d.device_name, d.location, d.last_seen, b.name as branch_name,
        CASE WHEN d.last_seen IS NOT NULL AND datetime(d.last_seen) >= datetime('now','-10 minutes') THEN 'online' ELSE 'offline' END as device_status
        FROM face_registrations fr
        LEFT JOIN devices d ON fr.device_serial=d.serial_number
        LEFT JOIN branches b ON fr.branch_id=b.id
        WHERE 1=1`;
    const binds = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND fr.branch_id=?'; binds.push(effBranch); }
    if (userType) { q += ' AND fr.user_type=?'; binds.push(userType); }
    if (userId) { q += ' AND fr.user_id=?'; binds.push(userId); }
    if (user.role === 'teacher' || user.role === 'staff') {
        q += " AND fr.user_type='staff' AND fr.user_id=?";
        binds.push(user.linked_id);
    }
    q += ' ORDER BY b.name, d.device_name, fr.id DESC';
    const { results } = binds.length ? await env.DB.prepare(q).bind(...binds).all() : await env.DB.prepare(q).all();
    return json(results || []);
});

router.post('/api/face-registrations', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (!['student', 'staff'].includes(d.user_type)) return json({ error: 'Invalid user_type' }, 400);
    const person = await getPersonForFaceRegistration(env, d.user_type, Number(d.user_id));
    if (!person) return json({ error: 'User not found' }, 404);
    if (!(await userCanAccessBranch(env, user, person.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (d.branch_id && !(await userCanAccessBranch(env, user, d.branch_id))) return json({ error: 'Forbidden' }, 403);
    const result = await registerFaceForUser(env, {
        user_type: d.user_type,
        user_id: Number(d.user_id),
        branch_id: d.branch_id || undefined,
        device_serial: d.device_serial || '',
        photo_path: d.photo_path || person.photo_url || '',
        allowed_branch_ids: user.role === 'super_admin' ? [] : await getUserAssignedBranchIds(env, user.id, user.branch_id)
    });
    if (result.error) return json({ error: result.error }, 400);
    return json({ success: true, registrations: result.rows, total: result.total }, 201);
});

router.post('/api/face-registrations/:id/retry', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const reg = await env.DB.prepare('SELECT * FROM face_registrations WHERE id=?').bind(params.id).first();
    if (!reg) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, reg.branch_id))) return json({ error: 'Forbidden' }, 403);
    const person = await getPersonForFaceRegistration(env, reg.user_type, reg.user_id);
    const device = await getDeviceBySerial(env, reg.device_serial);
    if (!person || !device) return json({ error: 'Person or device not found' }, 404);
    await env.DB.prepare("UPDATE face_registrations SET registration_status='pending', last_error='', updated_at=datetime('now') WHERE id=?").bind(reg.id).run();
    await queueFaceRegistrationCommands(env, reg.id, person, device);
    return json({ success: true });
});

router.delete('/api/face-registrations/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const reg = await env.DB.prepare('SELECT * FROM face_registrations WHERE id=?').bind(params.id).first();
    if (!reg) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, reg.branch_id))) return json({ error: 'Forbidden' }, 403);
    const device = await getDeviceBySerial(env, reg.device_serial);
    const wasPushed = reg.registration_status === 'success' || !!reg.last_push_at;
    await clearPendingFaceCommands(env, reg);
    if (device && wasPushed) {
        await queueDeviceCommand(env, {
            device_serial: reg.device_serial,
            branch_id: reg.branch_id,
            school_id: reg.school_id || reg.branch_id || null,
            face_registration_id: null,
            command_type: 'face_remove',
            command_text: buildFaceDeleteCommand(reg.target_pin)
        });
    }
    await env.DB.prepare('DELETE FROM face_registrations WHERE id=?').bind(params.id).run();
    return json({ success: true, removed: true, pending_device_remove: !!(device && wasPushed) });
});

router.get('/api/attendance/device-dashboard', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    const date = url.searchParams.get('date') || formatAdmsDateTime().slice(0, 10);
    const effBranch = await getEffectiveBranchId(req, env, user);
    const branchClause = effBranch ? ' AND branch_id=?' : '';
    const branchJoinClause = effBranch ? ' AND al.branch_id=?' : '';
    const branchBinds = effBranch ? [effBranch] : [];

    const studentTotals = branchBinds.length
        ? await env.DB.prepare(`SELECT COUNT(*) as total FROM students WHERE status='Active'${branchClause}`).bind(...branchBinds).first()
        : await env.DB.prepare("SELECT COUNT(*) as total FROM students WHERE status='Active'").first();
    const staffTotals = branchBinds.length
        ? await env.DB.prepare(`SELECT COUNT(*) as total FROM staff WHERE status='Active'${branchClause}`).bind(...branchBinds).first()
        : await env.DB.prepare("SELECT COUNT(*) as total FROM staff WHERE status='Active'").first();
    const studentPresent = await env.DB.prepare(`SELECT COUNT(DISTINCT user_id) as total FROM attendance_logs WHERE user_type='student' AND punch_type='IN' AND date(punch_time)=?${branchClause}`).bind(date, ...branchBinds).first();
    const staffPresent = await env.DB.prepare(`SELECT COUNT(DISTINCT user_id) as total FROM attendance_logs WHERE user_type='staff' AND punch_type='IN' AND date(punch_time)=?${branchClause}`).bind(date, ...branchBinds).first();

    const { results: perDevice } = await env.DB.prepare(`SELECT d.id, d.device_name, d.serial_number, d.location, d.branch_id, b.name as branch_name,
        CASE WHEN d.last_seen IS NOT NULL AND datetime(d.last_seen) >= datetime('now','-10 minutes') THEN 'online' ELSE 'offline' END as status,
        COUNT(al.id) as punch_count,
        COUNT(DISTINCT CASE WHEN al.user_type='student' THEN al.user_id END) as students,
        COUNT(DISTINCT CASE WHEN al.user_type='staff' THEN al.user_id END) as staff
        FROM devices d
        LEFT JOIN branches b ON d.branch_id=b.id
        LEFT JOIN attendance_logs al ON al.device_serial=d.serial_number AND date(al.punch_time)=?
        WHERE 1=1${effBranch ? ' AND d.branch_id=?' : ''}
        GROUP BY d.id
        ORDER BY b.name, d.device_name`).bind(date, ...branchBinds).all();

    const { results: entries } = await env.DB.prepare(`SELECT al.user_id, al.user_type, al.branch_id, al.device_serial,
        d.device_name, d.location, b.name as branch_name,
        COALESCE(s.name, st.name, al.user_id) as person_name,
        s.admission_no, s.roll_no, c.name as class_name, s.section,
        st.employee_id, st.designation,
        MIN(CASE WHEN al.punch_type='IN' THEN al.punch_time END) as in_time,
        MAX(CASE WHEN al.punch_type='OUT' THEN al.punch_time END) as out_time,
        COUNT(*) as punch_count
        FROM attendance_logs al
        LEFT JOIN devices d ON al.device_serial=d.serial_number
        LEFT JOIN branches b ON al.branch_id=b.id
        LEFT JOIN students s ON al.user_type='student' AND al.user_id=s.id
        LEFT JOIN classes c ON s.class_id=c.id
        LEFT JOIN staff st ON al.user_type='staff' AND al.user_id=st.id
        WHERE date(al.punch_time)=?${branchJoinClause}
        GROUP BY al.user_type, al.user_id, al.device_serial
        ORDER BY b.name, d.device_name, person_name`).bind(date, ...branchBinds).all();

    const { results: branches } = await env.DB.prepare(`SELECT b.id, b.name,
        (SELECT COUNT(*) FROM students s WHERE s.branch_id=b.id AND s.status='Active') as total_students,
        (SELECT COUNT(DISTINCT al.user_id) FROM attendance_logs al WHERE al.branch_id=b.id AND al.user_type='student' AND al.punch_type='IN' AND date(al.punch_time)=?) as present_students,
        (SELECT COUNT(*) FROM staff st WHERE st.branch_id=b.id AND st.status='Active') as total_staff,
        (SELECT COUNT(DISTINCT al.user_id) FROM attendance_logs al WHERE al.branch_id=b.id AND al.user_type='staff' AND al.punch_type='IN' AND date(al.punch_time)=?) as present_staff
        FROM branches b
        WHERE 1=1${effBranch ? ' AND b.id=?' : ''}
        ORDER BY b.name`).bind(date, date, ...branchBinds).all();

    const deviceTotals = (perDevice || []).reduce((acc, device) => {
        acc.total++;
        if (device.status === 'online') acc.online++;
        else acc.offline++;
        return acc;
    }, { total: 0, online: 0, offline: 0 });

    return json({
        date,
        summary: {
            students: {
                total: Number(studentTotals.total || 0),
                present: Number(studentPresent.total || 0),
                absent: Math.max(0, Number(studentTotals.total || 0) - Number(studentPresent.total || 0))
            },
            staff: {
                total: Number(staffTotals.total || 0),
                present: Number(staffPresent.total || 0),
                absent: Math.max(0, Number(staffTotals.total || 0) - Number(staffPresent.total || 0))
            },
            devices: deviceTotals
        },
        per_device: perDevice || [],
        branch_comparison: (branches || []).map(row => ({
            ...row,
            absent_students: Math.max(0, Number(row.total_students || 0) - Number(row.present_students || 0)),
            absent_staff: Math.max(0, Number(row.total_staff || 0) - Number(row.present_staff || 0))
        })),
        entries: entries || []
    });
});

router.post('/api/attendance/students', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin', 'teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const { date, records, branch_id } = await req.json();
    const bid = await getWritableBranchId(req, env, user, branch_id);
    if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json({ error: 'No class assigned' }, 403);
        const studentIds = (records || []).map(record => Number(record.student_id)).filter(Boolean);
        if (!studentIds.length) return json({ error: 'No students selected' }, 400);
        const placeholders = studentIds.map(() => '?').join(',');
        const { results: rows } = await env.DB.prepare(`SELECT id, class_id, section FROM students WHERE branch_id=? AND id IN (${placeholders})`)
            .bind(bid, ...studentIds).all();
        if (rows.length !== studentIds.length || rows.some(row => !teacherHasAssignment(assignments, row.class_id, row.section))) {
            return json({ error: 'Forbidden' }, 403);
        }
    }
    for (const r of records) {
        await env.DB.prepare('INSERT OR REPLACE INTO student_attendance (branch_id, student_id, date, status, remark, marked_by) VALUES (?,?,?,?,?,?)')
            .bind(bid, r.student_id, date, r.status, r.remark || '', user.id).run();
    }

    try {
        const _absIds = (records||[]).filter(r => r.status === 'Absent').map(r => r.student_id).filter(Boolean);
        const _presIds = (records||[]).filter(r => r.status === 'Present').map(r => r.student_id).filter(Boolean);
        const _allIds = [...new Set([..._absIds, ..._presIds])];
        if (_allIds.length) {
            const _sett = await getOptionSettingsMap(env, bid);
            const _doAbs = _sett['enable_absent_email_auto'] === '1';
            const _doPres = _sett['enable_present_email_auto'] === '1';
            if ((_doAbs && _absIds.length) || (_doPres && _presIds.length)) {
                const _ph = _allIds.map(() => '?').join(',');
                const { results: _stuList } = await env.DB.prepare('SELECT id, name, email FROM students WHERE id IN (' + _ph + ')').bind(..._allIds).all();
                const _sm = {}; _stuList.forEach(s => { _sm[s.id] = s; });
                const _ep = [];
                if (_doAbs) _absIds.forEach(sid => { const s = _sm[sid]; if (s && s.email) _ep.push(tryAutoEmail(env, bid, 'enable_absent_email_auto', s.email, s.name, 'Attendance Alert \u2014 ' + s.name + ' Absent (' + date + ')', '<p>Dear Parent,</p><p>Your ward <strong>' + s.name + '</strong> was marked <strong style="color:red;">Absent</strong> on <strong>' + date + '</strong>.</p>')); });
                if (_doPres) _presIds.forEach(sid => { const s = _sm[sid]; if (s && s.email) _ep.push(tryAutoEmail(env, bid, 'enable_present_email_auto', s.email, s.name, 'Attendance \u2014 ' + s.name + ' Present (' + date + ')', '<p>Dear Parent,</p><p>Your ward <strong>' + s.name + '</strong> was marked <strong style="color:green;">Present</strong> on <strong>' + date + '</strong>.</p>')); });
                await Promise.all(_ep);
            }
        }
    } catch(e) {}
    return json({ success: true, count: records.length });
});

router.get('/api/attendance/students', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const classId = url.searchParams.get('class_id');
    const section = url.searchParams.get('section');
    const studentId = url.searchParams.get('student_id');
    const month = url.searchParams.get('month'); // YYYY-MM
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    let q = 'SELECT sa.*, s.name, s.admission_no, s.roll_no, s.photo_url, s.father_name, s.class_id, s.section FROM student_attendance sa JOIN students s ON sa.student_id = s.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND sa.branch_id=?'; b.push(effBranch); }
    if (date) { q += ' AND sa.date=?'; b.push(date); }
    if (month) { q += ' AND sa.date LIKE ?'; b.push(month + '%'); }
    if (fromDate) { q += ' AND sa.date>=?'; b.push(fromDate); }
    if (toDate) { q += ' AND sa.date<=?'; b.push(toDate); }
    if (classId) { q += ' AND s.class_id=?'; b.push(classId); }
    if (section) { q += ' AND s.section=?'; b.push(section); }
    if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json([]);
        const { clause, binds: assignmentBinds } = buildTeacherAssignmentClause(assignments, 's.class_id', 's.section');
        q += ` AND (${clause})`;
        b.push(...assignmentBinds);
    }
    if (user.role === 'student') {
        if (studentId && Number(studentId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        q += ' AND sa.student_id=?'; b.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        if (studentId) {
            if (!allowedIds.includes(Number(studentId))) return json({ error: 'Forbidden' }, 403);
            q += ' AND sa.student_id=?'; b.push(studentId);
        } else {
            q += ` AND sa.student_id IN (${allowedIds.map(() => '?').join(',')})`;
            b.push(...allowedIds);
        }
    } else if (studentId) {
        q += ' AND sa.student_id=?'; b.push(studentId);
    }
    q += ' ORDER BY s.roll_no, sa.date';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    results.forEach(r => normalizePhotoUrls(req, r));
    return json(results);
});

router.post('/api/attendance/staff', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const { date, records, branch_id } = await req.json();
    const bid = await getWritableBranchId(req, env, user, branch_id);
    for (const r of records) {
        await env.DB.prepare('INSERT OR REPLACE INTO staff_attendance (branch_id, staff_id, date, status, remark) VALUES (?,?,?,?,?)')
            .bind(bid, r.staff_id, date, r.status, r.remark || '').run();
    }
    return json({ success: true, count: records.length });
});

router.post('/api/attendance/auto-absent', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const { date, branch_id } = await req.json();
    if (!date) return json({ error: 'Date required' }, 400);
    const bid = await getWritableBranchId(req, env, user, branch_id);

    const d = new Date(date + 'T00:00:00');
    const dayOfWeek = d.getDay(); // 0=Sunday

    if (dayOfWeek === 0) {
        const sundaySettings = await getOptionSettingsMap(env, bid);
        if (sundaySettings.enable_sunday_working !== '1') {
            return json({ success: true, skipped: true, reason: 'Sunday' });
        }
    }

    const { results: holidays } = await env.DB.prepare(
        'SELECT id FROM holidays WHERE branch_id=? AND date=?'
    ).bind(bid, date).all();
    if (holidays.length > 0) return json({ success: true, skipped: true, reason: 'Holiday' });

    if (dayOfWeek === 6) {
        const dayOfMonth = d.getDate();
        if (dayOfMonth >= 8 && dayOfMonth <= 14) {
            const settings = await getOptionSettingsMap(env, bid);
            if (settings.face_att_2nd_sat_holiday === '1') {
                return json({ success: true, skipped: true, reason: '2nd Saturday' });
            }
        }
    }

    const { results: unmarkedStudents } = await env.DB.prepare(
        `SELECT id FROM students WHERE branch_id=? AND status='Active'
         AND id NOT IN (SELECT student_id FROM student_attendance WHERE date=? AND branch_id=?)`
    ).bind(bid, date, bid).all();

    const { results: unmarkedStaff } = await env.DB.prepare(
        `SELECT id FROM staff WHERE branch_id=? AND status='Active'
         AND id NOT IN (SELECT staff_id FROM staff_attendance WHERE date=? AND branch_id=?)`
    ).bind(bid, date, bid).all();

    let studentCount = 0, staffCount = 0;
    for (const s of unmarkedStudents) {
        await env.DB.prepare('INSERT OR IGNORE INTO student_attendance (branch_id, student_id, date, status, remark, marked_by) VALUES (?,?,?,?,?,?)')
            .bind(bid, s.id, date, 'A', 'Auto-marked absent', user.id).run();
        studentCount++;
    }
    for (const s of unmarkedStaff) {
        await env.DB.prepare('INSERT OR IGNORE INTO staff_attendance (branch_id, staff_id, date, status, remark) VALUES (?,?,?,?,?)')
            .bind(bid, s.id, date, 'A', 'Auto-marked absent').run();
        staffCount++;
    }
    return json({ success: true, students_marked: studentCount, staff_marked: staffCount });
});

router.get('/api/fee-deposits', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const studentId = url.searchParams.get('student_id');
    const month = url.searchParams.get('month');
    let q = 'SELECT fd.*, s.name as student_name, s.admission_no, s.father_name, s.section, c.name as class_name FROM fee_deposits fd JOIN students s ON fd.student_id = s.id LEFT JOIN classes c ON s.class_id = c.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND fd.branch_id=?'; b.push(effBranch); }
    if (user.role === 'student') {
        if (studentId && Number(studentId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        q += ' AND fd.student_id=?'; b.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        if (studentId) {
            if (!allowedIds.includes(Number(studentId))) return json({ error: 'Forbidden' }, 403);
            q += ' AND fd.student_id=?'; b.push(studentId);
        } else {
            q += ` AND fd.student_id IN (${allowedIds.map(() => '?').join(',')})`;
            b.push(...allowedIds);
        }
    } else if (studentId) {
        q += ' AND fd.student_id=?'; b.push(studentId);
    }
    if (month) { q += ' AND fd.month=?'; b.push(month); }
    const session = url.searchParams.get('session');
    if (session && session !== 'All') { q += ' AND fd.session=?'; b.push(session); }
    q += ' ORDER BY fd.date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/fee-deposits', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const result = await createFeeDepositRecord(env, bid, d);
    if (result.error) return json({ error: result.error }, result.status || 400);
    try {
        const _stu = await env.DB.prepare('SELECT name, email FROM students WHERE id=?').bind(d.student_id).first();
        if (_stu && _stu.email) {
            await tryAutoEmail(env, bid, 'enable_fee_deposit_email', _stu.email, _stu.name,
                'Fee Receipt ' + result.receipt_no + ' \u2014 ' + (d.month || ''),
                '<p>Dear <strong>' + _stu.name + '</strong>,</p><p>Your fee payment of <strong>\u20B9' + (d.received_amount||0) + '</strong> for <strong>' + (d.month||'') + '</strong> has been received.</p><p>Receipt No: <strong>' + result.receipt_no + '</strong></p><p>Thank you.</p>');
        }
    } catch(e) {}
    return json(result, 201);
});

router.get('/api/fee-due-report', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const effBranch = await getEffectiveBranchId(req, env, user);
    const branchId = effBranch ? Number(effBranch) : 1;
    const classId = url.searchParams.get('class_id');
    const section = url.searchParams.get('section');
    const month = url.searchParams.get('month');
    const studentId = url.searchParams.get('student_id');
    const session = url.searchParams.get('session');
    let query = `SELECT s.*, c.name as class_name, tr.name as route_name, tr.fee as transport_fee
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN transport_routes tr ON s.route_id = tr.id
        WHERE s.branch_id=? AND s.status='Active'`;
    const binds = [branchId];
    if (classId) { query += ' AND s.class_id=?'; binds.push(classId); }
    if (section) { query += ' AND s.section=?'; binds.push(section); }
    if (studentId) { query += ' AND s.id=?'; binds.push(studentId); }
    if (session && session !== 'All') { query += ' AND s.session=?'; binds.push(session); }
    if (user.role === 'student') {
        if (studentId && Number(studentId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        query += ' AND s.id=?';
        binds.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        if (studentId) {
            if (!allowedIds.includes(Number(studentId))) return json({ error: 'Forbidden' }, 403);
        } else {
            query += ` AND s.id IN (${allowedIds.map(() => '?').join(',')})`;
            binds.push(...allowedIds);
        }
    }
    query += ' ORDER BY c.name, s.section, s.roll_no, s.name';
    const { results: students } = await env.DB.prepare(query).bind(...binds).all();

    if (!students.length) return json([]);

    const SCHOOL_YEAR_MONTHS = ['April','May','June','July','August','September','October','November','December','January','February','March'];
    const monthsToCheck = month ? [month] : SCHOOL_YEAR_MONTHS;

    const classIds = [...new Set(students.map(s => s.class_id).filter(Boolean))];
    const slabCache = {};
    for (const cid of classIds) {
        let slabQ = `SELECT fs.amount, fs.category, fs.particular_id FROM fee_slabs fs
             LEFT JOIN fee_particulars fp ON fs.particular_id = fp.id
             WHERE fs.branch_id=? AND fs.class_id=? AND (fp.is_transport IS NULL OR fp.is_transport = 0)`;
        const slabBinds = [branchId, cid];
        if (session && session !== 'All') {
            slabQ += ` AND (fs.session=? OR fs.session IS NULL OR fs.session='')`;
            slabBinds.push(session);
        }
        const { results: slabs } = await env.DB.prepare(slabQ).bind(...slabBinds).all();
        slabCache[cid] = slabs;
    }

    const studentIds = students.map(s => s.id);
    const allDiscounts = {};
    if (studentIds.length) {
        let discQ = `SELECT student_id, month, amount FROM fee_discounts WHERE branch_id=? AND student_id IN (${studentIds.map(() => '?').join(',')})`;
        const discBinds = [branchId, ...studentIds];
        if (session && session !== 'All') {
            discQ += ` AND (session=? OR session IS NULL OR session='')`;
            discBinds.push(session);
        }
        const { results: discRows } = await env.DB.prepare(discQ).bind(...discBinds).all();
        for (const d of discRows) {
            if (!allDiscounts[d.student_id]) allDiscounts[d.student_id] = [];
            allDiscounts[d.student_id].push(d);
        }
    }

    const allDeposits = {};
    if (studentIds.length) {
        let depQuery = `SELECT student_id, month, received_amount, balance, date, created_at, id${session && session !== 'All' ? ', session' : ''} FROM fee_deposits WHERE branch_id=? AND student_id IN (${studentIds.map(() => '?').join(',')})`;
        const depBinds = [branchId, ...studentIds];
        if (session && session !== 'All') {
            depQuery += ' AND session=?';
            depBinds.push(session);
        }
        depQuery += ' ORDER BY date DESC, created_at DESC, id DESC';
        const { results: depRows } = await env.DB.prepare(depQuery).bind(...depBinds).all();
        for (const d of depRows) {
            const key = `${d.student_id}_${d.month}`;
            if (!allDeposits[key]) allDeposits[key] = [];
            allDeposits[key].push(d);
        }
    }

    const rows = [];

    for (const student of students) {
        const category = student.category || 'Default';
        const classSlabs = slabCache[student.class_id] || [];
        const catSlabs = classSlabs.filter(s => s.category === category);
        const slabs = catSlabs.length ? catSlabs : classSlabs.filter(s => (s.category || 'Default') === 'Default');
        const baseMonthlyFee = roundCurrency(slabs.reduce((sum, slab) => sum + Number(slab.amount || 0), 0));
        const transportFee = roundCurrency(student.transport_fee || 0);
        const oldBalance = roundCurrency(student.old_balance || 0);
        const dueMonths = [];
        const monthDetails = [];

        const stuDiscounts = allDiscounts[student.id] || [];

        let totalPaidAllMonths = 0;
        for (const monthName of monthsToCheck) {
            const deposits = allDeposits[`${student.id}_${monthName}`] || [];
            totalPaidAllMonths += deposits.reduce((sum, item) => sum + Number(item.received_amount || 0), 0);
        }
        totalPaidAllMonths = roundCurrency(totalPaidAllMonths);

        let totalAnnualCharge = 0;
        for (const monthName of monthsToCheck) {
            const monthDiscs = stuDiscounts.filter(d => !d.month || d.month === '' || d.month === monthName);
            const monthlyDiscount = roundCurrency(monthDiscs.reduce((sum, item) => sum + Number(item.amount || 0), 0));
            const monthlyCharge = Math.max(0, roundCurrency(baseMonthlyFee + transportFee - monthlyDiscount));
            totalAnnualCharge += monthlyCharge;
        }
        totalAnnualCharge = roundCurrency(totalAnnualCharge);

        if (totalPaidAllMonths >= roundCurrency(totalAnnualCharge + oldBalance)) continue;

        let paymentPool = totalPaidAllMonths;
        let totalDue = oldBalance;

        if (paymentPool > 0 && oldBalance > 0) {
            paymentPool = Math.max(0, roundCurrency(paymentPool - oldBalance));
        }

        for (const monthName of monthsToCheck) {
            const monthDiscs = stuDiscounts.filter(d => !d.month || d.month === '' || d.month === monthName);
            const monthlyDiscount = roundCurrency(monthDiscs.reduce((sum, item) => sum + Number(item.amount || 0), 0));
            const monthlyCharge = Math.max(0, roundCurrency(baseMonthlyFee + transportFee - monthlyDiscount));

            let monthOutstanding = monthlyCharge;
            if (paymentPool >= monthlyCharge) {
                paymentPool = roundCurrency(paymentPool - monthlyCharge);
                monthOutstanding = 0;
            } else if (paymentPool > 0) {
                monthOutstanding = roundCurrency(monthlyCharge - paymentPool);
                paymentPool = 0;
            }

            if (monthOutstanding > 0) {
                dueMonths.push(monthName);
                monthDetails.push({ month: monthName, due_amount: monthOutstanding, discount: monthlyDiscount, base_amount: baseMonthlyFee, transport_fee: transportFee });
                totalDue = roundCurrency(totalDue + monthOutstanding);
            }
        }

        if (totalDue <= 0) continue;
        const status = dueMonths.length < monthsToCheck.length ? 'partial' : 'unpaid';
        rows.push({
            student_id: student.id,
            admission_no: student.admission_no,
            student_name: student.name,
            father_name: student.father_name || '',
            class_name: student.class_name || '-',
            section: student.section || '',
            category: student.category || 'General',
            phone: student.phone || '',
            email: student.email || '',
            route_name: student.route_name || '',
            transport_fee: transportFee,
            due_months: dueMonths,
            month_details: monthDetails,
            old_balance: oldBalance,
            total_due: totalDue,
            status
        });
    }

    return json(rows);
});

router.get('/api/fee-deposits/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const { id } = params;
    let q = 'SELECT fd.*, s.name as student_name, s.admission_no, s.father_name, s.section, c.name as class_name FROM fee_deposits fd JOIN students s ON fd.student_id = s.id LEFT JOIN classes c ON s.class_id = c.id WHERE fd.id=?';
    const row = await env.DB.prepare(q).bind(id).first();
    if (!row) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, row.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (user.role === 'student' && Number(row.student_id) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
    if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.includes(Number(row.student_id))) return json({ error: 'Forbidden' }, 403);
    }
    const { results: items } = await env.DB.prepare('SELECT fdi.particular_id, fdi.amount, fp.name as particular_name FROM fee_deposit_items fdi LEFT JOIN fee_particulars fp ON fdi.particular_id = fp.id WHERE fdi.deposit_id=?').bind(id).all();
    row.items = items;
    return json(row);
});

router.get('/api/payment-requests', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    let q = `SELECT opr.*, s.name as student_name, s.father_name, s.admission_no, s.section,
        c.name as class_name, fd.receipt_no
        FROM online_payment_requests opr
        JOIN students s ON opr.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN fee_deposits fd ON opr.receipt_id = fd.id
        WHERE 1=1`;
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND opr.branch_id=?'; b.push(effBranch); }
    if (user.role === 'student') {
        q += ' AND opr.student_id=?';
        b.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        q += ` AND opr.student_id IN (${allowedIds.map(() => '?').join(',')})`;
        b.push(...allowedIds);
    }
    const studentId = url.searchParams.get('student_id');
    const status = url.searchParams.get('status');
    const classId = url.searchParams.get('class_id');
    const section = url.searchParams.get('section');
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    if (studentId) { q += ' AND opr.student_id=?'; b.push(studentId); }
    if (status) { q += ' AND opr.status=?'; b.push(status); }
    if (classId) { q += ' AND s.class_id=?'; b.push(classId); }
    if (section) { q += ' AND s.section=?'; b.push(section); }
    if (fromDate) { q += ' AND opr.request_date>=?'; b.push(fromDate); }
    if (toDate) { q += ' AND opr.request_date<=?'; b.push(toDate); }
    q += ' ORDER BY opr.request_date DESC, opr.created_at DESC, opr.id DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    results.forEach(row => {
        row.payment_proof_url = toAbsoluteFileUrl(req, row.payment_proof_url);
        row.can_review = isAdminRole(user) && row.status === 'Requested';
    });
    return json(results);
});

router.get('/api/payment-requests/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const row = await env.DB.prepare(`SELECT opr.*, s.name as student_name, s.father_name, s.admission_no, s.section,
        s.class_id, s.session as student_session, c.name as class_name, fd.receipt_no
        FROM online_payment_requests opr
        JOIN students s ON opr.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN fee_deposits fd ON opr.receipt_id = fd.id
        WHERE opr.id=?`).bind(params.id).first();
    if (!row) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, row.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (user.role === 'student' && Number(row.student_id) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
    if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.includes(Number(row.student_id))) return json({ error: 'Forbidden' }, 403);
    }
    row.payment_proof_url = toAbsoluteFileUrl(req, row.payment_proof_url);
    row.can_review = isAdminRole(user) && row.status === 'Requested';
    return json(row);
});

router.post('/api/payment-requests', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || user.role !== 'parent') return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (!d.student_id || !d.month || !d.transaction_id || !d.requested_amount) {
        return json({ error: 'student_id, month, amount and transaction_id are required' }, 400);
    }
    const amount = roundCurrency(d.requested_amount);
    if (amount <= 0) return json({ error: 'Requested amount must be greater than zero' }, 400);
    const allowedIds = await getAccessibleStudentIdsForUser(env, user);
    if (!allowedIds.includes(Number(d.student_id))) return json({ error: 'Forbidden' }, 403);
    const student = await env.DB.prepare('SELECT id, branch_id, session FROM students WHERE id=? AND status=?').bind(d.student_id, 'Active').first();
    if (!student) return json({ error: 'Student not found' }, 404);

    const existing = await env.DB.prepare('SELECT id FROM online_payment_requests WHERE branch_id=? AND student_id=? AND month=? AND status=?')
        .bind(student.branch_id, d.student_id, d.month, 'Requested').first();
    if (existing) return json({ error: 'A request for this month is already pending' }, 409);

    const requestDate = d.request_date && isValidISODate(d.request_date) ? d.request_date : new Date().toISOString().slice(0, 10);
    const result = await env.DB.prepare(`INSERT INTO online_payment_requests
        (branch_id, student_id, parent_phone, request_date, month, requested_amount, transaction_id, payment_proof_url, parent_note, status, session)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(student.branch_id, d.student_id, user.login_id || '', requestDate, d.month, amount, String(d.transaction_id).trim(), d.payment_proof_url || '', d.parent_note || '', 'Requested', d.session || student.session || '')
        .run();
    return json({ id: result.meta.last_row_id, success: true }, 201);
});

router.put('/api/payment-requests/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !isAdminRole(user)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const status = String(d.status || '').trim();
    if (!['Accepted', 'Rejected'].includes(status)) return json({ error: 'Valid status is required' }, 400);

    const row = await env.DB.prepare('SELECT * FROM online_payment_requests WHERE id=?').bind(params.id).first();
    if (!row) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, row.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (row.status !== 'Requested') return json({ error: 'This request has already been reviewed' }, 409);

    let receiptInfo = null;
    if (status === 'Accepted') {
        receiptInfo = await createFeeDepositRecord(env, row.branch_id, {
            date: new Date().toISOString().slice(0, 10),
            student_id: row.student_id,
            month: row.month,
            total_amount: row.requested_amount,
            late_fee: 0,
            concession: 0,
            grand_total: row.requested_amount,
            received_amount: row.requested_amount,
            balance: 0,
            payment_mode: 'Online',
            category: 'Online',
            remarks: `Online payment approved. Txn ID: ${row.transaction_id}${d.admin_note ? ` | ${String(d.admin_note).trim()}` : ''}`,
            session: row.session || ''
        });
        if (receiptInfo.error) return json({ error: receiptInfo.error }, receiptInfo.status || 400);
    }

    await env.DB.prepare(`UPDATE online_payment_requests
        SET status=?, admin_note=?, reviewed_at=?, reviewed_by=?, receipt_id=?
        WHERE id=?`)
        .bind(status, d.admin_note || '', new Date().toISOString(), user.id || null, receiptInfo ? receiptInfo.id : null, params.id)
        .run();

    return json({ success: true, receipt: receiptInfo });
});

router.get('/api/fee-report', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    let q = `SELECT fd.*, s.name as student_name, s.admission_no, s.father_name, s.section, c.name as class_name
        FROM fee_deposits fd
        JOIN students s ON fd.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE 1=1`;
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND fd.branch_id=?'; b.push(effBranch); }
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    const classId = url.searchParams.get('class_id');
    const section = url.searchParams.get('section');
    const paymentMode = url.searchParams.get('payment_mode');
    if (fromDate) { q += ' AND fd.date>=?'; b.push(fromDate); }
    if (toDate) { q += ' AND fd.date<=?'; b.push(toDate); }
    if (classId) { q += ' AND s.class_id=?'; b.push(classId); }
    if (section) { q += ' AND s.section=?'; b.push(section); }
    if (paymentMode) { q += ' AND fd.payment_mode=?'; b.push(paymentMode); }
    const session = url.searchParams.get('session');
    if (session && session !== 'All') { q += ' AND fd.session=?'; b.push(session); }
    q += ' ORDER BY fd.date, fd.id';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.get('/api/fee-report-headwise', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    let q = `SELECT fd.id as deposit_id, fd.date, fd.receipt_no, fd.payment_mode, fd.total_amount, fd.late_fee, fd.concession,
            fd.received_amount, s.name as student_name, s.father_name, s.admission_no, s.section, c.name as class_name,
            fdi.amount as item_amount, fp.name as particular_name
        FROM fee_deposit_items fdi
        JOIN fee_deposits fd ON fd.id = fdi.deposit_id
        JOIN students s ON fd.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN fee_particulars fp ON fp.id = fdi.particular_id
        WHERE 1=1`;
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND fd.branch_id=?'; b.push(effBranch); }
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    const classId = url.searchParams.get('class_id');
    const section = url.searchParams.get('section');
    const paymentMode = url.searchParams.get('payment_mode');
    if (fromDate) { q += ' AND fd.date>=?'; b.push(fromDate); }
    if (toDate) { q += ' AND fd.date<=?'; b.push(toDate); }
    if (classId) { q += ' AND s.class_id=?'; b.push(classId); }
    if (section) { q += ' AND s.section=?'; b.push(section); }
    if (paymentMode) { q += ' AND fd.payment_mode=?'; b.push(paymentMode); }
    const session = url.searchParams.get('session');
    if (session && session !== 'All') { q += ' AND fd.session=?'; b.push(session); }
    q += ' ORDER BY fd.date, fd.id, fp.name';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.get('/api/expenses', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    let q = 'SELECT e.*, eh.name as head_name, v.name as vendor_name FROM expenses e LEFT JOIN expense_heads eh ON e.head_id = eh.id LEFT JOIN vendors v ON e.vendor_id = v.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND e.branch_id=?'; b.push(effBranch); }
    q += ' ORDER BY e.date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/expenses', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO expenses (branch_id, date, head_id, amount, description, vendor_id, payment_mode, reference_no) VALUES (?,?,?,?,?,?,?,?)')
        .bind(bid, d.date, d.head_id, d.amount, d.description || '', d.vendor_id || null, d.payment_mode || '', d.reference_no || '').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/expenses/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'expenses', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('UPDATE expenses SET date=?, head_id=?, amount=?, description=?, vendor_id=?, payment_mode=?, reference_no=? WHERE id=?')
        .bind(d.date, d.head_id, d.amount, d.description || '', d.vendor_id || null, d.payment_mode || '', d.reference_no || '', params.id).run();
    return json({ success: true });
});

router.delete('/api/expenses/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'expenses', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM expenses WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/incomes', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    let q = 'SELECT i.*, ih.name as head_name FROM incomes i JOIN income_heads ih ON i.head_id = ih.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND i.branch_id=?'; b.push(effBranch); }
    q += ' ORDER BY i.date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/incomes', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO incomes (branch_id, date, head_id, amount, description, payment_mode, reference_no) VALUES (?,?,?,?,?,?,?)')
        .bind(bid, d.date, d.head_id, d.amount, d.description || '', d.payment_mode || '', d.reference_no || '').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/incomes/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'incomes', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('UPDATE incomes SET date=?, head_id=?, amount=?, description=?, payment_mode=?, reference_no=? WHERE id=?')
        .bind(d.date, d.head_id, d.amount, d.description || '', d.payment_mode || '', d.reference_no || '', params.id).run();
    return json({ success: true });
});

router.delete('/api/incomes/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'incomes', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM incomes WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.post('/api/exam-results', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin', 'branch_admin', 'teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const { exam_id, results: marks, branch_id } = await req.json();
    const bid = await getWritableBranchId(req, env, user, branch_id);
    if (!exam_id || !Array.isArray(marks) || !marks.length) return json({ error: 'exam_id and results are required' }, 400);

    const finalExamId = Number(exam_id);
    
    let teacherAssignments = [];
    if (user.role === 'teacher') {
        teacherAssignments = await getTeacherAssignments(env, user);
        if (!teacherAssignments.length) return json({ error: 'No class assigned' }, 403);
    }
    for (const m of marks) {
        const theoryMarks = Number(m.theory_marks || 0);
        const practicalMarks = Number(m.practical_marks || 0);
        const maxMarks = Number(m.max_marks || 100);
        const minMarks = Number(m.min_marks || 0);
        const totalMarks = theoryMarks + practicalMarks;
        if (![theoryMarks, practicalMarks, maxMarks, minMarks].every(Number.isFinite)) {
            return json({ error: 'Invalid marks payload' }, 400);
        }
        if (theoryMarks < 0 || practicalMarks < 0 || maxMarks <= 0 || minMarks < 0) {
            return json({ error: 'Marks cannot be negative and max marks must be greater than zero' }, 400);
        }
        if (minMarks > maxMarks) {
            return json({ error: 'Minimum marks cannot exceed maximum marks' }, 400);
        }
        if (totalMarks > maxMarks) {
            return json({ error: 'Obtained marks cannot exceed maximum marks' }, 400);
        }
        if (user.role === 'teacher') {
            const student = await env.DB.prepare('SELECT class_id, section FROM students WHERE branch_id=? AND id=?').bind(bid, m.student_id).first();
            if (!student || !teacherHasAssignment(teacherAssignments, student.class_id, student.section, m.subject_id)) {
                return json({ error: 'Forbidden' }, 403);
            }
        }
        await env.DB.prepare('INSERT OR REPLACE INTO exam_results (branch_id, exam_id, student_id, subject_id, theory_marks, practical_marks, total_marks, max_marks, min_marks, grade) VALUES (?,?,?,?,?,?,?,?,?,?)')
            .bind(bid, finalExamId, m.student_id, m.subject_id, theoryMarks, practicalMarks, totalMarks, maxMarks, minMarks, m.grade || '').run();
    }
    return json({ success: true });
});

router.get('/api/exam-results', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const examId = url.searchParams.get('exam_id');
    const studentId = url.searchParams.get('student_id');
    let q = 'SELECT er.*, s.name as student_name, sub.name as subject_name FROM exam_results er JOIN students s ON er.student_id = s.id JOIN subjects sub ON er.subject_id = sub.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND er.branch_id=?'; b.push(effBranch); }

    if (examId) {
        q += ' AND er.exam_id=?'; b.push(Number(examId));
    }
    
    if (user.role === 'student') {
        if (studentId && Number(studentId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        q += ' AND er.student_id=?'; b.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        if (studentId) {
            if (!allowedIds.includes(Number(studentId))) return json({ error: 'Forbidden' }, 403);
            q += ' AND er.student_id=?'; b.push(studentId);
        } else {
            q += ` AND er.student_id IN (${allowedIds.map(() => '?').join(',')})`;
            b.push(...allowedIds);
        }
    } else if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json([]);
        const { clause, binds: assignmentBinds } = buildTeacherAssignmentClause(assignments, 's.class_id', 's.section', 'er.subject_id');
        q += ` AND (${clause})`;
        b.push(...assignmentBinds);
        if (studentId) { q += ' AND er.student_id=?'; b.push(studentId); }
    } else if (studentId) {
        q += ' AND er.student_id=?'; b.push(studentId);
    }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.get('/api/result-details', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const examId = url.searchParams.get('exam_id');
    const studentId = url.searchParams.get('student_id');
    let q = 'SELECT rd.* FROM result_details rd JOIN students s ON rd.student_id = s.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND rd.branch_id=?'; b.push(effBranch); }
    if (examId) { q += ' AND rd.exam_id=?'; b.push(examId); }
    if (user.role === 'student') {
        if (studentId && Number(studentId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        q += ' AND rd.student_id=?'; b.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        if (studentId) {
            if (!allowedIds.includes(Number(studentId))) return json({ error: 'Forbidden' }, 403);
            q += ' AND rd.student_id=?'; b.push(studentId);
        } else {
            q += ` AND rd.student_id IN (${allowedIds.map(() => '?').join(',')})`;
            b.push(...allowedIds);
        }
    } else if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json([]);
        const { clause, binds: assignmentBinds } = buildTeacherAssignmentClause(assignments, 's.class_id', 's.section');
        q += ` AND (${clause})`;
        b.push(...assignmentBinds);
        if (studentId) { q += ' AND rd.student_id=?'; b.push(studentId); }
    } else if (studentId) {
        q += ' AND rd.student_id=?'; b.push(studentId);
    }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/result-details', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const finalExamId = Number(d.exam_id);
    if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json({ error: 'No class assigned' }, 403);
        const student = await env.DB.prepare('SELECT class_id, section FROM students WHERE branch_id=? AND id=?').bind(bid, d.student_id).first();
        if (!student || !teacherHasAssignment(assignments, student.class_id, student.section)) return json({ error: 'Forbidden' }, 403);
    }
    await env.DB.prepare('DELETE FROM result_details WHERE branch_id=? AND student_id=? AND exam_id=?').bind(bid, d.student_id, finalExamId).run();
    await env.DB.prepare('INSERT INTO result_details (branch_id, student_id, exam_id, attendance, remark, height, weight, result, division, rank, result_date, promoted_to) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(bid, d.student_id, finalExamId, d.attendance||'', d.remark||'', d.height||'', d.weight||'', d.result||'Pass', d.division||'', d.rank||null, d.result_date||'', d.promoted_to||'').run();
    return json({ success: true });
});

router.post('/api/upload', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return json({ error: 'No file provided' }, 400);
    if (file.size > 5 * 1024 * 1024) return json({ error: 'File size exceeds 5MB limit' }, 400);
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['jpg','jpeg','png','gif','pdf','doc','docx','xls','xlsx'];
    if (!allowed.includes(ext)) return json({ error: 'File type not allowed' }, 400);
    const ALLOWED_CONTENT_TYPES = new Set([
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]);
    if (!ALLOWED_CONTENT_TYPES.has(file.type)) return json({ error: 'File content type not allowed' }, 400);
    const branchId = await getWritableBranchId(req, env, user, Number(formData.get('branch_id')) || 0);
    const key = `${branchId || 'global'}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    await env.UPLOADS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
    return json({ url: toAbsoluteFileUrl(req, `/api/files/${key}`), key });
});

router.get('/api/files/:path+', async (req, env, params) => {
    const user = await getFileAccessUser(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const key = params.path;
    const branchId = Number(String(key || '').split('/')[0] || 0);
    if (branchId && !(await userCanAccessBranch(env, user, branchId))) {
        return json({ error: 'Forbidden' }, 403);
    }
    const obj = await env.UPLOADS.get(key);
    if (!obj) return new Response('Not found', { status: 404 });
    const contentType = obj.httpMetadata?.contentType || 'application/octet-stream';
    const inline = contentType.startsWith('image/') || contentType === 'application/pdf';
    return new Response(obj.body, {
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': inline ? 'inline' : 'attachment',
            'Cache-Control': 'private, max-age=60',
            'X-Content-Type-Options': 'nosniff'
        }
    });
});

router.get('/api/salary-settings', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    const staffId = url.searchParams.get('staff_id');
    let q = 'SELECT ss.*, CASE WHEN ss.component_type="allowance" THEN ah.name ELSE dh.name END as component_name FROM salary_settings ss LEFT JOIN allowance_heads ah ON ss.component_type="allowance" AND ss.component_id = ah.id LEFT JOIN deduction_heads dh ON ss.component_type="deduction" AND ss.component_id = dh.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND ss.branch_id=?'; b.push(effBranch); }
    if (staffId) { q += ' AND ss.staff_id=?'; b.push(staffId); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/salary-settings', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const existing = await env.DB.prepare('SELECT id FROM salary_settings WHERE branch_id=? AND staff_id=? AND component_type=? AND component_id=?')
        .bind(bid, d.staff_id, d.component_type, d.component_id).first();
    if (existing) return json({ error: 'This salary component already exists for the selected staff member' }, 409);
    await env.DB.prepare('INSERT INTO salary_settings (branch_id, staff_id, component_type, component_id, amount) VALUES (?,?,?,?,?)')
        .bind(bid, d.staff_id, d.component_type, d.component_id, d.amount || 0).run();
    return json({ success: true }, 201);
});

router.delete('/api/salary-settings/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'salary_settings', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM salary_settings WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/salaries', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');
    let q = 'SELECT gs.*, s.name as staff_name, s.employee_id, s.designation FROM generated_salaries gs JOIN staff s ON gs.staff_id = s.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND gs.branch_id=?'; b.push(effBranch); }
    if (month) { q += ' AND gs.month=?'; b.push(month); }
    if (year) { q += ' AND gs.year=?'; b.push(year); }
    q += ' ORDER BY gs.generated_date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/salaries/generate', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);

    if (d.staff_id && !d.staff_ids) {
        const staff = await env.DB.prepare('SELECT id, branch_id, basic_salary FROM staff WHERE id=?').bind(d.staff_id).first();
        if (!staff) return json({ error: 'Staff not found' }, 404);
        if (user.role !== 'super_admin' && Number(staff.branch_id) !== Number(bid)) return json({ error: 'Forbidden' }, 403);

        const allowancesObj = parseJsonObject(d.allowances);
        const deductionsObj = parseJsonObject(d.deductions);
        const invalidAllowance = Object.values(allowancesObj).some(value => Number(value || 0) < 0);
        const invalidDeduction = Object.values(deductionsObj).some(value => Number(value || 0) < 0);
        if (invalidAllowance || invalidDeduction) return json({ error: 'Salary components cannot be negative' }, 400);

        const settings = await getOptionSettingsMap(env, bid);
        const leaveAllowed = Number(settings.salary_leave_per_month || 2);
        const penaltyFraction = getLatePenaltyFraction(settings.salary_late_penalty || 'quarter');
        const attendanceSummary = await getStaffAttendanceSummary(env, bid, d.staff_id, d.month, d.year);
        const absentDays = Number(attendanceSummary?.absent_days ?? d.absent_days ?? 0);
        const lateDays = Number(attendanceSummary?.late_days ?? d.late_days ?? 0);
        const halfDays = Number(attendanceSummary?.half_days ?? d.half_days ?? 0);
        const basic = roundCurrency(staff.basic_salary || 0);
        const salaryPerDay = roundCurrency(basic / 30);
        const excessAbsent = Math.max(0, absentDays - leaveAllowed);
        const totalDeductedDays = roundCurrency(excessAbsent + (lateDays * penaltyFraction) + (halfDays * 0.5));
        const totalBasicSalary = Math.max(0, roundCurrency(basic - (salaryPerDay * totalDeductedDays)));
        const totalAllowances = sumNumericValues(allowancesObj);
        const totalDeductions = sumNumericValues(deductionsObj);
        const netSalary = Math.max(0, roundCurrency(totalBasicSalary + totalAllowances - totalDeductions));
        await env.DB.prepare(`INSERT OR REPLACE INTO generated_salaries
            (branch_id, staff_id, month, year, basic, total_allowances, total_deductions, net_salary,
             absent_days, late_days, half_days, total_deducted_days, salary_per_day, total_basic_salary,
             allowances, deductions, remark, status, generated_date)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
            .bind(bid, d.staff_id, d.month, d.year, basic, totalAllowances, totalDeductions, netSalary,
                absentDays, lateDays, halfDays, totalDeductedDays, salaryPerDay, totalBasicSalary,
                JSON.stringify(allowancesObj), JSON.stringify(deductionsObj), d.remark||'', d.status||'Unpaid', d.generated_date||new Date().toISOString().split('T')[0]).run();
        return json({ success: true, generated: 1 }, 201);
    }

    const { month, year, staff_ids } = d;
    let generated = 0;
    const bulkSettings = await getOptionSettingsMap(env, bid);
    const bulkLeaveAllowed = Number(bulkSettings.salary_leave_per_month || 2);
    const bulkPenaltyFraction = getLatePenaltyFraction(bulkSettings.salary_late_penalty || 'quarter');
    for (const sid of staff_ids) {
        const s = await env.DB.prepare('SELECT basic_salary FROM staff WHERE id=?').bind(sid).first();
        if (!s) continue;
        const { results: settings } = await env.DB.prepare('SELECT * FROM salary_settings WHERE staff_id=?').bind(sid).all();
        let totalAllow = 0, totalDeduct = 0;
        const allowancesMap = {};
        const deductionsMap = {};
        settings.forEach(c => {
            if (c.component_type === 'allowance') { totalAllow += c.amount; allowancesMap[c.component_id] = c.amount; }
            else { totalDeduct += c.amount; deductionsMap[c.component_id] = c.amount; }
        });
        const bulkBasic = roundCurrency(s.basic_salary || 0);
        const bulkSalaryPerDay = roundCurrency(bulkBasic / 30);
        const attendanceSummary = await getStaffAttendanceSummary(env, bid, sid, month, year);
        const absentDays = Number(attendanceSummary?.absent_days ?? 0);
        const lateDays = Number(attendanceSummary?.late_days ?? 0);
        const halfDays = Number(attendanceSummary?.half_days ?? 0);
        const excessAbsent = Math.max(0, absentDays - bulkLeaveAllowed);
        const totalDeductedDays = roundCurrency(excessAbsent + (lateDays * bulkPenaltyFraction) + (halfDays * 0.5));
        const totalBasicSalary = Math.max(0, roundCurrency(bulkBasic - (bulkSalaryPerDay * totalDeductedDays)));
        totalAllow = roundCurrency(totalAllow);
        totalDeduct = roundCurrency(totalDeduct);
        const net = Math.max(0, roundCurrency(totalBasicSalary + totalAllow - totalDeduct));
        await env.DB.prepare(`INSERT OR REPLACE INTO generated_salaries
            (branch_id, staff_id, month, year, basic, total_allowances, total_deductions, net_salary,
             absent_days, late_days, half_days, total_deducted_days, salary_per_day, total_basic_salary,
             allowances, deductions, status, generated_date)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
            .bind(bid, sid, month, year, bulkBasic, totalAllow, totalDeduct, net,
                absentDays, lateDays, halfDays, totalDeductedDays, bulkSalaryPerDay, totalBasicSalary,
                JSON.stringify(allowancesMap), JSON.stringify(deductionsMap), 'Generated', new Date().toISOString().split('T')[0]).run();
        generated++;
    }
    return json({ success: true, generated });
});

router.put('/api/salaries/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const existing = await env.DB.prepare('SELECT id, branch_id FROM generated_salaries WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const allowedFields = ['status', 'payment_date', 'payment_mode', 'remark'];
    const fields = []; const vals = [];
    for (const [k,v] of Object.entries(d)) {
        if (allowedFields.includes(k)) {
            fields.push(`${k}=?`);
            vals.push(v);
        }
    }
    if (!fields.length) return json({ error: 'No fields' }, 400);
    vals.push(params.id);
    await env.DB.prepare(`UPDATE generated_salaries SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();
    return json({ success: true });
});

router.delete('/api/salaries/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const existing = await env.DB.prepare('SELECT id, branch_id FROM generated_salaries WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM generated_salaries WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/books', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    let q = 'SELECT b.*, bt.name as type_name FROM books b LEFT JOIN book_types bt ON b.type_id = bt.id WHERE 1=1';
    const binds = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND b.branch_id=?'; binds.push(effBranch); }
    q += ' ORDER BY b.title';
    const { results } = binds.length ? await env.DB.prepare(q).bind(...binds).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/books', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO books (branch_id, book_no, title, author, isbn, publisher, type_id, quantity, available, rack_no, cost) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .bind(bid, d.book_no||'', d.title, d.author||'', d.isbn||'', d.publisher||'', d.type_id||null, d.quantity||1, d.quantity||1, d.rack_no||'', d.cost||0).run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/books/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'books', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('UPDATE books SET book_no=?, title=?, author=?, isbn=?, publisher=?, type_id=?, quantity=?, rack_no=?, cost=? WHERE id=?')
        .bind(d.book_no||'', d.title, d.author||'', d.isbn||'', d.publisher||'', d.type_id||null, d.quantity||1, d.rack_no||'', d.cost||0, params.id).run();
    return json({ success: true });
});

router.delete('/api/books/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'books', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM books WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/book-issues', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const studentId = url.searchParams.get('student_id');
    let q = 'SELECT bi.*, b.title as book_title, b.author, bt.name as type_name, s.name as student_name, s.admission_no, s.class_id as student_class_id, s.section as student_section FROM book_issues bi JOIN books b ON bi.book_id = b.id LEFT JOIN book_types bt ON b.type_id = bt.id JOIN students s ON bi.student_id = s.id WHERE 1=1';
    const binds = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND bi.branch_id=?'; binds.push(effBranch); }
    if (status) { q += ' AND bi.status=?'; binds.push(status); }
    if (user.role === 'student') {
        if (studentId && Number(studentId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        q += ' AND bi.student_id=?'; binds.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        if (studentId) {
            if (!allowedIds.includes(Number(studentId))) return json({ error: 'Forbidden' }, 403);
            q += ' AND bi.student_id=?'; binds.push(studentId);
        } else {
            q += ` AND bi.student_id IN (${allowedIds.map(() => '?').join(',')})`;
            binds.push(...allowedIds);
        }
    } else if (studentId) { q += ' AND bi.student_id=?'; binds.push(studentId); }
    q += ' ORDER BY bi.issue_date DESC';
    const { results } = binds.length ? await env.DB.prepare(q).bind(...binds).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/book-issues', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','staff'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const book = await env.DB.prepare('SELECT id, branch_id, available FROM books WHERE id=?').bind(d.book_id).first();
    if (!book) return json({ error: 'Book not found' }, 404);
    const student = await env.DB.prepare('SELECT id, branch_id FROM students WHERE id=?').bind(d.student_id).first();
    if (!student) return json({ error: 'Student not found' }, 404);
    if (Number(book.branch_id) !== Number(bid) || Number(student.branch_id) !== Number(bid)) return json({ error: 'Forbidden' }, 403);
    if (Number(book.available || 0) <= 0) return json({ error: 'Book is not available for issue' }, 400);
    const existingIssue = await env.DB.prepare("SELECT id FROM book_issues WHERE book_id=? AND student_id=? AND status='Issued'")
        .bind(d.book_id, d.student_id).first();
    if (existingIssue) return json({ error: 'This book is already issued to the selected student' }, 409);
    const stockUpdate = await env.DB.prepare('UPDATE books SET available = available - 1 WHERE id=? AND available > 0').bind(d.book_id).run();
    if (!stockUpdate.meta || !stockUpdate.meta.changes) return json({ error: 'Book is no longer available for issue' }, 409);
    await env.DB.prepare('INSERT INTO book_issues (branch_id, book_id, student_id, issue_date, due_date, status) VALUES (?,?,?,?,?,?)')
        .bind(bid, d.book_id, d.student_id, d.issue_date, d.due_date||'', 'Issued').run();
    return json({ success: true }, 201);
});

router.put('/api/book-issues/:id/return', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','staff'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const issue = await env.DB.prepare('SELECT * FROM book_issues WHERE id=?').bind(params.id).first();
    if (!issue) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, issue.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (issue.status === 'Returned') return json({ error: 'Book is already returned' }, 400);
    await env.DB.prepare('UPDATE book_issues SET return_date=?, status=?, fine=? WHERE id=?')
        .bind(d.return_date || new Date().toISOString().slice(0,10), 'Returned', d.fine||0, params.id).run();
    await env.DB.prepare('UPDATE books SET available = MIN(quantity, available + 1) WHERE id=?').bind(issue.book_id).run();
    return json({ success: true });
});

router.get('/api/timetable', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const classId = url.searchParams.get('class_id');
    const section = url.searchParams.get('section');
    const staffId = url.searchParams.get('staff_id');
    const day = url.searchParams.get('day');
    const subjectId = url.searchParams.get('subject_id');
    let q = 'SELECT t.*, sub.name as subject_name, s.name as teacher_name, c.name as class_name, p.name as period_name FROM timetable t LEFT JOIN subjects sub ON t.subject_id = sub.id LEFT JOIN staff s ON t.staff_id = s.id LEFT JOIN classes c ON t.class_id = c.id LEFT JOIN periods p ON t.period = p.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND t.branch_id=?'; b.push(effBranch); }
    if (user.role === 'student') {
        const student = await env.DB.prepare('SELECT class_id, section FROM students WHERE branch_id=? AND id=?').bind(user.branch_id, user.linked_id).first();
        if (!student) return json([]);
        q += ' AND t.class_id=? AND t.section=?';
        b.push(student.class_id, student.section || '');
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        const placeholders = allowedIds.map(() => '?').join(',');
        const { results: children } = await env.DB.prepare(`SELECT DISTINCT class_id, section FROM students WHERE branch_id=? AND id IN (${placeholders})`).bind(user.branch_id, ...allowedIds).all();
        if (!children.length) return json([]);
        const scopeConditions = [];
        children.forEach(child => {
            scopeConditions.push('(t.class_id=? AND t.section=?)');
            b.push(child.class_id, child.section || '');
        });
        q += ` AND (${scopeConditions.join(' OR ')})`;
    } else if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json([]);
        const { clause, binds: assignmentBinds } = buildTeacherAssignmentClause(assignments, 't.class_id', 't.section', 't.subject_id');
        q += ` AND (t.staff_id=? OR (${clause}))`;
        b.push(user.linked_id, ...assignmentBinds);
        if (staffId && Number(staffId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
    }
    if (classId) { q += ' AND t.class_id=?'; b.push(classId); }
    if (section) { q += ' AND t.section=?'; b.push(section); }
    if (staffId) { q += ' AND t.staff_id=?'; b.push(staffId); }
    if (day) { q += ' AND t.day=?'; b.push(day); }
    if (subjectId) { q += ' AND t.subject_id=?'; b.push(subjectId); }
    q += ' ORDER BY t.day, t.period';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/timetable', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const body = await req.json();
    const bid = await getWritableBranchId(req, env, user, body.branch_id);
    if (body.entries) {
        for (const e of body.entries) {
            const existing = await env.DB.prepare('SELECT id FROM timetable WHERE branch_id=? AND class_id=? AND section=? AND day=? AND period=?')
                .bind(bid, e.class_id, e.section||'', e.day, e.period).first();
            if (existing) return json({ error: `Timetable entry already exists for ${e.day} period ${e.period}` }, 409);
            await env.DB.prepare('INSERT INTO timetable (branch_id, class_id, section, day, period, subject_id, staff_id, time) VALUES (?,?,?,?,?,?,?,?)')
                .bind(bid, e.class_id, e.section||'', e.day, e.period, e.subject_id||null, e.staff_id||null, e.time||null).run();
        }
        return json({ success: true });
    }
    const duplicate = await env.DB.prepare('SELECT id FROM timetable WHERE branch_id=? AND class_id=? AND section=? AND day=? AND period=?')
        .bind(bid, body.class_id, body.section||'', body.day, body.period).first();
    if (duplicate) return json({ error: `Timetable entry already exists for ${body.day} period ${body.period}` }, 409);
    const { results } = await env.DB.prepare('INSERT INTO timetable (branch_id, class_id, section, day, period, subject_id, staff_id, time) VALUES (?,?,?,?,?,?,?,?) RETURNING *')
        .bind(bid, body.class_id, body.section||'', body.day, body.period, body.subject_id||null, body.staff_id||null, body.time||null).all();
    return json(results[0], 201);
});

router.put('/api/timetable/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const existing = await env.DB.prepare('SELECT id FROM timetable WHERE branch_id=? AND class_id=? AND section=? AND day=? AND period=? AND id<>?')
        .bind(bid, d.class_id, d.section||'', d.day, d.period, params.id).first();
    if (existing) return json({ error: `Timetable entry already exists for ${d.day} period ${d.period}` }, 409);
    await env.DB.prepare('UPDATE timetable SET class_id=?, section=?, day=?, period=?, subject_id=?, staff_id=?, time=? WHERE id=?')
        .bind(d.class_id, d.section||'', d.day, d.period, d.subject_id||null, d.staff_id||null, d.time||null, params.id).run();
    return json({ success: true });
});

router.delete('/api/timetable/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'timetable', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM timetable WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/course-schedules', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const classId = url.searchParams.get('class_id');
    const subjectId = url.searchParams.get('subject_id');
    const examId = url.searchParams.get('exam_id');
    let q = 'SELECT cs.*, c.name as class_name, sub.name as subject_name FROM course_schedules cs LEFT JOIN classes c ON cs.class_id = c.id LEFT JOIN subjects sub ON cs.subject_id = sub.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND cs.branch_id=?'; b.push(effBranch); }
    if (classId) { q += ' AND cs.class_id=?'; b.push(classId); }
    if (subjectId) { q += ' AND cs.subject_id=?'; b.push(subjectId); }
    if (examId) { q += ' AND cs.exam_id=?'; b.push(examId); }
    q += ' ORDER BY cs.schedule';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/course-schedules', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const finalExamId = d.exam_id ? Number(d.exam_id) : null;
    const r = await env.DB.prepare('INSERT INTO course_schedules (branch_id, class_id, subject_id, exam_id, schedule, topic, assignment) VALUES (?,?,?,?,?,?,?)')
        .bind(bid, d.class_id, d.subject_id, finalExamId, d.schedule, d.topic, d.assignment||'').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/course-schedules/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    let targetBranchId = null;
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'course_schedules', params.id);
        if (access.error) return json({ error: access.error }, access.status);
        targetBranchId = access.branch_id;
    }
    if (!targetBranchId) {
        const existing = await env.DB.prepare('SELECT branch_id FROM course_schedules WHERE id=?').bind(params.id).first();
        if (!existing) return json({ error: 'Not found' }, 404);
        targetBranchId = existing.branch_id;
    }
    const finalExamId = d.exam_id ? Number(d.exam_id) : null;
    await env.DB.prepare('UPDATE course_schedules SET class_id=?, subject_id=?, exam_id=?, schedule=?, topic=?, assignment=? WHERE id=?')
        .bind(d.class_id, d.subject_id, finalExamId, d.schedule, d.topic, d.assignment||'', params.id).run();
    return json({ success: true });
});

router.delete('/api/course-schedules/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'course_schedules', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM course_schedules WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/activities', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    let q = 'SELECT a.*, cg.name as group_name FROM activities a LEFT JOIN class_groups cg ON a.class_group_id = cg.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND a.branch_id=?'; b.push(effBranch); }
    q += ' ORDER BY a.date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/activities', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO activities (branch_id, date, class_group_id, event, description) VALUES (?,?,?,?,?)')
        .bind(bid, d.date, d.class_group_id||null, d.event, d.description||'').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/activities/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'activities', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('UPDATE activities SET date=?, class_group_id=?, event=?, description=? WHERE id=?')
        .bind(d.date, d.class_group_id||null, d.event, d.description||'', params.id).run();
    return json({ success: true });
});

router.delete('/api/activities/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'activities', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM activities WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/class-groups', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    let q = 'SELECT * FROM class_groups WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id=?'; b.push(effBranch); }
    q += ' ORDER BY name';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/class-groups', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO class_groups (branch_id, name, class_ids) VALUES (?,?,?)')
        .bind(bid, d.name, d.class_ids||'').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/class-groups/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'class_groups', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('UPDATE class_groups SET name=?, class_ids=? WHERE id=?')
        .bind(d.name, d.class_ids||'', params.id).run();
    return json({ success: true });
});

router.delete('/api/class-groups/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'class_groups', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM class_groups WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/homework', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const classId = url.searchParams.get('class_id');
    const section = url.searchParams.get('section');
    let q = 'SELECT h.*, sub.name as subject_name, c.name as class_name, s.name as teacher_name FROM homework h LEFT JOIN subjects sub ON h.subject_id = sub.id LEFT JOIN classes c ON h.class_id = c.id LEFT JOIN staff s ON h.assigned_by = s.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND h.branch_id=?'; b.push(effBranch); }
    if (user.role === 'student') {
        const student = await env.DB.prepare('SELECT class_id, section FROM students WHERE branch_id=? AND id=?').bind(user.branch_id, user.linked_id).first();
        if (!student) return json([]);
        q += ' AND h.class_id=? AND h.section=?';
        b.push(student.class_id, student.section || '');
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        const placeholders = allowedIds.map(() => '?').join(',');
        const { results: children } = await env.DB.prepare(`SELECT DISTINCT class_id, section FROM students WHERE branch_id=? AND id IN (${placeholders})`).bind(user.branch_id, ...allowedIds).all();
        if (!children.length) return json([]);
        const scopeConditions = [];
        children.forEach(child => {
            scopeConditions.push('(h.class_id=? AND h.section=?)');
            b.push(child.class_id, child.section || '');
        });
        q += ` AND (${scopeConditions.join(' OR ')})`;
    } else if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json([]);
        const { clause, binds: assignmentBinds } = buildTeacherAssignmentClause(assignments, 'h.class_id', 'h.section', 'h.subject_id');
        q += ` AND (${clause})`;
        b.push(...assignmentBinds);
    }
    if (classId) { q += ' AND h.class_id=?'; b.push(classId); }
    if (section) { q += ' AND h.section=?'; b.push(section); }
    q += ' ORDER BY h.date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/homework', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!teacherHasAssignment(assignments, d.class_id, d.section, d.subject_id)) return json({ error: 'Forbidden' }, 403);
    }
    const r = await env.DB.prepare('INSERT INTO homework (branch_id, class_id, section, subject_id, type, title, description, date, due_date, assigned_by, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .bind(bid, d.class_id, d.section||'', d.subject_id, d.type||'', d.title, d.description||'', d.date, d.due_date||'', d.assigned_by||user.linked_id||null, d.status||'Active').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/homework/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role === 'teacher') {
        const existing = await env.DB.prepare('SELECT class_id, section, subject_id, assigned_by FROM homework WHERE branch_id=? AND id=?').bind(user.branch_id, params.id).first();
        if (!existing || Number(existing.assigned_by || 0) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        const assignments = await getTeacherAssignments(env, user);
        if (!teacherHasAssignment(assignments, d.class_id, d.section, d.subject_id)) return json({ error: 'Forbidden' }, 403);
    }
    await env.DB.prepare('UPDATE homework SET class_id=?, section=?, subject_id=?, type=?, title=?, description=?, date=?, due_date=?, status=? WHERE id=?')
        .bind(d.class_id, d.section||'', d.subject_id, d.type||'', d.title, d.description||'', d.date, d.due_date||'', d.status||'Active', params.id).run();
    return json({ success: true });
});

router.delete('/api/homework/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role === 'teacher') {
        const existing = await env.DB.prepare('SELECT assigned_by FROM homework WHERE branch_id=? AND id=?').bind(user.branch_id, params.id).first();
        if (!existing || Number(existing.assigned_by || 0) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
    }
    if (user.role === 'branch_admin') {
        const access = await ensureBranchAccess(env, user, 'homework', params.id);
        if (access.error) return json({ error: access.error }, access.status);
        await env.DB.prepare('DELETE FROM homework WHERE id=?').bind(params.id).run();
    } else if (user.role === 'teacher') {
        await env.DB.prepare('DELETE FROM homework WHERE id=? AND branch_id=?').bind(params.id, user.branch_id).run();
    } else {
        await env.DB.prepare('DELETE FROM homework WHERE id=?').bind(params.id).run();
    }
    return json({ success: true });
});

router.get('/api/date-sheets', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    let q = 'SELECT ds.*, en.name as exam_name, (SELECT COUNT(*) FROM datesheets WHERE sheet_id = ds.id) as entry_count FROM date_sheets ds LEFT JOIN exams e ON ds.exam_id = e.id LEFT JOIN exam_names en ON e.name = en.name WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND ds.branch_id=?'; b.push(effBranch); }
    q += ' ORDER BY ds.publish_date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/date-sheets', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const finalExamId = Number(d.exam_id);
    const { results } = await env.DB.prepare('INSERT INTO date_sheets (branch_id, exam_id, publish_date, status) VALUES (?,?,?,?) RETURNING *')
        .bind(bid, finalExamId, d.publish_date||null, d.status||'Draft').all();
    return json(results[0], 201);
});

router.put('/api/date-sheets/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const access = await ensureBranchAccess(env, user, 'date_sheets', params.id);
    if (access.error) return json({ error: access.error }, access.status);
    const finalExamId = Number(d.exam_id);
    await env.DB.prepare('UPDATE date_sheets SET exam_id=?, publish_date=?, status=? WHERE id=?')
        .bind(finalExamId, d.publish_date||null, d.status||'Draft', params.id).run();
    return json({ success: true });
});

router.delete('/api/date-sheets/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM datesheets WHERE sheet_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM date_sheets WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/date-sheets/:id/entries', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const { results } = await env.DB.prepare('SELECT d.*, sub.name as subject_name, c.name as class_name FROM datesheets d LEFT JOIN subjects sub ON d.subject_id = sub.id LEFT JOIN classes c ON d.class_id = c.id WHERE d.sheet_id=? ORDER BY d.date, d.class_id')
        .bind(params.id).all();
    return json(results);
});

router.post('/api/date-sheets/:id/entries', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const sheet = await env.DB.prepare('SELECT exam_id FROM date_sheets WHERE id=?').bind(params.id).first();
    const exam_id = sheet ? sheet.exam_id : (d.exam_id || 0);
    const { results } = await env.DB.prepare('INSERT INTO datesheets (branch_id, sheet_id, exam_id, class_id, subject_id, date, time_from, time_to) VALUES (?,?,?,?,?,?,?,?) RETURNING *')
        .bind(bid, params.id, exam_id, d.class_id, d.subject_id, d.date||null, d.time_from||null, d.time_to||null).all();
    return json(results[0], 201);
});

router.put('/api/datesheet-entries/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    await env.DB.prepare('UPDATE datesheets SET class_id=?, subject_id=?, date=?, time_from=?, time_to=? WHERE id=?')
        .bind(d.class_id, d.subject_id, d.date||null, d.time_from||null, d.time_to||null, params.id).run();
    return json({ success: true });
});

router.delete('/api/datesheet-entries/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM datesheets WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/datesheets', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const examId = url.searchParams.get('exam_id');
    const classId = url.searchParams.get('class_id');
    let q = 'SELECT ds.*, sub.name as subject_name, c.name as class_name, en.name as exam_name FROM datesheets ds LEFT JOIN subjects sub ON ds.subject_id = sub.id LEFT JOIN classes c ON ds.class_id = c.id LEFT JOIN exams e ON ds.exam_id = e.id LEFT JOIN exam_names en ON e.name = en.name WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND ds.branch_id=?'; b.push(effBranch); }
    if (user.role === 'student') {
        const student = await env.DB.prepare('SELECT class_id FROM students WHERE branch_id=? AND id=?').bind(user.branch_id, user.linked_id).first();
        if (!student) return json([]);
        q += ' AND ds.class_id=?';
        b.push(student.class_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        const placeholders = allowedIds.map(() => '?').join(',');
        const { results: children } = await env.DB.prepare(`SELECT DISTINCT class_id FROM students WHERE branch_id=? AND id IN (${placeholders})`).bind(user.branch_id, ...allowedIds).all();
        if (!children.length) return json([]);
        q += ` AND ds.class_id IN (${children.map(() => '?').join(',')})`;
        b.push(...children.map(child => child.class_id));
    } else if (user.role === 'teacher') {
        const assignments = await getTeacherAssignments(env, user);
        if (!assignments.length) return json([]);
        const classIds = [...new Set(assignments.map(assignment => Number(assignment.class_id)).filter(Boolean))];
        q += ` AND ds.class_id IN (${classIds.map(() => '?').join(',')})`;
        b.push(...classIds);
    }
    if (examId) { q += ' AND ds.exam_id=?'; b.push(examId); }
    if (classId) { q += ' AND ds.class_id=?'; b.push(classId); }
    const session = url.searchParams.get('session');
    if (session && session !== 'All') { q += ' AND e.session=?'; b.push(session); }
    q += ' ORDER BY ds.date';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.get('/api/vendors', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    let q = 'SELECT * FROM vendors WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id=?'; b.push(effBranch); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/vendors', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO vendors (branch_id, name, phone, email, address, gst_no) VALUES (?,?,?,?,?,?)')
        .bind(bid, d.name, d.phone||'', d.email||'', d.address||'', d.gst_no||'').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/vendors/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'vendors', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('UPDATE vendors SET name=?, phone=?, email=?, address=?, gst_no=? WHERE id=?')
        .bind(d.name, d.phone||'', d.email||'', d.address||'', d.gst_no||'', params.id).run();
    return json({ success: true });
});

router.delete('/api/vendors/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'vendors', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM vendors WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/bank-accounts', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    let q = 'SELECT * FROM bank_accounts WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id=?'; b.push(effBranch); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/bank-accounts', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO bank_accounts (branch_id, bank_name, account_no, ifsc_code, branch_name, balance) VALUES (?,?,?,?,?,?)')
        .bind(bid, d.bank_name, d.account_no||'', d.ifsc_code||'', d.branch_name||'', d.balance||0).run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/bank-accounts/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'bank_accounts', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('UPDATE bank_accounts SET bank_name=?, account_no=?, ifsc_code=?, branch_name=?, balance=? WHERE id=?')
        .bind(d.bank_name, d.account_no||'', d.ifsc_code||'', d.branch_name||'', d.balance||0, params.id).run();
    return json({ success: true });
});

router.delete('/api/bank-accounts/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'bank_accounts', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM bank_accounts WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/cash-transactions', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    let q = 'SELECT ct.*, ba.bank_name FROM cash_transactions ct LEFT JOIN bank_accounts ba ON ct.bank_id = ba.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND ct.branch_id=?'; b.push(effBranch); }
    q += ' ORDER BY ct.date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/cash-transactions', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    await env.DB.prepare('INSERT INTO cash_transactions (branch_id, date, type, amount, bank_id, description, reference_no) VALUES (?,?,?,?,?,?,?)')
        .bind(bid, d.date, d.type, d.amount, d.bank_id||null, d.description||'', d.reference_no||'').run();
    if (d.bank_id) {
        const delta = d.type === 'deposit' ? d.amount : -d.amount;
        await env.DB.prepare('UPDATE bank_accounts SET balance = balance + ? WHERE id=?').bind(delta, d.bank_id).run();
    }
    return json({ success: true }, 201);
});

router.put('/api/cash-transactions/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const id = params.id;
    const d = await req.json();
    const old = await env.DB.prepare('SELECT * FROM cash_transactions WHERE id=?').bind(id).first();
    if (!old) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, old.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (old.bank_id) {
        const revDelta = old.type === 'deposit' ? -old.amount : old.amount;
        await env.DB.prepare('UPDATE bank_accounts SET balance = balance + ? WHERE id=?').bind(revDelta, old.bank_id).run();
    }
    await env.DB.prepare('UPDATE cash_transactions SET date=?, type=?, amount=?, bank_id=?, description=?, reference_no=? WHERE id=?')
        .bind(d.date, d.type, d.amount, d.bank_id||null, d.description||'', d.reference_no||'', id).run();
    if (d.bank_id) {
        const delta = d.type === 'deposit' ? d.amount : -d.amount;
        await env.DB.prepare('UPDATE bank_accounts SET balance = balance + ? WHERE id=?').bind(delta, d.bank_id).run();
    }
    return json({ success: true });
});

router.delete('/api/cash-transactions/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const id = params.id;
    const old = await env.DB.prepare('SELECT * FROM cash_transactions WHERE id=?').bind(id).first();
    if (!old) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, old.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (old.bank_id) {
        const revDelta = old.type === 'deposit' ? -old.amount : old.amount;
        await env.DB.prepare('UPDATE bank_accounts SET balance = balance + ? WHERE id=?').bind(revDelta, old.bank_id).run();
    }
    await env.DB.prepare('DELETE FROM cash_transactions WHERE id=?').bind(id).run();
    return json({ success: true });
});

router.get('/api/email-log', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    let q = 'SELECT * FROM email_log WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id=?'; b.push(effBranch); }
    q += ' ORDER BY sent_at DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

async function sendViaZoho(apiKey, fromEmail, fromName, toEmail, toName, subject, htmlBody) {
    const resp = await fetch('https://api.zeptomail.in/v1.1/email', {
        method: 'POST',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            from: { address: fromEmail, name: fromName },
            to: [{ email_address: { address: toEmail, name: toName || toEmail } }],
            subject: subject,
            htmlbody: htmlBody
        })
    });
    const data = await resp.json();
    if (!resp.ok || data.error) throw new Error(data.message || data.error?.details || 'ZeptoMail API error');
    return data;
}

async function tryAutoEmail(env, branchId, settingKey, toEmail, toName, subject, htmlBody) {
    try {
        if (!toEmail || !toEmail.includes('@')) return;
        const settings = await getOptionSettingsMap(env, branchId);
        if (settings[settingKey] !== '1') return;
        const apiKey = settings['zoho_api_key'];
        if (!apiKey) return;
        const fromEmail = settings['zoho_from_email'] || 'noreply@edunex1.com';
        const fromName = settings['zoho_from_name'] || 'EduNex1';
        await sendViaZoho(apiKey, fromEmail, fromName, toEmail, toName || toEmail, subject, htmlBody);
    } catch(e) {  }
}

router.post('/api/email/send', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);

    const { results: settings } = await env.DB.prepare(
        "SELECT setting_key, setting_value FROM option_settings WHERE branch_id=? AND setting_key IN ('zoho_api_key','zoho_from_email','zoho_from_name')"
    ).bind(bid).all();
    const getSetting = (key) => (settings.find(s => s.setting_key === key) || {}).setting_value || '';
    const apiKey = getSetting('zoho_api_key');
    const fromEmail = getSetting('zoho_from_email') || 'support@edunex1.com';
    const fromName = getSetting('zoho_from_name') || 'EduNex1';

    if (!apiKey) return json({ error: 'Zoho Email API Key not configured. Go to Settings → Option Settings.' }, 400);

    const subject = d.subject;
    if (!subject) return json({ error: 'Email subject is required' }, 400);

    const recipientData = Array.isArray(d.recipients) ? d.recipients : [];
    if (!recipientData.length) return json({ error: 'No recipients provided' }, 400);

    let sentCount = 0;
    let failCount = 0;
    const logStmt = env.DB.prepare('INSERT INTO email_log (branch_id, type, recipient_type, recipient_id, email, subject, message, status) VALUES (?,?,?,?,?,?,?,?)');
    const logBatch = [];

    for (const r of recipientData) {
        const toEmail = r.email;
        if (!toEmail) { failCount++; continue; }
        const toName = r.name || '';
        const body = r.html_body || d.html_body || d.message || '';
        try {
            await sendViaZoho(apiKey, fromEmail, fromName, toEmail, toName, subject, body);
            logBatch.push(logStmt.bind(bid, d.type || 'manual', d.recipient_type || '', r.recipient_id || null, toEmail, subject, body, 'Sent'));
            sentCount++;
        } catch (e) {
            logBatch.push(logStmt.bind(bid, d.type || 'manual', d.recipient_type || '', r.recipient_id || null, toEmail, subject, body, 'Failed'));
            failCount++;
        }
    }

    if (logBatch.length) await env.DB.batch(logBatch);

    if (sentCount === 0) return json({ error: 'All emails failed to send. Check your Zoho API Key and sender settings.' }, 502);
    return json({ success: true, sent_count: sentCount, failed_count: failCount });
});

router.get('/api/sms-log', async (req, env) => {

    return json([]);
});

router.post('/api/sms/send', async (req, env) => {

    return json({ error: 'SMS feature is currently disabled. Please contact administrator.' }, 400);
});

router.get('/api/activity-log', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    let q = 'SELECT al.* FROM activity_log al WHERE 1=1';
    const b = [];
    if (user.role !== 'super_admin') {
        q += ' AND al.branch_id=?';
        b.push(user.branch_id);
    }
    q += ' ORDER BY al.created_at DESC LIMIT 200';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.get('/api/fee-slabs', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const classId = url.searchParams.get('class_id');
    const category = url.searchParams.get('category');
    const session = url.searchParams.get('session');
    let q = 'SELECT fs.*, fp.name as particular_name, fp.mode as mode, fp.months as months, fp.is_transport as is_transport, c.name as class_name FROM fee_slabs fs JOIN fee_particulars fp ON fs.particular_id = fp.id JOIN classes c ON fs.class_id = c.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND fs.branch_id=?'; b.push(effBranch); }
    if (classId) { q += ' AND fs.class_id=?'; b.push(classId); }
    if (category) { q += ' AND fs.category=?'; b.push(category); }
    if (session) { q += ' AND (fs.session=? OR fs.session IS NULL OR fs.session=\'\')'; b.push(session); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/fee-slabs', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    for (const slab of (d.slabs || [d])) {
        await env.DB.prepare('INSERT OR REPLACE INTO fee_slabs (branch_id, class_id, particular_id, amount, category, session) VALUES (?,?,?,?,?,?)')
            .bind(bid, slab.class_id, slab.particular_id, slab.amount || 0, slab.category || 'Default', slab.session || d.session || '').run();
    }
    return json({ success: true }, 201);
});

router.get('/api/fee-discounts', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const studentId = url.searchParams.get('student_id');
    let q = 'SELECT fd.*, s.name as student_name, s.admission_no FROM fee_discounts fd JOIN students s ON fd.student_id = s.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND fd.branch_id=?'; b.push(effBranch); }
    if (studentId) { q += ' AND fd.student_id=?'; b.push(studentId); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/fee-discounts', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    await env.DB.prepare('INSERT INTO fee_discounts (branch_id, student_id, particular_id, month, amount, reason, category) VALUES (?,?,?,?,?,?,?)')
        .bind(bid, d.student_id, d.particular_id||null, d.month||'', d.amount||0, d.reason||'', d.category||'').run();
    return json({ success: true }, 201);
});

router.put('/api/fee-discounts/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'fee_discounts', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('UPDATE fee_discounts SET student_id=?, particular_id=?, month=?, amount=?, reason=?, category=? WHERE id=?')
        .bind(d.student_id, d.particular_id||null, d.month||'', d.amount||0, d.reason||'', d.category||'', params.id).run();
    return json({ success: true });
});

router.delete('/api/fee-discounts/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'fee_discounts', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM fee_discounts WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.delete('/api/fee-slabs', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    const classId = url.searchParams.get('class_id');
    const category = url.searchParams.get('category') || 'Default';
    const session = url.searchParams.get('session') || '';
    const bid = await getWritableBranchId(req, env, user, url.searchParams.get('branch_id'));
    if (!classId) return json({ error: 'class_id required' }, 400);
    await env.DB.prepare('DELETE FROM fee_slabs WHERE branch_id=? AND class_id=? AND category=? AND (session=? OR session IS NULL)').bind(bid, classId, category, session).run();
    return json({ success: true });
});

router.get('/api/character-certificates', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    let q = 'SELECT cc.*, s.name as student_name, s.admission_no, s.father_name, s.section, s.gender, s.class_id, s.session, c.name as class_name FROM character_certificates cc JOIN students s ON cc.student_id = s.id LEFT JOIN classes c ON s.class_id = c.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND cc.branch_id=?'; b.push(effBranch); }
    if (user.role === 'student') {
        q += ' AND cc.student_id=?'; b.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        q += ` AND cc.student_id IN (${allowedIds.map(() => '?').join(',')})`;
        b.push(...allowedIds);
    } else if (!isAdminRole(user) && user.role !== 'super_admin') {
        return json({ error: 'Forbidden' }, 403);
    }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/character-certificates', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const student = await getStudentForCertificate(env, user, d.student_id);
    if (!student) return json({ error: 'Student not found' }, 404);
    if (d.date && !isValidISODate(d.date)) return json({ error: 'Invalid certificate date' }, 400);
    if (d.date && d.date > new Date().toISOString().slice(0,10)) return json({ error: 'Certificate date cannot be in the future' }, 400);
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO character_certificates (branch_id, student_id, serial_no, format, conduct, date, purpose, remarks, created_date) VALUES (?,?,?,?,?,?,?,?,?)').bind(bid, d.student_id, d.serial_no || '', d.format || 'cbse', d.conduct || '', d.date || new Date().toISOString().slice(0,10), d.purpose || '', d.remarks || '', new Date().toISOString().slice(0,10)).run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/character-certificates/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const existing = await env.DB.prepare('SELECT branch_id FROM character_certificates WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    const student = await getStudentForCertificate(env, user, d.student_id);
    if (!student) return json({ error: 'Student not found' }, 404);
    if (d.date && !isValidISODate(d.date)) return json({ error: 'Invalid certificate date' }, 400);
    if (d.date && d.date > new Date().toISOString().slice(0,10)) return json({ error: 'Certificate date cannot be in the future' }, 400);
    await env.DB.prepare('UPDATE character_certificates SET student_id=?, serial_no=?, format=?, conduct=?, date=?, purpose=?, remarks=? WHERE id=?').bind(d.student_id, d.serial_no || '', d.format || 'cbse', d.conduct || '', d.date || '', d.purpose || '', d.remarks || '', params.id).run();
    return json({ success: true });
});

router.delete('/api/character-certificates/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const existing = await env.DB.prepare('SELECT branch_id FROM character_certificates WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM character_certificates WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/co-scholastic-areas', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    let q = 'SELECT * FROM co_scholastic_areas WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id=?'; b.push(effBranch); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/co-scholastic-areas', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO co_scholastic_areas (branch_id, name) VALUES (?,?)').bind(bid, d.name).run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/co-scholastic-areas/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    await env.DB.prepare('UPDATE co_scholastic_areas SET name=? WHERE id=?').bind(d.name, params.id).run();
    return json({ success: true });
});

router.delete('/api/co-scholastic-areas/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'co_scholastic_areas', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM co_scholastic_areas WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/co-scholastic-results', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const examId = url.searchParams.get('exam_id');
    const studentId = url.searchParams.get('student_id');
    let q = 'SELECT cr.*, ca.name as area_name FROM co_scholastic_results cr LEFT JOIN co_scholastic_areas ca ON cr.area_id = ca.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND cr.branch_id=?'; b.push(effBranch); }
    if (examId) { q += ' AND cr.exam_id=?'; b.push(examId); }
    if (studentId) { q += ' AND cr.student_id=?'; b.push(studentId); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/co-scholastic-results', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const { exam_id, student_id, results: entries, branch_id } = await req.json();
    const bid = await getWritableBranchId(req, env, user, branch_id);
    const finalExamId = Number(exam_id);
    for (const e of entries) {
        await env.DB.prepare('INSERT OR REPLACE INTO co_scholastic_results (branch_id, student_id, exam_id, area_id, grade, discipline) VALUES (?,?,?,?,?,?)').bind(bid, student_id, finalExamId, e.area_id, e.grade || '', e.discipline || '').run();
    }
    return json({ success: true });
});

router.get('/api/teacher-permissions', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const staffId = url.searchParams.get('staff_id');
    let q = 'SELECT tp.*, s.name as teacher_name, c.name as class_name, sub.name as subject_name FROM teacher_permissions tp LEFT JOIN staff s ON tp.staff_id = s.id LEFT JOIN classes c ON tp.class_id = c.id LEFT JOIN subjects sub ON tp.subject_id = sub.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND tp.branch_id=?'; b.push(effBranch); }
    if (user.role === 'teacher') {
        if (staffId && Number(staffId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        q += ' AND tp.staff_id=?';
        b.push(user.linked_id);
    } else if (staffId) { q += ' AND tp.staff_id=?'; b.push(staffId); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/teacher-permissions', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO teacher_permissions (branch_id, staff_id, class_id, section_id, subject_id, modules) VALUES (?,?,?,?,?,?)')
        .bind(bid, d.staff_id, d.class_id, d.section_id||null, d.subject_id||null, d.modules||'').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/teacher-permissions/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    await env.DB.prepare('UPDATE teacher_permissions SET staff_id=?, class_id=?, section_id=?, subject_id=?, modules=? WHERE id=?')
        .bind(d.staff_id, d.class_id, d.section_id||null, d.subject_id||null, d.modules||'', params.id).run();
    return json({ success: true });
});

router.delete('/api/teacher-permissions/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'teacher_permissions', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare('DELETE FROM teacher_permissions WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/student-subjects/:studentId', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const { results } = await env.DB.prepare('SELECT ss.*, sub.name as subject_name, sub.code FROM student_subjects ss JOIN subjects sub ON ss.subject_id = sub.id WHERE ss.student_id = ?').bind(params.studentId).all();
    return json(results);
});

router.post('/api/student-subjects', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin','teacher'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const { student_id, subject_ids } = await req.json();
    await env.DB.prepare('DELETE FROM student_subjects WHERE student_id=?').bind(student_id).run();
    for (const sid of subject_ids) {
        await env.DB.prepare('INSERT INTO student_subjects (student_id, subject_id) VALUES (?,?)').bind(student_id, sid).run();
    }
    return json({ success: true });
});

router.post('/api/students/promote', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const { student_ids, to_class_id, to_section, to_session, subject_ids, branch_id } = await req.json();
    const bid = await getWritableBranchId(req, env, user, branch_id);
    for (const sid of student_ids) {
        const stu = await env.DB.prepare('SELECT id, class_id, session, category, route_id, old_balance FROM students WHERE id=?').bind(sid).first();
        if (!stu) continue;

        const oldSlabs = await getStudentSlabs(env, bid, stu.class_id, stu.category, stu.session);
        const annualSlabFee = roundCurrency(computeSlabAnnual(oldSlabs));
        const route = stu.route_id ? await env.DB.prepare('SELECT fee FROM transport_routes WHERE id=?').bind(stu.route_id).first() : null;
        const transportFee = roundCurrency(route ? Number(route.fee||0) : 0);
        const annualFee = roundCurrency(annualSlabFee + transportFee * 12);
        const paidRow = await env.DB.prepare('SELECT COALESCE(SUM(received_amount),0) as total FROM fee_deposits WHERE student_id=? AND session=?').bind(sid, stu.session||'').first();
        const totalPaid = roundCurrency(paidRow ? paidRow.total : 0);

        const discRow = await env.DB.prepare('SELECT COALESCE(SUM(amount),0) as total FROM fee_discounts WHERE student_id=? AND branch_id=? AND (session=? OR session IS NULL OR session=\'\')').bind(sid, bid, stu.session||'').first();
        const totalDisc = roundCurrency(discRow ? discRow.total : 0);
        const unpaid = Math.max(0, roundCurrency(annualFee - totalPaid - totalDisc));
        const newOldBalance = roundCurrency((stu.old_balance || 0) + unpaid);
        await env.DB.prepare('UPDATE students SET class_id=?, section=?, session=?, old_balance=?, fee_paid=0 WHERE id=?')
            .bind(to_class_id, to_section||'', to_session||'', newOldBalance, sid).run();

        try {
            const newSlabs = await getStudentSlabs(env, bid, to_class_id, stu.category, to_session);
            const newSlabAnnual = computeSlabAnnual(newSlabs);
            const newRoute = stu.route_id ? await env.DB.prepare('SELECT fee FROM transport_routes WHERE id=?').bind(stu.route_id).first() : null;
            const newTFee = newRoute ? Number(newRoute.fee||0)*12 : 0;
            const newFeeAmount = roundCurrency(newSlabAnnual + newTFee);
            await env.DB.prepare('UPDATE students SET fee_amount=? WHERE id=?').bind(newFeeAmount, sid).run();
        } catch(e) {  }
        if (Array.isArray(subject_ids)) {
            await env.DB.prepare('DELETE FROM student_subjects WHERE student_id=?').bind(sid).run();
            for (const subjectId of subject_ids) {
                await env.DB.prepare('INSERT INTO student_subjects (student_id, subject_id) VALUES (?,?)').bind(sid, subjectId).run();
            }
        }
    }
    return json({ success: true, promoted: student_ids.length });
});

router.get('/api/fee-carry-forward', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const studentId = url.searchParams.get('student_id');
    if (!studentId) return json({ error: 'student_id required' }, 400);
    const stu = await env.DB.prepare('SELECT old_balance FROM students WHERE id=?').bind(studentId).first();
    return json({ carry_forward: stu ? roundCurrency(stu.old_balance || 0) : 0 });
});

router.get('/api/exams', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin','teacher','staff','student','parent'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    let q = 'SELECT * FROM exams WHERE 1=1';
    const b = [];
    const branchId = Number(url.searchParams.get('branch_id') || 0);
    if (user.role === 'super_admin') {
        if (branchId) {
            await syncBranchExamsFromMaster(env, branchId);
            q += ' AND branch_id=?';
            b.push(branchId);
        }
    } else {
        const assignedBranchIds = await getUserAssignedBranchIds(env, user.id, user.branch_id);
        const selectedBranchId = branchId && assignedBranchIds.includes(branchId)
            ? branchId
            : Number(user.branch_id || assignedBranchIds[0] || 0);
        await syncBranchExamsFromMaster(env, selectedBranchId);
        q += ' AND branch_id=?';
        b.push(selectedBranchId);
    }
    const session = url.searchParams.get('session');
    if (session && session !== 'All') { q += ' AND session=?'; b.push(session); }
    q += ' ORDER BY id DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/exams', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO exams (branch_id, name, group_id, session) VALUES (?,?,?,?)')
        .bind(bid, d.name, d.group_id||null, d.session||'').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/exams/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const fields = []; const vals = [];
    for (const [k,v] of Object.entries(d)) { if (!['id','branch_id'].includes(k) && SAFE_COL_RE.test(k)) { fields.push(`${k}=?`); vals.push(v); } }
    if (!fields.length) return json({ error: 'No fields' }, 400);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, 'exams', params.id);
        if (access.error) return json({ error: access.error }, access.status);
    }
    vals.push(params.id);
    await env.DB.prepare(`UPDATE exams SET ${fields.join(',')} WHERE id=?`).bind(...vals).run();
    return json({ success: true });
});

router.delete('/api/exams/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM exam_results WHERE exam_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM datesheets WHERE exam_id=?').bind(params.id).run();
    await env.DB.prepare('DELETE FROM exams WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/gallery', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    let q = 'SELECT * FROM gallery WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id=?'; b.push(effBranch); }
    q += ' ORDER BY date DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/gallery', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const r = await env.DB.prepare('INSERT INTO gallery (branch_id, title, description, image_url, date, status, photos) VALUES (?,?,?,?,?,?,?)')
        .bind(bid, d.title, d.description||'', d.image_url||'', d.date||new Date().toISOString().slice(0,10), d.status||'Published', d.photos||'[]').run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/gallery/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    await env.DB.prepare('UPDATE gallery SET title=?, description=?, image_url=?, date=?, status=?, photos=? WHERE id=?')
        .bind(d.title, d.description||'', d.image_url||'', d.date||'', d.status||'Published', d.photos||'[]', params.id).run();
    return json({ success: true });
});

router.delete('/api/gallery/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM gallery WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/attendance/staff', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin','teacher','staff'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const staffId = url.searchParams.get('staff_id');
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    let q = 'SELECT sa.*, s.name, s.employee_id, s.father_name, s.designation, s.photo_url, s.phone, s.email FROM staff_attendance sa JOIN staff s ON sa.staff_id = s.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND sa.branch_id=?'; b.push(effBranch); }
    if (date) { q += ' AND sa.date=?'; b.push(date); }
    if (fromDate) { q += ' AND sa.date>=?'; b.push(fromDate); }
    if (toDate) { q += ' AND sa.date<=?'; b.push(toDate); }
    if (user.role === 'teacher') {
        if (staffId && Number(staffId) !== Number(user.linked_id)) return json({ error: 'Forbidden' }, 403);
        q += ' AND sa.staff_id=?';
        b.push(user.linked_id);
    } else if (staffId) { q += ' AND sa.staff_id=?'; b.push(staffId); }
    q += ' ORDER BY s.name, sa.date';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

const SENSITIVE_SETTINGS = new Set(['zoho_api_key', 'zoho_token', 'api_key', 'secret_key', 'smtp_password']);
const PUBLIC_SETTINGS = new Set(['enable_fee_due_student_portal', 'enable_fee_due_installment', 'enable_discount_in_receipt', 'academic_start_month', 'enable_sunday_working']);
router.get('/api/public-settings', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const bid = Number(await getWritableBranchId(req, env, user));
    const { results } = await env.DB.prepare('SELECT setting_key, setting_value FROM option_settings WHERE branch_id=?').bind(bid).all();
    const map = {};
    results.forEach(r => { if (PUBLIC_SETTINGS.has(r.setting_key)) map[r.setting_key] = r.setting_value; });
    return json(map);
});
router.get('/api/option-settings', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const bid = Number(await getWritableBranchId(req, env, user));
    const { results } = await env.DB.prepare('SELECT * FROM option_settings WHERE branch_id=?').bind(bid).all();
    if (user.role === 'branch_admin') {
        return json(results.filter(r => !SENSITIVE_SETTINGS.has(r.setting_key)));
    }
    return json(results);
});

router.post('/api/option-settings', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = Number(await getWritableBranchId(req, env, user, d.branch_id));
    for (const [key, value] of Object.entries(d.settings || {})) {
        if (user.role === 'branch_admin' && SENSITIVE_SETTINGS.has(key)) continue;
        await env.DB.prepare('INSERT OR REPLACE INTO option_settings (branch_id, setting_key, setting_value) VALUES (?,?,?)')
            .bind(bid, key, value).run();
    }
    return json({ success: true });
});

router.get('/api/transfer-certificates', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    let q = 'SELECT * FROM transfer_certificates WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND branch_id=?'; b.push(effBranch); }
    if (user.role === 'student') {
        q += ' AND student_id=?'; b.push(user.linked_id);
    } else if (user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        q += ` AND student_id IN (${allowedIds.map(() => '?').join(',')})`;
        b.push(...allowedIds);
    } else if (!isAdminRole(user) && user.role !== 'super_admin') {
        return json({ error: 'Forbidden' }, 403);
    }
    q += ' ORDER BY id DESC';
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/transfer-certificates', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const student = await getStudentForCertificate(env, user, d.student_id);
    if (!student) return json({ error: 'Student not found' }, 404);
    if (!isValidISODate(d.date_of_leaving) || !isValidISODate(d.issue_date)) return json({ error: 'Invalid transfer certificate dates' }, 400);
    if (d.date_of_admission && isValidISODate(d.date_of_admission) && d.date_of_leaving < d.date_of_admission) return json({ error: 'Date of leaving cannot be before admission date' }, 400);
    if (d.issue_date < d.date_of_leaving) return json({ error: 'Issue date cannot be before leaving date' }, 400);
    const tomorrowUtc = new Date(Date.now() + 86400000).toISOString().slice(0,10);
    if (d.issue_date > tomorrowUtc) return json({ error: 'Issue date cannot be in the future' }, 400);
    const requestedBranchId = Number(d.branch_id) || Number(student.branch_id) || null;
    const bid = Number(await getWritableBranchId(req, env, user, requestedBranchId));
    const r = await env.DB.prepare(
        `INSERT INTO transfer_certificates (branch_id, student_id, tc_no, admission_no, student_name, father_name, mother_name, dob, dob_words, nationality, category, religion, gender, class_id, section, last_class_studied, date_of_admission, date_of_leaving, qualified_for_promotion, fees_paid_up_to_date, scholarship, general_conduct, character, reason_for_leaving, remarks, issue_date, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(bid, d.student_id, d.tc_no, d.admission_no, d.student_name, d.father_name, d.mother_name, d.dob, d.dob_words, d.nationality || 'Indian', d.category, d.religion, d.gender, d.class_id, d.section, d.last_class_studied, d.date_of_admission, d.date_of_leaving, d.qualified_for_promotion || 'Yes', d.fees_paid_up_to_date || 'Yes', d.scholarship || 'None', d.general_conduct || 'Good', d.character || 'Good', d.reason_for_leaving, d.remarks, d.issue_date, d.status || 'Issued').run();
    return json({ success: true, id: r.meta.last_row_id });
});

router.put('/api/transfer-certificates/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const id = parseInt(params.id);
    const existing = await env.DB.prepare('SELECT branch_id FROM transfer_certificates WHERE id=?').bind(id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    if (d.student_id) {
        const student = await getStudentForCertificate(env, user, d.student_id);
        if (!student) return json({ error: 'Student not found' }, 404);
    }
    if (!isValidISODate(d.date_of_leaving) || !isValidISODate(d.issue_date)) return json({ error: 'Invalid transfer certificate dates' }, 400);
    if (d.date_of_admission && isValidISODate(d.date_of_admission) && d.date_of_leaving < d.date_of_admission) return json({ error: 'Date of leaving cannot be before admission date' }, 400);
    if (d.issue_date < d.date_of_leaving) return json({ error: 'Issue date cannot be before leaving date' }, 400);
    const tomorrowUtc = new Date(Date.now() + 86400000).toISOString().slice(0,10);
    if (d.issue_date > tomorrowUtc) return json({ error: 'Issue date cannot be in the future' }, 400);
    await env.DB.prepare(
        `UPDATE transfer_certificates SET tc_no=?, admission_no=?, student_name=?, father_name=?, mother_name=?, dob=?, dob_words=?, nationality=?, category=?, religion=?, gender=?, class_id=?, section=?, last_class_studied=?, date_of_admission=?, date_of_leaving=?, qualified_for_promotion=?, fees_paid_up_to_date=?, scholarship=?, general_conduct=?, character=?, reason_for_leaving=?, remarks=?, issue_date=?, status=? WHERE id=?`
    ).bind(d.tc_no, d.admission_no, d.student_name, d.father_name, d.mother_name, d.dob, d.dob_words, d.nationality || 'Indian', d.category, d.religion, d.gender, d.class_id, d.section, d.last_class_studied, d.date_of_admission, d.date_of_leaving, d.qualified_for_promotion || 'Yes', d.fees_paid_up_to_date || 'Yes', d.scholarship || 'None', d.general_conduct || 'Good', d.character || 'Good', d.reason_for_leaving, d.remarks, d.issue_date, d.status || 'Issued', id).run();
    return json({ success: true });
});

router.delete('/api/transfer-certificates/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const id = parseInt(params.id);
    const existing = await env.DB.prepare('SELECT branch_id FROM transfer_certificates WHERE id=?').bind(id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM transfer_certificates WHERE id=?').bind(id).run();
    return json({ success: true });
});

router.get('/api/transport-mapping', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const routeId = url.searchParams.get('route_id');
    let q = 'SELECT tm.*, v.vehicle_no, v.driver_name, tr.name as route_name, tr.fee as route_fee FROM transport_mapping tm LEFT JOIN vehicles v ON tm.vehicle_id = v.id LEFT JOIN transport_routes tr ON tm.route_id = tr.id WHERE 1=1';
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND tm.branch_id=?'; b.push(effBranch); }
    if (user.role === 'student' || user.role === 'parent') {
        const allowedIds = await getAccessibleStudentIdsForUser(env, user);
        if (!allowedIds.length) return json([]);
        const placeholders = allowedIds.map(() => '?').join(',');
        const { results: routeRows } = await env.DB.prepare(`SELECT DISTINCT route_id FROM students WHERE id IN (${placeholders}) AND route_id IS NOT NULL`).bind(...allowedIds).all();
        const allowedRouteIds = routeRows.map(row => Number(row.route_id)).filter(Boolean);
        if (!allowedRouteIds.length) return json([]);
        if (routeId) {
            if (!allowedRouteIds.includes(Number(routeId))) return json({ error: 'Forbidden' }, 403);
            q += ' AND tm.route_id=?';
            b.push(routeId);
        } else {
            q += ` AND tm.route_id IN (${allowedRouteIds.map(() => '?').join(',')})`;
            b.push(...allowedRouteIds);
        }
    } else if (routeId) {
        q += ' AND tm.route_id=?';
        b.push(routeId);
    }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/transport-mapping', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const vehicle = await env.DB.prepare('SELECT id, branch_id FROM vehicles WHERE id=?').bind(d.vehicle_id).first();
    const route = await env.DB.prepare('SELECT id, branch_id, fee FROM transport_routes WHERE id=?').bind(d.route_id).first();
    if (!vehicle || !route) return json({ error: 'Vehicle or route not found' }, 404);
    if (Number(vehicle.branch_id) !== Number(bid) || Number(route.branch_id) !== Number(bid)) return json({ error: 'Forbidden' }, 403);
    const r = await env.DB.prepare('INSERT INTO transport_mapping (branch_id, vehicle_id, route_id, amount_per_month) VALUES (?,?,?,?)').bind(bid, d.vehicle_id, d.route_id, d.amount_per_month || route.fee || 0).run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.put('/api/transport-mapping/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    const existing = await env.DB.prepare('SELECT branch_id FROM transport_mapping WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    const vehicle = await env.DB.prepare('SELECT id, branch_id FROM vehicles WHERE id=?').bind(d.vehicle_id).first();
    const route = await env.DB.prepare('SELECT id, branch_id, fee FROM transport_routes WHERE id=?').bind(d.route_id).first();
    if (!vehicle || !route) return json({ error: 'Vehicle or route not found' }, 404);
    if (Number(vehicle.branch_id) !== Number(existing.branch_id) || Number(route.branch_id) !== Number(existing.branch_id)) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('UPDATE transport_mapping SET vehicle_id=?, route_id=?, amount_per_month=? WHERE id=?').bind(d.vehicle_id, d.route_id, d.amount_per_month || route.fee || 0, params.id).run();
    return json({ success: true });
});

router.delete('/api/transport-mapping/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const existing = await env.DB.prepare('SELECT branch_id FROM transport_mapping WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);
    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);
    await env.DB.prepare('DELETE FROM transport_mapping WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

router.get('/api/dashboard/stats', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const effBranch = await getEffectiveBranchId(req, env, user);
    const bid = effBranch ? Number(effBranch) : 0;
    const bFilter = bid ? ' WHERE branch_id = ?' : '';
    const bAnd = bid ? ' AND branch_id = ?' : '';
    const bArr = bid ? [bid] : [];

    const students = bid
        ? await env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active FROM students WHERE branch_id = ?`).bind(bid).first()
        : await env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) as active FROM students`).first();
    const staff = bid
        ? await env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN designation='Teacher' THEN 1 ELSE 0 END) as teachers FROM staff WHERE branch_id = ?`).bind(bid).first()
        : await env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN designation='Teacher' THEN 1 ELSE 0 END) as teachers FROM staff`).first();
    const fees = bid
        ? await env.DB.prepare(`SELECT COALESCE(SUM(received_amount),0) as collected, COALESCE(SUM(balance),0) as pending FROM fee_deposits WHERE branch_id = ?`).bind(bid).first()
        : await env.DB.prepare(`SELECT COALESCE(SUM(received_amount),0) as collected, COALESCE(SUM(balance),0) as pending FROM fee_deposits`).first();
    const classes = bid
        ? await env.DB.prepare(`SELECT COUNT(*) as total FROM classes WHERE branch_id = ?`).bind(bid).first()
        : await env.DB.prepare(`SELECT COUNT(*) as total FROM classes`).first();
    const subjects = bid
        ? await env.DB.prepare(`SELECT COUNT(*) as total FROM subjects WHERE branch_id = ?`).bind(bid).first()
        : await env.DB.prepare(`SELECT COUNT(*) as total FROM subjects`).first();

    const months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    const monthlyFee = [];
    for (const m of months) {
        const row = bid
            ? await env.DB.prepare(`SELECT COALESCE(SUM(received_amount),0) as collected, COALESCE(SUM(balance),0) as pending FROM fee_deposits WHERE month=? AND branch_id=?`).bind(m, bid).first()
            : await env.DB.prepare(`SELECT COALESCE(SUM(received_amount),0) as collected, COALESCE(SUM(balance),0) as pending FROM fee_deposits WHERE month=?`).bind(m).first();
        monthlyFee.push({ month: m, collected: row.collected, pending: row.pending });
    }

    const targetBid = bid || 1;
    const { results: byClass } = await env.DB.prepare(`SELECT c.name as class_name, COUNT(s.id) as count FROM classes c LEFT JOIN students s ON c.id = s.class_id AND s.status='Active' WHERE c.branch_id = ? GROUP BY c.id ORDER BY c.display_order`).bind(targetBid).all();

    const gender = bid
        ? await env.DB.prepare(`SELECT gender, COUNT(*) as count FROM students WHERE branch_id=? AND status='Active' GROUP BY gender`).bind(bid).all()
        : await env.DB.prepare(`SELECT gender, COUNT(*) as count FROM students WHERE status='Active' GROUP BY gender`).all();

    const category = bid
        ? await env.DB.prepare(`SELECT category, COUNT(*) as count FROM students WHERE branch_id=? AND status='Active' GROUP BY category`).bind(bid).all()
        : await env.DB.prepare(`SELECT category, COUNT(*) as count FROM students WHERE status='Active' GROUP BY category`).all();

    const staffDesig = bid
        ? await env.DB.prepare(`SELECT designation, COUNT(*) as count FROM staff WHERE branch_id=? AND status='Active' GROUP BY designation`).bind(bid).all()
        : await env.DB.prepare(`SELECT designation, COUNT(*) as count FROM staff WHERE status='Active' GROUP BY designation`).all();

    const recentStudents = bid
        ? await env.DB.prepare(`SELECT s.id, s.admission_no, s.name, s.father_name, s.class_id, c.name as class_name, s.section, s.admission_date FROM students s LEFT JOIN classes c ON s.class_id=c.id WHERE s.branch_id=? ORDER BY s.id DESC LIMIT 10`).bind(bid).all()
        : await env.DB.prepare(`SELECT s.id, s.admission_no, s.name, s.father_name, s.class_id, c.name as class_name, s.section, s.admission_date FROM students s LEFT JOIN classes c ON s.class_id=c.id ORDER BY s.id DESC LIMIT 10`).all();

    const activeStaff = bid
        ? await env.DB.prepare(`SELECT id, employee_id, name, designation, phone FROM staff WHERE branch_id=? AND status='Active' ORDER BY name LIMIT 10`).bind(bid).all()
        : await env.DB.prepare(`SELECT id, employee_id, name, designation, phone FROM staff WHERE status='Active' ORDER BY name LIMIT 10`).all();

    const feeCollected = bid
        ? await env.DB.prepare(`SELECT COALESCE(SUM(received_amount),0) as total_paid FROM fee_deposits WHERE branch_id=?`).bind(bid).first()
        : await env.DB.prepare(`SELECT COALESCE(SUM(received_amount),0) as total_paid FROM fee_deposits`).first();
    const activeStudentsForFee = bid
        ? (await env.DB.prepare(`SELECT s.id, s.class_id, s.category, s.session, s.old_balance, COALESCE(tr.fee,0) as transport_fee FROM students s LEFT JOIN transport_routes tr ON s.route_id=tr.id WHERE s.branch_id=? AND s.status='Active'`).bind(bid).all()).results
        : (await env.DB.prepare(`SELECT s.id, s.class_id, s.category, s.session, s.old_balance, COALESCE(tr.fee,0) as transport_fee FROM students s LEFT JOIN transport_routes tr ON s.route_id=tr.id WHERE s.status='Active'`).all()).results;
    const allSlabs = bid
        ? (await env.DB.prepare('SELECT fs.class_id, fs.category, fs.session, fs.amount, fp.months FROM fee_slabs fs LEFT JOIN fee_particulars fp ON fs.particular_id=fp.id WHERE fs.branch_id=? AND (fp.is_transport IS NULL OR fp.is_transport=0)').bind(bid).all()).results
        : (await env.DB.prepare('SELECT fs.class_id, fs.category, fs.session, fs.amount, fp.months FROM fee_slabs fs LEFT JOIN fee_particulars fp ON fs.particular_id=fp.id WHERE (fp.is_transport IS NULL OR fp.is_transport=0)').all()).results;
    function slabAnnual(slabList, transportFee) {
        const fee = slabList.reduce((s,r) => {
            let mc = 12; try { const mp = typeof r.months==='string'&&r.months ? JSON.parse(r.months) : null; if (Array.isArray(mp)) mc = mp.length; } catch(e){}
            return s + Number(r.amount||0) * mc;
        }, 0);
        return fee + Number(transportFee||0) * 12;
    }
    let totalExpected = 0;
    for (const st of activeStudentsForFee) {
        const cat = st.category || 'Default';
        const sess = st.session || '';

        let stuSlabs = allSlabs.filter(sl => sl.class_id === st.class_id && (sl.category||'Default') === cat && (sl.session||'') === sess);
        if (!stuSlabs.length && sess) stuSlabs = allSlabs.filter(sl => sl.class_id === st.class_id && (sl.category||'Default') === cat && (!sl.session || sl.session === ''));
        if (!stuSlabs.length) stuSlabs = allSlabs.filter(sl => sl.class_id === st.class_id && (sl.category||'Default') === 'Default' && ((sl.session||'') === sess || !sl.session || sl.session === ''));
        totalExpected += slabAnnual(stuSlabs, st.transport_fee) + Number(st.old_balance||0);
    }
    totalExpected = roundCurrency(totalExpected);
    const feeTotals = { total_expected: totalExpected, total_paid: feeCollected ? feeCollected.total_paid : 0 };
    const dueStudents = activeStudentsForFee.filter(st => {
        const cat = st.category || 'Default';
        const sess = st.session || '';
        let stuSlabs = allSlabs.filter(sl => sl.class_id === st.class_id && (sl.category||'Default') === cat && (sl.session||'') === sess);
        if (!stuSlabs.length && sess) stuSlabs = allSlabs.filter(sl => sl.class_id === st.class_id && (sl.category||'Default') === cat && (!sl.session || sl.session === ''));
        if (!stuSlabs.length) stuSlabs = allSlabs.filter(sl => sl.class_id === st.class_id && (sl.category||'Default') === 'Default' && ((sl.session||'') === sess || !sl.session || sl.session === ''));
        return (slabAnnual(stuSlabs, st.transport_fee) + Number(st.old_balance||0)) > 0;
    });
    const studentsDue = { count: dueStudents.length };

    return json({
        students, staff, fees, classes: classes.total, subjects: subjects.total,
        monthlyFee, byClass,
        gender: gender.results, category: category.results, staffDesig: staffDesig.results,
        recentStudents: recentStudents.results, activeStaff: activeStaff.results,
        feeTotals, studentsDue: studentsDue.count
    });
});

const MASTER_TABLES = new Set([
    'classes', 'sections', 'subjects', 'designations', 'fee_particulars',
    'expense_heads', 'income_heads', 'transport_routes', 'vehicles',
    'exam_names', 'exam_groups', 'notices', 'holidays', 'academic_sessions',
    'periods', 'houses', 'streams', 'grading_system', 'deduction_heads',
    'allowance_heads', 'book_types', 'homework_types', 'admit_card_instructions',
    'branch_settings', 'syllabi', 'sms_templates'
]);

router.get('/api/master/:table', async (req, env, params) => {
    if (!MASTER_TABLES.has(params.table)) return json({ error: 'Invalid table' }, 400);
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    let bid = user.branch_id;
    if (user.role === 'super_admin') {
        const qBid = url.searchParams.get('branch_id');
        if (qBid) bid = parseInt(qBid);
    }
    const table = params.table;
    let results;
    if (bid) {
        results = await env.DB.prepare(`SELECT * FROM ${table} WHERE branch_id = ? ORDER BY id`).bind(bid).all();
    } else {
        results = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY id`).all();
    }
    return json(results.results);
});

router.post('/api/master/:table', async (req, env, params) => {
    if (!MASTER_TABLES.has(params.table)) return json({ error: 'Invalid table' }, 400);
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const data = await req.json();
    const bid = await getWritableBranchId(req, env, user, data.branch_id);
    if (!bid) return json({ error: 'branch_id required' }, 400);
    data.branch_id = bid;
    const table = params.table;
    const keys = Object.keys(data).filter(k => SAFE_COL_RE.test(k));
    if (!keys.length) return json({ error: 'No valid fields' }, 400);
    const vals = keys.map(k => data[k]);
    const placeholders = keys.map(() => '?').join(',');
    const result = await env.DB.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`).bind(...vals).run();
    return json({ id: result.meta.last_row_id, ...data }, 201);
});

router.put('/api/master/:table/:id', async (req, env, params) => {
    if (!MASTER_TABLES.has(params.table)) return json({ error: 'Invalid table' }, 400);
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const data = await req.json();
    const table = params.table;
    const cols = Object.keys(data).filter(k => k !== 'id' && k !== 'branch_id' && SAFE_COL_RE.test(k));
    if (!cols.length) return json({ error: 'No valid fields' }, 400);
    const sets = cols.map(k => `${k}=?`).join(',');
    const vals = cols.map(k => data[k]);
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, table, parseInt(params.id));
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare(`UPDATE ${table} SET ${sets} WHERE id=?`).bind(...vals, parseInt(params.id)).run();
    return json({ ok: true });
});

router.delete('/api/master/:table/:id', async (req, env, params) => {
    if (!MASTER_TABLES.has(params.table)) return json({ error: 'Invalid table' }, 400);
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    if (!['super_admin', 'branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const table = params.table;
    if (user.role !== 'super_admin') {
        const access = await ensureBranchAccess(env, user, table, parseInt(params.id));
        if (access.error) return json({ error: access.error }, access.status);
    }
    await env.DB.prepare(`DELETE FROM ${table} WHERE id=?`).bind(parseInt(params.id)).run();
    return json({ ok: true });
});

router.get('/api/face-descriptors', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(req.url);
    const personType = url.searchParams.get('person_type');
    let q = `SELECT fd.*, 
        CASE WHEN fd.person_type='student' THEN s.name WHEN fd.person_type='staff' THEN st.name END as person_name,
        CASE WHEN fd.person_type='student' THEN s.admission_no END as admission_no,
        CASE WHEN fd.person_type='student' THEN c.name END as class_name,
        CASE WHEN fd.person_type='student' THEN s.section END as section,
        CASE WHEN fd.person_type='student' THEN s.roll_no END as roll_no,
        CASE WHEN fd.person_type='student' THEN s.photo_url END as photo_url,
        CASE WHEN fd.person_type='staff' THEN st.employee_id END as employee_id,
        CASE WHEN fd.person_type='staff' THEN st.designation END as designation,
        CASE WHEN fd.person_type='staff' THEN st.photo_url END as staff_photo_url
        FROM face_descriptors fd 
        LEFT JOIN students s ON fd.person_type='student' AND fd.person_id=s.id 
        LEFT JOIN classes c ON s.class_id=c.id
        LEFT JOIN staff st ON fd.person_type='staff' AND fd.person_id=st.id
        WHERE 1=1`;
    const b = [];
    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND fd.branch_id=?'; b.push(effBranch); }
    if (personType) { q += ' AND fd.person_type=?'; b.push(personType); }
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.post('/api/face-descriptors', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const d = await req.json();
    if (!d.person_type || !d.person_id || !d.descriptors) return json({ error: 'Missing fields' }, 400);
    if (!['student','staff'].includes(d.person_type)) return json({ error: 'Invalid person_type' }, 400);
    const bid = await getWritableBranchId(req, env, user, d.branch_id);
    const desc = typeof d.descriptors === 'string' ? d.descriptors : JSON.stringify(d.descriptors);
    const r = await env.DB.prepare('INSERT OR REPLACE INTO face_descriptors (branch_id, person_type, person_id, descriptors) VALUES (?,?,?,?)')
        .bind(bid, d.person_type, d.person_id, desc).run();
    return json({ id: r.meta.last_row_id }, 201);
});

router.delete('/api/face-descriptors/:type/:personId', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user || !['super_admin','branch_admin'].includes(user.role)) return json({ error: 'Forbidden' }, 403);
    const bid = await getWritableBranchId(req, env, user, new URL(req.url).searchParams.get('branch_id'));
    let q = 'DELETE FROM face_descriptors WHERE person_type=? AND person_id=?';
    const b = [params.type, params.personId];
    if (user.role !== 'super_admin') { q += ' AND branch_id=?'; b.push(bid); }
    await env.DB.prepare(q).bind(...b).run();
    return json({ ok: true });
});


router.get('/api/teacher-permission-requests', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    
    const url = new URL(req.url);
    let q = `SELECT tpr.*, s.name as staff_name, s.employee_id, s.designation, s.phone as staff_phone,
        u.login_id as reviewed_by_name
        FROM teacher_permission_requests tpr
        JOIN staff s ON tpr.staff_id = s.id
        LEFT JOIN users u ON tpr.reviewed_by = u.id
        WHERE 1=1`;
    const b = [];

    const effBranch = await getEffectiveBranchId(req, env, user);
    if (effBranch) { q += ' AND tpr.branch_id=?'; b.push(effBranch); }

    if (user.role === 'teacher') {
        q += ' AND tpr.staff_id=?';
        b.push(user.linked_id);
    }

    const status = url.searchParams.get('status');
    const requestType = url.searchParams.get('request_type');
    const staffId = url.searchParams.get('staff_id');
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    const priority = url.searchParams.get('priority');
    
    if (status && status !== 'All') { q += ' AND tpr.status=?'; b.push(status); }
    if (requestType && requestType !== 'All') { q += ' AND tpr.request_type=?'; b.push(requestType); }
    if (staffId) { q += ' AND tpr.staff_id=?'; b.push(staffId); }
    if (fromDate) { q += ' AND DATE(tpr.created_at)>=?'; b.push(fromDate); }
    if (toDate) { q += ' AND DATE(tpr.created_at)<=?'; b.push(toDate); }
    if (priority && priority !== 'All') { q += ' AND tpr.priority=?'; b.push(priority); }
    
    q += ' ORDER BY tpr.created_at DESC, tpr.id DESC';
    
    const { results } = b.length ? await env.DB.prepare(q).bind(...b).all() : await env.DB.prepare(q).all();
    return json(results);
});

router.get('/api/teacher-permission-requests/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    
    const row = await env.DB.prepare(`SELECT tpr.*, s.name as staff_name, s.employee_id, s.designation, s.phone as staff_phone,
        u.login_id as reviewed_by_name
        FROM teacher_permission_requests tpr
        JOIN staff s ON tpr.staff_id = s.id
        LEFT JOIN users u ON tpr.reviewed_by = u.id
        WHERE tpr.id=?`).bind(params.id).first();
    
    if (!row) return json({ error: 'Not found' }, 404);

    if (!(await userCanAccessBranch(env, user, row.branch_id))) return json({ error: 'Forbidden' }, 403);

    if (user.role === 'teacher' && Number(row.staff_id) !== Number(user.linked_id)) {
        return json({ error: 'Forbidden' }, 403);
    }
    
    return json(row);
});

router.post('/api/teacher-permission-requests', async (req, env) => {
    const user = await authenticate(req, env);
    if (!user || user.role !== 'teacher') return json({ error: 'Only teachers can submit permission requests' }, 403);
    
    const d = await req.json();

    if (!d.request_type || !d.subject) {
        return json({ error: 'Request type and subject are required' }, 400);
    }
    
    const validTypes = ['Leave', 'Resource', 'Equipment', 'Other'];
    if (!validTypes.includes(d.request_type)) {
        return json({ error: 'Invalid request type' }, 400);
    }
    
    const validPriorities = ['Normal', 'Urgent'];
    const priority = validPriorities.includes(d.priority) ? d.priority : 'Normal';

    const staff = await env.DB.prepare('SELECT id, branch_id FROM staff WHERE id=?').bind(user.linked_id).first();
    if (!staff) return json({ error: 'Teacher profile not found' }, 404);

    const subject = String(d.subject || '').trim().slice(0, 200);
    const description = String(d.description || '').trim().slice(0, 2000);
    
    const result = await env.DB.prepare(`INSERT INTO teacher_permission_requests 
        (branch_id, staff_id, request_type, subject, description, priority, status) 
        VALUES (?,?,?,?,?,?,?)`)
        .bind(staff.branch_id, user.linked_id, d.request_type, subject, description, priority, 'Pending')
        .run();
    
    return json({ id: result.meta.last_row_id, success: true }, 201);
});

router.put('/api/teacher-permission-requests/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    
    const d = await req.json();
    
    const existing = await env.DB.prepare('SELECT * FROM teacher_permission_requests WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);

    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);

    if (user.role === 'teacher') {
        if (Number(existing.staff_id) !== Number(user.linked_id)) {
            return json({ error: 'Forbidden' }, 403);
        }
        if (existing.status !== 'Pending') {
            return json({ error: 'Cannot edit request that has been reviewed' }, 400);
        }

        const updates = {};
        if (d.subject !== undefined) updates.subject = String(d.subject).trim().slice(0, 200);
        if (d.description !== undefined) updates.description = String(d.description).trim().slice(0, 2000);
        if (d.priority !== undefined && ['Normal', 'Urgent'].includes(d.priority)) updates.priority = d.priority;
        if (d.request_type !== undefined && ['Leave', 'Resource', 'Equipment', 'Other'].includes(d.request_type)) updates.request_type = d.request_type;
        
        if (Object.keys(updates).length === 0) return json({ success: true });
        
        const sets = Object.keys(updates).map(k => `${k}=?`).join(', ');
        const vals = Object.values(updates);
        
        await env.DB.prepare(`UPDATE teacher_permission_requests SET ${sets}, updated_at=datetime('now') WHERE id=?`)
            .bind(...vals, params.id).run();
        
        return json({ success: true });
    }

    if (!isAdminRole(user)) return json({ error: 'Forbidden' }, 403);
    
    const status = String(d.status || '').trim();
    if (!['Approved', 'Rejected'].includes(status)) {
        return json({ error: 'Valid status (Approved/Rejected) is required' }, 400);
    }
    
    if (existing.status !== 'Pending') {
        return json({ error: 'This request has already been reviewed' }, 409);
    }
    
    const adminRemarks = String(d.admin_remarks || '').trim().slice(0, 1000);
    
    await env.DB.prepare(`UPDATE teacher_permission_requests 
        SET status=?, admin_remarks=?, reviewed_by=?, reviewed_at=datetime('now'), updated_at=datetime('now') 
        WHERE id=?`)
        .bind(status, adminRemarks, user.id, params.id).run();
    
    return json({ success: true });
});

router.delete('/api/teacher-permission-requests/:id', async (req, env, params) => {
    const user = await authenticate(req, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);
    
    const existing = await env.DB.prepare('SELECT * FROM teacher_permission_requests WHERE id=?').bind(params.id).first();
    if (!existing) return json({ error: 'Not found' }, 404);

    if (!(await userCanAccessBranch(env, user, existing.branch_id))) return json({ error: 'Forbidden' }, 403);

    if (user.role === 'teacher') {
        if (Number(existing.staff_id) !== Number(user.linked_id)) {
            return json({ error: 'Forbidden' }, 403);
        }
        if (existing.status !== 'Pending') {
            return json({ error: 'Cannot delete request that has been reviewed' }, 400);
        }
    } else if (!isAdminRole(user)) {
        return json({ error: 'Forbidden' }, 403);
    }
    
    await env.DB.prepare('DELETE FROM teacher_permission_requests WHERE id=?').bind(params.id).run();
    return json({ success: true });
});

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin') || '';
        const allowedOrigins = getAllowedOrigins(env);
        const originAllowed = allowedOrigins.has(origin) ||
            (env.DEV_MODE === 'true' && origin === 'http://localhost:3000');
        const corsH = {
            'Access-Control-Allow-Origin': originAllowed ? origin : '',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Vary': 'Origin',
        };

        if (request.method === 'OPTIONS') return new Response(null, { headers: corsH });

        let response;
        const url = new URL(request.url);
        const apiUser = url.pathname.startsWith('/api/') ? await authenticate(request, env) : null;
        const routePath = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
        const match = router.match(request.method, routePath);
        if (match) {
            try { response = await match.handler(request, env, match.params); }
            catch (e) { response = json({ error: e.message }, 500); }
        } else if (url.pathname.startsWith('/iclock')) {
            let payload = '';
            try {
                if (request.method !== 'GET' && request.method !== 'HEAD') payload = await request.clone().text();
            } catch {}
            const serial = getRequestSerial(request);
            const device = await getDeviceBySerial(env, serial);
            await logAdmsRequest(env, request, serial, device, payload);
            await logUnknownDevice(env, request, serial, payload);
            response = textResponse(`OK\nDateTime=${formatAdmsDateTime()}`);
        } else {
            response = json({ error: 'Not found' }, 404);
        }

        if (apiUser && url.pathname.startsWith('/api/')) {
            const methodMap = {
                GET: 'view',
                POST: 'edit',
                PUT: 'edit',
                PATCH: 'edit',
                DELETE: 'delete'
            };
            const actionType = methodMap[request.method] || 'other';
            const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
            if (!url.pathname.startsWith('/api/activity-log')) {
                await logActivity(env, {
                    branch_id: apiUser.branch_id,
                    user_id: apiUser.id,
                    user_name: apiUser.login_id,
                    activity: `${request.method} ${url.pathname}${response.status >= 400 ? ` (${response.status})` : ''}`,
                    ip_address: ipAddress,
                    action_type: actionType
                });
            }
        }

        const newHeaders = new Headers(response.headers);
        Object.entries(corsH).forEach(([k, v]) => newHeaders.set(k, v));
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
    }
};
