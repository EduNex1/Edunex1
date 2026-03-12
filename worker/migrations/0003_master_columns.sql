-- Add missing columns to master tables for UI compatibility

ALTER TABLE subjects ADD COLUMN is_activity INTEGER DEFAULT 0;

ALTER TABLE student_attendance ADD COLUMN remark TEXT;
ALTER TABLE staff_attendance ADD COLUMN remark TEXT;

ALTER TABLE designations ADD COLUMN attendance TEXT DEFAULT 'Yes';
ALTER TABLE designations ADD COLUMN display_order INTEGER DEFAULT 0;

ALTER TABLE exam_names ADD COLUMN min_marks REAL DEFAULT 0;
ALTER TABLE exam_names ADD COLUMN max_marks REAL DEFAULT 100;
ALTER TABLE exam_names ADD COLUMN status TEXT DEFAULT 'Published';
ALTER TABLE exam_names ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE exam_names ADD COLUMN session TEXT;

ALTER TABLE periods ADD COLUMN display_order INTEGER DEFAULT 0;

ALTER TABLE homework_types ADD COLUMN display_order INTEGER DEFAULT 0;

ALTER TABLE classes ADD COLUMN numeric_name INTEGER DEFAULT 0;

ALTER TABLE fee_particulars ADD COLUMN mode TEXT;
ALTER TABLE fee_particulars ADD COLUMN months TEXT;
ALTER TABLE fee_particulars ADD COLUMN is_transport INTEGER DEFAULT 0;

ALTER TABLE homework ADD COLUMN status TEXT DEFAULT 'Active';

ALTER TABLE books ADD COLUMN book_no TEXT;
ALTER TABLE books ADD COLUMN cost REAL DEFAULT 0;

ALTER TABLE notices ADD COLUMN display_to TEXT;

-- ===== COURSE SCHEDULES =====
CREATE TABLE IF NOT EXISTS course_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    exam_id INTEGER,
    schedule TEXT NOT NULL,
    topic TEXT NOT NULL,
    assignment TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ===== ACTIVITIES =====
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    class_group_id INTEGER,
    event TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== CLASS GROUPS =====
CREATE TABLE IF NOT EXISTS class_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    class_ids TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ===== TIMETABLE TIME =====
ALTER TABLE timetable ADD COLUMN time TEXT;

-- ===== DATE SHEETS (parent) =====
CREATE TABLE IF NOT EXISTS date_sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    publish_date TEXT,
    status TEXT DEFAULT 'Draft',
    created_at TEXT DEFAULT (date('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

ALTER TABLE datesheets ADD COLUMN sheet_id INTEGER REFERENCES date_sheets(id);
ALTER TABLE datesheets RENAME COLUMN exam_date TO date;
ALTER TABLE datesheets RENAME COLUMN start_time TO time_from;
ALTER TABLE datesheets RENAME COLUMN end_time TO time_to;

-- ===== GALLERY PHOTOS =====
ALTER TABLE gallery ADD COLUMN status TEXT DEFAULT 'Published';
ALTER TABLE gallery ADD COLUMN photos TEXT;

-- ===== USER PERMISSIONS =====
CREATE TABLE IF NOT EXISTS user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    module TEXT NOT NULL,
    access INTEGER DEFAULT 0,
    modify INTEGER DEFAULT 0,
    can_delete INTEGER DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Fee slabs category column
ALTER TABLE fee_slabs ADD COLUMN category TEXT DEFAULT 'Default';

-- Character certificates
CREATE TABLE IF NOT EXISTS character_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    serial_no TEXT,
    format TEXT DEFAULT 'cbse',
    conduct TEXT,
    date TEXT,
    purpose TEXT,
    remarks TEXT,
    created_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Co-scholastic areas reference
CREATE TABLE IF NOT EXISTS co_scholastic_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Add min_marks column to exam_results
ALTER TABLE exam_results ADD COLUMN min_marks REAL DEFAULT 0;

-- Result details (attendance, height, weight, etc. per student per exam)
CREATE TABLE IF NOT EXISTS result_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    attendance TEXT,
    remark TEXT,
    height TEXT,
    weight TEXT,
    result TEXT DEFAULT 'Pass',
    division TEXT,
    rank INTEGER,
    result_date TEXT,
    promoted_to TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Add category column to fee_discounts
ALTER TABLE fee_discounts ADD COLUMN category TEXT;

CREATE TABLE IF NOT EXISTS transfer_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    student_id INTEGER,
    tc_no TEXT,
    admission_no TEXT,
    student_name TEXT,
    father_name TEXT,
    mother_name TEXT,
    dob TEXT,
    dob_words TEXT,
    nationality TEXT DEFAULT 'Indian',
    category TEXT,
    religion TEXT,
    gender TEXT,
    class_id INTEGER,
    section TEXT,
    last_class_studied TEXT,
    date_of_admission TEXT,
    date_of_leaving TEXT,
    qualified_for_promotion TEXT DEFAULT 'Yes',
    fees_paid_up_to_date TEXT DEFAULT 'Yes',
    scholarship TEXT DEFAULT 'None',
    general_conduct TEXT DEFAULT 'Good',
    character TEXT DEFAULT 'Good',
    reason_for_leaving TEXT,
    remarks TEXT,
    issue_date TEXT,
    status TEXT DEFAULT 'Issued',
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS syllabi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    class_id INTEGER,
    subject_id INTEGER,
    title TEXT NOT NULL,
    note TEXT,
    file_name TEXT,
    status TEXT DEFAULT 'Draft',
    created_at TEXT DEFAULT (date('now')),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ===== GENERATED SALARIES extra columns =====
ALTER TABLE generated_salaries ADD COLUMN absent_days INTEGER DEFAULT 0;
ALTER TABLE generated_salaries ADD COLUMN late_days INTEGER DEFAULT 0;
ALTER TABLE generated_salaries ADD COLUMN half_days INTEGER DEFAULT 0;
ALTER TABLE generated_salaries ADD COLUMN total_deducted_days REAL DEFAULT 0;
ALTER TABLE generated_salaries ADD COLUMN salary_per_day REAL DEFAULT 0;
ALTER TABLE generated_salaries ADD COLUMN total_basic_salary REAL DEFAULT 0;
ALTER TABLE generated_salaries ADD COLUMN remark TEXT;
ALTER TABLE generated_salaries ADD COLUMN payment_date TEXT;
ALTER TABLE generated_salaries ADD COLUMN payment_mode TEXT;
ALTER TABLE generated_salaries ADD COLUMN allowances TEXT;
ALTER TABLE generated_salaries ADD COLUMN deductions TEXT;

-- ===== SMS TEMPLATES =====
CREATE TABLE IF NOT EXISTS sms_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL,
    key TEXT,
    name TEXT NOT NULL,
    message TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);
