const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY HEADERS ====================
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');
    next();
});

// ==================== STATIC FILES (must come FIRST) ====================
// Serve all static assets with absolute paths
app.use(express.static(__dirname, { index: false }));

// ==================== CLEAN URL ROUTES ====================
// Flat routes (no nesting) — so relative paths in HTML still work
const routes = {
    '/': 'login.html',
    '/dashboard': 'dashboard.html',
    '/teacher-dashboard': 'teacher-dashboard.html',
    '/parent-dashboard': 'parent-dashboard.html',
    '/student-dashboard': 'student-dashboard.html',

    // Students
    '/student-list': 'all-student.html',
    '/new-admission': 'admit-form.html',
    '/student-details': 'student-details.html',
    '/assign-subjects': 'assign-subjects.html',
    '/character-certificate': 'character-certificate.html',
    '/student-promotion': 'student-promotion.html',
    '/id-card': 'id-card.html',
    '/admit-card': 'admit-card.html',
    '/transfer-certificate': 'transfer-certificate.html',
    '/attendance': 'student-attendence.html',
    '/student-attendance-report': 'student-attendance-report.html',
    '/student-attendance-detail': 'student-attendance-detail.html',
    '/student-attendance-stats': 'student-attendance-stats.html',
    '/face-attendance': 'face-attendance.html',
    '/face-registration': 'face-registration.html',
    '/face-settings': 'face-settings.html',

    // Academics
    '/academic-notice': 'academic-notice.html',
    '/academic-timetable': 'academic-timetable.html',
    '/academic-schedule': 'academic-schedule.html',
    '/academic-syllabus': 'syllabus.html',
    '/academic-datesheet': 'academic-datesheet.html',
    '/datesheet-print': 'datesheet-print.html',
    '/academic-holidays': 'academic-holidays.html',
    '/academic-activity': 'academic-activity.html',
    '/academic-homework': 'academic-homework.html',
    '/academic-gallery': 'academic-gallery.html',

    // Staff
    '/view-staff': 'view-staff.html',
    '/staff-details': 'staff-details.html',
    '/add-staff': 'add-staff.html',
    '/staff-id-card': 'staff-id-card.html',
    '/staff-attendance': 'staff-attendance.html',
    '/staff-attendance-report': 'staff-attendance-report.html',
    '/staff-attendance-detail': 'staff-attendance-detail.html',
    '/teacher-permission': 'teacher-permission.html',

    // Fee
    '/fee-deposit': 'fee-deposit.html',
    '/fee-online-requests': 'fee-online-requests.html',
    '/fee-online-request-review': 'fee-online-request-review.html',
    '/fee-receipt': 'fee-receipt.html',
    '/fee-report': 'fee-report.html',
    '/fee-report-headwise': 'fee-report-headwise.html',
    '/fee-due-report': 'fee-due-report.html',
    '/fee-demand-bill': 'fee-demand-bill.html',
    '/demand-bill-print': 'demand-bill-print.html',
    '/receipt-print': 'receipt-print.html',
    '/fee-discount': 'fee-discount.html',

    // Payroll
    '/deduction-head': 'deduction-head.html',
    '/allowance-head': 'allowance-head.html',
    '/salary-settings': 'salary-settings.html',
    '/salary-generate': 'salary-generate.html',
    '/salary-list': 'salary-list.html',

    // Accounts
    '/account-expenses': 'account-expenses.html',
    '/account-income': 'account-income.html',
    '/expense-head': 'expense-head.html',
    '/income-head': 'income-head.html',
    '/cash-deposit-withdraw': 'cash-deposit-withdraw.html',
    '/expenses-income-report': 'expenses-income-report.html',
    '/account-vendor': 'account-vendor.html',
    '/account-bank': 'account-bank.html',

    // Email
    '/email-students': 'email-students.html',
    '/email-staff': 'email-staff.html',
    '/email-report': 'email-report.html',

    // Result
    '/result-student-wise': 'result-student-wise.html',
    '/result-subject-wise': 'result-subject-wise.html',
    '/consolidated-marks': 'consolidated-marks.html',
    '/result-single-exam': 'result-single-exam.html',
    '/result-multiple-exam': 'result-multiple-exam.html',

    // Teachers
    '/add-teacher': 'add-teacher.html',

    // Class
    '/add-class': 'add-class.html',

    // Library
    '/all-books': 'library-books.html',
    '/add-book': 'library-add-book.html',
    '/library-books': 'library-books.html',
    '/library-add-book': 'library-add-book.html',
    '/library-book-type': 'library-book-type.html',
    '/library-issue': 'library-issue.html',
    '/library-return': 'library-return.html',
    '/library-settings': 'library-settings.html',

    // Fee Master
    '/fee-particulars': 'fee-particulars.html',
    '/fee-amount-slab': 'fee-amount-slab.html',

    // Masters
    '/master-academic-session': 'master-academic-session.html',
    '/master-designation': 'master-designation.html',
    '/master-class': 'master-class.html',
    '/master-section': 'master-section.html',
    '/master-subject': 'master-subject.html',
    '/master-exam-name': 'master-exam-name.html',
    '/master-exam-group': 'master-exam-group.html',
    '/master-period': 'master-period.html',
    '/master-homework-type': 'master-homework-type.html',
    '/master-house': 'master-house.html',
    '/master-stream': 'master-stream.html',

    // Other
    '/transport': 'transport-vehicles.html',
    '/transport-vehicles': 'transport-vehicles.html',
    '/transport-registration': 'transport-registration.html',
    '/transport-routes': 'transport-routes.html',
    '/transport-mapping': 'transport-mapping.html',

    // Admin Profile
    '/admin-profile': 'admin-profile.html',
    '/super-admin-profile': 'super-admin-profile.html',

    // Settings Module
    '/settings-users': 'settings-users.html',
    '/settings-user-add': 'settings-user-add.html',
    '/settings-user-permission': 'settings-user-permission.html',
    '/settings-activity-log': 'settings-activity-log.html',
    '/settings-branches': 'settings-branches.html',
    '/settings-branch-add': 'settings-branch-add.html',
    '/settings-branch-school': 'settings-branch-school.html',
    '/settings-options': 'settings-options.html',
    '/settings-exam': 'settings-exam.html',

    // ==================== ROLE DASHBOARDS (defined above) ====================

    // ==================== TEACHER PANEL ====================
    '/t-my-students': 't-my-students.html',
    '/t-mark-attendance': 't-mark-attendance.html',
    '/t-attendance-report': 't-attendance-report.html',
    '/t-homework': 't-homework.html',
    '/t-enter-marks': 't-enter-marks.html',
    '/t-view-results': 't-view-results.html',
    '/t-timetable': 't-timetable.html',
    '/t-datesheet': 't-datesheet.html',
    '/t-syllabus': 't-syllabus.html',
    '/t-notice': 't-notice.html',
    '/t-holidays': 't-holidays.html',
    '/t-my-attendance': 't-my-attendance.html',
    '/t-my-profile': 't-my-profile.html',

    // ==================== PARENT PANEL ====================
    '/p-my-children': 'p-my-children.html',
    '/p-attendance': 'p-attendance.html',
    '/p-fee-status': 'p-fee-status.html',
    '/p-online-payment': 'p-online-payment.html',
    '/p-fee-receipts': 'p-fee-receipts.html',
    '/p-results': 'p-results.html',
    '/p-report-card': 'p-report-card.html',
    '/p-homework': 'p-homework.html',
    '/p-timetable': 'p-timetable.html',
    '/p-datesheet': 'p-datesheet.html',
    '/p-syllabus': 'p-syllabus.html',
    '/p-notice': 'p-notice.html',
    '/p-holidays': 'p-holidays.html',
    '/p-transport': 'p-transport.html',
    '/p-my-profile': 'p-my-profile.html',

    // ==================== STUDENT PANEL ====================
    '/s-my-attendance': 's-my-attendance.html',
    '/s-my-results': 's-my-results.html',
    '/s-fee-status': 's-fee-status.html',
    '/s-fee-receipts': 's-fee-receipts.html',
    '/s-homework': 's-homework.html',
    '/s-timetable': 's-timetable.html',
    '/s-datesheet': 's-datesheet.html',
    '/s-syllabus': 's-syllabus.html',
    '/s-notice': 's-notice.html',
    '/s-holidays': 's-holidays.html',
    '/s-my-books': 's-my-books.html',
    '/s-transport': 's-transport.html',
    '/s-my-profile': 's-my-profile.html',
};

// Register clean URL routes
Object.entries(routes).forEach(([route, file]) => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, file));
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <div style="text-align:center;padding:50px;font-family:sans-serif;">
            <h1 style="color:#304ffe;">404 — Page Not Found</h1>
            <p>The page you are looking for doesn't exist.</p>
            <a href="/dashboard" style="color:#304ffe;">← Back to Dashboard</a>
        </div>
    `);
});

app.listen(PORT, () => {
    console.log(`\nSchool Management System - EduNex1`);
    console.log(`------------------------------------`);
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Dashboard:         http://localhost:${PORT}/dashboard`);
    console.log(`Students:          http://localhost:${PORT}/student-list`);
    console.log(`Staff:             http://localhost:${PORT}/view-staff`);
    console.log(`Transfer Cert:     http://localhost:${PORT}/transfer-certificate`);
    console.log(`Character Cert:    http://localhost:${PORT}/character-certificate`);
    console.log(`------------------------------------\n`);
});
