-- =====================================================
-- SEED DATA — Initial setup for VKIS
-- =====================================================

-- Super Admin user (password: admin123 — will be hashed in production)
INSERT INTO users (login_id, password_hash, role, branch_id, is_active)
VALUES ('superadmin', 'admin123', 'super_admin', NULL, 1);

-- Default Branch
INSERT INTO branches (name, code, address, phone, email, school_name, principal_name, board, affiliation_no, school_code)
VALUES ('Lucknow', 'LKN', 'NH-24, Lucknow Road, Uttar Pradesh, India', '+91 99999 88888', 'info@vkis.edu.in', 'Vaish Khan International School', 'Dr. Rajesh Kumar Sharma', 'CBSE', '2130456', '12345');

-- Branch Admin for Lucknow
INSERT INTO users (login_id, password_hash, role, branch_id, is_active)
VALUES ('admin@LKN', 'admin123', 'branch_admin', 1, 1);

-- Academic Session
INSERT INTO academic_sessions (branch_id, name, start_date, end_date, status)
VALUES (1, '2025-2026', '2025-04-01', '2026-03-31', 'Active');

-- Default Classes (Nursery to 12)
INSERT INTO classes (branch_id, name, short_name, fee, display_order) VALUES
(1, 'Nursery', 'NUR', 2500, 1),
(1, 'LKG', 'LKG', 2800, 2),
(1, 'UKG', 'UKG', 3000, 3),
(1, '1', 'I', 3200, 4),
(1, '2', 'II', 3200, 5),
(1, '3', 'III', 3500, 6),
(1, '4', 'IV', 3500, 7),
(1, '5', 'V', 3800, 8),
(1, '6', 'VI', 4000, 9),
(1, '7', 'VII', 4000, 10),
(1, '8', 'VIII', 4200, 11),
(1, '9', 'IX', 4500, 12),
(1, '10', 'X', 5000, 13),
(1, '11', 'XI', 5500, 14),
(1, '12', 'XII', 6000, 15);

-- Sections
INSERT INTO sections (branch_id, name) VALUES
(1, 'A'), (1, 'B'), (1, 'C'), (1, 'D');

-- Subjects
INSERT INTO subjects (branch_id, name, code, has_practical) VALUES
(1, 'Hindi', 'HIN', 0),
(1, 'English', 'ENG', 0),
(1, 'Mathematics', 'MAT', 0),
(1, 'Science', 'SCI', 1),
(1, 'Social Science', 'SST', 0),
(1, 'Computer Science', 'CS', 1),
(1, 'Sanskrit', 'SKT', 0),
(1, 'EVS', 'EVS', 0),
(1, 'General Knowledge', 'GK', 0),
(1, 'Drawing', 'DRW', 0),
(1, 'Physical Education', 'PE', 1),
(1, 'Moral Science', 'MS', 0);

-- Designations
INSERT INTO designations (branch_id, name) VALUES
(1, 'Principal'),
(1, 'Vice Principal'),
(1, 'Teacher'),
(1, 'Clerk'),
(1, 'Accountant'),
(1, 'Librarian'),
(1, 'Sports Coach'),
(1, 'Peon');

-- Fee Particulars
INSERT INTO fee_particulars (branch_id, name) VALUES
(1, 'Tuition Fee'),
(1, 'Computer Fee'),
(1, 'Activity Fee'),
(1, 'Library Fee'),
(1, 'Transport Fee'),
(1, 'Lab Fee');

-- Transport Routes
INSERT INTO transport_routes (branch_id, name, stops, fee) VALUES
(1, 'Route 1 — Aliganj → School', 'Aliganj, Kapoorthala, Mahanagar', 800),
(1, 'Route 2 — Gomtinagar → School', 'Gomtinagar, Vikas Nagar, Indira Nagar', 900),
(1, 'Route 3 — Hazratganj → School', 'Hazratganj, Aminabad, Charbagh', 700),
(1, 'Route 4 — Alambagh → School', 'Alambagh, Charbagh, Husainabad', 850),
(1, 'Route 5 — Jankipuram → School', 'Jankipuram, Sitapur Road, Vikas Nagar', 950);

-- Grading System
INSERT INTO grading_system (branch_id, grade, min_percentage, max_percentage) VALUES
(1, 'A+', 91, 100),
(1, 'A', 81, 90),
(1, 'B+', 71, 80),
(1, 'B', 61, 70),
(1, 'C+', 51, 60),
(1, 'C', 41, 50),
(1, 'D', 33, 40),
(1, 'E', 0, 32);

-- Exam Names
INSERT INTO exam_names (branch_id, name) VALUES
(1, 'Unit Test 1'),
(1, 'Half Yearly'),
(1, 'Unit Test 2'),
(1, 'Annual');

-- Counters (for auto-generating IDs)
INSERT INTO counters (branch_id, counter_type, year, last_serial) VALUES
(1, 'admission', 2026, 0),
(1, 'employee', 2026, 0),
(1, 'receipt', 2026, 0);

-- Admit Card Instructions
INSERT INTO admit_card_instructions (branch_id, text) VALUES
(1, 'Students must carry their admit card to the examination hall.'),
(1, 'No electronic devices are allowed during the exam.'),
(1, 'Students should reach the exam center 30 minutes before the scheduled time.'),
(1, 'Use only blue or black ink pen for writing answers.');

-- Periods
INSERT INTO periods (branch_id, name, start_time, end_time) VALUES
(1, 'Period 1', '08:00', '08:40'),
(1, 'Period 2', '08:40', '09:20'),
(1, 'Period 3', '09:20', '10:00'),
(1, 'Break', '10:00', '10:20'),
(1, 'Period 4', '10:20', '11:00'),
(1, 'Period 5', '11:00', '11:40'),
(1, 'Period 6', '11:40', '12:20'),
(1, 'Lunch', '12:20', '01:00'),
(1, 'Period 7', '01:00', '01:40'),
(1, 'Period 8', '01:40', '02:20');

-- Houses
INSERT INTO houses (branch_id, name, color) VALUES
(1, 'Red House', '#e53935'),
(1, 'Blue House', '#1e88e5'),
(1, 'Green House', '#43a047'),
(1, 'Yellow House', '#fdd835');

-- Streams
INSERT INTO streams (branch_id, name) VALUES
(1, 'Science'),
(1, 'Commerce'),
(1, 'Arts/Humanities');

-- Homework Types
INSERT INTO homework_types (branch_id, name) VALUES
(1, 'Assignment'),
(1, 'Project'),
(1, 'Worksheet'),
(1, 'Practice');

-- Book Types
INSERT INTO book_types (branch_id, name) VALUES
(1, 'Text Book'),
(1, 'Reference Book'),
(1, 'Story Book'),
(1, 'Magazine'),
(1, 'Encyclopedia');

-- Expense Heads
INSERT INTO expense_heads (branch_id, name) VALUES
(1, 'Stationery'),
(1, 'Electricity'),
(1, 'Maintenance'),
(1, 'Transport'),
(1, 'Salary'),
(1, 'Events'),
(1, 'Miscellaneous');

-- Income Heads
INSERT INTO income_heads (branch_id, name) VALUES
(1, 'Fee Collection'),
(1, 'Admission Fee'),
(1, 'Transport Fee'),
(1, 'Late Fee'),
(1, 'Other Income');

-- Default Option Settings
INSERT INTO option_settings (branch_id, setting_key, setting_value) VALUES
(1, 'academic_start_month', 'April'),
(1, 'enable_fee_due_installment', '1'),
(1, 'enable_fee_due_student_portal', '1'),
(1, 'enable_discount_in_receipt', '0'),
(1, 'enable_sunday_working', '0'),
(1, 'enable_fee_deposit_sms', '1'),
(1, 'enable_admission_sms', '1'),
(1, 'enable_absent_sms_auto', '0'),
(1, 'enable_present_sms_auto', '0'),
(1, 'fee_demand_bill_note', 'Please submit your fees as soon as possible.');
