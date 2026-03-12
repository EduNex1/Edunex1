-- =====================================================
-- VKIS School Management System — Database Schema
-- Multi-tenant with branch_id on every table
-- =====================================================

-- ===== BRANCHES =====
CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    school_name TEXT NOT NULL DEFAULT 'School',
    principal_name TEXT,
    board TEXT DEFAULT 'CBSE',
    affiliation_no TEXT,
    school_code TEXT,
    logo_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ===== USERS (All Logins) =====
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login_id TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('super_admin','branch_admin','teacher','staff','student','parent')),
    branch_id INTEGER,
    linked_id INTEGER,
    is_active INTEGER DEFAULT 1,
    last_login TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== ACADEMIC SESSIONS =====
CREATE TABLE IF NOT EXISTS academic_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'Active',
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== CLASSES =====
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    fee REAL DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== SECTIONS =====
CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== SUBJECTS =====
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    code TEXT,
    has_practical INTEGER DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== DESIGNATIONS =====
CREATE TABLE IF NOT EXISTS designations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== STUDENTS =====
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    admission_no TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    gender TEXT,
    category TEXT,
    religion TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    aadhar_no TEXT,
    class_id INTEGER,
    section TEXT,
    session TEXT,
    roll_no INTEGER,
    route_id INTEGER,
    admission_date TEXT,
    id_type TEXT DEFAULT 'Aadharshila ID',
    status TEXT DEFAULT 'Active',
    fee_amount REAL DEFAULT 0,
    fee_paid REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- ===== STUDENT SUBJECTS (many-to-many) =====
CREATE TABLE IF NOT EXISTS student_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ===== STAFF =====
CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    name TEXT NOT NULL,
    father_name TEXT,
    dob TEXT,
    gender TEXT,
    designation TEXT,
    qualification TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    aadhar_no TEXT,
    joining_date TEXT,
    basic_salary REAL DEFAULT 0,
    bank_name TEXT,
    account_no TEXT,
    ifsc_code TEXT,
    pan_no TEXT,
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== STUDENT ATTENDANCE =====
CREATE TABLE IF NOT EXISTS student_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('P','A','L','HD')),
    marked_by INTEGER,
    UNIQUE(student_id, date),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ===== STAFF ATTENDANCE =====
CREATE TABLE IF NOT EXISTS staff_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('P','A','L','HD')),
    UNIQUE(staff_id, date),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ===== FEE PARTICULARS =====
CREATE TABLE IF NOT EXISTS fee_particulars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== FEE SLABS (class-wise fee amounts) =====
CREATE TABLE IF NOT EXISTS fee_slabs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    particular_id INTEGER NOT NULL,
    amount REAL DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (particular_id) REFERENCES fee_particulars(id)
);

-- ===== FEE DEPOSITS =====
CREATE TABLE IF NOT EXISTS fee_deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    date TEXT NOT NULL,
    student_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    total_amount REAL DEFAULT 0,
    late_fee REAL DEFAULT 0,
    concession REAL DEFAULT 0,
    grand_total REAL DEFAULT 0,
    received_amount REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    payment_mode TEXT,
    category TEXT DEFAULT 'Old',
    remarks TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ===== FEE DEPOSIT ITEMS (per-particular breakdown) =====
CREATE TABLE IF NOT EXISTS fee_deposit_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deposit_id INTEGER NOT NULL,
    particular_id INTEGER NOT NULL,
    amount REAL DEFAULT 0,
    FOREIGN KEY (deposit_id) REFERENCES fee_deposits(id) ON DELETE CASCADE,
    FOREIGN KEY (particular_id) REFERENCES fee_particulars(id)
);

-- ===== FEE DISCOUNTS =====
CREATE TABLE IF NOT EXISTS fee_discounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    particular_id INTEGER,
    month TEXT,
    amount REAL DEFAULT 0,
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ===== EXPENSE HEADS =====
CREATE TABLE IF NOT EXISTS expense_heads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== INCOME HEADS =====
CREATE TABLE IF NOT EXISTS income_heads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== EXPENSES =====
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    head_id INTEGER NOT NULL,
    amount REAL DEFAULT 0,
    description TEXT,
    vendor_id INTEGER,
    payment_mode TEXT,
    reference_no TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (head_id) REFERENCES expense_heads(id)
);

-- ===== INCOMES =====
CREATE TABLE IF NOT EXISTS incomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    head_id INTEGER NOT NULL,
    amount REAL DEFAULT 0,
    description TEXT,
    payment_mode TEXT,
    reference_no TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (head_id) REFERENCES income_heads(id)
);

-- ===== VENDORS =====
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    gst_no TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== BANK ACCOUNTS =====
CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    bank_name TEXT NOT NULL,
    account_no TEXT,
    ifsc_code TEXT,
    branch_name TEXT,
    balance REAL DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== CASH TRANSACTIONS =====
CREATE TABLE IF NOT EXISTS cash_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('deposit','withdraw')),
    amount REAL DEFAULT 0,
    bank_id INTEGER,
    description TEXT,
    reference_no TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (bank_id) REFERENCES bank_accounts(id)
);

-- ===== DEDUCTION HEADS =====
CREATE TABLE IF NOT EXISTS deduction_heads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== ALLOWANCE HEADS =====
CREATE TABLE IF NOT EXISTS allowance_heads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== SALARY SETTINGS =====
CREATE TABLE IF NOT EXISTS salary_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    component_type TEXT NOT NULL CHECK(component_type IN ('allowance','deduction')),
    component_id INTEGER NOT NULL,
    amount REAL DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ===== GENERATED SALARIES =====
CREATE TABLE IF NOT EXISTS generated_salaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    basic REAL DEFAULT 0,
    total_allowances REAL DEFAULT 0,
    total_deductions REAL DEFAULT 0,
    net_salary REAL DEFAULT 0,
    status TEXT DEFAULT 'Generated',
    generated_date TEXT DEFAULT (datetime('now')),
    UNIQUE(staff_id, month, year),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- ===== VEHICLES =====
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    vehicle_no TEXT NOT NULL,
    driver_name TEXT,
    driver_phone TEXT,
    capacity INTEGER DEFAULT 0,
    type TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== TRANSPORT ROUTES =====
CREATE TABLE IF NOT EXISTS transport_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    stops TEXT,
    fee REAL DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== TRANSPORT MAPPING =====
CREATE TABLE IF NOT EXISTS transport_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (route_id) REFERENCES transport_routes(id)
);

-- ===== BOOKS =====
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    publisher TEXT,
    type_id INTEGER,
    quantity INTEGER DEFAULT 1,
    available INTEGER DEFAULT 1,
    rack_no TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== BOOK TYPES =====
CREATE TABLE IF NOT EXISTS book_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== BOOK ISSUES =====
CREATE TABLE IF NOT EXISTS book_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT,
    return_date TEXT,
    status TEXT DEFAULT 'Issued',
    fine REAL DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ===== NOTICES =====
CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    target TEXT DEFAULT 'All',
    posted_by INTEGER,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== TIMETABLE =====
CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    section TEXT,
    day TEXT NOT NULL,
    period INTEGER NOT NULL,
    subject_id INTEGER,
    staff_id INTEGER,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- ===== PERIODS =====
CREATE TABLE IF NOT EXISTS periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== HOMEWORK =====
CREATE TABLE IF NOT EXISTS homework (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    section TEXT,
    subject_id INTEGER NOT NULL,
    type TEXT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    due_date TEXT,
    assigned_by INTEGER,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ===== HOMEWORK TYPES =====
CREATE TABLE IF NOT EXISTS homework_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== HOLIDAYS =====
CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT DEFAULT 'Holiday',
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== EXAMS =====
CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    group_id INTEGER,
    session TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== EXAM NAMES (types) =====
CREATE TABLE IF NOT EXISTS exam_names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== EXAM GROUPS =====
CREATE TABLE IF NOT EXISTS exam_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    exam_ids TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== EXAM RESULTS =====
CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    theory_marks REAL DEFAULT 0,
    practical_marks REAL DEFAULT 0,
    total_marks REAL DEFAULT 0,
    max_marks REAL DEFAULT 100,
    grade TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ===== DATESHEETS =====
CREATE TABLE IF NOT EXISTS datesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    exam_date TEXT,
    start_time TEXT,
    end_time TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ===== HOUSES =====
CREATE TABLE IF NOT EXISTS houses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== STREAMS =====
CREATE TABLE IF NOT EXISTS streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== TEACHER PERMISSIONS =====
CREATE TABLE IF NOT EXISTS teacher_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    section_id INTEGER,
    subject_id INTEGER,
    modules TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ===== GRADING SYSTEM =====
CREATE TABLE IF NOT EXISTS grading_system (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    grade TEXT NOT NULL,
    min_percentage REAL DEFAULT 0,
    max_percentage REAL DEFAULT 100,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== ADMIT CARD INSTRUCTIONS =====
CREATE TABLE IF NOT EXISTS admit_card_instructions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== SMS LOG =====
CREATE TABLE IF NOT EXISTS sms_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    recipient_type TEXT,
    recipient_id INTEGER,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'Sent',
    sent_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== ACTIVITY LOG =====
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER,
    user_id INTEGER,
    user_name TEXT,
    activity TEXT NOT NULL,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== OPTION SETTINGS =====
CREATE TABLE IF NOT EXISTS option_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    UNIQUE(branch_id, setting_key),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== CO-SCHOLASTIC RESULTS =====
CREATE TABLE IF NOT EXISTS co_scholastic_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    area_id INTEGER,
    grade TEXT,
    discipline TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- ===== GALLERY =====
CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    date TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== ADMISSION COUNTER (for auto-generating admission_no) =====
CREATE TABLE IF NOT EXISTS counters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    counter_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    last_serial INTEGER DEFAULT 0,
    UNIQUE(branch_id, counter_type, year),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);
