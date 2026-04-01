
/* Global HTML-escape utility – prevents stored XSS when inserting API data into the DOM */
function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* CSV Export utility – downloads array of objects as a CSV file */
function exportCSV(rows, columns, filename) {
    if (!rows || !rows.length) { if (typeof showToast === 'function') showToast('No data to export', 'error'); return; }
    filename = filename || 'export.csv';
    var header = columns.map(function(c){ return '"' + (c.label || c.key).replace(/"/g, '""') + '"'; }).join(',');
    var lines = rows.map(function(r){
        return columns.map(function(c){
            var v = typeof c.fn === 'function' ? c.fn(r) : (r[c.key] != null ? String(r[c.key]) : '');
            return '"' + v.replace(/"/g, '""') + '"';
        }).join(',');
    });
    var csv = '\uFEFF' + header + '\n' + lines.join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Exported ' + rows.length + ' records', 'success');
}

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''  // Use local proxy (same-origin) for local dev
    : 'https://vkis-api.schoolhub100.workers.dev';

const authStorage = {
    getItem: function(key) {
        var sessionValue = null;
        try { sessionValue = sessionStorage.getItem(key); } catch (e) {}
        if (sessionValue != null) return sessionValue;
        try {
            var legacyValue = localStorage.getItem(key);
            if (legacyValue != null) {
                sessionStorage.setItem(key, legacyValue);
                localStorage.removeItem(key);
            }
            return legacyValue;
        } catch (e) {
            return sessionValue;
        }
    },
    setItem: function(key, value) {
        try { sessionStorage.setItem(key, value); } catch (e) {}
        try { localStorage.removeItem(key); } catch (e) {}
    },
    removeItem: function(key) {
        try { sessionStorage.removeItem(key); } catch (e) {}
        try { localStorage.removeItem(key); } catch (e) {}
    }
};

function appendAuthTokenToFileUrl(value, token) {
    if (!value || typeof value !== 'string' || value.indexOf('/api/files/') === -1 || !token) return value;
    try {
        var url = new URL(value, API_BASE);
        if (!url.searchParams.get('auth_token')) url.searchParams.set('auth_token', token);
        return url.toString();
    } catch (e) {
        return value;
    }
}

function secureApiPayload(data, token) {
    if (Array.isArray(data)) return data.map(function(item){ return secureApiPayload(item, token); });
    if (data && typeof data === 'object') {
        var next = {};
        Object.keys(data).forEach(function(key){
            next[key] = secureApiPayload(data[key], token);
        });
        return next;
    }
    return appendAuthTokenToFileUrl(data, token);
}

function getToken() { return authStorage.getItem('vkis_token'); }
function setToken(token) { authStorage.setItem('vkis_token', token); }
function getUser() { try { return JSON.parse(authStorage.getItem('vkis_user')); } catch { return null; } }
function setUser(user) { authStorage.setItem('vkis_user', JSON.stringify(user)); }
function clearAuth() { authStorage.removeItem('vkis_token'); authStorage.removeItem('vkis_user'); authStorage.removeItem('vkis_permissions'); }
function getUserPerms() { try { return JSON.parse(authStorage.getItem('vkis_permissions')); } catch { return null; } }
function setUserPerms(perms) { authStorage.setItem('vkis_permissions', JSON.stringify(perms)); }
function isLoggedIn() { return !!getToken(); }

function requireAuth() {
    if (!isLoggedIn()) { window.location.href = '/'; return false; }
    return true;
}

async function api(endpoint, options = {}) {
    const skipSessionInjection = options.skipSessionInjection === true;
    const fetchOptions = { ...options };
    delete fetchOptions.skipSessionInjection;
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(fetchOptions.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const method = (fetchOptions.method || 'GET').toUpperCase();
    const sessionEndpoints = ['/api/students', '/api/fee-deposits', '/api/exam-results', '/api/datesheets', '/api/fee-report', '/api/fee-report-headwise', '/api/result-details'];
    
    // Auto-inject session for GET requests
    if (!skipSessionInjection && method === 'GET' && typeof getSelectedSession === 'function') {
        const sess = getSelectedSession();
        if (sess && !endpoint.includes('session=')) {
            if (sessionEndpoints.some(ep => endpoint.startsWith(ep) && (endpoint === ep || endpoint.charAt(ep.length) === '?'))) {
                endpoint += (endpoint.includes('?') ? '&' : '?') + 'session=' + encodeURIComponent(sess);
            }
        }
    }
    

    // Auto-inject branch_id for selected branch
    if (typeof getSelectedBranch === 'function') {
        const branchId = getSelectedBranch();
        if (branchId) {
            const skipBranchEndpoints = ['/api/auth/', '/api/branches', '/api/me'];
            if (!skipBranchEndpoints.some(ep => endpoint.startsWith(ep))) {
                if (method === 'GET') {
                    if (!endpoint.includes('branch_id=')) {
                        endpoint += (endpoint.includes('?') ? '&' : '?') + 'branch_id=' + encodeURIComponent(branchId);
                    }
                } else if ((method === 'POST' || method === 'PUT') && fetchOptions.body) {
                    try {
                        const bodyObj = JSON.parse(fetchOptions.body);
                        if (!bodyObj.branch_id) {
                            bodyObj.branch_id = branchId;
                            fetchOptions.body = JSON.stringify(bodyObj);
                        }
                    } catch(e) {}
                }
            }
        }
    }

    const res = await fetch(`${API_BASE}${endpoint}`, { ...fetchOptions, headers });
    if (res.status === 401 && !endpoint.includes('/auth/login')) {
        clearAuth(); window.location.href = '/'; return null;
    }
    const data = secureApiPayload(await res.json(), token);
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data;
}

async function loginUser(login_id, password) {
    try {
        const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ login_id, password }) });
        if (data && data.token) { setToken(data.token); setUser(data.user); return data; }
        return { error: 'Login failed' };
    } catch(e) {
        return { error: e.message || 'Invalid credentials' };
    }
}

function logoutUser() { clearAuth(); window.location.href = '/'; }

async function getCurrentUser() { return api('/api/auth/me'); }

async function getBranches() { return api('/api/branches'); }
async function createBranch(data) { return api('/api/branches', { method: 'POST', body: JSON.stringify(data) }); }
async function updateBranch(id, data) { return api(`/api/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteBranch(id) { return api(`/api/branches/${id}`, { method: 'DELETE' }); }

async function getStudents(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/students${params ? '?' + params : ''}`);
}
async function getStudent(id) { return api(`/api/students/${id}`); }
async function createStudent(data) { return api('/api/students', { method: 'POST', body: JSON.stringify(data) }); }
async function updateStudent(id, data) { return api(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteStudent(id) { return api(`/api/students/${id}`, { method: 'DELETE' }); }

async function getStaff(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/staff${params ? '?' + params : ''}`);
}
async function getStaffMember(id) { return api(`/api/staff/${id}`); }
async function createStaffMember(data) { return api('/api/staff', { method: 'POST', body: JSON.stringify(data) }); }
async function updateStaffMember(id, data) { return api(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteStaffMember(id) { return api(`/api/staff/${id}`, { method: 'DELETE' }); }

async function getMasterData(table, branchId) {
    const params = branchId ? `?branch_id=${branchId}` : '';
    return api(`/api/${table}${params}`);
}
async function createMasterData(table, data) { var r = await api(`/api/${table}`, { method: 'POST', body: JSON.stringify(data) }); _invalidateMasterCache(); return r; }
async function updateMasterData(table, id, data) { var r = await api(`/api/${table}/${id}`, { method: 'PUT', body: JSON.stringify(data) }); _invalidateMasterCache(); return r; }
async function deleteMasterData(table, id) { var r = await api(`/api/${table}/${id}`, { method: 'DELETE' }); _invalidateMasterCache(); return r; }
function _invalidateMasterCache() { if(typeof _dropdownCache==='object' && _dropdownCache) { for(var k in _dropdownCache) delete _dropdownCache[k]; } }

async function getClasses() { return getMasterData('classes'); }
async function getSections() { return getMasterData('sections'); }
async function getSubjects() { return getMasterData('subjects'); }
async function getDesignations() { return getMasterData('designations'); }
async function getFeeParticulars() { return getMasterData('fee_particulars'); }
async function getExpenseHeads() { return getMasterData('expense_heads'); }
async function getIncomeHeads() { return getMasterData('income_heads'); }
async function getTransportRoutes() { return getMasterData('transport_routes'); }
async function getVehicles() { return getMasterData('vehicles'); }
async function getTransportMappings(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/transport-mapping${params ? '?' + params : ''}`);
}
async function createTransportMapping(data) { return api('/api/transport-mapping', { method: 'POST', body: JSON.stringify(data) }); }
async function updateTransportMapping(id, data) { return api(`/api/transport-mapping/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteTransportMapping(id) { return api(`/api/transport-mapping/${id}`, { method: 'DELETE' }); }
async function fetchExamNamesMaster(branchId) {
    try {
        const rows = await getMasterData('exam_names', branchId || undefined);
        return Array.isArray(rows) ? rows : [];
    } catch (e) {
        return [];
    }
}

function mapExamRowsToNames(rows) {
    if (!Array.isArray(rows)) return [];
    return rows
        .map(exam => ({
            id: exam.id,
            name: exam.name || exam.title || '',
            session: exam.session || '',
            status: exam.status || 'Published'
        }))
        .filter(exam => exam.name);
}

async function getExamNames(filters = {}) {
    const branchId = (filters && filters.branch_id) || (typeof getSelectedBranch === 'function' ? getSelectedBranch() : '');
    const selectedSession = typeof getSelectedSession === 'function' ? getSelectedSession() : '';
    const master = await fetchExamNamesMaster(branchId);
    if (master.length) {
        // Add session to master exam names from selected session
        return master.map(exam => ({
            ...exam,
            session: exam.session || selectedSession || ''
        }));
    }
    let exams = [];
    try {
        exams = await getExams({ ...filters, useMasterFallback: false });
    } catch (e) {
        exams = [];
    }
    return mapExamRowsToNames(exams);
}
async function getNotices() { return getMasterData('notices'); }
async function getHolidays() { return getMasterData('holidays'); }
async function getAcademicSessions() { return getMasterData('academic_sessions'); }

function normalizeSectionLabel(value) {
    return String(value || '').trim();
}

async function getAvailableSections(classId, studentRows) {
    const names = new Set();

    try {
        const masterSections = await getSections();
        if (Array.isArray(masterSections)) {
            masterSections.forEach((section) => {
                const name = normalizeSectionLabel(section && (section.name || section.title || section.section));
                if (name) names.add(name);
            });
        }
    } catch (e) {}

    const rows = Array.isArray(studentRows) ? studentRows : [];
    rows.forEach((student) => {
        const name = normalizeSectionLabel(student && student.section);
        if (name) names.add(name);
    });

    if (!names.size && classId) {
        try {
            const students = await getStudents({ class_id: classId });
            if (Array.isArray(students)) {
                students.forEach((student) => {
                    const name = normalizeSectionLabel(student && student.section);
                    if (name) names.add(name);
                });
            }
        } catch (e) {}
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

async function populateSectionSelect(selectElement, options = {}) {
    if (!selectElement) return [];

    const includeAll = !!options.includeAll;
    const placeholder = options.placeholder || (includeAll ? 'All Sections' : 'Select Section');
    const emptyValue = includeAll ? 'All' : '';
    const sections = await getAvailableSections(options.classId || '', options.students || []);

    let html = `<option value="${emptyValue}">${placeholder}</option>`;
    if (!sections.length) {
        selectElement.innerHTML = `<option value="${emptyValue}">No sections available</option>`;
        selectElement.disabled = true;
        return [];
    }

    sections.forEach((section) => {
        html += `<option value="${section}">${section}</option>`;
    });
    selectElement.disabled = false;
    selectElement.innerHTML = html;

    if (options.selectedValue && sections.includes(options.selectedValue)) {
        selectElement.value = options.selectedValue;
    } else {
        selectElement.value = emptyValue;
    }

    return sections;
}
async function getPeriods() { return getMasterData('periods'); }
async function getHouses() { return getMasterData('houses'); }
async function getStreams() { return getMasterData('streams'); }
async function getGradingSystem() { return getMasterData('grading_system'); }
async function getSyllabi() { return getMasterData('syllabi'); }
async function createSyllabus(data) { return createMasterData('syllabi', data); }
async function updateSyllabus(id, data) { return updateMasterData('syllabi', id, data); }
async function deleteSyllabus(id) { return deleteMasterData('syllabi', id); }

async function getOptionSettings(branchId) {
    const params = branchId ? `?branch_id=${encodeURIComponent(branchId)}` : '';
    const rows = await api(`/api/option-settings${params}`);
    if (!Array.isArray(rows)) return rows || {};
    return rows.reduce((acc, row) => {
        acc[row.setting_key] = row.setting_value;
        return acc;
    }, {});
}
async function saveOptionSettings(settings, branchId) { return api('/api/option-settings', { method: 'POST', body: JSON.stringify({ settings, branch_id: branchId || undefined }) }); }
async function getPublicSettings() { return api('/api/public-settings'); }

async function getMyChildren() { return api('/api/my-children'); }

async function markStudentAttendance(date, records) {
    return api('/api/attendance/students', { method: 'POST', body: JSON.stringify({ date, records }) });
}
async function getStudentAttendance(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/attendance/students${params ? '?' + params : ''}`);
}
async function markStaffAttendance(date, records) {
    return api('/api/attendance/staff', { method: 'POST', body: JSON.stringify({ date, records }) });
}
async function autoMarkAbsent(date) {
    return api('/api/attendance/auto-absent', { method: 'POST', body: JSON.stringify({ date }) });
}

async function getFeeDeposits(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/fee-deposits${params ? '?' + params : ''}`);
}
async function getFeeDeposit(id) {
    return api(`/api/fee-deposits/${id}`);
}
async function createFeeDeposit(data) {
    return api('/api/fee-deposits', { method: 'POST', body: JSON.stringify(data) });
}
async function getFeeDueReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/fee-due-report${params ? '?' + params : ''}`);
}
async function getFeeReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/fee-report${params ? '?' + params : ''}`);
}
async function getFeeHeadwiseReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/fee-report-headwise${params ? '?' + params : ''}`);
}
async function getPaymentRequests(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/payment-requests${params ? '?' + params : ''}`);
}
async function getPaymentRequest(id) {
    return api(`/api/payment-requests/${id}`);
}
async function createPaymentRequest(data) {
    return api('/api/payment-requests', { method: 'POST', body: JSON.stringify(data) });
}
async function updatePaymentRequest(id, data) {
    return api(`/api/payment-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

async function getExpenses() { return api('/api/expenses'); }
async function createExpense(data) { return api('/api/expenses', { method: 'POST', body: JSON.stringify(data) }); }
async function updateExpense(id, data) { return api(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteExpense(id) { return api(`/api/expenses/${id}`, { method: 'DELETE' }); }
async function getIncomes() { return api('/api/incomes'); }
async function createIncome(data) { return api('/api/incomes', { method: 'POST', body: JSON.stringify(data) }); }
async function updateIncome(id, data) { return api(`/api/incomes/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteIncome(id) { return api(`/api/incomes/${id}`, { method: 'DELETE' }); }

async function getExamResults(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/exam-results${params ? '?' + params : ''}`);
}
async function saveExamResults(exam_id, results) {
    return api('/api/exam-results', { method: 'POST', body: JSON.stringify({ exam_id, results }) });
}
async function getResultDetails(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/result-details${params ? '?' + params : ''}`);
}
async function saveResultDetail(data) {
    return api('/api/result-details', { method: 'POST', body: JSON.stringify(data) });
}

async function getExams(filters = {}) {
    const payload = { ...filters };
    const useMasterFallback = payload.useMasterFallback !== false;
    delete payload.useMasterFallback;

    if (!payload.session && typeof getSelectedSession === 'function') {
        const selectedSession = getSelectedSession();
        if (selectedSession) payload.session = selectedSession;
    }
    if (!payload.branch_id && typeof getSelectedBranch === 'function') {
        const selectedBranch = getSelectedBranch();
        if (selectedBranch) payload.branch_id = selectedBranch;
    }

    let params = new URLSearchParams(payload).toString();
    let rows = [];
    try {
        rows = await api(`/api/exams${params ? '?' + params : ''}`, { skipSessionInjection: true });
    } catch (e) {
        rows = [];
    }

    if ((!Array.isArray(rows) || rows.length === 0) && !filters.session && payload.session) {
        const retryPayload = { ...payload };
        delete retryPayload.session;
        params = new URLSearchParams(retryPayload).toString();
        try {
            rows = await api(`/api/exams${params ? '?' + params : ''}`, { skipSessionInjection: true });
        } catch (e) {
            rows = [];
        }
    }

    if ((!Array.isArray(rows) || rows.length === 0) && payload.branch_id) {
        const retryPayload = { ...payload };
        delete retryPayload.branch_id;
        params = new URLSearchParams(retryPayload).toString();
        try {
            rows = await api(`/api/exams${params ? '?' + params : ''}`, { skipSessionInjection: true });
        } catch (e) {
            rows = [];
        }
    }

    if ((!Array.isArray(rows) || rows.length === 0) && useMasterFallback) {
        const branchId = (filters && filters.branch_id) || payload.branch_id || (typeof getSelectedBranch === 'function' ? getSelectedBranch() : '');
        const master = await fetchExamNamesMaster(branchId);
        if (master.length) {
            return master
                .map((exam, idx) => ({
                    id: exam.id || ('m_' + idx),
                    name: exam.name || exam.title || '',
                    title: exam.name || exam.title || '',
                    session: exam.session || payload.session || '',
                    status: exam.status || 'Published'
                }))
                .filter(exam => exam.name);
        }
    }

    return Array.isArray(rows) ? rows : [];
}
async function createExam(data) { return api('/api/exams', { method: 'POST', body: JSON.stringify(data) }); }
async function updateExam(id, data) { return api(`/api/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteExam(id) { return api(`/api/exams/${id}`, { method: 'DELETE' }); }

async function getDashboardStats(branchId) {
    const params = branchId ? `?branch_id=${branchId}` : '';
    return api(`/api/dashboard/stats${params}`);
}

async function uploadFile(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    if (typeof getSelectedBranch === 'function') {
        var branchId = getSelectedBranch();
        if (branchId) formData.append('branch_id', branchId);
    }
    const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST', body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = secureApiPayload(await res.json(), token);
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
}

async function getUsers() { return api('/api/users'); }
async function createUser(data) { return api('/api/users', { method: 'POST', body: JSON.stringify(data) }); }
async function updateUser(id, data) { return api(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteUser(id) { return api(`/api/users/${id}`, { method: 'DELETE' }); }
async function changePassword(currentPassword, newPassword) { return api('/api/change-password', { method: 'POST', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) }); }
async function getUserCredentials(type, id) { return api(`/api/user-credentials/${type}/${id}`); }
async function adminResetPassword(type, linkedId, newPassword) { return api('/api/admin-reset-password', { method: 'POST', body: JSON.stringify({ type, linked_id: linkedId, new_password: newPassword }) }); }
async function getMyProfile() { return api('/api/me'); }
async function updateMyProfile(data) { return api('/api/me', { method: 'PUT', body: JSON.stringify(data) }); }
async function getSuperAdmins() { return api('/api/super-admins'); }
async function createSuperAdmin(data) { return api('/api/super-admins', { method: 'POST', body: JSON.stringify(data) }); }
async function getUserPermissions(userId) {
    const params = userId ? `?user_id=${userId}` : '';
    return api(`/api/user-permissions${params}`);
}
async function saveUserPermissions(userId, permissions) {
    return api('/api/user-permissions', { method: 'POST', body: JSON.stringify({ user_id: userId, permissions }) });
}

async function getSalarySettings(staffId) {
    const params = staffId ? `?staff_id=${staffId}` : '';
    return api(`/api/salary-settings${params}`);
}
async function createSalarySetting(data) { return api('/api/salary-settings', { method: 'POST', body: JSON.stringify(data) }); }
async function deleteSalarySetting(id) { return api(`/api/salary-settings/${id}`, { method: 'DELETE' }); }
async function getSalaries(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/salaries${params ? '?' + params : ''}`);
}
async function generateSalaries(data) { return api('/api/salaries/generate', { method: 'POST', body: JSON.stringify(data) }); }
async function updateSalary(id, data) { return api(`/api/salaries/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteSalary(id) { return api(`/api/salaries/${id}`, { method: 'DELETE' }); }

async function getSmsTemplates() { return getMasterData('sms_templates'); }

async function getBooks() { return api('/api/books'); }
async function createBook(data) { return api('/api/books', { method: 'POST', body: JSON.stringify(data) }); }
async function updateBook(id, data) { return api(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteBook(id) { return api(`/api/books/${id}`, { method: 'DELETE' }); }

async function getBookIssues(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/book-issues${params ? '?' + params : ''}`);
}
async function createBookIssue(data) { return api('/api/book-issues', { method: 'POST', body: JSON.stringify(data) }); }
async function returnBook(id, data) { return api(`/api/book-issues/${id}/return`, { method: 'PUT', body: JSON.stringify(data) }); }

async function getTimetable(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/timetable${params ? '?' + params : ''}`);
}
async function saveTimetable(entries) { return api('/api/timetable', { method: 'POST', body: JSON.stringify({ entries }) }); }
async function createTimetableEntry(data) { return api('/api/timetable', { method: 'POST', body: JSON.stringify(data) }); }
async function updateTimetableEntry(id, data) { return api(`/api/timetable/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteTimetableEntry(id) { return api(`/api/timetable/${id}`, { method: 'DELETE' }); }

async function getCourseSchedules(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/course-schedules${params ? '?' + params : ''}`);
}
async function createCourseSchedule(data) { return api('/api/course-schedules', { method: 'POST', body: JSON.stringify(data) }); }
async function updateCourseSchedule(id, data) { return api(`/api/course-schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteCourseSchedule(id) { return api(`/api/course-schedules/${id}`, { method: 'DELETE' }); }

async function getActivities() { return api('/api/activities'); }
async function createActivity(data) { return api('/api/activities', { method: 'POST', body: JSON.stringify(data) }); }
async function updateActivity(id, data) { return api(`/api/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteActivity(id) { return api(`/api/activities/${id}`, { method: 'DELETE' }); }

async function getClassGroups() { return api('/api/class-groups'); }
async function createClassGroup(data) { return api('/api/class-groups', { method: 'POST', body: JSON.stringify(data) }); }

async function getGallery() { return api('/api/gallery'); }
async function createGalleryAlbum(data) { return api('/api/gallery', { method: 'POST', body: JSON.stringify(data) }); }
async function updateGalleryAlbum(id, data) { return api(`/api/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteGalleryAlbum(id) { return api(`/api/gallery/${id}`, { method: 'DELETE' }); }

async function getHomework(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/homework${params ? '?' + params : ''}`);
}
async function createHomework(data) { return api('/api/homework', { method: 'POST', body: JSON.stringify(data) }); }
async function updateHomework(id, data) { return api(`/api/homework/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteHomework(id) { return api(`/api/homework/${id}`, { method: 'DELETE' }); }

async function getDatesheets(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/datesheets${params ? '?' + params : ''}`);
}
async function getDateSheets() { return api('/api/date-sheets'); }
async function createDateSheet(data) { return api('/api/date-sheets', { method: 'POST', body: JSON.stringify(data) }); }
async function updateDateSheet(id, data) { return api(`/api/date-sheets/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteDateSheet(id) { return api(`/api/date-sheets/${id}`, { method: 'DELETE' }); }
async function getDateSheetEntries(sheetId) { return api(`/api/date-sheets/${sheetId}/entries`); }
async function createDateSheetEntry(sheetId, data) { return api(`/api/date-sheets/${sheetId}/entries`, { method: 'POST', body: JSON.stringify(data) }); }
async function updateDateSheetEntry(entryId, data) { return api(`/api/datesheet-entries/${entryId}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteDateSheetEntry(entryId) { return api(`/api/datesheet-entries/${entryId}`, { method: 'DELETE' }); }

async function getVendors() { return api('/api/vendors'); }
async function createVendor(data) { return api('/api/vendors', { method: 'POST', body: JSON.stringify(data) }); }
async function updateVendor(id, data) { return api(`/api/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteVendor(id) { return api(`/api/vendors/${id}`, { method: 'DELETE' }); }

async function getBankAccounts() { return api('/api/bank-accounts'); }
async function createBankAccount(data) { return api('/api/bank-accounts', { method: 'POST', body: JSON.stringify(data) }); }
async function updateBankAccount(id, data) { return api(`/api/bank-accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteBankAccount(id) { return api(`/api/bank-accounts/${id}`, { method: 'DELETE' }); }

async function getCashTransactions() { return api('/api/cash-transactions'); }
async function createCashTransaction(data) { return api('/api/cash-transactions', { method: 'POST', body: JSON.stringify(data) }); }
async function updateCashTransaction(id, data) { return api(`/api/cash-transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteCashTransaction(id) { return api(`/api/cash-transactions/${id}`, { method: 'DELETE' }); }

async function getEmailLog() { return api('/api/email-log'); }
async function sendEmailApi(data) { return api('/api/email/send', { method: 'POST', body: JSON.stringify(data) }); }
async function getSmsLog() { return api('/api/sms-log'); }
async function sendRealSms(data) { return api('/api/sms/send', { method: 'POST', body: JSON.stringify(data) }); }

async function getActivityLog() { return api('/api/activity-log'); }

async function getFeeSlabs(classId, session) {
    let params = classId ? `?class_id=${classId}` : '';
    if (session) params += (params ? '&' : '?') + `session=${encodeURIComponent(session)}`;
    return api(`/api/fee-slabs${params}`);
}
async function saveFeeSlabs(data) { return api('/api/fee-slabs', { method: 'POST', body: JSON.stringify(data) }); }
async function deleteFeeSlabsByClass(classId, category, session) {
    let url = `/api/fee-slabs?class_id=${classId}&category=${encodeURIComponent(category || 'Default')}`;
    if (session) url += `&session=${encodeURIComponent(session)}`;
    return api(url, { method: 'DELETE' });
}

async function getFeeDiscounts(studentId) {
    const params = studentId ? `?student_id=${studentId}` : '';
    return api(`/api/fee-discounts${params}`);
}
async function createFeeDiscount(data) { return api('/api/fee-discounts', { method: 'POST', body: JSON.stringify(data) }); }
async function deleteFeeDiscount(id) { return api(`/api/fee-discounts/${id}`, { method: 'DELETE' }); }

async function getCharacterCertificates() { return api('/api/character-certificates'); }
async function createCharacterCertificate(data) { return api('/api/character-certificates', { method: 'POST', body: JSON.stringify(data) }); }
async function updateCharacterCertificate(id, data) { return api(`/api/character-certificates/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteCharacterCertificate(id) { return api(`/api/character-certificates/${id}`, { method: 'DELETE' }); }

async function getCoScholasticAreas() { return api('/api/co-scholastic-areas'); }
async function getCoScholasticResults(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/co-scholastic-results${params ? '?' + params : ''}`);
}
async function saveCoScholasticResults(exam_id, student_id, results) {
    return api('/api/co-scholastic-results', { method: 'POST', body: JSON.stringify({ exam_id, student_id, results }) });
}

async function getTeacherPermissions(staffId) {
    const params = staffId ? `?staff_id=${staffId}` : '';
    return api(`/api/teacher-permissions${params}`);
}
async function createTeacherPermission(data) { return api('/api/teacher-permissions', { method: 'POST', body: JSON.stringify(data) }); }
async function updateTeacherPermission(id, data) { return api(`/api/teacher-permissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteTeacherPermission(id) { return api(`/api/teacher-permissions/${id}`, { method: 'DELETE' }); }

async function getStudentSubjects(studentId) { return api(`/api/student-subjects/${studentId}`); }
async function saveStudentSubjects(studentId, subjectIds) {
    return api('/api/student-subjects', { method: 'POST', body: JSON.stringify({ student_id: studentId, subject_ids: subjectIds }) });
}

async function promoteStudents(data) { return api('/api/students/promote', { method: 'POST', body: JSON.stringify(data) }); }

async function getCarryForward(studentId, currentSession) {
    return api(`/api/fee-carry-forward?student_id=${studentId}&current_session=${encodeURIComponent(currentSession)}`);
}

async function createGalleryItem(data) { return api('/api/gallery', { method: 'POST', body: JSON.stringify(data) }); }

async function getStaffAttendance(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/attendance/staff${params ? '?' + params : ''}`);
}

async function getTransferCertificates() { return api('/api/transfer-certificates'); }
async function createTransferCertificate(data) { return api('/api/transfer-certificates', { method: 'POST', body: JSON.stringify(data) }); }
async function updateTransferCertificate(id, data) { return api(`/api/transfer-certificates/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
async function deleteTransferCertificate(id) { return api(`/api/transfer-certificates/${id}`, { method: 'DELETE' }); }

async function getDeductionHeads() { return getMasterData('deduction_heads'); }
async function getAllowanceHeads() { return getMasterData('allowance_heads'); }
async function getBookTypes() { return getMasterData('book_types'); }
async function getHomeworkTypes() { return getMasterData('homework_types'); }
async function getExamGroups() { return getMasterData('exam_groups'); }

async function getFaceDescriptors(filters = {}) { const p = new URLSearchParams(filters).toString(); return api(`/api/face-descriptors${p ? '?' + p : ''}`); }
async function saveFaceDescriptor(data) { return api('/api/face-descriptors', { method: 'POST', body: JSON.stringify(data) }); }
async function deleteFaceDescriptor(type, personId) { return api(`/api/face-descriptors/${type}/${personId}`, { method: 'DELETE' }); }

/* ─── Teacher Permission Requests ─── */
async function getTeacherPermissionRequests(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return api(`/api/teacher-permission-requests${params ? '?' + params : ''}`);
}
async function getTeacherPermissionRequest(id) {
    return api(`/api/teacher-permission-requests/${id}`);
}
async function createTeacherPermissionRequest(data) {
    return api('/api/teacher-permission-requests', { method: 'POST', body: JSON.stringify(data) });
}
async function updateTeacherPermissionRequest(id, data) {
    return api(`/api/teacher-permission-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
async function deleteTeacherPermissionRequest(id) {
    return api(`/api/teacher-permission-requests/${id}`, { method: 'DELETE' });
}
