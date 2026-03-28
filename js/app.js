

(function () {
    if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
        window.location.href = '/';
        return;
    }
})();

function requireRoles(allowedRoles, redirectTo) {
    var user = typeof getUser === 'function' ? getUser() : null;
    if (!user) { window.location.href = redirectTo || '/'; return false; }
    var effectiveRole = user.role;
    // Treat 'staff' same as 'teacher' for permission purposes
    if (effectiveRole === 'staff' && allowedRoles.includes('teacher')) effectiveRole = 'teacher';
    if (!allowedRoles.includes(effectiveRole)) {
        if (!redirectTo) {
            if (user.role === 'teacher' || user.role === 'staff') redirectTo = '/teacher-dashboard';
            else if (user.role === 'student') redirectTo = '/student-dashboard';
            else if (user.role === 'parent') redirectTo = '/parent-dashboard';
            else redirectTo = '/dashboard';
        }
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

function renderSidebar(activeMenu) {
    const user = typeof getUser === 'function' ? getUser() : null;
    const isSuperAdmin = user && user.role === 'super_admin';
    const studentMenus = ['student-list', 'new-admission', 'assign-subjects', 'promote-class'];
    const staffMenus = ['view-staff', 'add-staff', 'staff-attendance', 'staff-attendance-report', 'teacher-permission'];
    const feeMenus = ['fee-deposit', 'fee-online-requests', 'fee-online-request-review', 'fee-receipt', 'fee-report', 'fee-report-headwise', 'fee-due-report', 'fee-demand-bill', 'fee-discount'];
    const payrollMenus = ['deduction-head', 'allowance-head', 'salary-settings', 'salary-generate', 'salary-list'];
    const attendanceMenus = ['student-attendance', 'student-attendance-report', 'student-attendance-stats', 'face-attendance', 'face-registration', 'face-settings'];
    const cardsCertsMenus = ['id-card', 'staff-id-card', 'admit-card', 'character-certificate', 'transfer-certificate'];
    const academicsMenus = ['academic-notice', 'academic-timetable', 'academic-schedule', 'academic-syllabus', 'academic-datesheet', 'academic-holidays', 'academic-activity', 'academic-homework', 'academic-gallery'];
    const teacherMenus = ['add-teacher'];
    const parentMenus = [];
    const libraryMenus = ['library-books', 'library-add-book', 'library-book-type', 'library-issue', 'library-return', 'library-settings'];
    const transportMenus = ['transport-vehicles', 'transport-registration', 'transport-routes', 'transport-mapping'];
    const accountMenus = [];
    const accountsNewMenus = ['account-expenses', 'account-income', 'expense-head', 'income-head', 'cash-deposit-withdraw', 'expenses-income-report', 'account-vendor', 'account-bank'];
    const messagingMenus = ['email-students', 'email-staff', 'email-report'];
    const resultMenus = ['result-student-wise', 'result-subject-wise', 'consolidated-marks', 'result-single-exam', 'result-multiple-exam'];
    const classMenus = ['add-class'];
    const examMenus = [];
    const feeMasterMenus = ['fee-particulars', 'fee-amount-slab'];
    const masterMenus = ['master-academic-session', 'master-designation', 'master-class', 'master-section', 'master-subject', 'master-exam-name', 'master-exam-group', 'master-period', 'master-homework-type', 'master-house', 'master-stream'];
    const settingsMenus = ['settings-users', 'settings-user-add', 'settings-user-permission', 'settings-activity-log', 'settings-branches', 'settings-branch-add', 'settings-branch-school', 'settings-options', 'settings-exam'];

    const isStudentActive = studentMenus.includes(activeMenu);
    const isAttendanceActive = attendanceMenus.includes(activeMenu);
    const isCardsCertsActive = cardsCertsMenus.includes(activeMenu);
    const isAcademicsActive = academicsMenus.includes(activeMenu);
    const isStaffActive = staffMenus.includes(activeMenu);
    const isFeeActive = feeMenus.includes(activeMenu);
    const isPayrollActive = payrollMenus.includes(activeMenu);
    const isTeacherActive = teacherMenus.includes(activeMenu);
    const isParentActive = parentMenus.includes(activeMenu);
    const isLibraryActive = libraryMenus.includes(activeMenu);
    const isTransportActive = transportMenus.includes(activeMenu);
    const isAccountActive = accountMenus.includes(activeMenu);
    const isAccountsNewActive = accountsNewMenus.includes(activeMenu);
    const isMessagingActive = messagingMenus.includes(activeMenu);
    const isResultActive = resultMenus.includes(activeMenu);
    const isClassActive = classMenus.includes(activeMenu);
    const isExamActive = examMenus.includes(activeMenu);
    const isFeeMasterActive = feeMasterMenus.includes(activeMenu);
    const isMasterActive = masterMenus.includes(activeMenu);
    const isSettingsActive = settingsMenus.includes(activeMenu);

    function mc(key) { return activeMenu === key ? ' menu-active' : ''; }
    function sga(isActive) { return isActive ? ' sub-group-active' : ''; }


    const _perms = typeof getUserPerms === 'function' ? getUserPerms() : null;
    const hasAccess = function(key) {
        if (isSuperAdmin) return true;
        if (!_perms || !Array.isArray(_perms) || _perms.length === 0) return false;
        const _p = _perms.find(function(x) { return x.module === key; });
        return !!(_p && _p.access);
    };
    const _hasAnyPerm = isSuperAdmin || (Array.isArray(_perms) && _perms.some(function(p) { return p.access; }));

    const html = `
    <div class="sidebar-main sidebar-menu-one sidebar-expand-md sidebar-color">
        <div class="mobile-sidebar-header d-md-none"></div>
        <div class="sidebar-menu-content">
            <ul class="nav nav-sidebar-menu sidebar-toggle-view">

                <!-- Dashboard -->
                <li class="nav-item">
                    <a href="/dashboard" class="nav-link${mc('dashboard')}"><i class="flaticon-dashboard"></i><span>Dashboard</span></a>
                </li>

                <!-- No Permissions Warning -->
                ${(!isSuperAdmin && !_hasAnyPerm) ? `<li class="nav-item" style="padding:10px 14px 6px;">
                    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px 12px;font-size:11px;color:#856404;line-height:1.5;">
                        <i class="fas fa-lock" style="margin-right:5px;"></i><strong>No permissions assigned.</strong><br>
                        Please contact Super Admin to get module access.
                    </div>
                </li>` : ''}

                <!-- Students -->
                ${hasAccess('students') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-classmates"></i><span>Students</span></a>
                    <ul class="nav sub-group-menu${sga(isStudentActive)}">
                        <li class="nav-item">
                            <a href="/student-list" class="nav-link${mc('student-list')}"><i class="fas fa-angle-right"></i>Student List</a>
                        </li>
                        <li class="nav-item">
                            <a href="/new-admission" class="nav-link${mc('new-admission')}"><i class="fas fa-angle-right"></i>New Admission</a>
                        </li>
                        <li class="nav-item">
                            <a href="/assign-subjects" class="nav-link${mc('assign-subjects')}"><i class="fas fa-angle-right"></i>Assign Subjects</a>
                        </li>
                        <li class="nav-item">
                            <a href="/student-promotion" class="nav-link${mc('promote-class')}"><i class="fas fa-angle-right"></i>Promote to Next Class</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Attendance -->
                ${hasAccess('attendance') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-checklist"></i><span>Attendance</span></a>
                    <ul class="nav sub-group-menu${sga(isAttendanceActive)}">
                        <li class="nav-item">
                            <a href="/attendance" class="nav-link${mc('student-attendance')}"><i class="fas fa-angle-right"></i>Student Attendance</a>
                        </li>
                        <li class="nav-item">
                            <a href="/student-attendance-report" class="nav-link${mc('student-attendance-report')}"><i class="fas fa-angle-right"></i>Attendance Report</a>
                        </li>
                        <li class="nav-item">
                            <a href="/student-attendance-stats" class="nav-link${mc('student-attendance-stats')}"><i class="fas fa-angle-right"></i>Attendance Stats</a>
                        </li>
                        <li class="nav-item">
                            <a href="/face-attendance" class="nav-link${mc('face-attendance')}"><i class="fas fa-angle-right"></i>Face Attendance</a>
                        </li>
                        <li class="nav-item">
                            <a href="/face-registration" class="nav-link${mc('face-registration')}"><i class="fas fa-angle-right"></i>Face Registration</a>
                        </li>
                        <li class="nav-item">
                            <a href="/face-settings" class="nav-link${mc('face-settings')}"><i class="fas fa-angle-right"></i>Face Settings</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Cards & Certificates -->
                ${hasAccess('cards_certs') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-script"></i><span>Cards & Certificates</span></a>
                    <ul class="nav sub-group-menu${sga(isCardsCertsActive)}">
                        <li class="nav-item">
                            <a href="/id-card" class="nav-link${mc('id-card')}"><i class="fas fa-angle-right"></i>Student ID Card</a>
                        </li>
                        <li class="nav-item">
                            <a href="/staff-id-card" class="nav-link${mc('staff-id-card')}"><i class="fas fa-angle-right"></i>Staff ID Card</a>
                        </li>
                        <li class="nav-item">
                            <a href="/admit-card" class="nav-link${mc('admit-card')}"><i class="fas fa-angle-right"></i>Admit Card</a>
                        </li>
                        <li class="nav-item">
                            <a href="/character-certificate" class="nav-link${mc('character-certificate')}"><i class="fas fa-angle-right"></i>Character Certificate</a>
                        </li>
                        <li class="nav-item">
                            <a href="/transfer-certificate" class="nav-link${mc('transfer-certificate')}"><i class="fas fa-angle-right"></i>Transfer Certificate</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Academics -->
                ${hasAccess('academics') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-mortarboard"></i><span>Academics</span></a>
                    <ul class="nav sub-group-menu${sga(isAcademicsActive)}">
                        <li class="nav-item">
                            <a href="/academic-notice" class="nav-link${mc('academic-notice')}"><i class="fas fa-angle-right"></i>Notice Board</a>
                        </li>
                        <li class="nav-item">
                            <a href="/academic-timetable" class="nav-link${mc('academic-timetable')}"><i class="fas fa-angle-right"></i>Time Table</a>
                        </li>
                        <li class="nav-item">
                            <a href="/academic-schedule" class="nav-link${mc('academic-schedule')}"><i class="fas fa-angle-right"></i>Course Schedule</a>
                        </li>
                        <li class="nav-item">
                            <a href="/academic-syllabus" class="nav-link${mc('academic-syllabus')}"><i class="fas fa-angle-right"></i>Syllabus</a>
                        </li>
                        <li class="nav-item">
                            <a href="/academic-datesheet" class="nav-link${mc('academic-datesheet')}"><i class="fas fa-angle-right"></i>Date Sheet</a>
                        </li>
                        <li class="nav-item">
                            <a href="/academic-holidays" class="nav-link${mc('academic-holidays')}"><i class="fas fa-angle-right"></i>Holidays List</a>
                        </li>
                        <li class="nav-item">
                            <a href="/academic-activity" class="nav-link${mc('academic-activity')}"><i class="fas fa-angle-right"></i>Activity Calendar</a>
                        </li>
                        <li class="nav-item">
                            <a href="/academic-homework" class="nav-link${mc('academic-homework')}"><i class="fas fa-angle-right"></i>Homework</a>
                        </li>
                        <li class="nav-item">
                            <a href="/academic-gallery" class="nav-link${mc('academic-gallery')}"><i class="fas fa-angle-right"></i>Photo Gallery</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Staff -->
                ${hasAccess('staff') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-multiple-users-silhouette"></i><span>Staff</span></a>
                    <ul class="nav sub-group-menu${sga(isStaffActive)}">
                        <li class="nav-item">
                            <a href="/view-staff" class="nav-link${mc('view-staff')}"><i class="fas fa-angle-right"></i>View Staff</a>
                        </li>
                        <li class="nav-item">
                            <a href="/add-staff" class="nav-link${mc('add-staff')}"><i class="fas fa-angle-right"></i>Add Staff</a>
                        </li>
                        <li class="nav-item">
                            <a href="/staff-attendance" class="nav-link${mc('staff-attendance')}"><i class="fas fa-angle-right"></i>Staff Attendance</a>
                        </li>
                        <li class="nav-item">
                            <a href="/staff-attendance-report" class="nav-link${mc('staff-attendance-report')}"><i class="fas fa-angle-right"></i>Attendance Report</a>
                        </li>
                        <li class="nav-item">
                            <a href="/teacher-permission" class="nav-link${mc('teacher-permission')}"><i class="fas fa-angle-right"></i>Teacher Permission</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Fee Master -->
                ${hasAccess('fee_master') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="fas fa-file-invoice-dollar"></i><span>Fee Master</span></a>
                    <ul class="nav sub-group-menu${sga(isFeeMasterActive)}">
                        <li class="nav-item">
                            <a href="/fee-particulars" class="nav-link${mc('fee-particulars')}"><i class="fas fa-angle-right"></i>Fee Particulars</a>
                        </li>
                        <li class="nav-item">
                            <a href="/fee-amount-slab" class="nav-link${mc('fee-amount-slab')}"><i class="fas fa-angle-right"></i>Fee Amount Slab</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Fee -->
                ${hasAccess('fee') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-money"></i><span>Fee</span></a>
                    <ul class="nav sub-group-menu${sga(isFeeActive)}">
                        <li class="nav-item">
                            <a href="/fee-deposit" class="nav-link${mc('fee-deposit')}"><i class="fas fa-angle-right"></i>Fee Deposit</a>
                        </li>
                        <li class="nav-item">
                            <a href="/fee-online-requests" class="nav-link${mc('fee-online-requests')}"><i class="fas fa-angle-right"></i>Online Fee Requests</a>
                        </li>
                        <li class="nav-item">
                            <a href="/fee-receipt" class="nav-link${mc('fee-receipt')}"><i class="fas fa-angle-right"></i>Fee Receipt</a>
                        </li>
                        <li class="nav-item">
                            <a href="/fee-report" class="nav-link${mc('fee-report')}"><i class="fas fa-angle-right"></i>Fee Report</a>
                        </li>
                        <li class="nav-item">
                            <a href="/fee-report-headwise" class="nav-link${mc('fee-report-headwise')}"><i class="fas fa-angle-right"></i>Report (Head Wise)</a>
                        </li>
                        <li class="nav-item">
                            <a href="/fee-due-report" class="nav-link${mc('fee-due-report')}"><i class="fas fa-angle-right"></i>Fee Due Report</a>
                        </li>
                        <li class="nav-item">
                            <a href="/fee-demand-bill" class="nav-link${mc('fee-demand-bill')}"><i class="fas fa-angle-right"></i>Demand Bill</a>
                        </li>
                        <li class="nav-item">
                            <a href="/fee-discount" class="nav-link${mc('fee-discount')}"><i class="fas fa-angle-right"></i>Fee Discount</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Payroll -->
                ${hasAccess('payroll') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="fas fa-wallet"></i><span>Payroll</span></a>
                    <ul class="nav sub-group-menu${sga(isPayrollActive)}">
                        <li class="nav-item">
                            <a href="/salary-generate" class="nav-link${mc('salary-generate')}"><i class="fas fa-angle-right"></i>Generate Salary</a>
                        </li>
                        <li class="nav-item">
                            <a href="/salary-list" class="nav-link${mc('salary-list')}"><i class="fas fa-angle-right"></i>Salary List</a>
                        </li>
                        <li class="nav-item">
                            <a href="/deduction-head" class="nav-link${mc('deduction-head')}"><i class="fas fa-angle-right"></i>Deduction Head</a>
                        </li>
                        <li class="nav-item">
                            <a href="/allowance-head" class="nav-link${mc('allowance-head')}"><i class="fas fa-angle-right"></i>Allowance Head</a>
                        </li>
                        <li class="nav-item">
                            <a href="/salary-settings" class="nav-link${mc('salary-settings')}"><i class="fas fa-angle-right"></i>Salary Settings</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Accounts -->
                ${hasAccess('accounts') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="fas fa-calculator"></i><span>Accounts</span></a>
                    <ul class="nav sub-group-menu${sga(isAccountsNewActive)}">
                        <li class="nav-item">
                            <a href="/account-expenses" class="nav-link${mc('account-expenses')}"><i class="fas fa-angle-right"></i>Expenses</a>
                        </li>
                        <li class="nav-item">
                            <a href="/account-income" class="nav-link${mc('account-income')}"><i class="fas fa-angle-right"></i>Income</a>
                        </li>
                        <li class="nav-item">
                            <a href="/cash-deposit-withdraw" class="nav-link${mc('cash-deposit-withdraw')}"><i class="fas fa-angle-right"></i>Cash Deposit/Withdraw</a>
                        </li>
                        <li class="nav-item">
                            <a href="/expenses-income-report" class="nav-link${mc('expenses-income-report')}"><i class="fas fa-angle-right"></i>Expenses & Income</a>
                        </li>
                        <li class="nav-item">
                            <a href="/account-vendor" class="nav-link${mc('account-vendor')}"><i class="fas fa-angle-right"></i>Vendors</a>
                        </li>
                        <li class="nav-item">
                            <a href="/account-bank" class="nav-link${mc('account-bank')}"><i class="fas fa-angle-right"></i>Bank Accounts</a>
                        </li>
                        <li class="nav-item">
                            <a href="/expense-head" class="nav-link${mc('expense-head')}"><i class="fas fa-angle-right"></i>Expense Heads</a>
                        </li>
                        <li class="nav-item">
                            <a href="/income-head" class="nav-link${mc('income-head')}"><i class="fas fa-angle-right"></i>Income Heads</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Email -->
                ${hasAccess('messaging') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="fas fa-envelope"></i><span>Email</span></a>
                    <ul class="nav sub-group-menu${sga(isMessagingActive)}">
                        <li class="nav-item">
                            <a href="/email-students" class="nav-link${mc('email-students')}"><i class="fas fa-angle-right"></i>Send Email to Students</a>
                        </li>
                        <li class="nav-item">
                            <a href="/email-staff" class="nav-link${mc('email-staff')}"><i class="fas fa-angle-right"></i>Send Email to Staff</a>
                        </li>
                        <li class="nav-item">
                            <a href="/email-report" class="nav-link${mc('email-report')}"><i class="fas fa-angle-right"></i>Email Report</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Result -->
                ${hasAccess('result') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="fas fa-poll"></i><span>Result</span></a>
                    <ul class="nav sub-group-menu${sga(isResultActive)}">
                        <li class="nav-item">
                            <a href="/result-student-wise" class="nav-link${mc('result-student-wise')}"><i class="fas fa-angle-right"></i>Update (Student Wise)</a>
                        </li>
                        <li class="nav-item">
                            <a href="/result-subject-wise" class="nav-link${mc('result-subject-wise')}"><i class="fas fa-angle-right"></i>Update (Subject Wise)</a>
                        </li>
                        <li class="nav-item">
                            <a href="/consolidated-marks" class="nav-link${mc('consolidated-marks')}"><i class="fas fa-angle-right"></i>Consolidated Marks List</a>
                        </li>
                        <li class="nav-item">
                            <a href="/result-single-exam" class="nav-link${mc('result-single-exam')}"><i class="fas fa-angle-right"></i>Result Single Exam</a>
                        </li>
                        <li class="nav-item">
                            <a href="/result-multiple-exam" class="nav-link${mc('result-multiple-exam')}"><i class="fas fa-angle-right"></i>Result Multiple Exam</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Transport -->
                ${hasAccess('transport') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-bus-side-view"></i><span>Transport</span></a>
                    <ul class="nav sub-group-menu${sga(isTransportActive)}">
                        <li class="nav-item">
                            <a href="/transport-vehicles" class="nav-link${mc('transport-vehicles')}"><i class="fas fa-angle-right"></i>Vehicle List</a>
                        </li>
                        <li class="nav-item">
                            <a href="/transport-registration" class="nav-link${mc('transport-registration')}"><i class="fas fa-angle-right"></i>Register Vehicle</a>
                        </li>
                        <li class="nav-item">
                            <a href="/transport-routes" class="nav-link${mc('transport-routes')}"><i class="fas fa-angle-right"></i>Vehicle Routes</a>
                        </li>
                        <li class="nav-item">
                            <a href="/transport-mapping" class="nav-link${mc('transport-mapping')}"><i class="fas fa-angle-right"></i>Route Mapping</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Library -->
                ${hasAccess('library') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-books"></i><span>Library</span></a>
                    <ul class="nav sub-group-menu${sga(isLibraryActive)}">
                        <li class="nav-item">
                            <a href="/library-books" class="nav-link${mc('library-books')}"><i class="fas fa-angle-right"></i>All Books</a>
                        </li>
                        <li class="nav-item">
                            <a href="/library-add-book" class="nav-link${mc('library-add-book')}"><i class="fas fa-angle-right"></i>Add Book</a>
                        </li>
                        <li class="nav-item">
                            <a href="/library-book-type" class="nav-link${mc('library-book-type')}"><i class="fas fa-angle-right"></i>Book Types</a>
                        </li>
                        <li class="nav-item">
                            <a href="/library-issue" class="nav-link${mc('library-issue')}"><i class="fas fa-angle-right"></i>Issue Book</a>
                        </li>
                        <li class="nav-item">
                            <a href="/library-return" class="nav-link${mc('library-return')}"><i class="fas fa-angle-right"></i>Book Return</a>
                        </li>
                        <li class="nav-item">
                            <a href="/library-settings" class="nav-link${mc('library-settings')}"><i class="fas fa-angle-right"></i>Library Settings</a>
                        </li>
                    </ul>
                </li>` : ''}

                <!-- Masters -->
                ${hasAccess('masters') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="fas fa-cogs"></i><span>Masters</span></a>
                    <ul class="nav sub-group-menu${sga(isMasterActive)}">
                        <li class="nav-item"><a href="/master-academic-session" class="nav-link${mc('master-academic-session')}"><i class="fas fa-angle-right"></i>Academic Session</a></li>
                        <li class="nav-item"><a href="/master-designation" class="nav-link${mc('master-designation')}"><i class="fas fa-angle-right"></i>Staff Designation</a></li>
                        <li class="nav-item"><a href="/master-class" class="nav-link${mc('master-class')}"><i class="fas fa-angle-right"></i>Class</a></li>
                        <li class="nav-item"><a href="/master-section" class="nav-link${mc('master-section')}"><i class="fas fa-angle-right"></i>Section</a></li>
                        <li class="nav-item"><a href="/master-subject" class="nav-link${mc('master-subject')}"><i class="fas fa-angle-right"></i>Subject</a></li>
                        <li class="nav-item"><a href="/master-exam-name" class="nav-link${mc('master-exam-name')}"><i class="fas fa-angle-right"></i>Exam Name</a></li>
                        <li class="nav-item"><a href="/master-exam-group" class="nav-link${mc('master-exam-group')}"><i class="fas fa-angle-right"></i>Exam Group</a></li>
                        <li class="nav-item"><a href="/master-period" class="nav-link${mc('master-period')}"><i class="fas fa-angle-right"></i>Period</a></li>
                        <li class="nav-item"><a href="/master-homework-type" class="nav-link${mc('master-homework-type')}"><i class="fas fa-angle-right"></i>Homework Type</a></li>
                        <li class="nav-item"><a href="/master-house" class="nav-link${mc('master-house')}"><i class="fas fa-angle-right"></i>House</a></li>
                        <li class="nav-item"><a href="/master-stream" class="nav-link${mc('master-stream')}"><i class="fas fa-angle-right"></i>Stream</a></li>
                    </ul>
                </li>` : ''}

                <!-- My Profile -->
                <li class="nav-item">
                    <a href="${isSuperAdmin ? '/super-admin-profile' : '/admin-profile'}" class="nav-link${activeMenu === 'admin-profile' || activeMenu === 'super-admin-profile' ? ' menu-active' : ''}"><i class="fas fa-user-circle"></i><span>My Profile</span></a>
                </li>

                <!-- Settings -->
                ${hasAccess('settings') ? `<li class="nav-item sidebar-nav-item">
                    <a href="#" class="nav-link"><i class="flaticon-settings"></i><span>Settings</span></a>
                    <ul class="nav sub-group-menu${sga(isSettingsActive)}">
                        <li class="nav-item"><a href="/settings-users" class="nav-link${mc('settings-users')}"><i class="fas fa-angle-right"></i>Users</a></li>
                        <li class="nav-item"><a href="/settings-user-permission" class="nav-link${mc('settings-user-permission')}"><i class="fas fa-angle-right"></i>User Permission</a></li>
                        <li class="nav-item"><a href="/settings-activity-log" class="nav-link${mc('settings-activity-log')}"><i class="fas fa-angle-right"></i>Activity Log</a></li>
                        ${isSuperAdmin ? '<li class="nav-item"><a href="/settings-branches" class="nav-link'+mc('settings-branches')+'"><i class="fas fa-angle-right"></i>Branches</a></li>' : ''}
                        <li class="nav-item"><a href="/settings-branch-school" class="nav-link${mc('settings-branch-school')}"><i class="fas fa-angle-right"></i>${isSuperAdmin ? 'Branch School Settings' : 'School Settings'}</a></li>
                        <li class="nav-item"><a href="/settings-options" class="nav-link${mc('settings-options')}"><i class="fas fa-angle-right"></i>Option Settings</a></li>
                        <li class="nav-item"><a href="/settings-exam" class="nav-link${mc('settings-exam')}"><i class="fas fa-angle-right"></i>Exam Settings</a></li>
                    </ul>
                </li>` : ''}
            </ul>
        </div>
    </div>`;

    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = html;
        bindSidebarDropdowns(sidebarContainer);
    }
}

function bindSidebarDropdowns(container) {
    $(container).off('click', '.sidebar-nav-item > .nav-link').on('click', '.sidebar-nav-item > .nav-link', function (e) {
        if (!$('#wrapper').hasClass('sidebar-collapsed')) {
            var animationSpeed = 300;
            var $this = $(this);
            var checkElement = $this.next('.sub-group-menu');

            if (checkElement.length) {
                e.preventDefault();

                if (checkElement.is(':visible')) {
                    checkElement.slideUp(animationSpeed, function () {
                        checkElement.removeClass('menu-open sub-group-active');
                    });
                    checkElement.parent('.sidebar-nav-item').removeClass('active');
                } else {
                    var parent = $this.parents('ul').first();
                    parent.find('.sub-group-menu:visible').slideUp(animationSpeed).removeClass('menu-open sub-group-active');
                    parent.find('.sidebar-nav-item.active').removeClass('active');

                    checkElement.slideDown(animationSpeed, function () {
                        checkElement.addClass('menu-open');
                        $this.parent('.sidebar-nav-item').addClass('active');
                    });
                }
            }
        } else {
            if ($this.attr('href') === '#') {
                e.preventDefault();
            }
        }
    });
}

function renderHeader(userName, role) {
    userName = userName || 'Admin';
    var loggedUser = typeof getUser === 'function' ? getUser() : null;
    var schoolName = (loggedUser && loggedUser.school_name) ? loggedUser.school_name : 'EduNex1';
    if (loggedUser) {
        userName = loggedUser.name || loggedUser.login_id || userName;
        var roleMap = { super_admin: 'Super Admin', branch_admin: 'Branch Admin', teacher: 'Teacher', student: 'Student', parent: 'Parent', staff: 'Staff' };
        role = roleMap[loggedUser.role] || role || 'Super Admin';
    } else {
        role = role || 'Super Admin';
    }

    var userBranchIds = Array.isArray(loggedUser && loggedUser.branch_ids) ? loggedUser.branch_ids : [];
    var canSwitchBranches = !!(loggedUser && (loggedUser.role === 'super_admin' || userBranchIds.length > 1));

    var branchSwitcherHtml = '';
    if (canSwitchBranches) {
        var branchDefaultOption = (loggedUser && loggedUser.role === 'super_admin')
            ? '<option value="">All Branches</option>'
            : '';
        branchSwitcherHtml = `
            <li class="navbar-item navbar-switcher-item">
                <select id="branchSwitcher" class="form-control form-control-sm navbar-switcher-select">
                    ${branchDefaultOption}
                </select>
            </li>`;
    }

    var sessionSwitcherHtml = '';
    if (loggedUser && ['super_admin', 'branch_admin'].includes(loggedUser.role)) {
        sessionSwitcherHtml = `
            <li class="navbar-item navbar-switcher-item">
                <select id="sessionSwitcher" class="form-control form-control-sm navbar-switcher-select">
                    <option value="">Loading...</option>
                </select>
            </li>`;
    }

    var displayName = (loggedUser && loggedUser.name) ? loggedUser.name : userName;
    var initials = displayName.split(' ').filter(function(w){return w;}).map(function(w){return w[0];}).join('').substring(0,2).toUpperCase() || '?';

    const html = `
    <div class="navbar navbar-expand-md header-menu-one custom-topbar">
        <div class="header-main-menu">
            <button class="sidebar-toggle-mobile" type="button" aria-label="Toggle menu">
                <i class="fas fa-bars"></i>
            </button>
            <div class="header-school-block">
                <h4 class="header-school-name">${schoolName}</h4>
                <span class="header-school-subtitle">EduNex1</span>
            </div>
            <ul class="navbar-nav">
                ${branchSwitcherHtml}
                ${sessionSwitcherHtml}
                <li class="navbar-item dropdown header-admin simple-user-menu">
                    <a class="navbar-nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-expanded="false">
                        <div class="admin-title">
                            <h5 class="item-title">${userName}</h5>
                            <span>${role}</span>
                        </div>
                        <div class="admin-img admin-img-initials">
                            ${initials}
                        </div>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a class="dropdown-item" href="${(function(){if(!loggedUser) return '/admin-profile'; var r=loggedUser.role; if(r==='super_admin') return '/super-admin-profile'; if(r==='teacher') return '/t-my-profile'; if(r==='student') return '/s-my-profile'; if(r==='parent') return '/p-my-profile'; return '/admin-profile';})()}"><i class="flaticon-user"></i>My Profile</a>
                        <a class="dropdown-item" href="#" onclick="if(typeof logoutUser==='function'){logoutUser();}else{window.location.href='/';}return false;"><i class="flaticon-turn-off"></i>Log Out</a>
                    </div>
                </li>
            </ul>
        </div>
    </div>`;

    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = html;
    }

    if (canSwitchBranches) {
        loadBranchSwitcher();
    }
    if (loggedUser && ['super_admin', 'branch_admin'].includes(loggedUser.role)) {
        loadSessionSwitcher();
    }
}

async function loadBranchSwitcher() {
    var switcher = document.getElementById('branchSwitcher');
    if (!switcher) return;
    var user = typeof getUser === 'function' ? getUser() : null;
    var canAllBranches = !!(user && user.role === 'super_admin');
    try {
        var branches = await getBranches();
        if (branches && !branches.error && Array.isArray(branches)) {
            if (!canAllBranches) switcher.innerHTML = '';
            branches.forEach(function(b) {
                var opt = document.createElement('option');
                opt.value = b.id;
                opt.textContent = b.name + ' (' + b.code + ')';
                switcher.appendChild(opt);
            });
        }
    } catch(e) {  }
    var savedBranch = sessionStorage.getItem('vkis_selected_branch');
    if (savedBranch) {
        switcher.value = savedBranch;
    } else if (!canAllBranches && switcher.options.length) {
        switcher.value = switcher.options[0].value;
        sessionStorage.setItem('vkis_selected_branch', switcher.value);
    }
    switcher.addEventListener('change', function() {
        sessionStorage.setItem('vkis_selected_branch', this.value);
        if (typeof onBranchSwitch === 'function') {
            onBranchSwitch(this.value);
        } else {
            window.location.reload();
        }
    });
}

function getSelectedBranch() {
    var user = typeof getUser === 'function' ? getUser() : null;
    if (!user) return '';
    if (user.role === 'super_admin') {
        return sessionStorage.getItem('vkis_selected_branch') || '';
    }
    var branchIds = Array.isArray(user.branch_ids) ? user.branch_ids : [];
    if (branchIds.length > 1) {
        var selected = sessionStorage.getItem('vkis_selected_branch');
        if (selected && branchIds.map(String).includes(String(selected))) return selected;
        return String(branchIds[0]);
    }
    return user.branch_id ? String(user.branch_id) : '';
}

async function loadSessionSwitcher() {
    var switcher = document.getElementById('sessionSwitcher');
    if (!switcher) return;
    try {
        var sessions = await getAcademicSessions();
        if (sessions && !sessions.error && Array.isArray(sessions)) {
            if (sessions.length) {
                var html = '';
                sessions.forEach(function(s) {
                    var isCurrent = s.status === 'Active';
                    html += '<option value="' + s.name + '">' + s.name + (isCurrent ? ' (Current)' : '') + '</option>';
                });
                switcher.innerHTML = html;
                switcher.disabled = false;
            } else {
                switcher.innerHTML = '<option value="">No sessions available</option>';
                switcher.disabled = true;
                return;
            }
        }
    } catch(e) {  }
    var savedSession = sessionStorage.getItem('vkis_selected_session');
    var hasSavedSession = false;
    if (savedSession) {
        for (var i = 0; i < switcher.options.length; i++) {
            if (switcher.options[i].value === savedSession) { hasSavedSession = true; break; }
        }
    }
    if (hasSavedSession) {
        switcher.value = savedSession;
    } else if (switcher.options.length) {
        switcher.value = switcher.options[0].value;
        sessionStorage.setItem('vkis_selected_session', switcher.value);
    }
    switcher.addEventListener('change', function() {
        sessionStorage.setItem('vkis_selected_session', this.value);
        if (typeof onSessionSwitch === 'function') {
            onSessionSwitch(this.value);
        } else {
            window.location.reload();
        }
    });
}

function getSelectedSession() {
    var user = typeof getUser === 'function' ? getUser() : null;
    if (user && ['super_admin', 'branch_admin'].includes(user.role)) {
        return sessionStorage.getItem('vkis_selected_session') || '';
    }
    return '';
}

function showToast(message, type) {
    type = type || 'success';

    const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', warning: 'fas fa-exclamation-triangle', info: 'fas fa-info-circle' };
    const bgColors = { success: '#08b13c', error: '#ff0000', warning: '#ffa601', info: '#304ffe' };

    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background:${bgColors[type]};color:#fff;padding:10px 20px;border-radius:6px;
        font-size:13px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,0.15);
        display:flex;align-items:center;gap:8px;min-width:260px;max-width:400px;
        animation:slideInRight 0.3s ease forwards;font-family:'Roboto',sans-serif;
    `;
    toast.innerHTML = `<i class="${icons[type]}"></i> ${message}`;
    container.appendChild(toast);

    if (!document.getElementById('toast-animation-style')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-style';
        style.textContent = `
            @keyframes slideInRight { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity:1; } to { transform: translateX(100%); opacity:0; } }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showConfirmModal(title, message, onConfirm) {
    const existingModal = document.getElementById('confirmModal');
    if (existingModal) existingModal.remove();
    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingBackdrop) existingBackdrop.remove();

    const modalHtml = `
    <div class="modal fade" id="confirmModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content" style="border:none;border-radius:10px;overflow:hidden;">
                <div class="modal-header" style="background:linear-gradient(135deg,#304ffe,#417dfc);border:none;padding:14px 20px;">
                    <h5 class="modal-title" style="color:#fff;font-weight:600;font-size:15px;">${title}</h5>
                    <button type="button" class="close" data-dismiss="modal" style="color:#fff;opacity:1;text-shadow:none;">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="padding:20px;">
                    <p style="font-size:13px;color:#333;margin:0;">${message}</p>
                </div>
                <div class="modal-footer" style="border-top:1px solid #eee;padding:12px 20px;">
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal" style="border-radius:5px;padding:6px 18px;font-size:13px;">Cancel</button>
                    <button type="button" class="btn btn-sm btn-danger" id="confirmModalYes" style="border-radius:5px;padding:6px 18px;background:#ff0000;border:none;font-size:13px;">Yes, Confirm</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = $('#confirmModal');
    modal.modal('show');

    document.getElementById('confirmModalYes').addEventListener('click', function () {
        modal.modal('hide');
        if (onConfirm) onConfirm();
    });

    modal.on('hidden.bs.modal', function () {
        document.getElementById('confirmModal').remove();
    });
}

var _dropdownCache = {};

async function _loadDropdownData(key, apiFn) {
    if (_dropdownCache[key]) return _dropdownCache[key];
    try {
        var data = await apiFn();
        if (data && !data.error && Array.isArray(data)) {
            _dropdownCache[key] = data;
            return data;
        }
    } catch(e) {}
    return [];
}

async function populateClassDropdown(selectElement, includeAll) {
    let html = includeAll ? '<option value="All">All Classes</option>' : '<option value="">Select Class *</option>';
    var classes = await _loadDropdownData('classes', getClasses);
    if (!Array.isArray(classes) || !classes.length) {
        selectElement.innerHTML = includeAll ? '<option value="">No classes available</option>' : '<option value="">No classes available</option>';
        selectElement.disabled = true;
        return;
    }
    selectElement.disabled = false;
    classes.forEach(function(c) { html += '<option value="' + c.id + '">Class ' + c.name + '</option>'; });
    selectElement.innerHTML = html;
}

async function populateSectionDropdown(selectElement, includeAll) {
    let html = includeAll ? '<option value="All">All Sections</option>' : '<option value="">Select Section *</option>';
    var sections = await _loadDropdownData('sections', getSections);
    if (!Array.isArray(sections) || !sections.length) {
        selectElement.innerHTML = includeAll ? '<option value="">No sections available</option>' : '<option value="">No sections available</option>';
        selectElement.disabled = true;
        return;
    }
    selectElement.disabled = false;
    sections.forEach(function(s) { html += '<option value="' + s.name + '">' + s.name + '</option>'; });
    selectElement.innerHTML = html;
}

async function populateSessionDropdown(selectElement, includeAll) {
    let html = includeAll ? '<option value="All">All Sessions</option>' : '<option value="">Select Session *</option>';
    var sessions = await _loadDropdownData('sessions', getAcademicSessions);
    if (!Array.isArray(sessions) || !sessions.length) {
        selectElement.innerHTML = includeAll ? '<option value="">No sessions available</option>' : '<option value="">No sessions available</option>';
        selectElement.disabled = true;
        return;
    }
    selectElement.disabled = false;
    sessions.forEach(function(s) {
        var isCurrent = s.status === 'Active';
        html += '<option value="' + s.name + '">' + s.name + (isCurrent ? ' (Current)' : '') + '</option>';
    });
    selectElement.innerHTML = html;
}

async function populateSubjectDropdown(selectElement, includeAll) {
    let html = includeAll ? '<option value="All">All Subjects</option>' : '';
    var subjects = await _loadDropdownData('subjects', getSubjects);
    if (!Array.isArray(subjects) || !subjects.length) {
        selectElement.innerHTML = '<option value="">No subjects available</option>';
        selectElement.disabled = true;
        return;
    }
    selectElement.disabled = false;
    subjects.forEach(function(s) { html += '<option value="' + s.id + '">' + s.name + '</option>'; });
    selectElement.innerHTML = html;
}

function populateCategoryDropdown(selectElement, includeAll) {
    var cats = ["General", "OBC", "SC", "ST", "EWS"];
    let html = includeAll ? '<option value="All">All Categories</option>' : '<option value="">Select Category *</option>';
    cats.forEach(function(c) { html += '<option value="' + c + '">' + c + '</option>'; });
    selectElement.innerHTML = html;
}

function populateReligionDropdown(selectElement) {
    var religions = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"];
    let html = '<option value="">Select Religion *</option>';
    religions.forEach(function(r) { html += '<option value="' + r + '">' + r + '</option>'; });
    selectElement.innerHTML = html;
}

async function populateRouteDropdown(selectElement) {
    let html = '<option value="">Select Route (Optional)</option>';
    var routes = await _loadDropdownData('routes', getTransportRoutes);
    routes.forEach(function(r) { html += '<option value="' + r.id + '">' + r.name + '</option>'; });
    selectElement.innerHTML = html;
}

async function populateHouseDropdown(selectElement) {
    let html = '<option value="">Select</option>';
    try {
        var houses = await _loadDropdownData('houses', getHouses);
        houses.forEach(function(h) { html += '<option value="' + h.name + '">' + h.name + '</option>'; });
    } catch(e) { console.warn('Could not load houses:', e); }
    selectElement.innerHTML = html;
}

async function populateStreamDropdown(selectElement) {
    let html = '<option value="">Select</option>';
    try {
        var streams = await _loadDropdownData('streams', getStreams);
        if (streams && streams.length) {
            streams.forEach(function(s) { html += '<option value="' + s.name + '">' + s.name + '</option>'; });
        } else {
            html += '<option value="Science">Science</option><option value="Commerce">Commerce</option><option value="Arts">Arts</option><option value="N/A">N/A</option>';
        }
    } catch(e) {
        html += '<option value="Science">Science</option><option value="Commerce">Commerce</option><option value="Arts">Arts</option><option value="N/A">N/A</option>';
    }
    selectElement.innerHTML = html;
}

async function populateDesignationDropdown(selectElement) {
    let html = '<option value="">Select Designation *</option>';
    var desig = await _loadDropdownData('designations', getDesignations);
    desig.forEach(function(d) { html += '<option value="' + d.name + '">' + d.name + '</option>'; });
    selectElement.innerHTML = html;
}

async function populateExamDropdown(selectElement) {
    let html = '<option value="">Select Exam *</option>';
    var exams = await _loadDropdownData('exam_names', getExamNames);
    if (!Array.isArray(exams) || !exams.length) {
        selectElement.innerHTML = '<option value="">No exams available</option>';
        selectElement.disabled = true;
        return;
    }
    selectElement.disabled = false;
    exams.forEach(function(e) { html += '<option value="' + e.id + '">' + e.name + '</option>'; });
    selectElement.innerHTML = html;
}

async function populateBranchDropdown(selectElement, includeAll) {
    let html = includeAll ? '<option value="">All Branches</option>' : '<option value="">Select Branch *</option>';
    try {
        var branches = await getBranches();
        if (branches && !branches.error && Array.isArray(branches)) {
            branches.forEach(function(b) { html += '<option value="' + b.id + '">' + b.name + ' (' + b.code + ')</option>'; });
            selectElement.disabled = branches.length === 0;
        } else {
            selectElement.disabled = true;
        }
    } catch(e) {
        selectElement.disabled = true;
    }
    if (selectElement.disabled) {
        selectElement.innerHTML = '<option value="">No branches available</option>';
        return;
    }
    selectElement.innerHTML = html;
}

function renderFooter() {
    var loggedUser = typeof getUser === 'function' ? getUser() : null;
    var schoolName = (loggedUser && loggedUser.school_name) ? loggedUser.school_name : 'EduNex1';
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="footer-wrap-layout1">
            <div class="copyright">© ${new Date().getFullYear()} <a href="#">${schoolName}</a>. All rights reserved.</div>
        </footer>`;
    }
}

function initPage(activeMenu) {
    var user = typeof getUser === 'function' ? getUser() : null;
    var role = user ? user.role : 'super_admin';
    var path = window.location.pathname;

    if (path.startsWith('/t-') || path === '/teacher-dashboard') role = 'teacher';
    else if (path.startsWith('/p-') || path === '/parent-dashboard') role = 'parent';
    else if (path.startsWith('/s-') || path === '/student-dashboard' || path === '/student-dashboard.html') role = 'student';

    // Override: if user role is teacher/staff/student/parent, always use their portal sidebar
    if (user) {
        if ((user.role === 'teacher' || user.role === 'staff') && !['super_admin','branch_admin'].includes(user.role)) role = 'teacher';
        else if (user.role === 'student') role = 'student';
        else if (user.role === 'parent') role = 'parent';
    }

    if (role === 'teacher') {
        renderHeader(user ? (user.name || user.login_id) : 'Teacher User', 'Teacher');
        renderTeacherSidebar(activeMenu);
    } else if (role === 'parent') {
        renderHeader(user ? (user.name || user.login_id) : 'Parent User', 'Parent');
        renderParentSidebar(activeMenu);
    } else if (role === 'student') {
        renderHeader(user ? (user.name || user.login_id) : 'Student User', 'Student');
        renderStudentSidebar(activeMenu);
    } else {
        renderHeader('Admin', 'Super Admin');
        renderSidebar(activeMenu);
    }
    renderFooter();

    // Background permission refresh for non-super_admin admins
    if (['super_admin', 'branch_admin'].includes(role) && role !== 'super_admin') {
        (async function() {
            try {
                var _u = typeof getUser === 'function' ? getUser() : null;
                if (_u && _u.id) {
                    var freshPerms = await getUserPermissions(_u.id);
                    if (typeof setUserPerms === 'function' && Array.isArray(freshPerms)) {
                        var oldStr = localStorage.getItem('vkis_permissions');
                        var newStr = JSON.stringify(freshPerms);
                        if (oldStr !== newStr) {
                            setUserPerms(freshPerms);
                            renderSidebar(activeMenu);
                        }
                    }
                }
            } catch(e) { /* ignore */ }
        })();
    }

    if (!document.querySelector('.sidebar-overlay')) {
        var overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
}

function renderTeacherSidebar(activeMenu) {
    function mc(key) { return activeMenu === key ? ' menu-active' : ''; }
    function oc(keys) { return keys.includes(activeMenu) ? ' show' : ''; }
    function sga(keys) { return keys.includes(activeMenu) ? ' sub-group-active' : ''; }

    var attMenus = ['t-mark-attendance', 't-attendance-report'];
    var resMenus = ['t-enter-marks', 't-view-results'];
    var acadMenus = ['t-timetable', 't-homework', 't-notice', 't-datesheet', 't-syllabus', 't-holidays'];

    var html = '<div class="sidebar-main sidebar-menu-one sidebar-expand-md sidebar-color">' +
        '<div class="mobile-sidebar-header d-md-none"></div>' +
        '<div class="sidebar-menu-content">' +
        '<ul class="nav nav-sidebar-menu sidebar-toggle-view">' +

        '<li class="nav-item"><a href="/teacher-dashboard" class="nav-link' + mc('dashboard') + '"><i class="flaticon-dashboard"></i><span>Dashboard</span></a></li>' +

        '<li class="nav-item"><a href="/t-my-students" class="nav-link' + mc('t-my-students') + '"><i class="flaticon-classmates"></i><span>My Students</span></a></li>' +

        '<li class="nav-item sidebar-nav-item">' +
        '<a href="#" class="nav-link"><i class="flaticon-checklist"></i><span>Attendance</span></a>' +
        '<ul class="nav sub-group-menu' + sga(attMenus) + '">' +
        '<li class="nav-item"><a href="/t-mark-attendance" class="nav-link' + mc('t-mark-attendance') + '"><i class="fas fa-angle-right"></i>Mark Attendance</a></li>' +
        '<li class="nav-item"><a href="/t-attendance-report" class="nav-link' + mc('t-attendance-report') + '"><i class="fas fa-angle-right"></i>Attendance Report</a></li>' +
        '</ul></li>' +

        '<li class="nav-item"><a href="/t-homework" class="nav-link' + mc('t-homework') + '"><i class="flaticon-open-book"></i><span>Homework</span></a></li>' +

        '<li class="nav-item sidebar-nav-item">' +
        '<a href="#" class="nav-link"><i class="flaticon-script"></i><span>Results</span></a>' +
        '<ul class="nav sub-group-menu' + sga(resMenus) + '">' +
        '<li class="nav-item"><a href="/t-enter-marks" class="nav-link' + mc('t-enter-marks') + '"><i class="fas fa-angle-right"></i>Enter Marks</a></li>' +
        '<li class="nav-item"><a href="/t-view-results" class="nav-link' + mc('t-view-results') + '"><i class="fas fa-angle-right"></i>View Results</a></li>' +
        '</ul></li>' +

        '<li class="nav-item sidebar-nav-item">' +
        '<a href="#" class="nav-link"><i class="flaticon-mortarboard"></i><span>Academics</span></a>' +
        '<ul class="nav sub-group-menu' + sga(acadMenus) + '">' +
        '<li class="nav-item"><a href="/t-timetable" class="nav-link' + mc('t-timetable') + '"><i class="fas fa-angle-right"></i>Time Table</a></li>' +
        '<li class="nav-item"><a href="/t-datesheet" class="nav-link' + mc('t-datesheet') + '"><i class="fas fa-angle-right"></i>Date Sheet</a></li>' +
        '<li class="nav-item"><a href="/t-syllabus" class="nav-link' + mc('t-syllabus') + '"><i class="fas fa-angle-right"></i>Syllabus</a></li>' +
        '<li class="nav-item"><a href="/t-notice" class="nav-link' + mc('t-notice') + '"><i class="fas fa-angle-right"></i>Notice Board</a></li>' +
        '<li class="nav-item"><a href="/t-holidays" class="nav-link' + mc('t-holidays') + '"><i class="fas fa-angle-right"></i>Holidays</a></li>' +
        '</ul></li>' +

        '<li class="nav-item"><a href="/t-my-attendance" class="nav-link' + mc('t-my-attendance') + '"><i class="fas fa-calendar-check"></i><span>My Attendance</span></a></li>' +

        '<li class="nav-item"><a href="/t-my-profile" class="nav-link' + mc('t-my-profile') + '"><i class="flaticon-user"></i><span>My Profile</span></a></li>' +

        '</ul></div></div>';
    var sc = document.getElementById('sidebar-container');
    sc.innerHTML = html;
    bindSidebarDropdowns(sc);
}

function renderParentSidebar(activeMenu) {
    function mc(key) { return activeMenu === key ? ' menu-active' : ''; }
    function oc(keys) { return keys.includes(activeMenu) ? ' show' : ''; }
    function sga(keys) { return keys.includes(activeMenu) ? ' sub-group-active' : ''; }

    var feeMenus = ['p-fee-status', 'p-fee-receipts', 'p-online-payment'];
    var acadMenus = ['p-timetable', 'p-datesheet', 'p-syllabus', 'p-notice', 'p-holidays'];
    var resMenus = ['p-results', 'p-report-card'];

    var html = '<div class="sidebar-main sidebar-menu-one sidebar-expand-md sidebar-color">' +
        '<div class="mobile-sidebar-header d-md-none"></div>' +
        '<div class="sidebar-menu-content">' +
        '<ul class="nav nav-sidebar-menu sidebar-toggle-view">' +

        '<li class="nav-item"><a href="/parent-dashboard" class="nav-link' + mc('dashboard') + '"><i class="flaticon-dashboard"></i><span>Dashboard</span></a></li>' +

        '<li class="nav-item"><a href="/p-my-children" class="nav-link' + mc('p-my-children') + '"><i class="flaticon-classmates"></i><span>My Children</span></a></li>' +

        '<li class="nav-item"><a href="/p-attendance" class="nav-link' + mc('p-attendance') + '"><i class="flaticon-checklist"></i><span>Attendance</span></a></li>' +

        '<li class="nav-item sidebar-nav-item">' +
        '<a href="#" class="nav-link"><i class="flaticon-technological"></i><span>Fee</span></a>' +
        '<ul class="nav sub-group-menu' + sga(feeMenus) + '">' +
        '<li class="nav-item"><a href="/p-fee-status" class="nav-link' + mc('p-fee-status') + '"><i class="fas fa-angle-right"></i>Fee Status</a></li>' +
        '<li class="nav-item"><a href="/p-online-payment" class="nav-link' + mc('p-online-payment') + '"><i class="fas fa-angle-right"></i>Online Payment</a></li>' +
        '<li class="nav-item"><a href="/p-fee-receipts" class="nav-link' + mc('p-fee-receipts') + '"><i class="fas fa-angle-right"></i>Fee Receipts</a></li>' +
        '</ul></li>' +

        '<li class="nav-item sidebar-nav-item">' +
        '<a href="#" class="nav-link"><i class="flaticon-script"></i><span>Results</span></a>' +
        '<ul class="nav sub-group-menu' + sga(resMenus) + '">' +
        '<li class="nav-item"><a href="/p-results" class="nav-link' + mc('p-results') + '"><i class="fas fa-angle-right"></i>Exam Results</a></li>' +
        '<li class="nav-item"><a href="/p-report-card" class="nav-link' + mc('p-report-card') + '"><i class="fas fa-angle-right"></i>Report Card</a></li>' +
        '</ul></li>' +

        '<li class="nav-item"><a href="/p-homework" class="nav-link' + mc('p-homework') + '"><i class="flaticon-open-book"></i><span>Homework</span></a></li>' +

        '<li class="nav-item sidebar-nav-item">' +
        '<a href="#" class="nav-link"><i class="flaticon-mortarboard"></i><span>Academics</span></a>' +
        '<ul class="nav sub-group-menu' + sga(acadMenus) + '">' +
        '<li class="nav-item"><a href="/p-timetable" class="nav-link' + mc('p-timetable') + '"><i class="fas fa-angle-right"></i>Time Table</a></li>' +
        '<li class="nav-item"><a href="/p-datesheet" class="nav-link' + mc('p-datesheet') + '"><i class="fas fa-angle-right"></i>Date Sheet</a></li>' +
        '<li class="nav-item"><a href="/p-syllabus" class="nav-link' + mc('p-syllabus') + '"><i class="fas fa-angle-right"></i>Syllabus</a></li>' +
        '<li class="nav-item"><a href="/p-notice" class="nav-link' + mc('p-notice') + '"><i class="fas fa-angle-right"></i>Notices</a></li>' +
        '<li class="nav-item"><a href="/p-holidays" class="nav-link' + mc('p-holidays') + '"><i class="fas fa-angle-right"></i>Holidays</a></li>' +
        '</ul></li>' +

        '<li class="nav-item"><a href="/p-transport" class="nav-link' + mc('p-transport') + '"><i class="flaticon-bus-side-view"></i><span>Transport</span></a></li>' +

        '<li class="nav-item"><a href="/p-my-profile" class="nav-link' + mc('p-my-profile') + '"><i class="flaticon-user"></i><span>My Profile</span></a></li>' +

        '</ul></div></div>';
    var sc = document.getElementById('sidebar-container');
    sc.innerHTML = html;
    bindSidebarDropdowns(sc);
}

function renderStudentSidebar(activeMenu) {
    function mc(key) { return activeMenu === key ? ' menu-active' : ''; }
    function oc(keys) { return keys.includes(activeMenu) ? ' show' : ''; }
    function sga(keys) { return keys.includes(activeMenu) ? ' sub-group-active' : ''; }

    var acadMenus = ['s-timetable', 's-datesheet', 's-syllabus', 's-notice', 's-holidays', 's-homework'];
    var feeMenus = ['s-fee-status', 's-fee-receipts'];

    var html = '<div class="sidebar-main sidebar-menu-one sidebar-expand-md sidebar-color">' +
        '<div class="mobile-sidebar-header d-md-none"></div>' +
        '<div class="sidebar-menu-content">' +
        '<ul class="nav nav-sidebar-menu sidebar-toggle-view">' +

        '<li class="nav-item"><a href="/student-dashboard" class="nav-link' + mc('dashboard') + '"><i class="flaticon-dashboard"></i><span>Dashboard</span></a></li>' +

        '<li class="nav-item"><a href="/s-my-attendance" class="nav-link' + mc('s-my-attendance') + '"><i class="flaticon-checklist"></i><span>My Attendance</span></a></li>' +

        '<li class="nav-item"><a href="/s-my-results" class="nav-link' + mc('s-my-results') + '"><i class="flaticon-script"></i><span>My Results</span></a></li>' +

        '<li class="nav-item sidebar-nav-item">' +
        '<a href="#" class="nav-link"><i class="flaticon-technological"></i><span>Fee</span></a>' +
        '<ul class="nav sub-group-menu' + sga(feeMenus) + '">' +
        '<li class="nav-item"><a href="/s-fee-status" class="nav-link' + mc('s-fee-status') + '"><i class="fas fa-angle-right"></i>Fee Status</a></li>' +
        '<li class="nav-item"><a href="/s-fee-receipts" class="nav-link' + mc('s-fee-receipts') + '"><i class="fas fa-angle-right"></i>Fee Receipts</a></li>' +
        '</ul></li>' +

        '<li class="nav-item sidebar-nav-item">' +
        '<a href="#" class="nav-link"><i class="flaticon-mortarboard"></i><span>Academics</span></a>' +
        '<ul class="nav sub-group-menu' + sga(acadMenus) + '">' +
        '<li class="nav-item"><a href="/s-homework" class="nav-link' + mc('s-homework') + '"><i class="fas fa-angle-right"></i>Homework</a></li>' +
        '<li class="nav-item"><a href="/s-timetable" class="nav-link' + mc('s-timetable') + '"><i class="fas fa-angle-right"></i>Time Table</a></li>' +
        '<li class="nav-item"><a href="/s-datesheet" class="nav-link' + mc('s-datesheet') + '"><i class="fas fa-angle-right"></i>Date Sheet</a></li>' +
        '<li class="nav-item"><a href="/s-syllabus" class="nav-link' + mc('s-syllabus') + '"><i class="fas fa-angle-right"></i>Syllabus</a></li>' +
        '<li class="nav-item"><a href="/s-notice" class="nav-link' + mc('s-notice') + '"><i class="fas fa-angle-right"></i>Notices</a></li>' +
        '<li class="nav-item"><a href="/s-holidays" class="nav-link' + mc('s-holidays') + '"><i class="fas fa-angle-right"></i>Holidays</a></li>' +
        '</ul></li>' +

        '<li class="nav-item"><a href="/s-my-books" class="nav-link' + mc('s-my-books') + '"><i class="flaticon-books"></i><span>My Books</span></a></li>' +

        '<li class="nav-item"><a href="/s-transport" class="nav-link' + mc('s-transport') + '"><i class="flaticon-bus-side-view"></i><span>My Transport</span></a></li>' +

        '<li class="nav-item"><a href="/s-my-profile" class="nav-link' + mc('s-my-profile') + '"><i class="flaticon-user"></i><span>My Profile</span></a></li>' +

        '</ul></div></div>';
    var sc = document.getElementById('sidebar-container');
    sc.innerHTML = html;
    bindSidebarDropdowns(sc);
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
