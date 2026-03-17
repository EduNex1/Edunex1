
                         EDUNEX1 SCHOOL MANAGEMENT SYSTEM
                       Complete Platform Documentation Guide
                       ______________________________________


                              TABLE OF CONTENTS

   1.  Platform Overview
   2.  Login & Authentication
   3.  User Roles & Access Levels
   4.  Admin Panel (Super Admin / Branch Admin)
         4.1   Dashboard
         4.2   Students Module
         4.3   Attendance Module
         4.4   Cards & Certificates Module
         4.5   Academics Module
         4.6   Staff Module
         4.7   Fee Master Module
         4.8   Fee Module
         4.9   Payroll Module
         4.10  Accounts Module
         4.11  Email / Messaging Module
         4.12  Result Module
         4.13  Transport Module
         4.14  Library Module
         4.15  Masters Module
         4.16  Settings Module
   5.  Teacher Portal
   6.  Parent Portal
   7.  Student Portal
   8.  Branch & Session Management
   9.  Permission System


________________________________________________________________________________

1. PLATFORM OVERVIEW
________________________________________________________________________________

EduNex1 is a comprehensive, cloud-based School Management System designed to
manage all aspects of school operations. It provides role-based access for five
types of users:

   Super Admin      Full platform access across all branches
   Branch Admin     Manages a single branch with configurable module permissions
   Teacher          Class/subject-specific access for attendance, marks, homework
   Parent           View-only access to children's academic records, fees, attendance
   Student          View-only access to own academic records, fees, attendance


Key Capabilities at a Glance:

   Student Management     Admission, profiles, promotion, subject assignment
   Attendance             Daily marking, reports, statistics, face recognition
   Fee Management         Fee structure setup, collection, receipts, reports,
                          online payment, discounts
   Academics              Notices, timetable, syllabus, datesheet, holidays,
                          homework, gallery
   Staff & Payroll        Staff profiles, attendance, salary generation, payments
   Results                Student-wise and subject-wise entry, consolidated marks,
                          result cards
   Cards & Certificates   ID cards, admit cards, character & transfer certificates
   Transport              Vehicle management, routes, student-route mapping
   Library                Book catalog, issue/return, settings
   Accounts               Income/expense tracking, bank accounts, vendor management
   Messaging              Email to students/staff with templates and reports
   Settings               User management, permissions, branch settings, options


________________________________________________________________________________

2. LOGIN & AUTHENTICATION
________________________________________________________________________________

The login page is the entry point for all users regardless of their role.

How to Log In:

   1. Open the platform URL in any browser
   2. Enter your User ID (provided by the school admin)
   3. Enter your Password
   4. Click Sign In
   5. You will be automatically redirected to your role-specific dashboard

Login Page Features:
   - Password visibility toggle (eye icon) to show or hide password while typing
   - Error messages displayed if credentials are incorrect
   - Loading spinner shown during authentication
   - Automatic redirect to dashboard if already logged in

After Successful Login:
   - A secure session token is created (valid for 24 hours)
   - For admin users, module permissions are loaded and cached
   - You are redirected to your dashboard based on your role:
        Super Admin / Branch Admin    goes to    Admin Dashboard
        Teacher                       goes to    Teacher Dashboard
        Parent                        goes to    Parent Dashboard
        Student                       goes to    Student Dashboard


________________________________________________________________________________

3. USER ROLES & ACCESS LEVELS
________________________________________________________________________________

Role Comparison:

                        Super    Branch
   Feature              Admin    Admin    Teacher   Parent   Student
   --------------------------------------------------------------------------
   Multi-branch access   Yes      No        No       No       No
   Session switcher      Yes      Yes       No       No       No
   Branch switcher       Yes      If multi  No       No       No
   Admin sidebar         All      Based on  No       No       No
   (16 modules)          modules  permissions
   Teacher portal        No       No        Yes      No       No
   Parent portal         No       No        No       Yes      No
   Student portal        No       No        No       No       Yes
   Manage users          Yes      Yes       No       No       No
   Manage permissions    Yes      Limited   No       No       No
   Manage branches       Yes      No        No       No       No
   Change own password   Yes      Yes       Yes      Yes      Yes

How Permissions Work:

   - Super Admin always has access to every module. No permissions setup needed.
   - Branch Admin starts with NO access. The Super Admin must grant module
     permissions from the Settings section.
   - If a Branch Admin has no permissions assigned, the sidebar shows a yellow
     warning message: "No permissions assigned. Please contact Super Admin to
     get module access."
   - Branch Admins can only grant permissions for modules they themselves have
     access to.
   - Branch Admins cannot edit their own permissions.
   - Permissions are cached locally and refreshed in the background on each
     page load.


________________________________________________________________________________

4. ADMIN PANEL (SUPER ADMIN / BRANCH ADMIN)
________________________________________________________________________________

The admin panel is the main management interface for Super Admin and Branch Admin
users. It consists of 16 modules accessible from the left sidebar.


Header Bar (Top Navigation):

The header bar appears on every admin page and contains:

   1. Mobile menu toggle (hamburger icon) for opening/closing sidebar on mobile
   2. School name with "EduNex1" subtitle
   3. Branch Switcher dropdown (shown for Super Admin or multi-branch users)
      - Super Admin sees "All Branches" as the default option
      - Switching branches filters all data to the selected branch
   4. Session Switcher dropdown (shown for Super Admin and Branch Admin)
      - Select the active academic session (e.g., "2025-26")
   5. User menu (top-right corner) showing user name, role, and avatar initials
      - My Profile link
      - Log Out button


________________________________________________________________________________

4.1  DASHBOARD
________________________________________________________________________________

The admin dashboard provides a comprehensive overview of the school's current
status at a glance.

Statistics Cards (6 cards at the top):

   Students       Total students and active count
   Staff          Total staff and number of teachers
   Collected      Total fee collected (in INR) with collection percentage
   Pending        Outstanding fee amount and number of students with dues
   Classes        Total classes and class groups
   Subjects       Total subjects

Charts (6 visual charts):

   Students by Class          Bar chart showing student count per class
   Monthly Fee Collection     Grouped bar showing Collected vs Pending per month
   Fee Overview               Doughnut chart showing Collected vs Pending split
   Category Distribution      Doughnut showing students by category
   Gender Distribution        Doughnut showing Male vs Female students
   Staff Roles                Horizontal bar showing staff count per designation

Tables:

   Recent Admissions    Latest admitted students with name, admission no, class, date
   Active Staff         Staff list with photo, name, designation, employee ID

Quick Access Grid with 10 shortcuts:
   New Admission, Student List, Attendance, Staff, Fee Collection,
   Payroll, Accounts, Library, Masters, Settings


________________________________________________________________________________

4.2  STUDENTS MODULE
________________________________________________________________________________

Permission Key: students


4.2.1  Student List

Displays all students in a searchable, filterable table.

Filters available: Class, Section, Category, Session, Status

Table columns: Photo, Admission No, Name, Father's Name, Class/Section,
Gender, Category, Phone, Status

Actions available per student:
   - View Details (opens the student profile page)
   - Edit (opens the admission form in edit mode)
   - Delete (removes the student after confirmation)
   - Export CSV (downloads the filtered student list)


4.2.2  New Admission

A comprehensive admission form with 7 sections for registering new students
or editing existing records. Supports photo upload with cropping tool.

Section 1 - Scholar Details:
   Photo upload with crop tool, Admission No (auto-generated), Student Name,
   Date of Birth, PEN, ID Type (Unique ID / Enrollment No / Aadharshila ID),
   Class, Section, Session, Admission Date, Gender, Category, Stream,
   Fee Category (Full Fee / Half Fee / Free / RTE / Scholarship), Mobile,
   Email, Roll No, Blood Group, Status, New/Old, House, House Role,
   Height, Weight, Aadhar Number, Family ID, SSSM ID

Section 2 - Address Details:
   Address, State (all Indian states and UTs listed), District, Pin Code,
   Nationality

Section 3 - Parents/Guardian Details:
   Father's Name, Mother's Name, Guardian Name, Guardian Address,
   Guardian Mobile, Relation, Father's Occupation, Religion, Caste

Section 4 - Transfer Certificate Details:
   Withdrawal File Number, Scholar Register Number, Last School Name

Section 5 - Bank Account Details:
   Account Holder, Branch Name, Account Number, IFSC Code, Security Amount

Section 6 - Other Details:
   Transport toggle (Yes/No, shows bus route dropdown when Yes),
   Last Due Amount, Other Information

Section 7 - Upload Documents:
   Upload multiple documents (PDF/JPG/PNG) with name and file

On successful admission, a success screen displays the new admission number
and auto-generated login credentials (Login ID and default password).


4.2.3  Student Details

A read-only profile view showing all student information organized in
card sections:
   - Student photo with name, admission number, class, status badge
   - Personal details, contact information, parents/guardian details
   - Transfer certificate details, bank account details
   - Transport info, login credentials (password reveal for admins only)
   - Assigned subjects displayed as badges
   - Uploaded documents list
   - Edit, Print, and Back buttons


4.2.4  Assign Subjects

Assign subjects to individual students from the master subject list.

How to use:
   1. Select class and student
   2. View available subjects with checkboxes
   3. Check or uncheck subjects to assign or remove
   4. Save assignments


4.2.5  Promote to Next Class

Bulk-promote students from one class and section to another for a new
academic session.

How to use:
   1. Select the From Class and optionally From Section
   2. Select the To Class (auto-suggests the next class), To Section,
      and To Session
   3. Click Search Students to load eligible students
   4. Select students via checkboxes (or use Select All)
   5. Optionally toggle which subjects to carry forward to the new class
   6. Click Promote Selected Students
   7. A confirmation dialog shows the count and details before proceeding


________________________________________________________________________________

4.3  ATTENDANCE MODULE
________________________________________________________________________________

Permission Key: attendance


4.3.1  Student Attendance (Mark Attendance)

Mark daily attendance for students in a class.

How to use:
   1. Select Class, Section, and Date
   2. Choose sort order: Roll No, Admission No, or Name
   3. Click Search to load the student list
   4. For each student, select their status:
      Present / Absent / Late / Half Day
   5. Add optional remarks for individual students
   6. Use the "Mark All Present" checkbox for quick bulk action
   7. Click Save Attendance

The page shows color-coded status badges and displays class, section,
and date information prominently. If you try to leave the page with
unsaved changes, a browser warning will appear.


4.3.2  Attendance Report

Monthly attendance summary with per-student statistics.

Filters: Class, Section, Month

Table shows: Roll No, Student Name, Present days, Absent days, Late days,
Attendance percentage

Features: Export to CSV, Print report


4.3.3  Attendance Stats

Visual attendance statistics with class-wise attendance percentages,
charts, and trend analysis.


4.3.4  Face Attendance

AI-powered face recognition system for automated attendance marking.

How to use:
   1. Select class and date
   2. Use the camera to capture and match student faces
   3. Attendance is auto-marked based on face recognition


4.3.5  Face Registration

Register student face data for the face recognition system.

How to use:
   1. Select class and student
   2. Capture face images from the camera
   3. Save face descriptors for future recognition


4.3.6  Face Settings

Configure face recognition system parameters and matching thresholds.


________________________________________________________________________________

4.4  CARDS & CERTIFICATES MODULE
________________________________________________________________________________

Permission Key: cards_certs


4.4.1  Student ID Card

Generate and print student identity cards.
   - Select class and section to load students
   - Preview ID card with school logo, student photo, name, class, admission number
   - Print individual or bulk ID cards
   - Uses the selected branch's school information and signing authority


4.4.2  Staff ID Card

Generate and print staff identity cards.
   - Select designation to filter staff
   - Preview ID card with school logo, staff photo, name, designation, employee ID
   - Print individual or bulk ID cards


4.4.3  Admit Card

Generate exam admit cards for students.
   - Select class, section, and exam
   - Preview admit card with student details, exam schedule, school info
   - Print individual or bulk admit cards


4.4.4  Character Certificate

Generate character or conduct certificates for students.
   - Select student by class/section or search
   - Preview certificate with formal language template
   - Print with school letterhead and signing authority signature


4.4.5  Transfer Certificate

Generate Transfer Certificates (TC) for students leaving the school.
   - Create TC with all required fields (reason for leaving, conduct, dates)
   - Preview formatted TC document
   - Print with official school header and signature


________________________________________________________________________________

4.5  ACADEMICS MODULE
________________________________________________________________________________

Permission Key: academics


4.5.1  Notice Board

Manage school notices and announcements.
   - Add new notice with title and description
   - Edit or delete existing notices
   - Notices are visible to all portals (teacher, parent, student)


4.5.2  Time Table

Create and manage class-wise weekly timetables.
   - Select class and section
   - Grid view with Periods as rows and Days (Monday to Saturday) as columns
   - Assign subjects and teachers to each period and day slot
   - Save timetable per class-section combination


4.5.3  Course Schedule

Manage course schedules and academic planning.


4.5.4  Syllabus

Manage syllabus content for each class and subject.
   - Add syllabus with class, subject, title, and content
   - Edit and delete syllabus entries
   - Visible to teachers, parents, and students in their respective portals


4.5.5  Date Sheet

Create exam date sheets with detailed exam schedules.
   - Add datesheet entries with exam name, class, subject, date, start time,
     and end time
   - Edit and delete entries
   - Visible across all portals


4.5.6  Holidays List

Manage the school holiday calendar.
   - Add holidays with name, date, and type
     (National / Festival / Vacation / Holiday)
   - Edit and delete entries
   - Color-coded display by holiday type
   - Visible to teachers, parents, and students


4.5.7  Activity Calendar

Manage school activities and events.


4.5.8  Homework

Manage homework assignments from the admin view.
   - View all homework across classes
   - Add, edit, and delete homework entries
   - Fields: class, section, subject, date, submission date, type, title,
     description


4.5.9  Photo Gallery

Manage the school photo gallery.
   - Upload and organize school photos
   - Add titles and descriptions to galleries


________________________________________________________________________________

4.6  STAFF MODULE
________________________________________________________________________________

Permission Key: staff


4.6.1  View Staff

Displays all staff members in a searchable DataTable.

Table columns: Photo, Employee ID, Name (with father's name), Designation
(color badge), Status (Active / On Leave / Resigned / Terminated), Phone,
Basic Salary, Login ID

Actions per staff member: View Details, Edit, Delete


4.6.2  Add Staff

A comprehensive form for registering staff members, with 7 sections:

Section 1 - Employment Details:
   Photo upload with crop tool, Employee ID (auto-generated), Date of Joining,
   Designation, Status, Qualification, Teaching Subjects (multi-select),
   Experience

Section 2 - Personal Details:
   Full Name, Father's Name, Husband's Name, Gender, Date of Birth

Section 3 - Contact & Address:
   Address, Primary Mobile, Secondary Mobile, Email

Section 4 - Salary & Government IDs:
   Basic Salary, PAN Number, PF Number, Aadhar Number

Section 5 - Bank Account Details:
   Bank Name, Branch Name, Account Number, IFSC Code, Account Type

Section 6 - Other Details:
   Last School/Institution, Comments/Remarks

Section 7 - Upload Documents:
   Upload multiple documents (PDF/JPG/PNG/DOC) with file name

On successful addition, a success screen shows staff name, designation,
employee ID, and auto-generated login credentials.


4.6.3  Staff Details

Read-only profile view organized in card sections:
   - Employment details (photo, name, designation, qualification, status)
   - Personal details, contact information, teaching subjects
   - Government IDs, bank details
   - Login credentials (password reveal for admins only)
   - Edit, Print, and Back buttons


4.6.4  Staff Attendance

Mark daily attendance for staff members.
   - Select date and optionally filter by designation
   - For each staff member, select: Present / Absent / Late / Half Day
   - Add optional remarks
   - Save attendance


4.6.5  Staff Attendance Report

Monthly staff attendance summary with per-staff statistics.


4.6.6  Teacher Permission

Assign class, section, and subject permissions to teachers for the
Teacher Portal.

How to use:
   1. Select the teacher, class, section, and subject
   2. Choose module permissions: Student Attendance, Homework
   3. Click Save to assign
   4. Permission list table shows all assignments with edit and delete options
   5. The system prevents duplicate assignments (same teacher + class +
      section + subject)
   6. Filter by teacher to view specific assignments


________________________________________________________________________________

4.7  FEE MASTER MODULE
________________________________________________________________________________

Permission Key: fee_master


4.7.1  Fee Particulars

Configure fee heads (types of fees the school charges).

Examples: Tuition Fee, Exam Fee, Computer Fee, Lab Fee, Sports Fee

Fields:
   Fee Particular Name, Is Transport Fee (checkbox), Fee Mode,
   Applicable Months (select which months this fee applies, with Select All)

Table shows: Name, transport badge, fee mode, applicable months, edit/delete


4.7.2  Fee Amount Slab

Define class-wise fee amounts for each fee particular.

How to use:
   1. Select Fee Category (Full Fee / Half Fee / Free / RTE / Scholarship)
      and Session
   2. Click Search to view existing slabs
   3. Click Add Slab to create a new fee structure
   4. Select class and enter amount for each fee particular
   5. Submit to save

This is where you define how much each class pays for each fee head.
For example: "Class 1 pays Rs.500 Tuition Fee per month" vs
"Class 10 pays Rs.1000 per month."


________________________________________________________________________________

4.8  FEE MODULE
________________________________________________________________________________

Permission Key: fee


4.8.1  Fee Deposit (Collection)

The primary fee collection page with a two-step workflow.

Step 1 - Select Student:
   Enter Admission No directly and click Fetch,
   OR select Class, Section, and Student from dropdowns.
   Then select the Month of payment and choose Fee Particulars
   (checkboxes for each fee head). Click Proceed.

Step 2 - Fee Receipt:
   Student info displays: name, father's name, class, admission number.
   Fee breakdown table shows each particular and its amount.

   Editable fields: Late Fee, Concession (discount amount)
   Auto-calculated: Grand Total, Balance

   Calculation:
      Grand Total = Total Amount + Late Fee + Old Balance - Concession
      Balance = Grand Total - Received Amount

   Enter Received Amount and select Payment Mode (Cash / Online / Bank / Cheque).
   Add optional remarks. Click Submit to save and print receipt.


4.8.2  Online Fee Requests

View and manage online payment requests submitted by parents.
   - List of payment requests with student name, amount, transaction ID,
     payment proof
   - Approve or Reject requests
   - When approved, automatically creates a fee deposit record


4.8.3  Fee Receipt

Search, view, and manage all fee receipts.

Filters: Class, Section, Fee Month, Payment Mode, Date Range, Receipt Number

Table shows: Receipt No, Date, Admission No, Student Name, Class/Section,
Month, Amount, Payment Mode (color badge)

Actions: Print individual receipt, Delete, Export CSV

Footer shows total receipt count and total collected amount.


4.8.4  Fee Report

Fee collection report for financial analysis and record-keeping.

Filters: Date range (From/To), Class, Section, Payment Mode

Table shows: Date, Receipt No, Student Name, Class/Section, Month, Amount,
Payment Mode

Features: Print report, Export CSV, Total amount displayed in footer


4.8.5  Report (Head Wise)

Fee collection breakdown by individual fee heads (particulars).
Useful for seeing how much was collected under each fee category.


4.8.6  Fee Due Report

Shows students with outstanding (unpaid) fees.

Filters: Class, Section, Month

Table shows: Student Name, Admission No, Class/Section, Total Fee, Paid Amount,
Due Amount, Status (Paid / Unpaid / Partial)

Special Features:
   - Send SMS to parents of students with dues (compose and send)
   - Send Email with rich text editor for composing reminders
   - Dynamic placeholder tags for personalized messages
   - Export CSV, Print


4.8.7  Demand Bill

Generate and print fee demand bills for individual students showing
their fee structure and pending amounts.


4.8.8  Fee Discount

Apply per-student discounts on individual fee particulars.

How to use:
   1. Select Class, Section, and Student
   2. Click Fetch to load fee particulars
   3. Enter discount amount for each particular
   4. Click Save Discount

Use Delete Discount to remove all discounts for that student.
Discounts are session-specific (apply only to the current academic session).


________________________________________________________________________________

4.9  PAYROLL MODULE
________________________________________________________________________________

Permission Key: payroll


4.9.1  Generate Salary

Generate monthly salary for individual staff members.

How to use:
   1. Select the Month and Staff Member (optionally filter by designation)
   2. Click Proceed (the system checks for duplicate salary in the same month)
   3. The system auto-fills:
      - Attendance data (absent, late, half-day counts from records)
      - Salary settings (per-staff allowance and deduction defaults)
   4. You can adjust:
      - Attendance deduction days
      - Basic salary amount
      - Individual allowance amounts
      - Individual deduction amounts
   5. Final Salary is calculated in real-time:
      Final = Total Basic Salary + Sum of Allowances - Sum of Deductions
      Basic Salary is adjusted for attendance deductions.
   6. Add generate date and optional remark
   7. Click Submit to save (status is set as "Unpaid")


4.9.2  Salary List

View and manage all generated salaries.

Filters: Month, Designation, Staff

Table shows: Status (Paid/Unpaid badge), Employee ID, Name, Designation,
Month/Year, Generated Date, Amount, Remark

Actions per salary:
   - Pay Now (for unpaid): Opens a payment card to enter payment date and
     select payment mode (Cash / Bank Transfer / UPI)
   - Print: Generates a formatted salary slip with school header, employee
     details, allowance and deduction breakdown, and net salary
   - Delete: Removes the salary record after confirmation
   - Export CSV: Download salary data in bulk


4.9.3  Deduction Head

Configure salary deduction categories.
Examples: PF, TDS, Professional Tax, Loan Recovery


4.9.4  Allowance Head

Configure salary allowance categories.
Examples: HRA, DA, Travel Allowance, Medical Allowance


4.9.5  Salary Settings

Configure per-staff salary components and leave rules.
   - Select staff member
   - Set individual allowance and deduction default amounts
   - Configure leave rules (allowed leaves per month, late penalty fractions)
   - These defaults auto-fill when generating salary


________________________________________________________________________________

4.10  ACCOUNTS MODULE
________________________________________________________________________________

Permission Key: accounts


4.10.1  Expenses

Record and manage school expenses.
   - Add expense with date, expense head, amount, vendor, description
   - View expense list with filters
   - Edit and delete expense records


4.10.2  Income

Record and manage non-fee school income.
   - Add income entry with date, income head, amount, description
   - View income list with filters


4.10.3  Cash Deposit/Withdraw

Manage cash transactions with bank accounts (deposits and withdrawals).


4.10.4  Expenses & Income Report

Combined financial report showing expenses and income over a selected
date range with totals.


4.10.5  Vendors

Manage vendor and supplier records.
Fields: Vendor name, contact person, phone, email, address, GST number


4.10.6  Bank Accounts

Manage school bank account details.
Fields: Bank name, account number, IFSC, branch, account type, opening balance


4.10.7  Expense Heads

Configure expense categories.
Examples: Electricity, Stationery, Maintenance, Printing, Rent


4.10.8  Income Heads

Configure income categories.
Examples: Donation, Rent Income, Interest, Miscellaneous


________________________________________________________________________________

4.11  EMAIL / MESSAGING MODULE
________________________________________________________________________________

Permission Key: messaging


4.11.1  Send Email to Students

Compose and send emails to students and parents.
   - Filter students by class and section
   - Select individual students or all
   - Rich text editor for composing emails
   - Dynamic placeholder tags for personalized content
   - Send in bulk


4.11.2  Send Email to Staff

Compose and send emails to staff members.
   - Filter staff by designation
   - Select individual staff or all
   - Rich text editor for composing
   - Send in bulk


4.11.3  Email Report

View history of all sent emails with delivery status tracking.


________________________________________________________________________________

4.12  RESULT MODULE
________________________________________________________________________________

Permission Key: result


4.12.1  Update (Student Wise)

Enter exam marks for an individual student across all their subjects.

How to use:
   1. Select Class, Section, Student, and Exam
   2. All subjects assigned to the student are displayed
   3. Enter marks for each subject: Min, Max, Theory, Practical
   4. Grade is auto-calculated based on percentage:
      A+ (90% and above), A (75-89%), B (60-74%), C (45-59%), D (below 45%)
   5. Save marks


4.12.2  Update (Subject Wise)

Enter exam marks for all students in a class for a single subject.

How to use:
   1. Select Class, Section, Subject, and Exam
   2. All students in that class are displayed
   3. Enter marks for each student in the selected subject
   4. Save marks in bulk


4.12.3  Consolidated Marks List

View all marks for a class across all subjects in a single table.
   - Select class, section, and exam
   - Table shows all subjects as columns and students as rows
   - Total, percentage, and grade calculated per student
   - Print and export options available


4.12.4  Result Single Exam

Generate individual student result cards for a single exam.
   - Select class, section, student, and exam
   - Preview formatted result card with school header, student details,
     subject-wise marks, total, percentage, and grade
   - Print result card


4.12.5  Result Multiple Exam

Generate cumulative result cards showing marks across multiple exams.
   - Select class, section, and student
   - Preview comprehensive result card with all exams and subjects
   - Print the complete report card


________________________________________________________________________________

4.13  TRANSPORT MODULE
________________________________________________________________________________

Permission Key: transport


4.13.1  Vehicle List

Manage school transport vehicles.
Fields: Vehicle number, type, driver name, driver phone, driver license,
capacity, insurance expiry


4.13.2  Register Vehicle

Add new vehicles to the transport fleet.


4.13.3  Vehicle Routes

Define bus routes with pickup/drop points and monthly fees.
Fields: Route name, description, monthly fee, list of pickup points


4.13.4  Route Mapping

Assign vehicles and drivers to routes.


________________________________________________________________________________

4.14  LIBRARY MODULE
________________________________________________________________________________

Permission Key: library


4.14.1  All Books

View and manage the complete book catalog.
Table shows: Book ID, Title, Author, Type, Quantity, Available copies


4.14.2  Add Book

Add new books to the library.
Fields: Title, Author, ISBN, Type, Publisher, Quantity, Rack Number, Description


4.14.3  Book Types

Configure book categories.
Examples: Textbook, Reference, Fiction, Non-Fiction, Magazine


4.14.4  Issue Book

Issue books to students.
   1. Select student (by class/section or admission number)
   2. Select book from catalog
   3. Set issue date and due date
   4. Issue book (reduces available count)


4.14.5  Book Return

Process book returns from students.
   1. Search by student or book
   2. View list of issued books
   3. Process return (updates available count)


4.14.6  Library Settings

Configure library rules and settings.


________________________________________________________________________________

4.15  MASTERS MODULE
________________________________________________________________________________

Permission Key: masters

The Masters module contains all the reference data used throughout the platform.
All master pages follow the same pattern: Add, Edit, Delete, Search.

   Academic Session       Define sessions like "2025-26", "2026-27"
   Staff Designation      Define staff roles: Principal, Teacher, Clerk, Peon, etc.
   Class                  Define classes: Nursery, LKG, UKG, 1, 2, 3 ... 12
   Section                Define sections: A, B, C, D
   Subject                Define subjects: English, Hindi, Mathematics, Science, etc.
   Exam Name              Define exams: Unit Test 1, Half Yearly, Annual, etc.
   Exam Group             Group exams together for report card generation
   Period                 Define periods with time ranges for timetable
   Homework Type          Define types: Written, Oral, Project, Assignment, Practice
   House                  Define school houses: Red, Blue, Green, Yellow
   Stream                 Define streams: Science, Commerce, Arts, General


________________________________________________________________________________

4.16  SETTINGS MODULE
________________________________________________________________________________

Permission Key: settings


4.16.1  Users

Manage admin user accounts (Super Admin and Branch Admin users).

Table shows: Login ID, Role, Status (Active/Inactive), Last Login,
Assigned Branches, Created Date

Actions: Add User, Edit, Delete

Note: Student, Parent, Teacher, and Staff accounts are automatically created
during admission or staff registration. They do not appear here.


4.16.2  User Permission

Assign module-level permissions to Branch Admin users. This page controls
what each admin user can see and do in the platform.

There are 16 modules available:

   Dashboard              Overview, statistics, charts
   Students               Student list, admission, promotion
   Attendance             Student attendance, reports, statistics
   Cards & Certificates   ID cards, admit cards, certificates
   Academics              Notice, timetable, syllabus, datesheet
   Staff                  Staff list, attendance, permissions
   Fee                    Fee deposit, receipt, reports
   Fee Master             Fee particulars, amount slabs
   Payroll                Salary settings, generation, payments
   Accounts               Income, expenses, reports
   Messaging              Email to students and staff
   Result                 Marks entry, result cards
   Transport              Vehicles, routes, mapping
   Library                Books, issue and return
   Masters                All reference data
   Settings               Users, permissions, options

Each module has three permission levels:
   Access     User can view the module's pages
   Modify     User can add and edit data in the module
   Delete     User can remove data in the module


4.16.3  Activity Log

View system activity logs showing who did what and when.


4.16.4  Branches (Super Admin only)

Manage school branches. This page is only visible to Super Admin users.
   - Add new branches
   - Edit branch details
   - Manage branch-specific settings


4.16.5  Branch School Settings / School Settings

Configure school identity and settings per branch. Contains 4 independent
sections, each with its own Save button.

Section 1 - School Details:
   School Logo (upload with crop tool), School Name, Board (CBSE/ICSE/etc.),
   Principal Name, Phone, Affiliation No, Email, Address, School Code

Section 2 - Session & Timing:
   Academic Session (dropdown), ERP Session (for portal access),
   School Time From, School Time To

Section 3 - Signing Authority:
   Signature Image (upload), Designation, Name
   This information appears on ID cards, certificates, receipts, and
   result cards.

Section 4 - Online Payment Method:
   Payment QR Image (upload), Account Holder Name, Bank Account Number,
   IFSC Code, Branch Name, UPI ID / Note


4.16.6  Option Settings

Platform-wide configuration toggles organized in 4 sections:

Academic Settings:
   - Session Start Month selector
   - Enable fee due report according to installment
   - Enable fee due report in student portal
   - Enable discount display in fee receipt
   - Enable Sunday is working day

Email Integration (Super Admin only):
   - ZeptoMail API Key
   - From Email address and From Name

Email Notifications:
   - Fee deposit email notification (auto-send on payment)
   - Admission confirmation email
   - Student absent email (automatic)
   - Student present email (automatic)

Fee Demand Bill Note:
   - Custom text that prints on fee demand bills


4.16.7  Exam Settings

Configure exam-related settings and parameters.


________________________________________________________________________________

5. TEACHER PORTAL
________________________________________________________________________________

The Teacher Portal is a dedicated interface for teachers. It has its own sidebar
and is completely separate from the admin panel. Teachers can only access data
related to their assigned classes and subjects.


How Teacher Access is Set Up:

   1. Admin creates a staff record for the teacher (Staff > Add Staff)
   2. Admin creates a user account linked to the staff record
   3. Admin assigns class/section/subject permissions (Staff > Teacher Permission)
   4. Teacher logs in and sees only their assigned classes and subjects


Teacher Sidebar Menu:

   Dashboard                Overview with stats and today's schedule
   My Students              View students in assigned classes
   Attendance
      Mark Attendance       Mark daily student attendance
      Attendance Report     Monthly attendance summary
   Homework                 Create and manage homework assignments
   Results
      Enter Marks           Enter exam marks for assigned subject
      View Results          View exam results (read-only)
   Academics
      Time Table            View personal weekly timetable
      Date Sheet            View exam schedule
      Syllabus              View syllabus content
      Notice Board          View school notices
      Holidays              View holiday calendar
   My Attendance            View own attendance record
   My Profile               Edit contact info, change password


Detailed Page Descriptions:


5.1  Teacher Dashboard

Stats Cards (3):
   My Classes     Number of assigned class-section combinations
   My Students    Total unique students across all assigned classes
   Attendance     Classes marked today vs total assignments

Today's Schedule: Table showing period, time, class, and subject for
the current day.

Recent Notices: Latest 4 school notices.

Quick Access shortcuts: Attendance, Homework, Enter Marks, Timetable,
Datesheet, Notices, My Profile


5.2  My Students

View students in the teacher's assigned classes.

Filters: Class (from assigned classes), Section, Subject

Table shows: Admission No, Name, Roll, Gender, Father's Name, Contact, Status

Stats Cards: Total students, Present Today, Boys/Girls count, Subject name


5.3  Mark Attendance

Mark daily student attendance for assigned classes only.

How to use:
   1. Select Class and Section (from assigned classes only)
   2. Select Date (defaults to today)
   3. Click Load Students
   4. For each student, select: Present / Absent / Late using radio buttons
   5. Use All Present or All Absent buttons for quick bulk action
   6. Real-time summary shows Present, Absent, and Late counts
   7. Click Save Attendance


5.4  Attendance Report

Monthly attendance summary for the teacher's assigned classes.

Filters: Class, Section, Month

Table shows: Roll, Student Name, Present count, Absent count, Late count,
Attendance percentage


5.5  Homework

Full homework management for assigned classes.

Features:
   - Add homework with: date, submission date, type (Written / Oral / Project /
     Assignment / Practice), title, description
   - Edit existing homework
   - Delete homework (with confirmation)
   - View homework list filtered by assigned class, section, and subject


5.6  Enter Marks

Enter exam marks for the teacher's assigned subject.

How to use:
   1. Select Assignment (class-section-subject combination) and Exam
   2. Click Load Students
   3. For each student, enter: Min marks, Max marks, Theory marks, Practical marks
   4. Total and Grade are auto-calculated:
      A+ for 90% and above, A for 75-89%, B for 60-74%, C for 45-59%,
      D for below 45%
   5. Click Save Marks


5.7  View Results

Read-only view of exam results for the assigned subject.

Table shows: Roll, Student Name, Max marks, Obtained marks, Percentage, Grade

Also displays the class average percentage.


5.8  My Timetable

View the teacher's weekly timetable in a grid layout.
Periods as rows, Days (Monday to Saturday) as columns.
Each cell shows the subject and class-section. Color-coded for clarity.


5.9  My Attendance

View the teacher's own staff attendance for a selected month.

Stats Cards: Present days, Absent days, Late days

Table shows: Date, Status, Remark


5.10  My Profile

View and edit the teacher's own profile.

Read-only fields: Name, Father's Name, Employee ID, Designation, DOB,
Gender, Qualification

Editable fields: Phone, Email, Address

Features:
   - Photo upload with cropping tool
   - Change password (requires current password, minimum 4 characters for
     new password)


________________________________________________________________________________

6. PARENT PORTAL
________________________________________________________________________________

The Parent Portal allows parents to monitor their children's academic progress,
fee status, and school activities. Parents can have multiple children linked
to a single account.


How Parent Access Works:

   1. When a student is admitted, a parent account is automatically created
      (or linked to an existing parent account)
   2. Parent logs in with their credentials
   3. If multiple children are enrolled, a child selector dropdown appears
      on every page
   4. All data shown is filtered to the currently selected child


Parent Sidebar Menu:

   Dashboard                Overview with child stats
   My Children              View all children's profiles
   Attendance               Visual calendar attendance view
   Fee
      Fee Status            Annual fee summary with month-wise status
      Online Payment        Submit online payment with proof
      Fee Receipts          View and print fee receipts
   Results
      Exam Results          View exam-wise subject results
      Report Card           Consolidated multi-exam report
   Homework                 View homework assignments
   Academics
      Time Table            View class timetable
      Date Sheet            View exam schedule
      Syllabus              View syllabus content
      Notices               View school notices
      Holidays              View holiday calendar
   Transport                View transport details
   My Profile               View profile, change password


Detailed Page Descriptions:


6.1  Parent Dashboard

Child Selector: Dropdown to switch between children (if multiple enrolled)

Stats Cards (3):
   Attendance     Percentage with present/total days count
   Fee Paid       Total paid with pending amount (or "No dues" message)
   Last Exam      Percentage and grade from the most recent exam

Content Panels:
   Today's Homework (up to 3 items)
   Upcoming Exams (up to 3 exams)

Quick Access shortcuts: My Children, Results, Fee Status, Online Payment, Notices


6.2  My Children

Grid view of all children with photo initials, name, class, and roll number.

Clicking on a child shows their detailed profile:
   - Personal Information: name, class, roll, admission no, DOB, gender,
     blood group, religion, category, address
   - Guardian Information: father/mother name, phone, occupation
   - Quick Action links to: Attendance, Fee Status, Results, Homework,
     Timetable, Transport


6.3  Attendance

Visual calendar view of a child's attendance.

Color-coded calendar grid:
   Green = Present, Red = Absent, Orange = Late, Purple = Holiday
   Today is highlighted with a border

Stats Cards: Present days, Absent days, Late days, Overall percentage

Month navigation with arrow buttons to go forward or backward.


6.4  Fee Status

Comprehensive fee overview for the selected child.

Fee Summary (5 boxes at top):
   Annual Fee, Total Paid, Pending, Discount, Old Balance

Monthly Fee Breakdown:
   Lists each fee particular with its amount and frequency (monthly,
   quarterly, etc.), transport fee if applicable, and total.

Month-wise Status (12 tiles from April to March):
   Each month shows the fee amount and a status badge:
      Green "Paid"       Fully paid
      Orange "Partial"   Partially paid
      Red "Due"          Payment due
      Grey "Upcoming"    Future month (not yet due)

Payment History:
   Chronological list of all payments with receipt number, date,
   payment mode, amount, and balance.


6.5  Online Payment

Submit online payment requests to the school.

Features:
   - View school's payment details: QR code, bank account info, UPI ID
   - Select the due month (auto-populated with pending months)
   - Enter amount paid and transaction ID
   - Upload payment proof (image or PDF)
   - Add optional note
   - View request history with status:
     Requested (pending) / Accepted / Rejected


6.6  Fee Receipts

View all fee receipts with expandable details.

Each receipt card shows: Month, receipt number, date, payment mode,
received amount, balance

Expandable section shows: Individual fee items and amounts, summary with
total, late fee, concession, and grand total

Print button available for each receipt.


6.7  Exam Results

View exam results for the selected child.

Filters: Child selector, Exam selector

Display:
   - Result header with student name, class, exam, percentage, grade,
     pass/fail status
   - Subject-wise table: Subject, Max Marks, Obtained, Percentage, Grade
   - Total row with overall aggregates
   - Print button


6.8  Report Card

Consolidated report showing results across all exams.

Displays student info header, then a card for each exam with subject-wise
marks table and totals. Print button for the complete report card.


6.9  Homework

View homework assignments for the selected child's class.

Displays color-coded cards per subject with title, description, date,
type badge, and due date.


6.10  Timetable

View weekly class timetable for the selected child.

Grid layout with Periods as rows and Days (Monday to Saturday) as columns.
Each cell shows the subject name.


6.11  Other Academic Pages

   Date Sheet    Exam schedule table showing Exam, Date, Day, Subject, Time
   Syllabus      Subject-wise syllabus cards with content
   Notices       School notice cards with title, content, date
   Holidays      Holiday table with type badges
                 (National / Festival / Vacation / Holiday)


6.12  Transport

View transport details for the selected child:
Route name, Vehicle number, Driver name, Monthly fee, Driver phone number

Shows "No transport assigned" if the child does not use school transport.


6.13  My Profile

Parent Information: name, phone, email, father/mother name, address,
number of children

My Children overview: cards for each child with basic info

Child Detail: dropdown to select and view full student profile

Change Password: enter current password and new password


________________________________________________________________________________

7. STUDENT PORTAL
________________________________________________________________________________

The Student Portal provides students with read-only access to their own
academic records, fee information, and school activities.


Student Sidebar Menu:

   Dashboard                Overview with personal stats
   My Attendance            Calendar attendance view
   My Results               Exam results
   Fee
      Fee Status            Annual fee summary
      Fee Receipts          View fee receipts
   Academics
      Homework              View homework assignments
      Time Table            View class timetable
      Date Sheet            View exam schedule
      Syllabus              View syllabus content
      Notices               View school notices
      Holidays              View holiday calendar
   My Books                 View issued library books
   My Transport             View transport details
   My Profile               View profile, change password


Detailed Page Descriptions:


7.1  Student Dashboard

My Info Card: Photo or avatar, name, class and section, roll number,
admission number

Stats Cards (3):
   Attendance     Percentage with present/total days
   Fee Status     "Paid" in green or due amount in red
   Last Exam      Grade and percentage from the most recent exam

Content Panels:
   Today's Homework (up to 3 items)
   Upcoming Exams (up to 3 exams)
   Latest Notices (up to 3 notices)

Quick Access shortcuts: Attendance, Results, Fee Status, Notices


7.2  My Attendance

Visual calendar view of the student's own attendance.

Color codes: Green = Present, Red = Absent, Orange = Late, Purple = Holiday

Stats Cards: Present days, Absent days, Late days, Overall percentage

Month navigation with arrow buttons.


7.3  My Results

View exam results with an exam selector dropdown.

Display:
   - Result header with student info, overall percentage, grade,
     pass/fail status
   - Subject-wise table with marks, percentage, and grade for each subject
   - Print button


7.4  Fee Status

Same layout as the parent fee status page but shows data for the
student only.

Important: This page respects the admin's setting. If the admin has
disabled fee due display in the student portal, students see a lock
message: "Please contact the school office for fee details."

Sections: Fee Summary (5 boxes), Monthly Fee Breakdown, Month-wise
Status (12 tiles from April to March), Payment History


7.5  Fee Receipts

Expandable receipt cards with fee breakdown details.
Same format as the parent fee receipts page.


7.6  Academic Pages

   Homework       Homework cards for the student's class and section
   Timetable      Weekly grid with Periods and Days
   Date Sheet     Exam schedule filtered by the student's class
   Syllabus       Subject-wise syllabus cards for the class
   Notices        All school notices
   Holidays       Holiday table with type badges


7.7  My Books

View library books currently issued to the student.

Table shows: Book Title, Issue Date, Due Date, Status (Issued / Returned
with color badge)


7.8  My Transport

View assigned transport details:
Route name, Vehicle number, Driver name, Monthly fee, Driver phone number

Shows "No transport assigned" if the student does not use school transport.


7.9  My Profile

Comprehensive read-only profile organized in sections:
   - Scholar Details: Photo, admission no, name, DOB, PEN, class, roll,
     admission date, status
   - Personal Details: Gender, category, blood group, Aadhar, Family ID,
     SSSM ID, height, weight
   - Parents/Guardian: Father/mother name, phone, email
   - Address: Full address, state, district, pin code, nationality
   - Transport (if assigned): Route, vehicle, driver, fee

Change Password: Enter current password, new password (minimum 4 characters),
and confirm new password.


________________________________________________________________________________

8. BRANCH & SESSION MANAGEMENT
________________________________________________________________________________


Branch System:

EduNex1 supports multiple school branches under a single platform.

   - Super Admin can manage all branches and switch between them using the
     branch dropdown in the header bar.
   - Branch Admin sees only their assigned branch or branches.
   - All data (students, staff, fees, attendance, etc.) is branch-specific.
   - The "All Branches" option (Super Admin only) shows aggregated data on
     the dashboard.


Session (Academic Year) System:

The platform uses academic sessions (e.g., "2025-26") to organize data
by academic year.

   - Sessions are created in the Masters section under Academic Session.
   - Each branch has an Active Session set in the Branch School Settings page.
   - The Session Switcher in the header allows admins to view data from
     different academic years.
   - Fee slabs, discounts, results, and promotions are all session-specific.

How Sessions Affect Data:

   Students        Displayed in the session they were admitted or promoted into
   Fee Slabs       Defined per session (different fee structures per year)
   Fee Deposits    Recorded against a specific session
   Fee Discounts   Session-specific (need to be re-entered each academic year)
   Exam Results    Session-specific
   Promotions      Promote from current session to a target session
   Attendance      Date-based (not directly tied to a session)


________________________________________________________________________________

9. PERMISSION SYSTEM
________________________________________________________________________________


Admin Permissions (16 Modules):

Module permissions are managed through the Settings section under
User Permission. Each of the 16 modules has three levels:

   Access     The user can view the module's pages in the sidebar and navigate
              to them
   Modify     The user can add new records and edit existing data in the module
   Delete     The user can remove records from the module

Key rules:
   - Super Admin always has full access to all 16 modules. No permissions
     setup is needed.
   - Branch Admin must be granted access by a Super Admin.
   - Branch Admin can only grant permissions for modules they themselves
     have access to.
   - No user can edit their own permissions (this prevents accidental
     lockouts).
   - Permissions are cached locally after login and silently refreshed in
     the background on each page load.


Teacher Permissions:

Teacher access is controlled through the Staff section under
Teacher Permission.

Each teacher permission assignment includes:
   - Teacher name
   - Class
   - Section
   - Subject
   - Module toggles: Student Attendance, Homework

Teachers can only see and manage data for their specific assigned
class-section-subject combinations. They cannot access any class or
subject that has not been assigned to them.


Portal Access (Parent and Student):

   - Parent accounts are automatically created and linked to their
     children during the student admission process.
   - Student accounts are automatically created during admission.
   - No manual permission management is needed for parents or students.
     Their access is determined by their role.
   - The admin can toggle whether fee due information is visible in the
     Student Portal through the Option Settings page.


________________________________________________________________________________

10. GETTING STARTED - INITIAL SETUP GUIDE
________________________________________________________________________________

This section explains the exact order in which a new admin should set up the
platform before it can be used for daily operations. Follow these steps
carefully from top to bottom. Each step depends on the previous one.


PHASE 1 - FOUNDATION SETUP (Do this on Day 1)
________________________________________________________________________________

These are the building blocks. Nothing else works until these are created.


Step 1: Log in as Super Admin

   Open the platform URL and log in with the Super Admin credentials
   provided to you. You will land on the Admin Dashboard.


Step 2: Set up your Branch and School Identity

   Go to: Settings > Branch School Settings

   This is the first thing you should fill in. Complete all 4 sections:

   Section 1 - School Details:
      Upload your school logo, enter school name, board (CBSE/ICSE/State
      Board etc.), principal name, phone number, affiliation number, email,
      full school address, and school code. Click Save.

      Why this matters: This information appears on every printed document -
      ID cards, certificates, receipts, result cards. Without this, all
      printouts will show blank headers.

   Section 2 - Session & Timing:
      Set school start time and end time. You will set the academic session
      here after creating it in the next step. Click Save.

   Section 3 - Signing Authority:
      Upload the signature image of the authorized person (usually the
      principal), enter their name and designation. Click Save.

      Why this matters: This signature appears on all certificates, ID cards,
      and official documents generated by the platform.

   Section 4 - Online Payment (optional for now):
      If you want parents to pay fees online, upload your payment QR code,
      enter bank account details, IFSC code, and UPI ID. Click Save.
      You can also set this up later.


Step 3: Create Academic Session

   Go to: Masters > Academic Session

   Create your current academic session, for example "2025-26".
   If needed, also create the next session like "2026-27".

   After creating the session, go back to Settings > Branch School Settings
   and select this new session as your Active Academic Session. Save it.

   Why this matters: Sessions are the backbone of the platform. Students,
   fees, results, and promotions are all tied to sessions. Without an active
   session, most features will not work correctly.


Step 4: Create Staff Designations

   Go to: Masters > Staff Designation

   Create all the staff roles used in your school. Examples:
      Principal, Vice Principal, Teacher, PRT, TGT, PGT, Clerk, Accountant,
      Librarian, Peon, Driver, Security Guard

   Why this matters: You cannot add staff without designations. The
   designation dropdown on the Add Staff page pulls from this list.


Step 5: Create Classes

   Go to: Masters > Class

   Create all the classes your school has. Examples:
      Nursery, LKG, UKG, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12

   Enter them in order. Each class needs a name.

   Why this matters: Classes are required for student admission, fee slabs,
   attendance, timetable, results - almost everything. Without classes,
   you cannot admit a single student.


Step 6: Create Sections

   Go to: Masters > Section

   Create all the sections your school uses. Examples:
      A, B, C, D

   Why this matters: Students are assigned to a class AND a section. The
   section dropdown appears on the admission form and many other pages.


Step 7: Create Subjects

   Go to: Masters > Subject

   Create all subjects taught in your school. Examples:
      English, Hindi, Mathematics, Science, Social Science, Computer,
      Physical Education, Drawing, Sanskrit, General Knowledge

   Why this matters: Subjects are needed for assigning to students, creating
   timetables, entering exam marks, and giving teachers their assignments.


Step 8: Create Exam Names

   Go to: Masters > Exam Name

   Create the exams your school conducts. Examples:
      Unit Test 1, Unit Test 2, Half Yearly, Unit Test 3, Unit Test 4, Annual

   Why this matters: Without exam names, you cannot enter marks or generate
   result cards.


Step 9: Create Periods (for timetable)

   Go to: Masters > Period

   Create the period slots with their time ranges. Examples:
      Period 1 (8:00 AM - 8:40 AM)
      Period 2 (8:40 AM - 9:20 AM)
      Recess (9:20 AM - 9:40 AM)
      Period 3 (9:40 AM - 10:20 AM)
      ... and so on

   Why this matters: Periods are needed to create class timetables and
   teacher schedules. Without these, the timetable page will be empty.


Optional Masters (create now or later):

   Masters > Exam Group
      Group multiple exams together for consolidated report cards.

   Masters > Homework Type
      Define homework types: Written, Oral, Project, Assignment, Practice.
      Needed only when teachers start assigning homework.

   Masters > House
      Define school houses: Red House, Blue House, Green House, Yellow House.
      Needed only if your school follows the house system.

   Masters > Stream
      Define streams: Science, Commerce, Arts, General.
      Needed only for senior classes (11th and 12th).


PHASE 2 - FEE STRUCTURE SETUP
________________________________________________________________________________

Set this up before admitting students so that fee data is ready from day one.


Step 10: Create Fee Particulars (Fee Heads)

   Go to: Fee Master > Fee Particulars

   Create each type of fee your school charges. Examples:
      Tuition Fee (monthly - select all 12 months)
      Admission Fee (one-time - select only the first month)
      Exam Fee (select exam months only)
      Computer Fee (monthly)
      Transport Fee (monthly, mark "Is Transport" checkbox)
      Lab Fee (monthly, if applicable)
      Sports Fee (select applicable months)

   For each fee head, select which months it applies to. For example:
      Tuition Fee applies to all 12 months (April to March).
      Exam Fee might apply only to September and March.

   Why this matters: These fee heads appear as line items in the fee receipt.
   Without them, the fee deposit page has nothing to charge.


Step 11: Create Fee Amount Slabs (Class-wise Fee Amounts)

   Go to: Fee Master > Fee Amount Slab

   This is where you define HOW MUCH each class pays for each fee head.

   How to do it:
      1. Select Fee Category as "Full Fee" and your current Session
      2. Click "Add Slab"
      3. Select a class (e.g., Class 1)
      4. Enter the amount for each fee particular:
         Tuition Fee: 500
         Computer Fee: 200
         Exam Fee: 300
         ... and so on
      5. Click Submit
      6. Repeat for every class

   If your school has different fee categories (Half Fee, Free, RTE,
   Scholarship), create separate slabs for each category for each class.

   Example:
      Class 1 - Full Fee:    Tuition 500, Computer 200, Exam 300
      Class 1 - Half Fee:    Tuition 250, Computer 100, Exam 150
      Class 1 - RTE:         Tuition 0, Computer 0, Exam 0
      Class 5 - Full Fee:    Tuition 800, Computer 300, Exam 400

   Why this matters: When you collect a student's fee, the system
   automatically looks up the correct amount based on the student's class
   and fee category. Without slabs, fee deposit will show zero amounts.


PHASE 3 - STAFF ONBOARDING
________________________________________________________________________________

Now that the foundation is ready, start adding your staff members.


Step 12: Add Staff Members

   Go to: Staff > Add Staff

   Add each staff member one by one. Fill in:
      - Photo, Name, Father's Name, Designation, Date of Joining
      - Contact details (mobile, email, address)
      - Qualification, Experience
      - Salary details (basic salary, PAN, PF number, Aadhar)
      - Bank account details (for salary payments)

   On successful addition, the system shows a Login ID and default password.
   Note these down and share with the staff member.

   Important: Add teachers first, as you will need them for timetable
   and teacher permission setup.


Step 13: Set up Teacher Permissions

   Go to: Staff > Teacher Permission

   For each teacher, assign which classes and subjects they teach.

   Example:
      Teacher: Mrs. Sharma
         Class 1, Section A, English (Attendance + Homework)
         Class 1, Section B, English (Attendance + Homework)
         Class 2, Section A, English (Attendance + Homework)

      Teacher: Mr. Verma
         Class 5, Section A, Mathematics (Attendance + Homework)
         Class 5, Section B, Mathematics (Attendance + Homework)

   Why this matters: Without teacher permissions, teachers will see a
   blank dashboard after login. They will not be able to mark attendance,
   assign homework, or enter marks.


PHASE 4 - STUDENT ADMISSIONS
________________________________________________________________________________

Everything is now ready to start enrolling students.


Step 14: Admit Students

   Go to: Students > New Admission

   For each student, fill in:
      - Photo, Name, Date of Birth, Class, Section, Session
      - Gender, Category, Fee Category (Full Fee/Half Fee/Free/RTE/Scholarship)
      - Mobile number, Email
      - Father's Name, Mother's Name
      - Address details
      - Transport toggle (if the student uses school transport)

   On successful admission, the system generates:
      - A unique Admission Number
      - A Login ID for student portal access
      - A default password
      - A linked parent account (auto-created)

   Note down or print these credentials to share with parents and students.

   Tip: You can also edit any student's details later from the student list
   using the Edit button.


Step 15: Assign Subjects to Students

   Go to: Students > Assign Subjects

   For each student (or class-wise), assign which subjects they study.

   This is important because:
      - Exam marks can only be entered for assigned subjects
      - Result cards show only assigned subjects
      - When promoting students, assigned subjects can be carried forward


PHASE 5 - ADDITIONAL SETUP (As needed)
________________________________________________________________________________

These can be set up at any time after the basics are ready.


Step 16: Create Timetable

   Go to: Academics > Time Table

   Select a class and section. A grid appears with Periods as rows and
   Days (Monday to Saturday) as columns. For each slot, select the subject
   and teacher. Save the timetable.

   Do this for every class-section combination.

   After this, teachers will see their personal schedule in their portal,
   and parents/students can view the class timetable.


Step 17: Set up Option Settings

   Go to: Settings > Option Settings

   Configure important toggles:
      - Session Start Month (usually April for Indian schools)
      - Whether to show fee dues in the student portal
      - Whether to show discounts on fee receipts
      - Whether Sunday is a working day
      - Email notification settings (if using email features)


Step 18: Set up Transport (if applicable)

   Go to: Transport > Vehicle List (add vehicles)
   Go to: Transport > Vehicle Routes (create routes with pickup points and fees)
   Go to: Transport > Route Mapping (assign vehicles to routes)

   Once routes are set up, you can assign students to routes during
   admission or by editing their profile.


Step 19: Set up Library (if applicable)

   Go to: Library > Book Types (create categories: Textbook, Reference, etc.)
   Go to: Library > Add Book (add books to the catalog)
   Go to: Library > Library Settings (configure rules)

   After setup, you can issue and return books from the Library section.


Step 20: Create Branch Admin Users (if needed)

   Go to: Settings > Users > Add User

   If you need other admin users to manage the platform:
      1. Create a new user with role "Branch Admin"
      2. Assign them to a branch
      3. Go to Settings > User Permission
      4. Select the new user and enable Access/Modify/Delete for
         the modules they should manage

   Remember: Branch Admins start with zero access. They will see nothing
   in the sidebar until you grant them permissions.


Step 21: Set up Email Integration (optional)

   Go to: Settings > Option Settings > Email Integration

   Enter your ZeptoMail API Key, From Email, and From Name.
   Then enable the email notification checkboxes as needed:
      - Fee deposit email (auto-sends receipt to parent after payment)
      - Admission confirmation email
      - Absent/Present notification emails


QUICK REFERENCE - WHAT TO SET UP FOR EACH FEATURE
________________________________________________________________________________

If you want to use a specific feature, here is exactly what needs to be
set up beforehand:


To admit students, you need:
   Academic Session, Classes, Sections

To collect fees, you need:
   Academic Session, Classes, Sections, Fee Particulars, Fee Amount Slabs,
   Students admitted with correct Fee Category

To mark student attendance, you need:
   Classes, Sections, Students admitted

To enter exam marks, you need:
   Classes, Sections, Subjects, Exam Names, Students admitted,
   Subjects assigned to students

To generate result cards, you need:
   Everything for marks entry above, plus Exam Groups (for multi-exam reports)

To create timetable, you need:
   Classes, Sections, Subjects, Periods, Teachers added and assigned

To enable teacher portal, you need:
   Staff added as Teacher, Teacher Permissions assigned

To enable parent portal, you need:
   Students admitted (parent accounts are auto-created)

To enable student portal, you need:
   Students admitted (student accounts are auto-created)

To generate salary, you need:
   Staff added, Designations, Allowance Heads, Deduction Heads,
   Salary Settings configured per staff

To use library, you need:
   Book Types, Books added to catalog

To use transport, you need:
   Vehicles registered, Routes created, Route mapping done

To print ID cards, you need:
   School settings (logo, name, signing authority), Students/Staff added

To print certificates, you need:
   School settings (logo, name, signing authority), Students admitted

To send emails, you need:
   Email Integration configured (ZeptoMail API key),
   Students/Staff with valid email addresses


DAY-TO-DAY OPERATIONS AFTER SETUP
________________________________________________________________________________

Once the initial setup is complete, here is what the school staff will
do on a daily, weekly, and monthly basis:


Daily Tasks:

   Mark student attendance
      Attendance > Student Attendance
      Select class, section, date. Mark each student and save.

   Mark staff attendance
      Staff > Staff Attendance
      Select date. Mark each staff member and save.

   Collect fees
      Fee > Fee Deposit
      Select student, month, and fee heads. Submit payment and print receipt.

   Check dashboard
      Dashboard shows live stats: attendance count, fee collection, pending dues.


Weekly Tasks:

   Assign homework (done by teachers from Teacher Portal)
      Teachers > Homework > Add
      Select class, subject, enter homework details.

   Review attendance reports
      Attendance > Attendance Report
      Check for patterns of absenteeism.

   Review online payment requests (if online payments are enabled)
      Fee > Online Fee Requests
      Approve or reject payment submissions from parents.


Monthly Tasks:

   Generate salary
      Payroll > Generate Salary
      Select month and staff. Review attendance deductions, allowances,
      deductions. Submit.

   Process salary payments
      Payroll > Salary List
      For unpaid salaries, click Pay Now and enter payment mode.

   Fee due follow-up
      Fee > Fee Due Report
      Filter by month. Review pending dues. Send SMS or email reminders
      to parents.

   Review fee collection report
      Fee > Fee Report
      Set date range for the month. Review total collections by payment mode.

   Record expenses and income
      Accounts > Expenses / Income
      Log all school expenses and non-fee income.


End-of-Term Tasks:

   Enter exam marks
      Result > Update (Student Wise) or Update (Subject Wise)
      Enter marks for each student and subject.

   Print result cards
      Result > Result Single Exam or Result Multiple Exam
      Generate and print for distribution.

   Print admit cards (before exams)
      Cards & Certificates > Admit Card


End-of-Year Tasks:

   Promote students to next class
      Students > Promote to Next Class
      Select current class, target class, and new session.
      Select students and promote.

   Create new academic session
      Masters > Academic Session > Add new session (e.g., "2026-27")

   Update branch school settings
      Settings > Branch School Settings
      Change active session to the new session.

   Create new fee slabs (if fee structure changes)
      Fee Master > Fee Amount Slab
      Create slabs for the new session with updated amounts.

   Re-enter discounts (if any students have discounts)
      Fee > Fee Discount
      Discounts are session-specific. Re-enter for the new session.


________________________________________________________________________________

                              End of Document

                   EduNex1 School Management System
                   Platform Documentation Guide
                   Last Updated: March 2026
________________________________________________________________________________
