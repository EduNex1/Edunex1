/**
 * ============================================
 * SCHOOL MANAGEMENT SYSTEM — MOCK DATA STORE
 * ============================================
 * Centralized data for all modules.
 * Will be replaced by Cloudflare D1 API calls later.
 */

const SCHOOL_CONFIG = {
    name: "Vaish Khan International School",
    shortName: "VKIS",
    tagline: "Nurturing Minds, Shaping Futures",
    address: "NH-24, Lucknow Road, Uttar Pradesh, India",
    phone: "+91 99999 88888",
    email: "info@vkis.edu.in",
    website: "www.vkis.edu.in",
    principalName: "Dr. Rajesh Kumar Sharma",
    boardAffiliation: "CBSE",
    affiliationNo: "2130456",
    schoolCode: "12345"
};

// ==================== BRANCHES (used by dashboard/template) ====================
const SCHOOL_BRANCHES = [
    { id: 1, name: "Lucknow", code: "LKN", address: "NH-24, Lucknow, UP", status: "Active", studentsCount: 1250, teachersCount: 85 },
    { id: 2, name: "Bareilly", code: "BRL", address: "Civil Lines, Bareilly, UP", status: "Active", studentsCount: 980, teachersCount: 62 },
    { id: 3, name: "Moradabad", code: "MBD", address: "Delhi Road, Moradabad, UP", status: "Active", studentsCount: 750, teachersCount: 48 },
    { id: 4, name: "Barabanki", code: "BBK", address: "Station Road, Barabanki, UP", status: "Active", studentsCount: 520, teachersCount: 35 }
];

// ==================== SESSIONS ====================
const SESSIONS = [
    { id: 1, name: "2023-2024", startDate: "2023-04-01", endDate: "2024-03-31", status: "Completed" },
    { id: 2, name: "2024-2025", startDate: "2024-04-01", endDate: "2025-03-31", status: "Completed" },
    { id: 3, name: "2025-2026", startDate: "2025-04-01", endDate: "2026-03-31", status: "Active" }
];

const CURRENT_SESSION = SESSIONS.find(s => s.status === "Active");

// ==================== CLASSES ====================
const CLASSES = [
    { id: 1, name: "Nursery", shortName: "NUR", fee: 2500 },
    { id: 2, name: "LKG", shortName: "LKG", fee: 2800 },
    { id: 3, name: "UKG", shortName: "UKG", fee: 3000 },
    { id: 4, name: "1", shortName: "I", fee: 3200 },
    { id: 5, name: "2", shortName: "II", fee: 3200 },
    { id: 6, name: "3", shortName: "III", fee: 3500 },
    { id: 7, name: "4", shortName: "IV", fee: 3500 },
    { id: 8, name: "5", shortName: "V", fee: 3800 },
    { id: 9, name: "6", shortName: "VI", fee: 4000 },
    { id: 10, name: "7", shortName: "VII", fee: 4000 },
    { id: 11, name: "8", shortName: "VIII", fee: 4200 },
    { id: 12, name: "9", shortName: "IX", fee: 4500 },
    { id: 13, name: "10", shortName: "X", fee: 5000 },
    { id: 14, name: "11", shortName: "XI", fee: 5500 },
    { id: 15, name: "12", shortName: "XII", fee: 6000 }
];

// ==================== SECTIONS ====================
const SECTIONS = [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
    { id: 3, name: "C" },
    { id: 4, name: "D" }
];

// ==================== CATEGORIES ====================
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];

// ==================== RELIGIONS ====================
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"];

// ==================== SUBJECTS ====================
const SUBJECTS = [
    { id: 1, name: "Hindi", code: "HIN", hasPractical: false },
    { id: 2, name: "English", code: "ENG", hasPractical: false },
    { id: 3, name: "Mathematics", code: "MAT", hasPractical: false },
    { id: 4, name: "Science", code: "SCI", hasPractical: true },
    { id: 5, name: "Social Science", code: "SST", hasPractical: false },
    { id: 6, name: "Computer Science", code: "CS", hasPractical: true },
    { id: 7, name: "Sanskrit", code: "SKT", hasPractical: false },
    { id: 8, name: "EVS", code: "EVS", hasPractical: false },
    { id: 9, name: "General Knowledge", code: "GK", hasPractical: false },
    { id: 10, name: "Drawing", code: "DRW", hasPractical: false },
    { id: 11, name: "Physical Education", code: "PE", hasPractical: true },
    { id: 12, name: "Moral Science", code: "MS", hasPractical: false }
];

// Class IDs 12(9th), 13(10th), 14(11th), 15(12th) are senior secondary
const SENIOR_CLASS_IDS = [12, 13, 14, 15];
function isSeniorClass(classId) { return SENIOR_CLASS_IDS.includes(classId); }

// Co-Scholastic areas (graded A-E, only for 9-12 report cards)
const CO_SCHOLASTIC_AREAS = [
    { id: 1, name: "Work Education" },
    { id: 2, name: "Art Education" },
    { id: 3, name: "Health & Physical Education" }
];

// Discipline grading (A/B/C)
const DISCIPLINE_GRADES = ['A', 'B', 'C'];

// Co-scholastic grade helper (5-point scale)
function getCoScholasticGrade(val) {
    if (val >= 5) return 'A';
    if (val >= 4) return 'B';
    if (val >= 3) return 'C';
    if (val >= 2) return 'D';
    return 'E';
}

// Co-scholastic results per student per exam
let CO_SCHOLASTIC_RESULTS = [
    { studentId: 1, examId: 2, areaId: 1, grade: 'A' },
    { studentId: 1, examId: 2, areaId: 2, grade: 'B' },
    { studentId: 1, examId: 2, areaId: 3, grade: 'A' },
    { studentId: 1, examId: 2, discipline: 'A' },
    { studentId: 2, examId: 2, areaId: 1, grade: 'A' },
    { studentId: 2, examId: 2, areaId: 2, grade: 'A' },
    { studentId: 2, examId: 2, areaId: 3, grade: 'B' },
    { studentId: 2, examId: 2, discipline: 'A' }
];

function getCoScholastic(studentId, examId) {
    const areas = CO_SCHOLASTIC_RESULTS.filter(r => r.studentId === studentId && r.examId === examId && r.areaId);
    const disc = CO_SCHOLASTIC_RESULTS.find(r => r.studentId === studentId && r.examId === examId && r.discipline);
    return { areas, discipline: disc ? disc.discipline : '—' };
}

// ==================== ROUTES ====================
const ROUTES = [
    { id: 1, name: "Route 1 — Aliganj → School", stops: "Aliganj, Kapoorthala, Mahanagar", fee: 800 },
    { id: 2, name: "Route 2 — Gomtinagar → School", stops: "Gomtinagar, Vikas Nagar, Indira Nagar", fee: 900 },
    { id: 3, name: "Route 3 — Hazratganj → School", stops: "Hazratganj, Aminabad, Charbagh", fee: 700 },
    { id: 4, name: "Route 4 — Alambagh → School", stops: "Alambagh, Charbagh, Husainabad", fee: 850 },
    { id: 5, name: "Route 5 — Jankipuram → School", stops: "Jankipuram, Sitapur Road, Vikas Nagar", fee: 950 }
];

// ==================== STUDENTS ====================
let STUDENTS = [
    {
        id: 1, admissionNo: "ADM-2025-001",
        photo: "img/figure/student2.png",
        name: "Aarav Sharma", fatherName: "Rajesh Sharma", motherName: "Priya Sharma",
        dob: "2015-03-12", gender: "Male", category: "General", religion: "Hindu",
        phone: "9876543210", email: "rajesh.sharma@gmail.com",
        address: "B-45, Gomtinagar, Lucknow, UP",
        classId: 8, section: "A", session: "2025-2026", rollNo: 1,
        route: 2, loginId: "STU-001", password: "vkis@2025",
        admissionDate: "2020-04-10",
        subjects: [1, 2, 3, 4, 5, 6, 9, 10],
        status: "Active", feeAmount: 3800, feePaid: 3800,
        promotionHistory: []
    },
    {
        id: 2, admissionNo: "ADM-2025-002",
        photo: "img/figure/student3.png",
        name: "Ananya Gupta", fatherName: "Vikram Gupta", motherName: "Neha Gupta",
        dob: "2015-07-22", gender: "Female", category: "General", religion: "Hindu",
        phone: "9876543211", email: "vikram.gupta@gmail.com",
        address: "12, Hazratganj, Lucknow, UP",
        classId: 8, section: "A", session: "2025-2026", rollNo: 2,
        route: 3, loginId: "STU-002", password: "vkis@2025",
        admissionDate: "2020-04-12",
        subjects: [1, 2, 3, 4, 5, 6, 9, 10],
        status: "Active", feeAmount: 3800, feePaid: 3800,
        promotionHistory: []
    },
    {
        id: 3, admissionNo: "ADM-2025-003",
        photo: "img/figure/student4.png",
        name: "Arjun Patel", fatherName: "Sunil Patel", motherName: "Kavita Patel",
        dob: "2014-11-05", gender: "Male", category: "OBC", religion: "Hindu",
        phone: "9876543212", email: "sunil.patel@gmail.com",
        address: "78, Indira Nagar, Lucknow, UP",
        classId: 9, section: "B", session: "2025-2026", rollNo: 1,
        route: 2, loginId: "STU-003", password: "vkis@2025",
        admissionDate: "2019-04-08",
        subjects: [1, 2, 3, 4, 5, 6, 7],
        status: "Active", feeAmount: 4000, feePaid: 2000,
        promotionHistory: []
    },
    {
        id: 4, admissionNo: "ADM-2025-004",
        photo: "img/figure/student5.png",
        name: "Diya Verma", fatherName: "Anil Verma", motherName: "Sunita Verma",
        dob: "2016-01-18", gender: "Female", category: "SC", religion: "Hindu",
        phone: "9876543213", email: "anil.verma@gmail.com",
        address: "34, Aliganj, Lucknow, UP",
        classId: 7, section: "A", session: "2025-2026", rollNo: 1,
        route: 1, loginId: "STU-004", password: "vkis@2025",
        admissionDate: "2021-04-05",
        subjects: [1, 2, 3, 4, 5, 8, 9, 10],
        status: "Active", feeAmount: 3500, feePaid: 3500,
        promotionHistory: []
    },
    {
        id: 5, admissionNo: "ADM-2025-005",
        photo: "img/figure/student6.png",
        name: "Ishaan Khan", fatherName: "Farhan Khan", motherName: "Ayesha Khan",
        dob: "2013-09-30", gender: "Male", category: "General", religion: "Muslim",
        phone: "9876543214", email: "farhan.khan@gmail.com",
        address: "56, Aminabad, Lucknow, UP",
        classId: 10, section: "A", session: "2025-2026", rollNo: 1,
        route: 3, loginId: "STU-005", password: "vkis@2025",
        admissionDate: "2018-04-10",
        subjects: [1, 2, 3, 4, 5, 6, 7],
        status: "Active", feeAmount: 4000, feePaid: 4000,
        promotionHistory: []
    },
    {
        id: 6, admissionNo: "ADM-2025-006",
        photo: "img/figure/student7.png",
        name: "Kavya Singh", fatherName: "Manish Singh", motherName: "Pooja Singh",
        dob: "2017-05-14", gender: "Female", category: "General", religion: "Hindu",
        phone: "9876543215", email: "manish.singh@gmail.com",
        address: "89, Mahanagar, Lucknow, UP",
        classId: 5, section: "B", session: "2025-2026", rollNo: 1,
        route: 1, loginId: "STU-006", password: "vkis@2025",
        admissionDate: "2022-04-08",
        subjects: [1, 2, 3, 8, 9, 10, 12],
        status: "Active", feeAmount: 3200, feePaid: 1600,
        promotionHistory: []
    },
    {
        id: 7, admissionNo: "ADM-2025-007",
        photo: "img/figure/student8.png",
        name: "Lakshya Tiwari", fatherName: "Deepak Tiwari", motherName: "Asha Tiwari",
        dob: "2015-12-25", gender: "Male", category: "General", religion: "Hindu",
        phone: "9876543216", email: "deepak.tiwari@gmail.com",
        address: "23, Vikas Nagar, Lucknow, UP",
        classId: 8, section: "B", session: "2025-2026", rollNo: 1,
        route: 2, loginId: "STU-007", password: "vkis@2025",
        admissionDate: "2020-04-15",
        subjects: [1, 2, 3, 4, 5, 6, 9, 10],
        status: "Active", feeAmount: 3800, feePaid: 3800,
        promotionHistory: []
    },
    {
        id: 8, admissionNo: "ADM-2025-008",
        photo: "img/figure/student9.png",
        name: "Meera Yadav", fatherName: "Gopal Yadav", motherName: "Rekha Yadav",
        dob: "2016-08-03", gender: "Female", category: "OBC", religion: "Hindu",
        phone: "9876543217", email: "gopal.yadav@gmail.com",
        address: "67, Jankipuram, Lucknow, UP",
        classId: 7, section: "B", session: "2025-2026", rollNo: 1,
        route: 5, loginId: "STU-008", password: "vkis@2025",
        admissionDate: "2021-04-12",
        subjects: [1, 2, 3, 4, 5, 8, 9, 10],
        status: "Active", feeAmount: 3500, feePaid: 3500,
        promotionHistory: []
    },
    {
        id: 9, admissionNo: "ADM-2025-009",
        photo: "img/figure/student10.png",
        name: "Nikhil Mishra", fatherName: "Ashok Mishra", motherName: "Geeta Mishra",
        dob: "2012-04-17", gender: "Male", category: "General", religion: "Hindu",
        phone: "9876543218", email: "ashok.mishra@gmail.com",
        address: "45, Charbagh, Lucknow, UP",
        classId: 12, section: "A", session: "2025-2026", rollNo: 1,
        route: 4, loginId: "STU-009", password: "vkis@2025",
        admissionDate: "2016-04-07",
        subjects: [1, 2, 3, 4, 5, 6, 11],
        status: "Active", feeAmount: 6000, feePaid: 6000,
        promotionHistory: []
    },
    {
        id: 10, admissionNo: "ADM-2025-010",
        photo: "img/figure/student11.png",
        name: "Priya Chauhan", fatherName: "Ramesh Chauhan", motherName: "Suman Chauhan",
        dob: "2014-02-28", gender: "Female", category: "ST", religion: "Hindu",
        phone: "9876543219", email: "ramesh.chauhan@gmail.com",
        address: "12, Alambagh, Lucknow, UP",
        classId: 9, section: "A", session: "2025-2026", rollNo: 2,
        route: 4, loginId: "STU-010", password: "vkis@2025",
        admissionDate: "2019-04-10",
        subjects: [1, 2, 3, 4, 5, 6, 7],
        status: "Active", feeAmount: 4000, feePaid: 4000,
        promotionHistory: []
    },
    {
        id: 11, admissionNo: "ADM-2025-011",
        photo: "img/figure/student12.png",
        name: "Rahul Dubey", fatherName: "Sanjay Dubey", motherName: "Mamta Dubey",
        dob: "2015-06-09", gender: "Male", category: "General", religion: "Hindu",
        phone: "9876543220", email: "sanjay.dubey@gmail.com",
        address: "90, Kapoorthala, Lucknow, UP",
        classId: 8, section: "A", session: "2025-2026", rollNo: 3,
        route: 1, loginId: "STU-011", password: "vkis@2025",
        admissionDate: "2020-04-08",
        subjects: [1, 2, 3, 4, 5, 6, 9, 10],
        status: "Active", feeAmount: 3800, feePaid: 1900,
        promotionHistory: []
    },
    {
        id: 12, admissionNo: "ADM-2025-012",
        photo: "img/figure/student13.png",
        name: "Saanvi Rastogi", fatherName: "Alok Rastogi", motherName: "Nidhi Rastogi",
        dob: "2017-10-15", gender: "Female", category: "General", religion: "Hindu",
        phone: "9876543221", email: "alok.rastogi@gmail.com",
        address: "33, Gomtinagar Extension, Lucknow, UP",
        classId: 5, section: "A", session: "2025-2026", rollNo: 1,
        route: 2, loginId: "STU-012", password: "vkis@2025",
        admissionDate: "2022-04-11",
        subjects: [1, 2, 3, 8, 9, 10, 12],
        status: "Active", feeAmount: 3200, feePaid: 3200,
        promotionHistory: []
    },
    {
        id: 13, admissionNo: "ADM-2025-013",
        photo: "img/figure/student2.png",
        name: "Tanish Agarwal", fatherName: "Vivek Agarwal", motherName: "Ritu Agarwal",
        dob: "2013-07-21", gender: "Male", category: "General", religion: "Hindu",
        phone: "9876543222", email: "vivek.agarwal@gmail.com",
        address: "55, Husainabad, Lucknow, UP",
        classId: 10, section: "B", session: "2025-2026", rollNo: 1,
        route: 4, loginId: "STU-013", password: "vkis@2025",
        admissionDate: "2018-04-14",
        subjects: [1, 2, 3, 4, 5, 6, 7],
        status: "Active", feeAmount: 4000, feePaid: 4000,
        promotionHistory: []
    },
    {
        id: 14, admissionNo: "ADM-2025-014",
        photo: "img/figure/student3.png",
        name: "Urvi Srivastava", fatherName: "Prakash Srivastava", motherName: "Anjali Srivastava",
        dob: "2018-02-14", gender: "Female", category: "General", religion: "Hindu",
        phone: "9876543223", email: "prakash.sri@gmail.com",
        address: "78, Sitapur Road, Lucknow, UP",
        classId: 4, section: "A", session: "2025-2026", rollNo: 1,
        route: 5, loginId: "STU-014", password: "vkis@2025",
        admissionDate: "2023-04-06",
        subjects: [1, 2, 3, 8, 9, 10, 12],
        status: "Active", feeAmount: 3200, feePaid: 3200,
        promotionHistory: []
    },
    {
        id: 15, admissionNo: "ADM-2025-015",
        photo: "img/figure/student4.png",
        name: "Varun Pandey", fatherName: "Hari Pandey", motherName: "Meena Pandey",
        dob: "2014-12-01", gender: "Male", category: "EWS", religion: "Hindu",
        phone: "9876543224", email: "hari.pandey@gmail.com",
        address: "22, Rajajipuram, Lucknow, UP",
        classId: 9, section: "A", session: "2025-2026", rollNo: 3,
        route: 1, loginId: "STU-015", password: "vkis@2025",
        admissionDate: "2019-04-15",
        subjects: [1, 2, 3, 4, 5, 6, 7],
        status: "Active", feeAmount: 4000, feePaid: 0,
        promotionHistory: []
    },
    {
        id: 16, admissionNo: "ADM-2024-016",
        photo: "img/figure/student5.png",
        name: "Zoya Ansari", fatherName: "Imran Ansari", motherName: "Fatima Ansari",
        dob: "2013-08-19", gender: "Female", category: "OBC", religion: "Muslim",
        phone: "9876543225", email: "imran.ansari@gmail.com",
        address: "44, Thakurganj, Lucknow, UP",
        classId: 10, section: "A", session: "2025-2026", rollNo: 2,
        route: 3, loginId: "STU-016", password: "vkis@2025",
        admissionDate: "2018-04-09",
        subjects: [1, 2, 3, 4, 5, 6, 7],
        status: "Active", feeAmount: 4000, feePaid: 4000,
        promotionHistory: []
    },
    {
        id: 17, admissionNo: "ADM-2023-017",
        photo: "img/figure/student6.png",
        name: "Aditya Tripathi", fatherName: "Manoj Tripathi", motherName: "Savita Tripathi",
        dob: "2011-05-25", gender: "Male", category: "General", religion: "Hindu",
        phone: "9876543226", email: "manoj.tripathi@gmail.com",
        address: "66, Lalbagh, Lucknow, UP",
        classId: 12, section: "B", session: "2025-2026", rollNo: 1,
        route: 3, loginId: "STU-017", password: "vkis@2025",
        admissionDate: "2015-04-10",
        subjects: [1, 2, 3, 4, 5, 6, 11],
        status: "TC", feeAmount: 6000, feePaid: 6000,
        promotionHistory: []
    },
    {
        id: 18, admissionNo: "ADM-2024-018",
        photo: "img/figure/student7.png",
        name: "Bhavna Rawat", fatherName: "Dinesh Rawat", motherName: "Kamla Rawat",
        dob: "2016-03-08", gender: "Female", category: "SC", religion: "Hindu",
        phone: "9876543227", email: "dinesh.rawat@gmail.com",
        address: "11, Chinhat, Lucknow, UP",
        classId: 7, section: "A", session: "2025-2026", rollNo: 2,
        route: 5, loginId: "STU-018", password: "vkis@2025",
        admissionDate: "2021-04-07",
        subjects: [1, 2, 3, 4, 5, 8, 9, 10],
        status: "Active", feeAmount: 3500, feePaid: 1750,
        promotionHistory: []
    },
    {
        id: 19, admissionNo: "ADM-2023-019",
        photo: "img/figure/student8.png",
        name: "Chirag Joshi", fatherName: "Naveen Joshi", motherName: "Renu Joshi",
        dob: "2012-11-11", gender: "Male", category: "General", religion: "Hindu",
        phone: "9876543228", email: "naveen.joshi@gmail.com",
        address: "99, Aashiana, Lucknow, UP",
        classId: 11, section: "A", session: "2025-2026", rollNo: 1,
        route: 4, loginId: "STU-019", password: "vkis@2025",
        admissionDate: "2017-04-12",
        subjects: [1, 2, 3, 4, 5, 6, 11],
        status: "Active", feeAmount: 5500, feePaid: 5500,
        promotionHistory: []
    },
    {
        id: 20, admissionNo: "ADM-2024-020",
        photo: "img/figure/student9.png",
        name: "Divyanshi Pal", fatherName: "Suresh Pal", motherName: "Kiran Pal",
        dob: "2017-09-02", gender: "Female", category: "OBC", religion: "Hindu",
        phone: "9876543229", email: "suresh.pal@gmail.com",
        address: "37, Bangla Bazaar, Lucknow, UP",
        classId: 5, section: "A", session: "2025-2026", rollNo: 2,
        route: 3, loginId: "STU-020", password: "vkis@2025",
        admissionDate: "2022-04-14",
        subjects: [1, 2, 3, 8, 9, 10, 12],
        status: "Active", feeAmount: 3200, feePaid: 3200,
        promotionHistory: []
    }
];

// ==================== CHARACTER CERTIFICATES ====================
let CHARACTER_CERTIFICATES = [
    {
        id: 1,
        studentId: 17,
        format: "cbse",
        serialNo: "CC-2025-001",
        createdDate: "2025-12-15",
        remarks: "Good",
        conduct: "Very Good"
    }
];

// ==================== PROMOTION RECORDS ====================
let PROMOTION_RECORDS = [];

// ==================== ACTIVITY LOG (legacy template) ====================
let SYSTEM_ACTIVITY_LOG = [
    { id: 1, user: "Admin", action: "Logged In", module: "Auth", timestamp: "2026-02-27 09:00:00", details: "Login from 192.168.1.1" },
    { id: 2, user: "Admin", action: "Viewed", module: "Students", timestamp: "2026-02-27 09:05:00", details: "Viewed Student List" },
    { id: 3, user: "Admin", action: "Added", module: "Students", timestamp: "2026-02-27 09:15:00", details: "Added student Aarav Sharma (ADM-2025-001)" },
    { id: 4, user: "Admin", action: "Edited", module: "Students", timestamp: "2026-02-27 10:00:00", details: "Updated fee for Arjun Patel" },
    { id: 5, user: "Admin", action: "Deleted", module: "Students", timestamp: "2026-02-27 10:30:00", details: "Removed duplicate record #999" }
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get class object by ID
 */
function getClassById(classId) {
    return CLASSES.find(c => c.id === classId) || null;
}

/**
 * Get subject object by ID
 */
function getSubjectById(subjectId) {
    return SUBJECTS.find(s => s.id === subjectId) || null;
}

/**
 * Get route object by ID
 */
function getRouteById(routeId) {
    return ROUTES.find(r => r.id === routeId) || null;
}

/**
 * Get students by class and optional section
 */
function getStudentsByClass(classId, section) {
    return STUDENTS.filter(s => {
        let match = s.classId === classId;
        if (section && section !== "All") {
            match = match && s.section === section;
        }
        return match;
    });
}

/**
 * Sort students array by given criteria
 * @param {Array} students - Array of student objects
 * @param {string} orderBy - 'rollNo' | 'admNo' | 'nameAZ' | 'nameZA'
 */
function sortStudents(students, orderBy) {
    switch (orderBy) {
        case 'admNo':
            students.sort((a, b) => (a.admissionNo || '').localeCompare(b.admissionNo || ''));
            break;
        case 'nameAZ':
            students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'nameZA':
            students.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        default: // rollNo
            students.sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));
            break;
    }
    return students;
}

/**
 * Filter students by multiple criteria
 */
function filterStudents(filters) {
    return STUDENTS.filter(s => {
        let match = true;
        if (filters.classId && filters.classId !== "All") {
            match = match && s.classId === parseInt(filters.classId);
        }
        if (filters.section && filters.section !== "All") {
            match = match && s.section === filters.section;
        }
        if (filters.category && filters.category !== "All") {
            match = match && s.category === filters.category;
        }
        if (filters.session && filters.session !== "All") {
            match = match && s.session === filters.session;
        }
        if (filters.status && filters.status !== "All") {
            match = match && s.status === filters.status;
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            match = match && (
                s.name.toLowerCase().includes(term) ||
                s.admissionNo.toLowerCase().includes(term) ||
                s.fatherName.toLowerCase().includes(term) ||
                s.phone.includes(term)
            );
        }
        return match;
    });
}

/**
 * Generate next admission number
 */
function generateAdmissionNo() {
    const year = new Date().getFullYear();
    const maxNo = STUDENTS.reduce((max, s) => {
        const parts = s.admissionNo.split('-');
        const num = parseInt(parts[2]) || 0;
        return num > max ? num : max;
    }, 0);
    return `ADM-${year}-${String(maxNo + 1).padStart(3, '0')}`;
}

/**
 * Generate next student ID
 */
function generateStudentId() {
    return STUDENTS.length > 0 ? Math.max(...STUDENTS.map(s => s.id)) + 1 : 1;
}

/**
 * Format date to DD/MM/YYYY
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Get student subject names as array
 */
function getStudentSubjectNames(student) {
    return (student.subjects || []).map(sid => {
        const subj = getSubjectById(sid);
        return subj ? subj.name : '';
    }).filter(Boolean);
}

/**
 * Check if student is already promoted for a given session
 */
function isStudentPromoted(studentId, toSession) {
    return PROMOTION_RECORDS.find(p => p.studentId === studentId && p.toSession === toSession) || null;
}

/**
 * Add a new student
 */
function addStudent(studentData) {
    studentData.id = generateStudentId();
    studentData.admissionNo = generateAdmissionNo();
    studentData.promotionHistory = [];
    STUDENTS.push(studentData);
    addActivityLog("Added", "Students", `Added student ${studentData.name} (${studentData.admissionNo})`);
    return studentData;
}

/**
 * Delete a student by ID
 */
function deleteStudent(studentId) {
    const student = STUDENTS.find(s => s.id === studentId);
    if (student) {
        STUDENTS = STUDENTS.filter(s => s.id !== studentId);
        addActivityLog("Deleted", "Students", `Deleted student ${student.name} (${student.admissionNo})`);
        return true;
    }
    return false;
}

/**
 * Add activity log entry
 */
function addActivityLog(action, module, details) {
    ACTIVITY_LOG.push({
        id: ACTIVITY_LOG.length + 1,
        user: "Admin",
        action: action,
        module: module,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        details: details
    });
}

/**
 * Get category-wise student count
 */
function getCategoryWiseCounts() {
    const counts = {};
    CATEGORIES.forEach(cat => {
        counts[cat] = STUDENTS.filter(s => s.category === cat && s.status === 'Active').length;
    });
    return counts;
}

/**
 * Get class-wise student count
 */
function getClassWiseCounts() {
    const counts = {};
    CLASSES.forEach(cls => {
        counts[cls.name] = STUDENTS.filter(s => s.classId === cls.id && s.status === 'Active').length;
    });
    return counts;
}


// ==================== EXAMS ====================

const EXAMS = [
    {
        id: 1, name: 'Unit Test - I', session: '2025-2026', startDate: '2025-07-15', endDate: '2025-07-22',
        dateSheet: [
            { subjectId: 2, date: '2025-07-15', time: '09:00 AM - 11:00 AM' },
            { subjectId: 3, date: '2025-07-16', time: '09:00 AM - 11:00 AM' },
            { subjectId: 1, date: '2025-07-17', time: '09:00 AM - 11:00 AM' },
            { subjectId: 4, date: '2025-07-18', time: '09:00 AM - 11:00 AM' },
            { subjectId: 5, date: '2025-07-19', time: '09:00 AM - 11:00 AM' },
            { subjectId: 8, date: '2025-07-21', time: '09:00 AM - 11:00 AM' },
            { subjectId: 9, date: '2025-07-22', time: '09:00 AM - 11:00 AM' }
        ]
    },
    {
        id: 2, name: 'Half Yearly', session: '2025-2026', startDate: '2025-10-01', endDate: '2025-10-12',
        dateSheet: [
            { subjectId: 1, date: '2025-10-01', time: '09:00 AM - 12:00 PM' },
            { subjectId: 2, date: '2025-10-03', time: '09:00 AM - 12:00 PM' },
            { subjectId: 3, date: '2025-10-05', time: '09:00 AM - 12:00 PM' },
            { subjectId: 4, date: '2025-10-07', time: '09:00 AM - 12:00 PM' },
            { subjectId: 5, date: '2025-10-08', time: '09:00 AM - 12:00 PM' },
            { subjectId: 8, date: '2025-10-10', time: '09:00 AM - 12:00 PM' },
            { subjectId: 9, date: '2025-10-12', time: '09:00 AM - 12:00 PM' }
        ]
    },
    {
        id: 3, name: 'Unit Test - II', session: '2025-2026', startDate: '2025-12-10', endDate: '2025-12-17',
        dateSheet: [
            { subjectId: 3, date: '2025-12-10', time: '09:00 AM - 11:00 AM' },
            { subjectId: 1, date: '2025-12-11', time: '09:00 AM - 11:00 AM' },
            { subjectId: 2, date: '2025-12-12', time: '09:00 AM - 11:00 AM' },
            { subjectId: 5, date: '2025-12-13', time: '09:00 AM - 11:00 AM' },
            { subjectId: 4, date: '2025-12-15', time: '09:00 AM - 11:00 AM' },
            { subjectId: 8, date: '2025-12-16', time: '09:00 AM - 11:00 AM' },
            { subjectId: 9, date: '2025-12-17', time: '09:00 AM - 11:00 AM' }
        ]
    },
    {
        id: 4, name: 'Annual Examination', session: '2025-2026', startDate: '2026-03-01', endDate: '2026-03-15',
        dateSheet: [
            { subjectId: 1, date: '2026-03-01', time: '09:00 AM - 12:00 PM' },
            { subjectId: 2, date: '2026-03-03', time: '09:00 AM - 12:00 PM' },
            { subjectId: 3, date: '2026-03-05', time: '09:00 AM - 12:00 PM' },
            { subjectId: 4, date: '2026-03-07', time: '09:00 AM - 12:00 PM' },
            { subjectId: 5, date: '2026-03-08', time: '09:00 AM - 12:00 PM' },
            { subjectId: 8, date: '2026-03-10', time: '09:00 AM - 12:00 PM' },
            { subjectId: 9, date: '2026-03-12', time: '09:00 AM - 12:00 PM' },
            { subjectId: 10, date: '2026-03-14', time: '09:00 AM - 11:00 AM' },
            { subjectId: 11, date: '2026-03-15', time: '09:00 AM - 11:00 AM' }
        ]
    },
    {
        id: 5, name: 'Pre-Board', session: '2025-2026', startDate: '2026-01-10', endDate: '2026-01-22',
        dateSheet: [
            { subjectId: 1, date: '2026-01-10', time: '09:00 AM - 12:00 PM' },
            { subjectId: 2, date: '2026-01-12', time: '09:00 AM - 12:00 PM' },
            { subjectId: 3, date: '2026-01-14', time: '09:00 AM - 12:00 PM' },
            { subjectId: 4, date: '2026-01-16', time: '09:00 AM - 12:00 PM' },
            { subjectId: 5, date: '2026-01-18', time: '09:00 AM - 12:00 PM' },
            { subjectId: 6, date: '2026-01-20', time: '09:00 AM - 12:00 PM' },
            { subjectId: 7, date: '2026-01-22', time: '09:00 AM - 12:00 PM' }
        ]
    }
];

function getSubjectById(id) {
    return SUBJECTS.find(s => s.id === id);
}


// ==================== TRANSFER CERTIFICATES ====================

let tcCounter = 3;
let TRANSFER_CERTIFICATES = [
    {
        id: 1, tcNo: 'TC/2025-26/001', studentId: 3,
        admissionNo: 'ADM-2025-003', studentName: 'Arjun Patel', fatherName: 'Sunil Patel', motherName: 'Kavita Patel',
        dob: '2014-11-05', dobWords: 'Fifth November Two Thousand Fourteen',
        nationality: 'Indian', category: 'OBC', religion: 'Hindu', gender: 'Male',
        classId: 5, section: 'B', lastClassStudied: '5 / B',
        dateOfAdmission: '2020-04-15', dateOfLeaving: '2025-11-20',
        qualifiedForPromotion: 'Yes', feesPaidUpToDate: 'Yes',
        scholarship: 'None', generalConduct: 'Good', character: 'Good',
        reasonForLeaving: 'Father transferred to another city',
        remarks: 'No dues pending', issueDate: '2025-11-22',
        status: 'Issued'
    },
    {
        id: 2, tcNo: 'TC/2025-26/002', studentId: 6,
        admissionNo: 'ADM-2025-006', studentName: 'Kavya Singh', fatherName: 'Amit Singh', motherName: 'Neha Singh',
        dob: '2015-09-18', dobWords: 'Eighteenth September Two Thousand Fifteen',
        nationality: 'Indian', category: 'General', religion: 'Hindu', gender: 'Female',
        classId: 4, section: 'A', lastClassStudied: '4 / A',
        dateOfAdmission: '2022-04-08', dateOfLeaving: '2025-12-15',
        qualifiedForPromotion: 'Yes', feesPaidUpToDate: 'Yes',
        scholarship: 'None', generalConduct: 'Very Good', character: 'Excellent',
        reasonForLeaving: 'Shifting to another school',
        remarks: 'All dues cleared', issueDate: '2025-12-18',
        status: 'Issued'
    }
];


// ==================== STAFF DESIGNATIONS ====================
const STAFF_DESIGNATIONS = [
    'Principal', 'Vice Principal', 'Teacher',
    'Clerk', 'Accountant', 'Peon', 'Librarian', 'Lab Assistant',
    'Sports Coach', 'Counselor', 'Driver', 'Guard'
];

// ==================== STAFF ====================
let STAFF = [
    {
        id: 1, employeeId: 'EMP-2025-001',
        photo: 'img/figure/teacher1.png',
        name: 'Dr. Rajesh Kumar Sharma', fatherName: 'Late Shri Balram Sharma', husbandName: '',
        dob: '1975-08-15', gender: 'Male', category: 'General', religion: 'Hindu',
        phone: '9876500001', secondaryMobile: '9876500101', email: 'rajesh.sharma@vkis.edu.in',
        address: '12, Civil Lines, Lucknow, UP',
        designation: 'Principal', department: 'Administration',
        qualification: 'Ph.D. (Education), M.Ed., B.Ed.', teachingSubjects: [],
        experience: '25 years',
        joiningDate: '2015-04-01', salary: 85000,
        panNumber: 'ABCPS1234K', pfNumber: 'UP/LKO/00001',
        loginId: 'STAFF-001', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'State Bank of India', branchName: 'Civil Lines', bankAccount: '123456789012', ifsc: 'SBIN0001234', accountType: 'Savings',
        aadharNumber: '1234 5678 9012', lastSchool: '', comments: ''
    },
    {
        id: 2, employeeId: 'EMP-2025-002',
        photo: 'img/figure/teacher2.png',
        name: 'Smt. Anita Mishra', fatherName: 'Shri Ramesh Mishra', husbandName: 'Shri Amit Mishra',
        dob: '1980-03-22', gender: 'Female', category: 'General', religion: 'Hindu',
        phone: '9876500002', secondaryMobile: '', email: 'anita.mishra@vkis.edu.in',
        address: '45, Gomtinagar, Lucknow, UP',
        designation: 'Vice Principal', department: 'Administration',
        qualification: 'M.A. (English), B.Ed.', teachingSubjects: [2],
        experience: '20 years',
        joiningDate: '2016-07-15', salary: 65000,
        panNumber: 'ABCPM2345L', pfNumber: 'UP/LKO/00002',
        loginId: 'STAFF-002', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'State Bank of India', branchName: 'Gomtinagar', bankAccount: '234567890123', ifsc: 'SBIN0002345', accountType: 'Savings',
        aadharNumber: '2345 6789 0123', lastSchool: 'City Montessori School', comments: ''
    },
    {
        id: 3, employeeId: 'EMP-2025-003',
        photo: 'img/figure/teacher3.png',
        name: 'Shri Sunil Verma', fatherName: 'Shri Mohan Verma', husbandName: '',
        dob: '1982-11-10', gender: 'Male', category: 'OBC', religion: 'Hindu',
        phone: '9876500003', secondaryMobile: '', email: 'sunil.verma@vkis.edu.in',
        address: '78, Aliganj, Lucknow, UP',
        designation: 'Teacher', department: 'Science',
        qualification: 'M.Sc. (Physics), B.Ed.', teachingSubjects: [4, 3],
        experience: '15 years',
        joiningDate: '2018-04-01', salary: 48000,
        panNumber: 'ABCPV3456M', pfNumber: 'UP/LKO/00003',
        loginId: 'STAFF-003', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'State Bank of India', branchName: 'Aliganj', bankAccount: '345678901234', ifsc: 'SBIN0003456', accountType: 'Savings',
        aadharNumber: '3456 7890 1234', lastSchool: 'Army Public School', comments: ''
    },
    {
        id: 4, employeeId: 'EMP-2025-004',
        photo: 'img/figure/teacher4.png',
        name: 'Smt. Priya Tiwari', fatherName: 'Shri Arun Tiwari', husbandName: 'Shri Manoj Tiwari',
        dob: '1985-06-28', gender: 'Female', category: 'General', religion: 'Hindu',
        phone: '9876500004', secondaryMobile: '9876500104', email: 'priya.tiwari@vkis.edu.in',
        address: '33, Indira Nagar, Lucknow, UP',
        designation: 'Teacher', department: 'Mathematics',
        qualification: 'M.Sc. (Mathematics), B.Ed.', teachingSubjects: [3],
        experience: '12 years',
        joiningDate: '2019-04-01', salary: 45000,
        panNumber: 'ABCPT4567N', pfNumber: 'UP/LKO/00004',
        loginId: 'STAFF-004', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'Punjab National Bank', branchName: 'Indira Nagar', bankAccount: '456789012345', ifsc: 'SBIN0004567', accountType: 'Savings',
        aadharNumber: '4567 8901 2345', lastSchool: 'Kendriya Vidyalaya', comments: ''
    },
    {
        id: 5, employeeId: 'EMP-2025-005',
        photo: 'img/figure/teacher5.png',
        name: 'Shri Mohd. Irfan', fatherName: 'Shri Mohd. Saleem', husbandName: '',
        dob: '1988-01-05', gender: 'Male', category: 'General', religion: 'Muslim',
        phone: '9876500005', secondaryMobile: '', email: 'irfan@vkis.edu.in',
        address: '56, Aminabad, Lucknow, UP',
        designation: 'Teacher', department: 'Urdu / Social Science',
        qualification: 'M.A. (History), B.Ed.', teachingSubjects: [5, 1],
        experience: '10 years',
        joiningDate: '2020-04-01', salary: 38000,
        panNumber: 'ABCPI5678P', pfNumber: 'UP/LKO/00005',
        loginId: 'STAFF-005', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'Bank of Baroda', branchName: 'Aminabad', bankAccount: '567890123456', ifsc: 'SBIN0005678', accountType: 'Savings',
        aadharNumber: '5678 9012 3456', lastSchool: 'Islamia Inter College', comments: ''
    },
    {
        id: 6, employeeId: 'EMP-2025-006',
        photo: 'img/figure/teacher6.png',
        name: 'Smt. Kavita Yadav', fatherName: 'Shri Banwari Yadav', husbandName: 'Shri Ranjeet Yadav',
        dob: '1990-09-18', gender: 'Female', category: 'OBC', religion: 'Hindu',
        phone: '9876500006', secondaryMobile: '', email: 'kavita.yadav@vkis.edu.in',
        address: '89, Jankipuram, Lucknow, UP',
        designation: 'Teacher', department: 'Hindi',
        qualification: 'M.A. (Hindi), B.Ed.', teachingSubjects: [1],
        experience: '8 years',
        joiningDate: '2021-04-01', salary: 35000,
        panNumber: 'ABCPY6789Q', pfNumber: 'UP/LKO/00006',
        loginId: 'STAFF-006', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'State Bank of India', branchName: 'Jankipuram', bankAccount: '678901234567', ifsc: 'SBIN0006789', accountType: 'Savings',
        aadharNumber: '6789 0123 4567', lastSchool: 'DIET Lucknow', comments: ''
    },
    {
        id: 7, employeeId: 'EMP-2025-007',
        photo: 'img/figure/teacher7.png',
        name: 'Shri Deepak Gupta', fatherName: 'Shri Vinod Gupta', husbandName: '',
        dob: '1992-04-12', gender: 'Male', category: 'General', religion: 'Hindu',
        phone: '9876500007', secondaryMobile: '', email: 'deepak.gupta@vkis.edu.in',
        address: '22, Hazratganj, Lucknow, UP',
        designation: 'Teacher', department: 'Primary',
        qualification: 'B.A., D.El.Ed.', teachingSubjects: [1, 3, 8],
        experience: '6 years',
        joiningDate: '2022-04-01', salary: 28000,
        panNumber: '', pfNumber: '',
        loginId: 'STAFF-007', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'Union Bank of India', branchName: 'Hazratganj', bankAccount: '789012345678', ifsc: 'SBIN0007890', accountType: 'Savings',
        aadharNumber: '7890 1234 5678', lastSchool: '', comments: ''
    },
    {
        id: 8, employeeId: 'EMP-2025-008',
        photo: 'img/figure/teacher8.png',
        name: 'Smt. Neha Pandey', fatherName: 'Shri Suresh Pandey', husbandName: '',
        dob: '1993-12-01', gender: 'Female', category: 'General', religion: 'Hindu',
        phone: '9876500008', secondaryMobile: '', email: 'neha.pandey@vkis.edu.in',
        address: '44, Mahanagar, Lucknow, UP',
        designation: 'Teacher', department: 'Primary',
        qualification: 'B.Sc., D.El.Ed.', teachingSubjects: [3, 4, 8],
        experience: '5 years',
        joiningDate: '2023-04-01', salary: 26000,
        panNumber: '', pfNumber: '',
        loginId: 'STAFF-008', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'State Bank of India', branchName: 'Mahanagar', bankAccount: '890123456789', ifsc: 'SBIN0008901', accountType: 'Savings',
        aadharNumber: '8901 2345 6789', lastSchool: '', comments: ''
    },
    {
        id: 9, employeeId: 'EMP-2025-009',
        photo: 'img/figure/teacher9.png',
        name: 'Shri Ravi Shankar', fatherName: 'Shri Krishna Shankar', husbandName: '',
        dob: '1985-07-07', gender: 'Male', category: 'SC', religion: 'Hindu',
        phone: '9876500009', secondaryMobile: '9876500109', email: 'ravi.shankar@vkis.edu.in',
        address: '67, Charbagh, Lucknow, UP',
        designation: 'Teacher', department: 'English',
        qualification: 'M.A. (English), M.Ed.', teachingSubjects: [2],
        experience: '14 years',
        joiningDate: '2017-04-01', salary: 48000,
        panNumber: 'ABCPS9012R', pfNumber: 'UP/LKO/00009',
        loginId: 'STAFF-009', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'Central Bank of India', branchName: 'Charbagh', bankAccount: '901234567890', ifsc: 'SBIN0009012', accountType: 'Current',
        aadharNumber: '9012 3456 7890', lastSchool: 'Lucknow Public School', comments: ''
    },
    {
        id: 10, employeeId: 'EMP-2025-010',
        photo: 'img/figure/teacher10.png',
        name: 'Shri Amit Kumar', fatherName: 'Shri Baldev Kumar', husbandName: '',
        dob: '1990-05-25', gender: 'Male', category: 'SC', religion: 'Hindu',
        phone: '9876500010', secondaryMobile: '', email: 'amit.kumar@vkis.edu.in',
        address: '11, Alambagh, Lucknow, UP',
        designation: 'Clerk', department: 'Office',
        qualification: 'B.Com., DCA', teachingSubjects: [],
        experience: '7 years',
        joiningDate: '2021-06-01', salary: 22000,
        panNumber: 'ABCPK0123S', pfNumber: 'UP/LKO/00010',
        loginId: 'STAFF-010', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'State Bank of India', branchName: 'Alambagh', bankAccount: '012345678901', ifsc: 'SBIN0010123', accountType: 'Savings',
        aadharNumber: '0123 4567 8901', lastSchool: '', comments: ''
    },
    {
        id: 11, employeeId: 'EMP-2025-011',
        photo: 'img/figure/teacher11.png',
        name: 'Shri Santosh Tripathi', fatherName: 'Shri Jagdish Tripathi', husbandName: '',
        dob: '1983-02-14', gender: 'Male', category: 'General', religion: 'Hindu',
        phone: '9876500011', secondaryMobile: '', email: 'santosh.tripathi@vkis.edu.in',
        address: '55, Rajajipuram, Lucknow, UP',
        designation: 'Accountant', department: 'Accounts',
        qualification: 'M.Com., Tally ERP', teachingSubjects: [],
        experience: '16 years',
        joiningDate: '2017-08-01', salary: 32000,
        panNumber: 'ABCPT1123T', pfNumber: 'UP/LKO/00011',
        loginId: 'STAFF-011', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'Punjab National Bank', branchName: 'Rajajipuram', bankAccount: '112233445566', ifsc: 'SBIN0011234', accountType: 'Savings',
        aadharNumber: '1122 3344 5566', lastSchool: '', comments: ''
    },
    {
        id: 12, employeeId: 'EMP-2025-012',
        photo: 'img/figure/teacher12.png',
        name: 'Smt. Sunita Devi', fatherName: 'Shri Ram Prasad', husbandName: 'Late Shri Mohan Lal',
        dob: '1978-10-30', gender: 'Female', category: 'OBC', religion: 'Hindu',
        phone: '9876500012', secondaryMobile: '', email: 'sunita.devi@vkis.edu.in',
        address: '99, Chinhat, Lucknow, UP',
        designation: 'Librarian', department: 'Library',
        qualification: 'M.Lib.Sc., B.Lib.Sc.', teachingSubjects: [],
        experience: '18 years',
        joiningDate: '2016-04-01', salary: 35000,
        panNumber: 'ABCPD2234U', pfNumber: 'UP/LKO/00012',
        loginId: 'STAFF-012', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'State Bank of India', branchName: 'Chinhat', bankAccount: '223344556677', ifsc: 'SBIN0012345', accountType: 'Savings',
        aadharNumber: '2233 4455 6677', lastSchool: 'UP Government School', comments: ''
    },
    {
        id: 13, employeeId: 'EMP-2025-013',
        photo: 'img/figure/teacher3.png',
        name: 'Shri Vikash Singh', fatherName: 'Shri Rajendra Singh', husbandName: '',
        dob: '1995-03-19', gender: 'Male', category: 'General', religion: 'Hindu',
        phone: '9876500013', secondaryMobile: '', email: 'vikash.singh@vkis.edu.in',
        address: '77, Vikas Nagar, Lucknow, UP',
        designation: 'Sports Coach', department: 'Sports',
        qualification: 'B.P.Ed., M.P.Ed.', teachingSubjects: [11],
        experience: '4 years',
        joiningDate: '2024-04-01', salary: 25000,
        panNumber: '', pfNumber: '',
        loginId: 'STAFF-013', password: 'vkis@staff2025',
        status: 'Active',
        bankName: 'Bank of India', branchName: 'Vikas Nagar', bankAccount: '334455667788', ifsc: 'SBIN0013456', accountType: 'Savings',
        aadharNumber: '3344 5566 7788', lastSchool: '', comments: ''
    },
    {
        id: 14, employeeId: 'EMP-2024-014',
        photo: 'img/figure/teacher5.png',
        name: 'Shri Ramesh Prasad', fatherName: 'Shri Shiv Prasad', husbandName: '',
        dob: '1970-06-20', gender: 'Male', category: 'OBC', religion: 'Hindu',
        phone: '9876500014', secondaryMobile: '', email: '',
        address: '88, Thakurganj, Lucknow, UP',
        designation: 'Peon', department: 'Support',
        qualification: '8th Pass', teachingSubjects: [],
        experience: '22 years',
        joiningDate: '2010-04-01', salary: 15000,
        panNumber: '', pfNumber: '',
        loginId: 'STAFF-014', password: 'vkis@staff2025',
        status: 'Resigned',
        bankName: 'State Bank of India', branchName: 'Thakurganj', bankAccount: '445566778899', ifsc: 'SBIN0014567', accountType: 'Savings',
        aadharNumber: '4455 6677 8899', lastSchool: '', comments: 'Resigned due to health issues'
    },
    {
        id: 15, employeeId: 'EMP-2024-015',
        photo: 'img/figure/teacher6.png',
        name: 'Smt. Pooja Chauhan', fatherName: 'Shri Dinesh Chauhan', husbandName: '',
        dob: '1991-11-08', gender: 'Female', category: 'ST', religion: 'Hindu',
        phone: '9876500015', secondaryMobile: '9876500115', email: 'pooja.chauhan@vkis.edu.in',
        address: '66, Bangla Bazaar, Lucknow, UP',
        designation: 'Teacher', department: 'Computer Science',
        qualification: 'M.C.A., B.Ed.', teachingSubjects: [6],
        experience: '9 years',
        joiningDate: '2020-07-01', salary: 36000,
        panNumber: 'ABCPC5567V', pfNumber: 'UP/LKO/00015',
        loginId: 'STAFF-015', password: 'vkis@staff2025',
        status: 'On Leave',
        bankName: 'HDFC Bank', branchName: 'Bangla Bazaar', bankAccount: '556677889900', ifsc: 'SBIN0015678', accountType: 'Savings',
        aadharNumber: '5566 7788 9900', lastSchool: 'Amity University', comments: 'On maternity leave'
    }
];

// ==================== STAFF HELPER FUNCTIONS ====================

function generateEmployeeId() {
    const year = new Date().getFullYear();
    const maxNo = STAFF.reduce((max, s) => {
        const parts = s.employeeId.split('-');
        const num = parseInt(parts[2]) || 0;
        return num > max ? num : max;
    }, 0);
    return `EMP-${year}-${String(maxNo + 1).padStart(3, '0')}`;
}

function generateStaffId() {
    return STAFF.length > 0 ? Math.max(...STAFF.map(s => s.id)) + 1 : 1;
}

function filterStaff(filters) {
    return STAFF.filter(s => {
        let match = true;
        if (filters.status && filters.status !== 'All') {
            match = match && s.status === filters.status;
        }
        if (filters.designation && filters.designation !== 'All') {
            match = match && s.designation === filters.designation;
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            match = match && (
                s.name.toLowerCase().includes(term) ||
                s.employeeId.toLowerCase().includes(term) ||
                s.phone.includes(term)
            );
        }
        return match;
    });
}

function deleteStaff(staffId) {
    const staff = STAFF.find(s => s.id === staffId);
    if (staff) {
        STAFF = STAFF.filter(s => s.id !== staffId);
        addActivityLog('Deleted', 'Staff', `Deleted staff ${staff.name} (${staff.employeeId})`);
        return true;
    }
    return false;
}

// ==================== STAFF ATTENDANCE ====================

let STAFF_ATTENDANCE = [];

// Auto-generate attendance for last 30 days (excluding Sundays)
(function generateStaffAttendance() {
    const activeStaff = STAFF.filter(s => s.status === 'Active');
    const today = new Date();
    for (let i = 30; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        if (date.getDay() === 0) continue; // Skip Sundays
        const dateStr = date.toISOString().split('T')[0];
        activeStaff.forEach(s => {
            const rand = Math.random();
            let status = 'Present';
            let remark = '';
            if (rand < 0.08) { status = 'Absent'; remark = 'No information'; }
            else if (rand < 0.14) { status = 'Leave'; remark = 'Personal leave'; }
            STAFF_ATTENDANCE.push({
                staffId: s.id,
                date: dateStr,
                status: status,
                remark: remark
            });
        });
    }
})();

function getStaffAttendance(date) {
    return STAFF_ATTENDANCE.filter(a => a.date === date);
}

function saveStaffAttendance(date, records) {
    // Remove existing records for this date
    STAFF_ATTENDANCE = STAFF_ATTENDANCE.filter(a => a.date !== date);
    // Add new records
    records.forEach(r => {
        STAFF_ATTENDANCE.push({
            staffId: r.staffId,
            date: date,
            status: r.status,
            remark: r.remark || ''
        });
    });
    addActivityLog('Saved', 'Staff Attendance', `Saved attendance for ${date}`);
}

function getStaffAttendanceReport(staffId, fromDate, toDate) {
    return STAFF_ATTENDANCE.filter(a => {
        let match = a.date >= fromDate && a.date <= toDate;
        if (staffId) match = match && a.staffId === staffId;
        return match;
    });
}

function getStaffAttendanceSummary(staffId, fromDate, toDate) {
    const records = getStaffAttendanceReport(staffId, fromDate, toDate);
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leave = records.filter(r => r.status === 'Leave').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, leave, total, percentage };
}

// ==================== STUDENT ATTENDANCE ====================

let STUDENT_ATTENDANCE = [];

// Auto-generate attendance for last 30 days (excluding Sundays)
(function generateStudentAttendance() {
    const activeStudents = STUDENTS.filter(s => s.status === 'Active');
    const today = new Date();
    for (let i = 30; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        if (date.getDay() === 0) continue; // Skip Sundays
        const dateStr = date.toISOString().split('T')[0];
        activeStudents.forEach(s => {
            const rand = Math.random();
            let status = 'Present';
            let remark = '';
            if (rand < 0.07) { status = 'Absent'; remark = 'No information'; }
            else if (rand < 0.12) { status = 'Leave'; remark = 'Personal leave'; }
            STUDENT_ATTENDANCE.push({
                studentId: s.id,
                date: dateStr,
                status: status,
                remark: remark
            });
        });
    }
})();

function getStudentAttendance(date) {
    return STUDENT_ATTENDANCE.filter(a => a.date === date);
}

function saveStudentAttendance(date, records) {
    // Remove existing records for this date matching these students
    const studentIds = records.map(r => r.studentId);
    STUDENT_ATTENDANCE = STUDENT_ATTENDANCE.filter(a => !(a.date === date && studentIds.includes(a.studentId)));
    // Add new records
    records.forEach(r => {
        STUDENT_ATTENDANCE.push({
            studentId: r.studentId,
            date: date,
            status: r.status,
            remark: r.remark || ''
        });
    });
    addActivityLog('Saved', 'Student Attendance', `Saved attendance for ${date}`);
}

function getStudentAttendanceReport(studentId, fromDate, toDate) {
    return STUDENT_ATTENDANCE.filter(a => {
        let match = a.date >= fromDate && a.date <= toDate;
        if (studentId) match = match && a.studentId === studentId;
        return match;
    });
}

function getStudentAttendanceSummary(studentId, fromDate, toDate) {
    const records = getStudentAttendanceReport(studentId, fromDate, toDate);
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leave = records.filter(r => r.status === 'Leave').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, leave, total, percentage };
}

/**
 * Get date-wise attendance summary for a class/section
 */
function getStudentAttendanceDateWise(classId, section, fromDate, toDate) {
    const students = STUDENTS.filter(s => s.status === 'Active' && s.classId === classId && s.section === section);
    const studentIds = students.map(s => s.id);
    const records = STUDENT_ATTENDANCE.filter(a => a.date >= fromDate && a.date <= toDate && studentIds.includes(a.studentId));

    // Group by date
    const dateMap = {};
    records.forEach(r => {
        if (!dateMap[r.date]) dateMap[r.date] = { date: r.date, present: 0, absent: 0, leave: 0, total: 0 };
        dateMap[r.date].total++;
        if (r.status === 'Present') dateMap[r.date].present++;
        else if (r.status === 'Absent') dateMap[r.date].absent++;
        else if (r.status === 'Leave') dateMap[r.date].leave++;
    });

    return Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));
}

// ==================== NOTICES ====================
let noticeCounter = 6;
let NOTICES = [
    { id: 1, date: '2026-03-03', notice: 'Annual examination schedule has been published. All students must check the notice board for details.', displayTo: ['students', 'teachers'], createdAt: '2026-03-03' },
    { id: 2, date: '2026-03-01', notice: 'Parent-Teacher Meeting scheduled for 10th March 2026. Parents are requested to attend without fail.', displayTo: ['students', 'teachers', 'school'], createdAt: '2026-03-01' },
    { id: 3, date: '2026-02-25', notice: 'Sports Day will be held on 15th March. Students interested in events must register with PT teacher.', displayTo: ['students', 'teachers', 'school', 'users'], createdAt: '2026-02-25' },
    { id: 4, date: '2026-02-20', notice: 'Fee submission last date extended to 28th February 2026. Late fee will apply after the deadline.', displayTo: ['students', 'school'], createdAt: '2026-02-20' },
    { id: 5, date: '2026-02-15', notice: 'Staff meeting on 18th February at 3:00 PM in the conference hall. Attendance is mandatory.', displayTo: ['teachers', 'school'], createdAt: '2026-02-15' }
];

function addNotice(data) {
    const n = { id: noticeCounter++, date: data.date, notice: data.notice, displayTo: data.displayTo || [], createdAt: new Date().toISOString().split('T')[0] };
    NOTICES.unshift(n);
    return n;
}
function updateNotice(id, data) {
    const n = NOTICES.find(x => x.id === id);
    if (n) { n.date = data.date; n.notice = data.notice; n.displayTo = data.displayTo || []; }
    return n;
}
function deleteNotice(id) { NOTICES = NOTICES.filter(x => x.id !== id); }

// ==================== TIMETABLE ====================
let timetableCounter = 25;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
    { no: 1, time: '08:00 - 08:40' },
    { no: 2, time: '08:40 - 09:20' },
    { no: 3, time: '09:20 - 10:00' },
    { no: 4, time: '10:15 - 10:55' },
    { no: 5, time: '10:55 - 11:35' },
    { no: 6, time: '11:35 - 12:15' },
    { no: 7, time: '12:45 - 01:25' },
    { no: 8, time: '01:25 - 02:05' }
];

let TIMETABLE = [];
// Auto-generate sample timetable for Class 5 Section A
(function () {
    const subjectIds = [1, 2, 3, 4, 5, 6, 11];
    const teacherIds = STAFF.filter(s => s.designation === 'Teacher' && s.status === 'Active').map(s => s.id);
    let id = 1;
    DAYS.forEach(day => {
        PERIODS.forEach((p, idx) => {
            if (idx < 6) {
                TIMETABLE.push({
                    id: id++,
                    day: day,
                    periodNo: p.no,
                    time: p.time,
                    classId: 8,
                    section: 'A',
                    subjectId: subjectIds[idx % subjectIds.length],
                    teacherId: teacherIds[idx % teacherIds.length]
                });
            }
        });
    });
    timetableCounter = id;
})();

function getTeachers() { return STAFF.filter(s => s.designation === 'Teacher' && s.status === 'Active'); }

function addTimetableEntry(data) {
    const entry = { id: timetableCounter++, day: data.day, periodNo: data.periodNo, time: data.time || PERIODS.find(p => p.no === data.periodNo)?.time || '', classId: data.classId, section: data.section, subjectId: data.subjectId, teacherId: data.teacherId };
    TIMETABLE.push(entry);
    return entry;
}
function updateTimetableEntry(id, data) {
    const e = TIMETABLE.find(x => x.id === id);
    if (e) { Object.assign(e, data); if (!data.time && data.periodNo) e.time = PERIODS.find(p => p.no === data.periodNo)?.time || e.time; }
    return e;
}
function deleteTimetableEntry(id) { TIMETABLE = TIMETABLE.filter(x => x.id !== id); }

function filterTimetable(filters) {
    return TIMETABLE.filter(t => {
        let match = true;
        if (filters.day) match = match && t.day === filters.day;
        if (filters.classId) match = match && t.classId === parseInt(filters.classId);
        if (filters.section && filters.section !== 'All') match = match && t.section === filters.section;
        if (filters.subjectId) match = match && t.subjectId === parseInt(filters.subjectId);
        if (filters.teacherId) match = match && t.teacherId === parseInt(filters.teacherId);
        return match;
    }).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.periodNo - b.periodNo);
}

// ==================== COURSE SCHEDULE ====================
let scheduleCounter = 8;
let COURSE_SCHEDULES = [
    { id: 1, classId: 8, subjectId: 3, examId: 1, schedule: '2026-02-01 to 2026-02-15', topic: 'Algebra — Linear Equations', assignment: 'Exercise 5.1, 5.2' },
    { id: 2, classId: 8, subjectId: 3, examId: 1, schedule: '2026-02-16 to 2026-02-28', topic: 'Geometry — Triangles', assignment: 'Draw and label triangle types' },
    { id: 3, classId: 8, subjectId: 4, examId: 1, schedule: '2026-02-01 to 2026-02-20', topic: 'Light — Reflection & Refraction', assignment: 'Lab report + Ex 10' },
    { id: 4, classId: 8, subjectId: 2, examId: 2, schedule: '2026-01-10 to 2026-03-15', topic: 'Grammar — Tenses & Voice', assignment: 'Worksheet 3, 4' },
    { id: 5, classId: 8, subjectId: 1, examId: 2, schedule: '2026-01-10 to 2026-03-15', topic: 'कविता — साखी, पद', assignment: 'प्रश्न-उत्तर लिखें' },
    { id: 6, classId: 8, subjectId: 5, examId: 4, schedule: '2026-01-01 to 2026-03-30', topic: 'History — Indian Freedom Movement', assignment: 'Map work + Essay' },
    { id: 7, classId: 9, subjectId: 3, examId: 1, schedule: '2026-02-01 to 2026-02-15', topic: 'Number System — Real Numbers', assignment: 'NCERT Ex 1.1–1.4' }
];

function addSchedule(data) {
    const s = { id: scheduleCounter++, classId: parseInt(data.classId), subjectId: parseInt(data.subjectId), examId: data.examId ? parseInt(data.examId) : null, schedule: data.schedule, topic: data.topic, assignment: data.assignment || '' };
    COURSE_SCHEDULES.push(s);
    return s;
}
function updateSchedule(id, data) {
    const s = COURSE_SCHEDULES.find(x => x.id === id);
    if (s) { Object.assign(s, { classId: parseInt(data.classId), subjectId: parseInt(data.subjectId), examId: data.examId ? parseInt(data.examId) : null, schedule: data.schedule, topic: data.topic, assignment: data.assignment || '' }); }
    return s;
}
function deleteSchedule(id) { COURSE_SCHEDULES = COURSE_SCHEDULES.filter(x => x.id !== id); }

function filterSchedules(filters) {
    return COURSE_SCHEDULES.filter(s => {
        let match = true;
        if (filters.classId) match = match && s.classId === parseInt(filters.classId);
        if (filters.subjectId) match = match && s.subjectId === parseInt(filters.subjectId);
        if (filters.examId && filters.examId !== 'all') match = match && s.examId === parseInt(filters.examId);
        return match;
    });
}

// ==================== SYLLABUS ====================
let syllabusCounter = 6;
let SYLLABI = [
    { id: 1, classId: 8, subjectId: 3, title: 'Mathematics — Class 5 Full Syllabus', note: 'Covers all chapters as per CBSE 2025-26 curriculum', fileName: 'maths_class5_syllabus.pdf', status: 'Published', createdAt: '2026-01-15' },
    { id: 2, classId: 8, subjectId: 4, title: 'Science — Class 5 Complete Syllabus', note: 'Theory + Practical syllabus included', fileName: 'science_class5_syllabus.pdf', status: 'Published', createdAt: '2026-01-15' },
    { id: 3, classId: 8, subjectId: 2, title: 'English Language & Literature', note: 'Grammar, writing, literature sections', fileName: 'english_class5.pdf', status: 'Published', createdAt: '2026-01-16' },
    { id: 4, classId: 9, subjectId: 3, title: 'Mathematics — Class 6 Syllabus', note: 'Draft version — pending review', fileName: '', status: 'Draft', createdAt: '2026-02-10' },
    { id: 5, classId: 8, subjectId: 1, title: 'हिंदी — कक्षा 5 पाठ्यक्रम', note: 'व्याकरण, पत्र लेखन, कविता', fileName: 'hindi_class5.pdf', status: 'Published', createdAt: '2026-01-17' }
];

function addSyllabus(data) {
    const s = { id: syllabusCounter++, classId: parseInt(data.classId), subjectId: parseInt(data.subjectId), title: data.title, note: data.note || '', fileName: data.fileName || '', status: data.status || 'Draft', createdAt: new Date().toISOString().split('T')[0] };
    SYLLABI.push(s);
    return s;
}
function updateSyllabus(id, data) {
    const s = SYLLABI.find(x => x.id === id);
    if (s) { Object.assign(s, { classId: parseInt(data.classId), subjectId: parseInt(data.subjectId), title: data.title, note: data.note || '', fileName: data.fileName || s.fileName, status: data.status || s.status }); }
    return s;
}
function deleteSyllabus(id) { SYLLABI = SYLLABI.filter(x => x.id !== id); }

// ==================== DATE SHEETS ====================
let dateSheetCounter = 4;
let dateSheetEntryCounter = 30;
let DATE_SHEETS = [
    {
        id: 1, examId: 4, publishDate: '2026-02-20', status: 'Published', createdAt: '2026-02-15',
        entries: [
            { id: 1, date: '2026-03-01', timeFrom: '09:00', timeTo: '12:00', classId: 8, subjectId: 1 },
            { id: 2, date: '2026-03-03', timeFrom: '09:00', timeTo: '12:00', classId: 8, subjectId: 2 },
            { id: 3, date: '2026-03-05', timeFrom: '09:00', timeTo: '12:00', classId: 8, subjectId: 3 },
            { id: 4, date: '2026-03-07', timeFrom: '09:00', timeTo: '12:00', classId: 8, subjectId: 4 },
            { id: 5, date: '2026-03-08', timeFrom: '09:00', timeTo: '12:00', classId: 8, subjectId: 5 },
            { id: 6, date: '2026-03-10', timeFrom: '09:00', timeTo: '11:00', classId: 8, subjectId: 8 },
            { id: 7, date: '2026-03-12', timeFrom: '09:00', timeTo: '11:00', classId: 8, subjectId: 9 },
            { id: 8, date: '2026-03-01', timeFrom: '09:00', timeTo: '12:00', classId: 9, subjectId: 1 },
            { id: 9, date: '2026-03-03', timeFrom: '09:00', timeTo: '12:00', classId: 9, subjectId: 2 },
            { id: 10, date: '2026-03-05', timeFrom: '09:00', timeTo: '12:00', classId: 9, subjectId: 3 },
            { id: 11, date: '2026-03-07', timeFrom: '09:00', timeTo: '12:00', classId: 9, subjectId: 4 },
            { id: 12, date: '2026-03-09', timeFrom: '09:00', timeTo: '12:00', classId: 9, subjectId: 5 },
            { id: 13, date: '2026-03-11', timeFrom: '09:00', timeTo: '11:00', classId: 9, subjectId: 6 },
            { id: 14, date: '2026-03-13', timeFrom: '09:00', timeTo: '11:00', classId: 9, subjectId: 7 }
        ]
    },
    {
        id: 2, examId: 1, publishDate: '2025-07-05', status: 'Published', createdAt: '2025-07-01',
        entries: [
            { id: 15, date: '2025-07-15', timeFrom: '09:00', timeTo: '11:00', classId: 8, subjectId: 2 },
            { id: 16, date: '2025-07-16', timeFrom: '09:00', timeTo: '11:00', classId: 8, subjectId: 3 },
            { id: 17, date: '2025-07-17', timeFrom: '09:00', timeTo: '11:00', classId: 8, subjectId: 1 },
            { id: 18, date: '2025-07-18', timeFrom: '09:00', timeTo: '11:00', classId: 8, subjectId: 4 },
            { id: 19, date: '2025-07-19', timeFrom: '09:00', timeTo: '11:00', classId: 8, subjectId: 5 }
        ]
    },
    {
        id: 3, examId: 2, publishDate: '2025-09-20', status: 'Draft', createdAt: '2025-09-18',
        entries: [
            { id: 20, date: '2025-10-01', timeFrom: '09:00', timeTo: '12:00', classId: 8, subjectId: 1 },
            { id: 21, date: '2025-10-03', timeFrom: '09:00', timeTo: '12:00', classId: 8, subjectId: 2 },
            { id: 22, date: '2025-10-05', timeFrom: '09:00', timeTo: '12:00', classId: 8, subjectId: 3 }
        ]
    }
];

function addDateSheet(data) {
    const ds = { id: dateSheetCounter++, examId: parseInt(data.examId), publishDate: data.publishDate, status: data.status || 'Draft', createdAt: new Date().toISOString().split('T')[0], entries: [] };
    DATE_SHEETS.push(ds);
    return ds;
}
function updateDateSheet(id, data) {
    const ds = DATE_SHEETS.find(x => x.id === id);
    if (ds) { ds.examId = parseInt(data.examId); ds.publishDate = data.publishDate; ds.status = data.status || ds.status; }
    return ds;
}
function deleteDateSheet(id) { DATE_SHEETS = DATE_SHEETS.filter(x => x.id !== id); }

function addDateSheetEntry(sheetId, data) {
    const ds = DATE_SHEETS.find(x => x.id === sheetId);
    if (!ds) return null;
    const entry = { id: dateSheetEntryCounter++, date: data.date, timeFrom: data.timeFrom, timeTo: data.timeTo, classId: parseInt(data.classId), subjectId: parseInt(data.subjectId) };
    ds.entries.push(entry);
    return entry;
}
function updateDateSheetEntry(sheetId, entryId, data) {
    const ds = DATE_SHEETS.find(x => x.id === sheetId);
    if (!ds) return null;
    const e = ds.entries.find(x => x.id === entryId);
    if (e) { Object.assign(e, { date: data.date, timeFrom: data.timeFrom, timeTo: data.timeTo, classId: parseInt(data.classId), subjectId: parseInt(data.subjectId) }); }
    return e;
}
function deleteDateSheetEntry(sheetId, entryId) {
    const ds = DATE_SHEETS.find(x => x.id === sheetId);
    if (ds) { ds.entries = ds.entries.filter(x => x.id !== entryId); }
}
function getDateSheetById(id) { return DATE_SHEETS.find(x => x.id === id); }

// ==================== HOLIDAYS ====================
let holidayCounter = 8;
let HOLIDAYS = [
    { id: 1, date: '2026-01-26', title: 'Republic Day', description: 'National holiday — Republic Day celebration' },
    { id: 2, date: '2026-03-14', title: 'Holi', description: 'Festival of colours' },
    { id: 3, date: '2026-04-14', title: 'Ambedkar Jayanti', description: 'Dr. B.R. Ambedkar birth anniversary' },
    { id: 4, date: '2026-05-01', title: 'Summer Break Begins', description: 'School closed for summer vacation' },
    { id: 5, date: '2026-08-15', title: 'Independence Day', description: 'National holiday — Independence Day' },
    { id: 6, date: '2026-10-02', title: 'Gandhi Jayanti', description: 'Mahatma Gandhi birth anniversary' },
    { id: 7, date: '2026-11-04', title: 'Diwali', description: 'Festival of lights — school closed' }
];
function addHoliday(d) { const h = { id: holidayCounter++, date: d.date, title: d.title, description: d.description || '' }; HOLIDAYS.push(h); return h; }
function updateHoliday(id, d) { const h = HOLIDAYS.find(x => x.id === id); if (h) Object.assign(h, { date: d.date, title: d.title, description: d.description || '' }); return h; }
function deleteHoliday(id) { HOLIDAYS = HOLIDAYS.filter(x => x.id !== id); }

// ==================== ACTIVITY CALENDAR ====================
let classGroupCounter = 4;
let CLASS_GROUPS = [
    { id: 1, name: 'Primary (Nursery–5)', classIds: [1, 2, 3, 4, 5, 6, 7, 8] },
    { id: 2, name: 'Middle (6–8)', classIds: [9, 10, 11] },
    { id: 3, name: 'Senior (9–12)', classIds: [12, 13, 14, 15] }
];
function addClassGroup(d) { const g = { id: classGroupCounter++, name: d.name, classIds: d.classIds || [] }; CLASS_GROUPS.push(g); return g; }

let activityCounter = 8;
let ACTIVITIES = [
    { id: 1, date: '2026-01-15', classGroupId: 1, event: 'Annual Sports Day', description: 'Track & field events for primary students' },
    { id: 2, date: '2026-02-10', classGroupId: 2, event: 'Science Exhibition', description: 'Working models and projects showcase' },
    { id: 3, date: '2026-02-14', classGroupId: 3, event: 'Career Counselling Session', description: 'Guest lecture by IIT alumni' },
    { id: 4, date: '2026-03-20', classGroupId: 1, event: 'Art Competition', description: 'Drawing and painting competition' },
    { id: 5, date: '2026-04-05', classGroupId: 2, event: 'Quiz Competition', description: 'Inter-class quiz — General Knowledge' },
    { id: 6, date: '2026-07-01', classGroupId: 1, event: 'Yoga Day Celebration', description: 'International Yoga Day activities' },
    { id: 7, date: '2026-08-14', classGroupId: 3, event: 'Independence Day Rehearsal', description: 'Flag hoisting rehearsal and cultural programme' }
];
function addActivity(d) { const a = { id: activityCounter++, date: d.date, classGroupId: parseInt(d.classGroupId), event: d.event, description: d.description || '' }; ACTIVITIES.push(a); return a; }
function updateActivity(id, d) { const a = ACTIVITIES.find(x => x.id === id); if (a) Object.assign(a, { date: d.date, classGroupId: parseInt(d.classGroupId), event: d.event, description: d.description || '' }); return a; }
function deleteActivity(id) { ACTIVITIES = ACTIVITIES.filter(x => x.id !== id); }

// ==================== HOMEWORK ====================
let homeworkCounter = 8;
const HOMEWORK_TYPES = ['Assignment', 'Worksheet', 'Project', 'Reading', 'Practice'];
let HOMEWORKS = [
    { id: 1, date: '2026-03-01', classId: 8, subjectId: 3, homework: 'Complete Exercise 12.3 — Fractions', type: 'Practice', status: 'Active' },
    { id: 2, date: '2026-03-01', classId: 8, subjectId: 2, homework: 'Write essay on "My School" (200 words)', type: 'Assignment', status: 'Active' },
    { id: 3, date: '2026-03-02', classId: 9, subjectId: 4, homework: 'Prepare lab report — Acids & Bases experiment', type: 'Project', status: 'Active' },
    { id: 4, date: '2026-03-02', classId: 8, subjectId: 1, homework: 'पाठ 5 पढ़ कर प्रश्न उत्तर लिखें', type: 'Assignment', status: 'Active' },
    { id: 5, date: '2026-03-03', classId: 9, subjectId: 3, homework: 'Solve NCERT Ex. 7.1 & 7.2 — Coordinate Geometry', type: 'Practice', status: 'Active' },
    { id: 6, date: '2026-02-28', classId: 8, subjectId: 5, homework: 'Map work — Mark rivers of India', type: 'Worksheet', status: 'Completed' },
    { id: 7, date: '2026-02-27', classId: 9, subjectId: 2, homework: 'Read Chapter 8 — The Selfish Giant', type: 'Reading', status: 'Completed' }
];
function addHomework(d) { const h = { id: homeworkCounter++, date: d.date, classId: parseInt(d.classId), subjectId: parseInt(d.subjectId), homework: d.homework, type: d.type || 'Assignment', status: d.status || 'Active' }; HOMEWORKS.push(h); return h; }
function updateHomework(id, d) { const h = HOMEWORKS.find(x => x.id === id); if (h) Object.assign(h, { date: d.date, classId: parseInt(d.classId), subjectId: parseInt(d.subjectId), homework: d.homework, type: d.type, status: d.status }); return h; }
function deleteHomework(id) { HOMEWORKS = HOMEWORKS.filter(x => x.id !== id); }

// ==================== PHOTO GALLERY ====================
let galleryCounter = 5;
let GALLERIES = [
    { id: 1, date: '2026-01-26', title: 'Republic Day Celebration 2026', status: 'Published', photos: ['republic_day_1.jpg', 'republic_day_2.jpg', 'republic_day_3.jpg', 'republic_day_4.jpg', 'republic_day_5.jpg'] },
    { id: 2, date: '2026-02-10', title: 'Science Exhibition', status: 'Published', photos: ['science_1.jpg', 'science_2.jpg', 'science_3.jpg'] },
    { id: 3, date: '2026-01-15', title: 'Annual Sports Day', status: 'Published', photos: ['sports_1.jpg', 'sports_2.jpg', 'sports_3.jpg', 'sports_4.jpg', 'sports_5.jpg', 'sports_6.jpg'] },
    { id: 4, date: '2026-03-01', title: 'Classroom Activities — March', status: 'Draft', photos: ['class_1.jpg', 'class_2.jpg'] }
];
function addGallery(d) { const g = { id: galleryCounter++, date: d.date, title: d.title, status: d.status || 'Draft', photos: d.photos || [] }; GALLERIES.push(g); return g; }
function updateGallery(id, d) { const g = GALLERIES.find(x => x.id === id); if (g) Object.assign(g, { date: d.date, title: d.title, status: d.status, photos: d.photos || g.photos }); return g; }
function deleteGallery(id) { GALLERIES = GALLERIES.filter(x => x.id !== id); }

// ==================== TEACHER PERMISSIONS ====================
const PERMISSION_MODULES = ['Student Attendance', 'Homework'];
let permissionCounter = 8;
let TEACHER_PERMISSIONS = [
    { id: 1, staffId: 3, classId: 8, sectionId: 1, subjectId: 3, modules: ['Student Attendance', 'Homework'] },
    { id: 2, staffId: 3, classId: 8, sectionId: 2, subjectId: 3, modules: ['Student Attendance'] },
    { id: 3, staffId: 4, classId: 9, sectionId: 1, subjectId: 4, modules: ['Student Attendance', 'Homework'] },
    { id: 4, staffId: 5, classId: 9, sectionId: 2, subjectId: 2, modules: ['Homework'] },
    { id: 5, staffId: 6, classId: 8, sectionId: 1, subjectId: 1, modules: ['Student Attendance'] },
    { id: 6, staffId: 7, classId: 11, sectionId: 1, subjectId: 5, modules: ['Student Attendance', 'Homework'] },
    { id: 7, staffId: 8, classId: 12, sectionId: 1, subjectId: 6, modules: ['Student Attendance', 'Homework'] }
];
function addPermission(d) { const p = { id: permissionCounter++, staffId: parseInt(d.staffId), classId: parseInt(d.classId), sectionId: parseInt(d.sectionId), subjectId: parseInt(d.subjectId), modules: d.modules || [] }; TEACHER_PERMISSIONS.push(p); return p; }
function updatePermission(id, d) { const p = TEACHER_PERMISSIONS.find(x => x.id === id); if (p) Object.assign(p, { staffId: parseInt(d.staffId), classId: parseInt(d.classId), sectionId: parseInt(d.sectionId), subjectId: parseInt(d.subjectId), modules: d.modules || [] }); return p; }
function deletePermission(id) { TEACHER_PERMISSIONS = TEACHER_PERMISSIONS.filter(x => x.id !== id); }

// ==================== FEE STRUCTURE & DEPOSITS ====================
const PAYMENT_MODES = ['Cash', 'Online / UPI', 'Bank Transfer', 'Cheque', 'DD'];
const FEE_MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
let receiptCounter = 1013;
let FEE_DEPOSITS = [
    { id: 1, receiptNo: 'REC-1001', date: '2026-01-10', studentId: 1, month: 'January', particulars: [1, 3], amounts: { 1: 2500, 3: 800 }, totalAmount: 3300, lateFee: 0, concession: 0, grandTotal: 3300, receivedAmount: 3300, balance: 0, paymentMode: 'Cash', category: 'Old', remarks: '' },
    { id: 2, receiptNo: 'REC-1002', date: '2026-01-12', studentId: 2, month: 'January', particulars: [1, 2], amounts: { 1: 2500, 2: 1200 }, totalAmount: 3700, lateFee: 0, concession: 200, grandTotal: 3500, receivedAmount: 3500, balance: 0, paymentMode: 'Online / UPI', category: 'Old', remarks: 'Sibling discount' },
    { id: 3, receiptNo: 'REC-1003', date: '2026-02-05', studentId: 1, month: 'February', particulars: [1], amounts: { 1: 2500 }, totalAmount: 2500, lateFee: 0, concession: 0, grandTotal: 2500, receivedAmount: 2500, balance: 0, paymentMode: 'Cash', category: 'Old', remarks: '' },
    { id: 4, receiptNo: 'REC-1004', date: '2026-02-08', studentId: 3, month: 'February', particulars: [1, 2, 3], amounts: { 1: 2500, 2: 1200, 3: 800 }, totalAmount: 4500, lateFee: 100, concession: 0, grandTotal: 4600, receivedAmount: 4000, balance: 600, paymentMode: 'Bank Transfer', category: 'Old', remarks: 'Partial payment' },
    { id: 5, receiptNo: 'REC-1005', date: '2026-01-15', studentId: 4, month: 'January', particulars: [1, 5], amounts: { 1: 2500, 5: 400 }, totalAmount: 2900, lateFee: 0, concession: 0, grandTotal: 2900, receivedAmount: 2900, balance: 0, paymentMode: 'Cash', category: 'Old', remarks: '' },
    { id: 6, receiptNo: 'REC-1006', date: '2026-01-18', studentId: 5, month: 'January', particulars: [1, 2, 3, 5], amounts: { 1: 2500, 2: 1200, 3: 800, 5: 400 }, totalAmount: 4900, lateFee: 0, concession: 0, grandTotal: 4900, receivedAmount: 4900, balance: 0, paymentMode: 'Online / UPI', category: 'Old', remarks: '' },
    { id: 7, receiptNo: 'REC-1007', date: '2026-02-10', studentId: 6, month: 'February', particulars: [1, 6], amounts: { 1: 2500, 6: 600 }, totalAmount: 3100, lateFee: 50, concession: 0, grandTotal: 3150, receivedAmount: 2000, balance: 1150, paymentMode: 'Cash', category: 'Old', remarks: 'Partial payment' },
    { id: 8, receiptNo: 'REC-1008', date: '2026-02-12', studentId: 7, month: 'February', particulars: [1, 2], amounts: { 1: 2500, 2: 1200 }, totalAmount: 3700, lateFee: 0, concession: 300, grandTotal: 3400, receivedAmount: 3400, balance: 0, paymentMode: 'Cheque', category: 'Old', remarks: '' },
    { id: 9, receiptNo: 'REC-1009', date: '2026-03-01', studentId: 1, month: 'March', particulars: [1, 2, 3], amounts: { 1: 2500, 2: 1200, 3: 800 }, totalAmount: 4500, lateFee: 0, concession: 0, grandTotal: 4500, receivedAmount: 4500, balance: 0, paymentMode: 'Online / UPI', category: 'Old', remarks: '' },
    { id: 10, receiptNo: 'REC-1010', date: '2026-03-05', studentId: 9, month: 'March', particulars: [1, 3, 4], amounts: { 1: 2500, 3: 800, 4: 500 }, totalAmount: 3800, lateFee: 0, concession: 0, grandTotal: 3800, receivedAmount: 3800, balance: 0, paymentMode: 'DD', category: 'Old', remarks: '' },
    { id: 11, receiptNo: 'REC-1011', date: '2026-03-08', studentId: 11, month: 'January', particulars: [1, 2, 5], amounts: { 1: 2500, 2: 1200, 5: 400 }, totalAmount: 4100, lateFee: 200, concession: 0, grandTotal: 4300, receivedAmount: 3000, balance: 1300, paymentMode: 'Cash', category: 'Old', remarks: 'Late + partial' },
    { id: 12, receiptNo: 'REC-1012', date: '2026-03-10', studentId: 13, month: 'March', particulars: [1, 2, 3, 4, 5], amounts: { 1: 2500, 2: 1200, 3: 800, 4: 500, 5: 400 }, totalAmount: 5400, lateFee: 0, concession: 500, grandTotal: 4900, receivedAmount: 4900, balance: 0, paymentMode: 'Bank Transfer', category: 'Old', remarks: 'Full payment with concession' }
];
function addFeeDeposit(d) {
    const dep = { id: receiptCounter, receiptNo: 'REC-' + receiptCounter, date: d.date, studentId: parseInt(d.studentId), month: d.month, particulars: d.particulars, amounts: d.amounts, totalAmount: d.totalAmount, lateFee: d.lateFee || 0, concession: d.concession || 0, grandTotal: d.grandTotal, receivedAmount: d.receivedAmount, balance: d.balance || 0, paymentMode: d.paymentMode, category: d.category || 'Old', remarks: d.remarks || '' };
    receiptCounter++;
    FEE_DEPOSITS.push(dep);
    return dep;
}
function deleteFeeDeposit(id) { FEE_DEPOSITS = FEE_DEPOSITS.filter(d => d.id !== id); }
function getStudentBalance(studentId) {
    return FEE_DEPOSITS.filter(d => d.studentId === parseInt(studentId)).reduce((sum, d) => sum + d.balance, 0);
}

// ==================== FEE DISCOUNTS ====================
let discountCounter = 4;
let FEE_DISCOUNTS = [
    { id: 1, studentId: 2, session: '2025-2026', discounts: { 1: 200, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
    { id: 2, studentId: 7, session: '2025-2026', discounts: { 1: 300, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 } },
    { id: 3, studentId: 13, session: '2025-2026', discounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 500, 6: 0, 7: 0 } }
];
function getStudentDiscount(studentId, session) {
    return FEE_DISCOUNTS.find(d => d.studentId === parseInt(studentId) && d.session === session) || null;
}
function saveStudentDiscount(studentId, session, discounts) {
    const existing = FEE_DISCOUNTS.find(d => d.studentId === parseInt(studentId) && d.session === session);
    if (existing) { existing.discounts = discounts; return existing; }
    const d = { id: discountCounter++, studentId: parseInt(studentId), session: session, discounts: discounts };
    FEE_DISCOUNTS.push(d);
    return d;
}

// ==================== PAYROLL — DEDUCTION HEADS ====================
let deductionHeadCounter = 4;
let DEDUCTION_HEADS = [
    { id: 1, name: 'Provident Fund (PF)' },
    { id: 2, name: 'TDS (Tax Deducted at Source)' },
    { id: 3, name: 'Professional Tax' }
];
function addDeductionHead(name) { const h = { id: deductionHeadCounter++, name: name }; DEDUCTION_HEADS.push(h); return h; }
function deleteDeductionHead(id) { DEDUCTION_HEADS = DEDUCTION_HEADS.filter(h => h.id !== id); }

// ==================== PAYROLL — ALLOWANCE HEADS ====================
let allowanceHeadCounter = 5;
let ALLOWANCE_HEADS = [
    { id: 1, name: 'House Rent Allowance (HRA)' },
    { id: 2, name: 'Dearness Allowance (DA)' },
    { id: 3, name: 'Travel Allowance (TA)' },
    { id: 4, name: 'Medical Allowance' }
];
function addAllowanceHead(name) { const h = { id: allowanceHeadCounter++, name: name }; ALLOWANCE_HEADS.push(h); return h; }
function deleteAllowanceHead(id) { ALLOWANCE_HEADS = ALLOWANCE_HEADS.filter(h => h.id !== id); }

// ==================== PAYROLL — SALARY SETTINGS ====================
let SALARY_SETTINGS = {
    leaveAllowedPerMonth: 2,
    latePenalty: 'quarter'  // 'quarter' = 1/4 day salary, 'half' = 1/2 day, 'full' = full day
};

// ==================== PAYROLL — GENERATED SALARIES ====================
let salaryCounter = 4;
let GENERATED_SALARIES = [
    { id: 1, staffId: 3, month: 'January', year: 2026, absentDays: 1, lateDays: 2, halfDays: 0, totalDeductedDays: 1.5, basicSalary: 48000, salaryPerDay: 1600, totalBasicSalary: 45600, allowances: { 1: 2000, 2: 1500 }, deductions: { 1: 1800 }, totalAllowance: 3500, totalDeduction: 1800, finalSalary: 47300, generateDate: '2026-02-01', remark: '', status: 'Paid', paymentDate: '2026-02-05', paymentMode: 'Bank' },
    { id: 2, staffId: 4, month: 'January', year: 2026, absentDays: 0, lateDays: 1, halfDays: 1, totalDeductedDays: 0.75, basicSalary: 45000, salaryPerDay: 1500, totalBasicSalary: 43875, allowances: { 1: 1500 }, deductions: {}, totalAllowance: 1500, totalDeduction: 0, finalSalary: 45375, generateDate: '2026-02-01', remark: '', status: 'Paid', paymentDate: '2026-02-06', paymentMode: 'Cash' },
    { id: 3, staffId: 6, month: 'February', year: 2026, absentDays: 2, lateDays: 0, halfDays: 0, totalDeductedDays: 2, basicSalary: 35000, salaryPerDay: 1166.67, totalBasicSalary: 32666.67, allowances: { 2: 1000 }, deductions: { 2: 500 }, totalAllowance: 1000, totalDeduction: 500, finalSalary: 33166.67, generateDate: '2026-03-01', remark: 'Had 2 leaves', status: 'Unpaid', paymentDate: '', paymentMode: '' }
];
function generateSalaryId() { return salaryCounter++; }

// ==================== ACCOUNTS — EXPENSE HEADS ====================
let expenseHeadCounter = 6;
let EXPENSE_HEADS = [
    { id: 1, name: 'Stationery' },
    { id: 2, name: 'Electricity Bill' },
    { id: 3, name: 'Building Maintenance' },
    { id: 4, name: 'Salary Advance' },
    { id: 5, name: 'Miscellaneous' }
];
function addExpenseHead(name) { EXPENSE_HEADS.push({ id: expenseHeadCounter++, name }); }
function deleteExpenseHead(id) { EXPENSE_HEADS = EXPENSE_HEADS.filter(h => h.id !== id); }

// ==================== ACCOUNTS — INCOME HEADS ====================
let incomeHeadCounter = 5;
let INCOME_HEADS = [
    { id: 1, name: 'Tuition Fee' },
    { id: 2, name: 'Admission Fee' },
    { id: 3, name: 'Transport Fee' },
    { id: 4, name: 'Other Income' }
];
function addIncomeHead(name) { INCOME_HEADS.push({ id: incomeHeadCounter++, name }); }
function deleteIncomeHead(id) { INCOME_HEADS = INCOME_HEADS.filter(h => h.id !== id); }

// ==================== ACCOUNTS — VENDORS ====================
let vendorCounter = 5;
let VENDORS = [
    { id: 1, name: 'Sharma Stationery', mobile: '9876543210', email: 'sharma@mail.com', address: 'Main Market, Vaish Khan', remark: 'Regular supplier' },
    { id: 2, name: 'Gupta Electronics', mobile: '9876512345', email: 'gupta.elec@mail.com', address: 'Station Road', remark: '' },
    { id: 3, name: 'City Electricals', mobile: '9988776655', email: '', address: 'Civil Lines', remark: 'Electricity repairs' },
    { id: 4, name: 'Krishna Traders', mobile: '9123456780', email: 'krishna@traders.in', address: 'Bazaar Road', remark: 'Building materials' }
];
function addVendor(data) { data.id = vendorCounter++; VENDORS.push(data); return data; }
function deleteVendor(id) { VENDORS = VENDORS.filter(v => v.id !== id); }

// ==================== ACCOUNTS — BANK ACCOUNTS ====================
let bankAccountCounter = 4;
let BANK_ACCOUNTS = [
    { id: 1, holderName: 'VKIS School Account', accountNo: '1234567890', bankName: 'State Bank of India', ifsc: 'SBIN0001234', branch: 'Vaish Khan Branch', remark: 'Main school account' },
    { id: 2, holderName: 'VKIS Salary Account', accountNo: '9876543210', bankName: 'Punjab National Bank', ifsc: 'PUNB0005678', branch: 'Civil Lines', remark: 'Staff salary account' },
    { id: 3, holderName: 'VKIS Misc Account', accountNo: '5566778899', bankName: 'Bank of Baroda', ifsc: 'BARB0009012', branch: 'Main Road', remark: '' }
];
function addBankAccount(data) { data.id = bankAccountCounter++; BANK_ACCOUNTS.push(data); return data; }
function deleteBankAccount(id) { BANK_ACCOUNTS = BANK_ACCOUNTS.filter(b => b.id !== id); }

// ==================== ACCOUNTS — EXPENSES ====================
let expenseCounter = 7;
let EXPENSES = [
    { id: 1, date: '2026-01-05', headId: 1, name: 'Notebooks & Pens', amount: 3500, vendorId: 1, bankId: 1, mode: 'Cash', detail: 'Monthly stationery purchase' },
    { id: 2, date: '2026-01-10', headId: 2, name: 'January Bill', amount: 12000, vendorId: 3, bankId: 1, mode: 'Bank', detail: 'Electricity bill for January' },
    { id: 3, date: '2026-01-18', headId: 3, name: 'Classroom Repair', amount: 8500, vendorId: 4, bankId: 2, mode: 'Bank', detail: 'Wall repair in class 5' },
    { id: 4, date: '2026-02-02', headId: 1, name: 'Chalk & Duster', amount: 1200, vendorId: 1, bankId: 0, mode: 'Cash', detail: '' },
    { id: 5, date: '2026-02-08', headId: 5, name: 'Water Cooler Service', amount: 2500, vendorId: 2, bankId: 0, mode: 'Cash', detail: 'AMC payment' },
    { id: 6, date: '2026-02-15', headId: 2, name: 'February Bill', amount: 11500, vendorId: 3, bankId: 1, mode: 'Bank', detail: 'Electricity bill for February' }
];
function addExpense(data) { data.id = expenseCounter++; EXPENSES.push(data); return data; }
function deleteExpense(id) { EXPENSES = EXPENSES.filter(e => e.id !== id); }

// ==================== ACCOUNTS — INCOMES ====================
let incomeCounter = 6;
let INCOMES = [
    { id: 1, date: '2026-01-05', headId: 1, amount: 85000, bankId: 1, detail: 'January tuition fees collected' },
    { id: 2, date: '2026-01-10', headId: 2, amount: 25000, bankId: 1, detail: 'New admissions' },
    { id: 3, date: '2026-01-20', headId: 3, amount: 18000, bankId: 2, detail: 'Transport fees Q1' },
    { id: 4, date: '2026-02-05', headId: 1, amount: 82000, bankId: 1, detail: 'February tuition fees' },
    { id: 5, date: '2026-02-12', headId: 4, amount: 5000, bankId: 0, detail: 'Misc income — canteen rent' }
];
function addIncome(data) { data.id = incomeCounter++; INCOMES.push(data); return data; }
function deleteIncome(id) { INCOMES = INCOMES.filter(i => i.id !== id); }

// ==================== ACCOUNTS — CASH DEPOSITS/WITHDRAWALS ====================
let cashTxnCounter = 5;
let CASH_TRANSACTIONS = [
    { id: 1, date: '2026-01-08', type: 'Deposit', amount: 50000, bankId: 1, by: 'Rajesh Kumar', remark: 'Monthly cash deposit' },
    { id: 2, date: '2026-01-15', type: 'Withdraw', amount: 20000, bankId: 1, by: 'Sunil Sharma', remark: 'Salary advance' },
    { id: 3, date: '2026-02-01', type: 'Deposit', amount: 75000, bankId: 2, by: 'Rajesh Kumar', remark: 'Fee collection deposit' },
    { id: 4, date: '2026-02-10', type: 'Withdraw', amount: 15000, bankId: 1, by: 'Sunil Sharma', remark: 'Maintenance expenses' }
];
function addCashTxn(data) { data.id = cashTxnCounter++; CASH_TRANSACTIONS.push(data); return data; }
function deleteCashTxn(id) { CASH_TRANSACTIONS = CASH_TRANSACTIONS.filter(t => t.id !== id); }

// ==================== MESSAGING — SMS TEMPLATES ====================
const SMS_TEMPLATES = [
    { id: 1, key: 'school-fee', name: 'School Fee Reminder', message: 'Dear Parent, this is a reminder that the school fee for your ward {student_name}, Class {class}/{section}, is due. Kindly deposit the fee at the earliest.\n\nRegards,\n{school_name}\n{school_phone}' },
    { id: 2, key: 'school-timing', name: 'School Timing', message: 'Dear Parent, please note the school timing for session 2025-26:\nMorning: 8:00 AM - 2:00 PM\nWinter: 9:00 AM - 3:00 PM\nKindly ensure your ward {student_name} arrives on time.\n\nRegards,\n{school_name}\n{school_phone}' },
    { id: 3, key: 'school-holiday', name: 'School Holiday', message: 'Dear Parent/Staff, please note that the school will remain closed on {date} on account of {reason}. Classes will resume as per normal schedule.\n\nRegards,\n{school_name}\n{school_phone}' },
    { id: 4, key: 'absent-message', name: 'Absent Message', message: 'Dear Parent, your ward {student_name}, Class {class}/{section}, was absent today ({date}). Kindly inform the school about the reason for absence.\n\nRegards,\n{school_name}\n{school_phone}' },
    { id: 5, key: 'ptm', name: 'PTM (Parent Teacher Meeting)', message: 'Dear Parent, you are cordially invited to the Parent-Teacher Meeting on {date} at {time}. Kindly attend to discuss the progress of your ward {student_name}, Class {class}/{section}.\n\nRegards,\n{school_name}\n{school_phone}' },
    { id: 6, key: 'preset-message', name: 'Preset Message (Custom)', message: 'Dear Parent/Staff, {custom_message}\n\nRegards,\n{school_name}\n{school_phone}' },
    { id: 7, key: 'staff-holiday', name: 'Staff Holiday Notice', message: 'Dear {staff_name}, please note that the school will remain closed on {date} on account of {reason}. Please plan accordingly.\n\nRegards,\n{school_name}\n{school_phone}' },
    { id: 8, key: 'staff-meeting', name: 'Staff Meeting', message: 'Dear {staff_name}, you are requested to attend a staff meeting on {date} at {time} in the conference hall. Your presence is mandatory.\n\nRegards,\n{school_name}\n{school_phone}' }
];

// ==================== MESSAGING — SENT SMS LOG ====================
let smsLogCounter = 7;
let SMS_LOG = [
    { id: 1, type: 'Student', template: 'School Fee Reminder', message: 'Dear Parent, this is a reminder that the school fee for your ward Aarav Sharma, Class 5/A, is due. Kindly deposit the fee at the earliest.\n\nRegards,\nVaish Khan International School\n+91 99999 88888', recipients: 'Aarav Sharma (Class 5/A)', recipientCount: 1, date: '2026-02-01', status: 'Sent' },
    { id: 2, type: 'Student', template: 'Absent Message', message: 'Dear Parent, your ward Ananya Gupta, Class 5/A, was absent today (2026-02-03). Kindly inform the school about the reason for absence.\n\nRegards,\nVaish Khan International School\n+91 99999 88888', recipients: 'Ananya Gupta (Class 5/A)', recipientCount: 1, date: '2026-02-03', status: 'Sent' },
    { id: 3, type: 'Student', template: 'PTM (Parent Teacher Meeting)', message: 'Dear Parent, you are cordially invited to the Parent-Teacher Meeting on 15-Feb-2026 at 10:00 AM...', recipients: 'Class 5/A — All Students', recipientCount: 12, date: '2026-02-10', status: 'Sent' },
    { id: 4, type: 'Staff', template: 'Staff Holiday Notice', message: 'Dear Staff, please note that the school will remain closed on 26-Jan-2026 on account of Republic Day...', recipients: 'All Staff', recipientCount: 15, date: '2026-01-20', status: 'Sent' },
    { id: 5, type: 'Staff', template: 'Staff Meeting', message: 'Dear Staff, you are requested to attend a staff meeting on 05-Feb-2026 at 3:00 PM in the conference hall...', recipients: 'All Teachers', recipientCount: 10, date: '2026-02-01', status: 'Sent' },
    { id: 6, type: 'Student', template: 'School Holiday', message: 'Dear Parent, please note that the school will remain closed on 14-Mar-2026 on account of Holi...', recipients: 'All Students', recipientCount: 45, date: '2026-03-01', status: 'Sent' }
];
function addSmsLog(data) { data.id = smsLogCounter++; SMS_LOG.push(data); return data; }

// ==================== RESULT MODULE ====================

// Grade calculation helper
function getGrade(pct) {
    if (pct >= 91) return 'A1';
    if (pct >= 81) return 'A2';
    if (pct >= 71) return 'B1';
    if (pct >= 61) return 'B2';
    if (pct >= 51) return 'C1';
    if (pct >= 41) return 'C2';
    if (pct >= 33) return 'D';
    return 'E';
}

// EXAM_RESULTS: stores marks per student, per exam, per subject
let EXAM_RESULTS = [
    // Aarav Sharma (id:1) — Class 8/A — Unit Test I
    { id: 1, studentId: 1, examId: 1, subjectId: 1, minMarks: 11, maxMarks: 50, obtainedMarks: 42, practical: null, grade: 'A2' },
    { id: 2, studentId: 1, examId: 1, subjectId: 2, minMarks: 11, maxMarks: 50, obtainedMarks: 45, practical: null, grade: 'A1' },
    { id: 3, studentId: 1, examId: 1, subjectId: 3, minMarks: 11, maxMarks: 50, obtainedMarks: 38, practical: null, grade: 'B1' },
    { id: 4, studentId: 1, examId: 1, subjectId: 4, minMarks: 11, maxMarks: 50, obtainedMarks: 40, practical: null, grade: 'A2' },
    { id: 5, studentId: 1, examId: 1, subjectId: 5, minMarks: 11, maxMarks: 50, obtainedMarks: 36, practical: null, grade: 'B1' },
    { id: 6, studentId: 1, examId: 1, subjectId: 6, minMarks: 11, maxMarks: 50, obtainedMarks: 44, practical: null, grade: 'A1' },
    { id: 7, studentId: 1, examId: 1, subjectId: 9, minMarks: 11, maxMarks: 50, obtainedMarks: 39, practical: null, grade: 'B1' },
    { id: 8, studentId: 1, examId: 1, subjectId: 10, minMarks: 11, maxMarks: 50, obtainedMarks: 46, practical: null, grade: 'A1' },
    // Aarav Sharma — Half Yearly
    { id: 9, studentId: 1, examId: 2, subjectId: 1, minMarks: 26, maxMarks: 100, obtainedMarks: 82, practical: null, grade: 'A2' },
    { id: 10, studentId: 1, examId: 2, subjectId: 2, minMarks: 26, maxMarks: 100, obtainedMarks: 88, practical: null, grade: 'A2' },
    { id: 11, studentId: 1, examId: 2, subjectId: 3, minMarks: 26, maxMarks: 100, obtainedMarks: 75, practical: null, grade: 'B1' },
    { id: 12, studentId: 1, examId: 2, subjectId: 4, minMarks: 26, maxMarks: 100, obtainedMarks: 80, practical: 18, grade: 'A2' },
    { id: 13, studentId: 1, examId: 2, subjectId: 5, minMarks: 26, maxMarks: 100, obtainedMarks: 70, practical: null, grade: 'B1' },
    { id: 14, studentId: 1, examId: 2, subjectId: 6, minMarks: 26, maxMarks: 100, obtainedMarks: 90, practical: 19, grade: 'A1' },
    { id: 15, studentId: 1, examId: 2, subjectId: 9, minMarks: 26, maxMarks: 100, obtainedMarks: 78, practical: null, grade: 'B1' },
    { id: 16, studentId: 1, examId: 2, subjectId: 10, minMarks: 26, maxMarks: 100, obtainedMarks: 92, practical: null, grade: 'A1' },
    // Ananya Gupta (id:2) — Class 8/A — Unit Test I
    { id: 17, studentId: 2, examId: 1, subjectId: 1, minMarks: 11, maxMarks: 50, obtainedMarks: 44, practical: null, grade: 'A1' },
    { id: 18, studentId: 2, examId: 1, subjectId: 2, minMarks: 11, maxMarks: 50, obtainedMarks: 47, practical: null, grade: 'A1' },
    { id: 19, studentId: 2, examId: 1, subjectId: 3, minMarks: 11, maxMarks: 50, obtainedMarks: 41, practical: null, grade: 'A2' },
    { id: 20, studentId: 2, examId: 1, subjectId: 4, minMarks: 11, maxMarks: 50, obtainedMarks: 43, practical: null, grade: 'A2' },
    { id: 21, studentId: 2, examId: 1, subjectId: 5, minMarks: 11, maxMarks: 50, obtainedMarks: 39, practical: null, grade: 'B1' },
    { id: 22, studentId: 2, examId: 1, subjectId: 6, minMarks: 11, maxMarks: 50, obtainedMarks: 46, practical: null, grade: 'A1' },
    { id: 23, studentId: 2, examId: 1, subjectId: 9, minMarks: 11, maxMarks: 50, obtainedMarks: 42, practical: null, grade: 'A2' },
    { id: 24, studentId: 2, examId: 1, subjectId: 10, minMarks: 11, maxMarks: 50, obtainedMarks: 48, practical: null, grade: 'A1' },
    // Ananya Gupta — Half Yearly
    { id: 25, studentId: 2, examId: 2, subjectId: 1, minMarks: 26, maxMarks: 100, obtainedMarks: 85, practical: null, grade: 'A2' },
    { id: 26, studentId: 2, examId: 2, subjectId: 2, minMarks: 26, maxMarks: 100, obtainedMarks: 92, practical: null, grade: 'A1' },
    { id: 27, studentId: 2, examId: 2, subjectId: 3, minMarks: 26, maxMarks: 100, obtainedMarks: 78, practical: null, grade: 'B1' },
    { id: 28, studentId: 2, examId: 2, subjectId: 4, minMarks: 26, maxMarks: 100, obtainedMarks: 85, practical: 19, grade: 'A2' },
    { id: 29, studentId: 2, examId: 2, subjectId: 5, minMarks: 26, maxMarks: 100, obtainedMarks: 76, practical: null, grade: 'B1' },
    { id: 30, studentId: 2, examId: 2, subjectId: 6, minMarks: 26, maxMarks: 100, obtainedMarks: 94, practical: 20, grade: 'A1' },
    { id: 31, studentId: 2, examId: 2, subjectId: 9, minMarks: 26, maxMarks: 100, obtainedMarks: 82, practical: null, grade: 'A2' },
    { id: 32, studentId: 2, examId: 2, subjectId: 10, minMarks: 26, maxMarks: 100, obtainedMarks: 95, practical: null, grade: 'A1' },
    // Rahul Dubey (id:11) — Class 8/A — Unit Test I
    { id: 33, studentId: 11, examId: 1, subjectId: 1, minMarks: 11, maxMarks: 50, obtainedMarks: 30, practical: null, grade: 'C1' },
    { id: 34, studentId: 11, examId: 1, subjectId: 2, minMarks: 11, maxMarks: 50, obtainedMarks: 35, practical: null, grade: 'B1' },
    { id: 35, studentId: 11, examId: 1, subjectId: 3, minMarks: 11, maxMarks: 50, obtainedMarks: 28, practical: null, grade: 'C1' },
    { id: 36, studentId: 11, examId: 1, subjectId: 4, minMarks: 11, maxMarks: 50, obtainedMarks: 32, practical: null, grade: 'C1' },
    { id: 37, studentId: 11, examId: 1, subjectId: 5, minMarks: 11, maxMarks: 50, obtainedMarks: 26, practical: null, grade: 'C2' },
    { id: 38, studentId: 11, examId: 1, subjectId: 6, minMarks: 11, maxMarks: 50, obtainedMarks: 38, practical: null, grade: 'B1' },
    { id: 39, studentId: 11, examId: 1, subjectId: 9, minMarks: 11, maxMarks: 50, obtainedMarks: 34, practical: null, grade: 'C1' },
    { id: 40, studentId: 11, examId: 1, subjectId: 10, minMarks: 11, maxMarks: 50, obtainedMarks: 40, practical: null, grade: 'A2' },
    // Lakshya Tiwari (id:7) — Class 8/B — Unit Test I
    { id: 41, studentId: 7, examId: 1, subjectId: 1, minMarks: 11, maxMarks: 50, obtainedMarks: 36, practical: null, grade: 'B1' },
    { id: 42, studentId: 7, examId: 1, subjectId: 2, minMarks: 11, maxMarks: 50, obtainedMarks: 40, practical: null, grade: 'A2' },
    { id: 43, studentId: 7, examId: 1, subjectId: 3, minMarks: 11, maxMarks: 50, obtainedMarks: 33, practical: null, grade: 'C1' },
    { id: 44, studentId: 7, examId: 1, subjectId: 4, minMarks: 11, maxMarks: 50, obtainedMarks: 37, practical: null, grade: 'B1' },
    { id: 45, studentId: 7, examId: 1, subjectId: 5, minMarks: 11, maxMarks: 50, obtainedMarks: 31, practical: null, grade: 'C1' },
    { id: 46, studentId: 7, examId: 1, subjectId: 6, minMarks: 11, maxMarks: 50, obtainedMarks: 42, practical: null, grade: 'A2' },
    { id: 47, studentId: 7, examId: 1, subjectId: 9, minMarks: 11, maxMarks: 50, obtainedMarks: 35, practical: null, grade: 'B1' },
    { id: 48, studentId: 7, examId: 1, subjectId: 10, minMarks: 11, maxMarks: 50, obtainedMarks: 43, practical: null, grade: 'A2' }
];
let examResultCounter = 49;

// RESULT_DETAILS: attendance, height, weight, remark etc. per student per exam
let RESULT_DETAILS = [
    { id: 1, studentId: 1, examId: 2, attendance: '92%', remark: 'Very Good', height: '142', weight: '38', result: 'Pass', division: 'First', rank: 1, resultDate: '2025-11-15', promotedTo: '' },
    { id: 2, studentId: 2, examId: 2, attendance: '95%', remark: 'Excellent', height: '140', weight: '36', result: 'Pass', division: 'First', rank: 2, resultDate: '2025-11-15', promotedTo: '' },
    { id: 3, studentId: 1, examId: 1, attendance: '90%', remark: 'Good', height: '141', weight: '37', result: 'Pass', division: 'First', rank: 1, resultDate: '2025-08-05', promotedTo: '' },
    { id: 4, studentId: 2, examId: 1, attendance: '94%', remark: 'Very Good', height: '139', weight: '35', result: 'Pass', division: 'First', rank: 2, resultDate: '2025-08-05', promotedTo: '' }
];
let resultDetailCounter = 5;

// EXAM_GROUPS: moved to Master Module section below

// Helper: get or create result entry
function getResult(studentId, examId, subjectId) {
    return EXAM_RESULTS.find(r => r.studentId === studentId && r.examId === examId && r.subjectId === subjectId);
}

function saveResult(data) {
    const existing = EXAM_RESULTS.find(r => r.studentId === data.studentId && r.examId === data.examId && r.subjectId === data.subjectId);
    if (existing) {
        Object.assign(existing, data);
        return existing;
    }
    data.id = examResultCounter++;
    EXAM_RESULTS.push(data);
    return data;
}

function getResultDetail(studentId, examId) {
    return RESULT_DETAILS.find(r => r.studentId === studentId && r.examId === examId);
}

function saveResultDetail(data) {
    const existing = RESULT_DETAILS.find(r => r.studentId === data.studentId && r.examId === data.examId);
    if (existing) {
        Object.assign(existing, data);
        return existing;
    }
    data.id = resultDetailCounter++;
    RESULT_DETAILS.push(data);
    return data;
}

// ==================== VEHICLES ====================
let vehicleCounter = 7;
let VEHICLES = [
    { id: 1, regNo: "UP32 AT 1234", type: "Self Owned", name: "Bus", engineNo: "ENG-20190045", chasisNo: "CHAS-20190045", seats: 40, pollutionCert: "Valid", pollutionRenewal: "2025-12-15", fitnessRenewal: "2025-11-20", status: "Active", driverName: "Ramesh Kumar", driverMobile: "9876543210", driverAddress: "25, Aliganj, Lucknow", otherInfo: "", routeId: 1 },
    { id: 2, regNo: "UP32 BT 5678", type: "Self Owned", name: "Bus", engineNo: "ENG-20200112", chasisNo: "CHAS-20200112", seats: 45, pollutionCert: "Valid", pollutionRenewal: "2025-10-10", fitnessRenewal: "2025-09-15", status: "Active", driverName: "Suresh Yadav", driverMobile: "9876543211", driverAddress: "10, Gomtinagar, Lucknow", otherInfo: "", routeId: 2 },
    { id: 3, regNo: "UP32 CT 9012", type: "Hired", name: "Van", engineNo: "ENG-20210078", chasisNo: "CHAS-20210078", seats: 15, pollutionCert: "Expired", pollutionRenewal: "2024-06-30", fitnessRenewal: "2025-08-10", status: "Active", driverName: "Manoj Singh", driverMobile: "9876543212", driverAddress: "44, Hazratganj, Lucknow", otherInfo: "Hired from ABC Transport", routeId: 3 },
    { id: 4, regNo: "UP32 DT 3456", type: "Self Owned", name: "Bus", engineNo: "ENG-20180034", chasisNo: "CHAS-20180034", seats: 50, pollutionCert: "Valid", pollutionRenewal: "2026-01-20", fitnessRenewal: "2026-02-15", status: "Active", driverName: "Ajay Verma", driverMobile: "9876543213", driverAddress: "78, Alambagh, Lucknow", otherInfo: "", routeId: 4 },
    { id: 5, regNo: "UP32 ET 7890", type: "Hired", name: "Van", engineNo: "ENG-20220099", chasisNo: "CHAS-20220099", seats: 12, pollutionCert: "Valid", pollutionRenewal: "2025-07-25", fitnessRenewal: "2025-06-30", status: "Inactive", driverName: "Rakesh Tiwari", driverMobile: "9876543214", driverAddress: "15, Jankipuram, Lucknow", otherInfo: "Under maintenance", routeId: 5 },
    { id: 6, regNo: "UP32 FT 2345", type: "Self Owned", name: "Mini Bus", engineNo: "ENG-20230056", chasisNo: "CHAS-20230056", seats: 25, pollutionCert: "Valid", pollutionRenewal: "2026-03-10", fitnessRenewal: "2026-04-05", status: "Active", driverName: "Deepak Mishra", driverMobile: "9876543215", driverAddress: "32, Vikas Nagar, Lucknow", otherInfo: "", routeId: 2 }
];

let routeMappingCounter = 7;
let VEHICLE_ROUTE_MAPPINGS = [
    { id: 1, vehicleId: 1, routeId: 1, amountPerMonth: 800 },
    { id: 2, vehicleId: 2, routeId: 2, amountPerMonth: 900 },
    { id: 3, vehicleId: 3, routeId: 3, amountPerMonth: 700 },
    { id: 4, vehicleId: 4, routeId: 4, amountPerMonth: 850 },
    { id: 5, vehicleId: 5, routeId: 5, amountPerMonth: 950 },
    { id: 6, vehicleId: 6, routeId: 2, amountPerMonth: 900 }
];

function getVehicleById(id) { return VEHICLES.find(v => v.id === id) || null; }

function saveVehicle(data) {
    if (data.id) {
        const v = VEHICLES.find(x => x.id === data.id);
        if (v) { Object.assign(v, data); return v; }
    }
    data.id = vehicleCounter++;
    VEHICLES.push(data);
    return data;
}

function deleteVehicle(id) {
    const i = VEHICLES.findIndex(v => v.id === id);
    if (i > -1) { VEHICLES.splice(i, 1); return true; }
    return false;
}

let routeCounter = 6;
function saveRoute(data) {
    if (data.id) {
        const r = ROUTES.find(x => x.id === data.id);
        if (r) { Object.assign(r, data); return r; }
    }
    data.id = routeCounter++;
    ROUTES.push(data);
    return data;
}

function deleteRoute(id) {
    const i = ROUTES.findIndex(r => r.id === id);
    if (i > -1) { ROUTES.splice(i, 1); return true; }
    return false;
}

function saveMapping(data) {
    if (data.id) {
        const m = VEHICLE_ROUTE_MAPPINGS.find(x => x.id === data.id);
        if (m) { Object.assign(m, data); return m; }
    }
    data.id = routeMappingCounter++;
    VEHICLE_ROUTE_MAPPINGS.push(data);
    return data;
}

function deleteMapping(id) {
    const i = VEHICLE_ROUTE_MAPPINGS.findIndex(m => m.id === id);
    if (i > -1) { VEHICLE_ROUTE_MAPPINGS.splice(i, 1); return true; }
    return false;
}

// ==================== LIBRARY ====================
let bookCounter = 11;
let BOOK_TYPES = [
    { id: 1, name: 'Course Book' },
    { id: 2, name: 'School Book' },
    { id: 3, name: 'Comic Book' },
    { id: 4, name: 'Reference Book' },
    { id: 5, name: 'Magazine' }
];
let bookTypeCounter = 6;

let BOOKS = [
    { id: 1, bookNo: 'BK-001', isbn: '978-0-13-468599-1', typeId: 1, author: 'R.D. Sharma', title: 'Mathematics Class 10', publisher: 'Dhanpat Rai, Delhi', cost: 450, totalCopies: 20, rackNo: 'R-01' },
    { id: 2, bookNo: 'BK-002', isbn: '978-0-07-139897-3', typeId: 1, author: 'H.C. Verma', title: 'Concepts of Physics Vol-1', publisher: 'Bharti Bhawan, Patna', cost: 380, totalCopies: 15, rackNo: 'R-02' },
    { id: 3, bookNo: 'BK-003', isbn: '978-81-7011-760-9', typeId: 2, author: 'NCERT', title: 'Science Textbook Class 8', publisher: 'NCERT, Delhi', cost: 120, totalCopies: 30, rackNo: 'R-01' },
    { id: 4, bookNo: 'BK-004', isbn: '978-81-7011-765-4', typeId: 2, author: 'NCERT', title: 'Hindi Vasant Class 7', publisher: 'NCERT, Delhi', cost: 95, totalCopies: 25, rackNo: 'R-03' },
    { id: 5, bookNo: 'BK-005', isbn: '978-0-06-112008-4', typeId: 4, author: 'Harper Lee', title: 'To Kill a Mockingbird', publisher: 'Harper Collins, London', cost: 350, totalCopies: 10, rackNo: 'R-04' },
    { id: 6, bookNo: 'BK-006', isbn: '978-93-5177-709-4', typeId: 3, author: 'Raj Comics', title: 'Nagraj — The Serpent King', publisher: 'Raj Comics, Delhi', cost: 80, totalCopies: 12, rackNo: 'R-05' },
    { id: 7, bookNo: 'BK-007', isbn: '978-0-19-953556-9', typeId: 4, author: 'Oxford Press', title: 'Oxford Advanced Learner Dictionary', publisher: 'Oxford University Press', cost: 650, totalCopies: 8, rackNo: 'R-04' },
    { id: 8, bookNo: 'BK-008', isbn: '978-81-237-0351-0', typeId: 1, author: 'Lakhmir Singh', title: 'Biology for Class 10', publisher: 'S. Chand, Delhi', cost: 320, totalCopies: 18, rackNo: 'R-02' },
    { id: 9, bookNo: 'BK-009', isbn: '978-93-5277-000-5', typeId: 5, author: 'India Today Group', title: 'India Today — Jan 2026', publisher: 'Living Media, Delhi', cost: 60, totalCopies: 5, rackNo: 'R-06' },
    { id: 10, bookNo: 'BK-010', isbn: '978-0-14-028329-7', typeId: 3, author: 'Herge', title: 'The Adventures of Tintin', publisher: 'Egmont, UK', cost: 250, totalCopies: 10, rackNo: 'R-05' }
];

let issueCounter = 7;
let BOOK_ISSUES = [
    { id: 1, studentId: 1, bookId: 1, issueDate: '2026-02-10', dueDate: '2026-02-24', returnDate: null, status: 'Issued' },
    { id: 2, studentId: 2, bookId: 3, issueDate: '2026-02-12', dueDate: '2026-02-26', returnDate: '2026-02-25', status: 'Returned' },
    { id: 3, studentId: 3, bookId: 5, issueDate: '2026-02-15', dueDate: '2026-03-01', returnDate: null, status: 'Issued' },
    { id: 4, studentId: 5, bookId: 6, issueDate: '2026-02-18', dueDate: '2026-03-04', returnDate: '2026-03-10', status: 'Returned' },
    { id: 5, studentId: 7, bookId: 2, issueDate: '2026-02-20', dueDate: '2026-03-06', returnDate: null, status: 'Issued' },
    { id: 6, studentId: 4, bookId: 8, issueDate: '2026-02-22', dueDate: '2026-03-08', returnDate: null, status: 'Issued' }
];

function getBookById(id) { return BOOKS.find(b => b.id === id) || null; }
function getBookTypeById(id) { return BOOK_TYPES.find(t => t.id === id) || null; }

function getIssuedCount(bookId) {
    return BOOK_ISSUES.filter(i => i.bookId === bookId && i.status === 'Issued').length;
}

function saveBook(data) {
    if (data.id) {
        const b = BOOKS.find(x => x.id === data.id);
        if (b) { Object.assign(b, data); return b; }
    }
    data.id = bookCounter++;
    BOOKS.push(data);
    return data;
}

function deleteBook(id) {
    const i = BOOKS.findIndex(b => b.id === id);
    if (i > -1) { BOOKS.splice(i, 1); return true; }
    return false;
}

function saveBookType(data) {
    if (data.id) {
        const t = BOOK_TYPES.find(x => x.id === data.id);
        if (t) { Object.assign(t, data); return t; }
    }
    data.id = bookTypeCounter++;
    BOOK_TYPES.push(data);
    return data;
}

function deleteBookType(id) {
    const i = BOOK_TYPES.findIndex(t => t.id === id);
    if (i > -1) { BOOK_TYPES.splice(i, 1); return true; }
    return false;
}

function saveBookIssue(data) {
    if (data.id) {
        const issue = BOOK_ISSUES.find(x => x.id === data.id);
        if (issue) { Object.assign(issue, data); return issue; }
    }
    data.id = issueCounter++;
    BOOK_ISSUES.push(data);
    return data;
}

function returnBook(issueId, returnDate) {
    const issue = BOOK_ISSUES.find(x => x.id === issueId);
    if (!issue) return null;
    issue.returnDate = returnDate;
    issue.status = 'Returned';
    return issue;
}

// ==================== LIBRARY SETTINGS ====================
let LIBRARY_SETTINGS = {
    finePerDay: 2,
    defaultDueDays: 14,
    dueDayPresets: [7, 20, 30]
};

function saveLibrarySettings(data) {
    Object.assign(LIBRARY_SETTINGS, data);
    return LIBRARY_SETTINGS;
}

function calcExtraDays(dueDate, returnDate) {
    const due = new Date(dueDate);
    const ret = new Date(returnDate);
    const diff = Math.floor((ret - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

function calcPenalty(extraDays, ratePerDay) {
    return extraDays * (ratePerDay || LIBRARY_SETTINGS.finePerDay);
}

// ==================== FEE MASTER ====================
const FEE_MODES = ['Monthly', 'Quarterly', 'Half-Yearly', 'Once', 'Other'];
const ALL_MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

let feeParticularCounter = 6;
let FEE_PARTICULARS = [
    { id: 1, name: 'Tuition Fee', charge: 2500, isTransport: false, mode: 'Monthly', months: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'] },
    { id: 2, name: 'Admission Fee', charge: 3000, isTransport: false, mode: 'Once', months: ['April'] },
    { id: 3, name: 'Exam Fee', charge: 800, isTransport: false, mode: 'Quarterly', months: ['June', 'September', 'December', 'March'] },
    { id: 4, name: 'Transport Fee', charge: 1200, isTransport: true, mode: 'Monthly', months: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'] },
    { id: 5, name: 'Annual Charges', charge: 1500, isTransport: false, mode: 'Once', months: ['April'] }
];

let FEE_CATEGORIES = ['Default'];
let feeSlabCounter = 8;
let FEE_SLABS = [
    { id: 1, category: 'Default', classId: 1, amounts: { 1: 800, 2: 2000, 3: 300, 4: 500, 5: 1500 } },
    { id: 2, category: 'Default', classId: 4, amounts: { 1: 1000, 2: 2500, 3: 400, 4: 600, 5: 1800 } },
    { id: 3, category: 'Default', classId: 8, amounts: { 1: 1200, 2: 3000, 3: 500, 4: 700, 5: 2000 } },
    { id: 4, category: 'Default', classId: 9, amounts: { 1: 1400, 2: 3500, 3: 600, 4: 800, 5: 2200 } },
    { id: 5, category: 'Default', classId: 11, amounts: { 1: 1600, 2: 4000, 3: 700, 4: 900, 5: 2500 } },
    { id: 6, category: 'Default', classId: 13, amounts: { 1: 1800, 2: 4500, 3: 800, 4: 1000, 5: 2800 } },
    { id: 7, category: 'Default', classId: 14, amounts: { 1: 2000, 2: 5000, 3: 900, 4: 1100, 5: 3000 } }
];

function getFeeParticularById(id) { return FEE_PARTICULARS.find(p => p.id === id) || null; }

function saveFeeParticular(data) {
    if (data.id) {
        const p = FEE_PARTICULARS.find(x => x.id === data.id);
        if (p) { Object.assign(p, data); return p; }
    }
    data.id = feeParticularCounter++;
    FEE_PARTICULARS.push(data);
    return data;
}

function deleteFeeParticular(id) {
    const i = FEE_PARTICULARS.findIndex(p => p.id === id);
    if (i > -1) { FEE_PARTICULARS.splice(i, 1); return true; }
    return false;
}

function getFeeSlab(category, classId) {
    return FEE_SLABS.find(s => s.category === category && s.classId === classId) || null;
}

function saveFeeSlab(data) {
    if (data.id) {
        const s = FEE_SLABS.find(x => x.id === data.id);
        if (s) { Object.assign(s, data); return s; }
    }
    // check existing
    const existing = FEE_SLABS.find(s => s.category === data.category && s.classId === data.classId);
    if (existing) { Object.assign(existing, data); return existing; }
    data.id = feeSlabCounter++;
    FEE_SLABS.push(data);
    return data;
}

function deleteFeeSlab(id) {
    const i = FEE_SLABS.findIndex(s => s.id === id);
    if (i > -1) { FEE_SLABS.splice(i, 1); return true; }
    return false;
}

// ==================== MASTER MODULE ====================

// --- Academic Session CRUD (SESSIONS exists at top) ---
let sessionCounter = 4;
function saveAcademicSession(data) {
    if (data.id) { const s = SESSIONS.find(x => x.id === data.id); if (s) { Object.assign(s, data); return s; } }
    data.id = sessionCounter++; SESSIONS.push(data); return data;
}
function deleteAcademicSession(id) { const i = SESSIONS.findIndex(s => s.id === id); if (i > -1) { SESSIONS.splice(i, 1); return true; } return false; }

// --- Staff Designation ---
let MASTER_DESIGNATIONS = [
    { id: 1, name: 'Principal', serialNo: 1, attendance: 'Yes' },
    { id: 2, name: 'Vice Principal', serialNo: 2, attendance: 'Yes' },
    { id: 3, name: 'Teacher', serialNo: 3, attendance: 'Yes' },
    { id: 4, name: 'Clerk', serialNo: 4, attendance: 'Yes' },
    { id: 5, name: 'Accountant', serialNo: 5, attendance: 'Yes' },
    { id: 6, name: 'Peon', serialNo: 6, attendance: 'No' },
    { id: 7, name: 'Librarian', serialNo: 7, attendance: 'Yes' },
    { id: 8, name: 'Lab Assistant', serialNo: 8, attendance: 'Yes' },
    { id: 9, name: 'Sports Coach', serialNo: 9, attendance: 'Yes' },
    { id: 10, name: 'Counselor', serialNo: 10, attendance: 'Yes' },
    { id: 11, name: 'Driver', serialNo: 11, attendance: 'No' },
    { id: 12, name: 'Guard', serialNo: 12, attendance: 'No' }
];
let desigCounter = 13;
function syncDesignations() { STAFF_DESIGNATIONS.length = 0; MASTER_DESIGNATIONS.forEach(d => STAFF_DESIGNATIONS.push(d.name)); }
function saveMasterDesignation(data) {
    if (data.id) { const d = MASTER_DESIGNATIONS.find(x => x.id === data.id); if (d) { Object.assign(d, data); syncDesignations(); return d; } }
    data.id = desigCounter++; MASTER_DESIGNATIONS.push(data); syncDesignations(); return data;
}
function deleteMasterDesignation(id) { const i = MASTER_DESIGNATIONS.findIndex(d => d.id === id); if (i > -1) { MASTER_DESIGNATIONS.splice(i, 1); syncDesignations(); return true; } return false; }

// --- Class CRUD (CLASSES exists at top) ---
let classCounter = 16;
function saveMasterClass(data) {
    if (data.id) { const c = CLASSES.find(x => x.id === data.id); if (c) { Object.assign(c, data); return c; } }
    data.id = classCounter++; CLASSES.push(data); return data;
}
function deleteMasterClass(id) { const i = CLASSES.findIndex(c => c.id === id); if (i > -1) { CLASSES.splice(i, 1); return true; } return false; }

// --- Section CRUD (SECTIONS exists at top) ---
let sectionCounter = 5;
function saveMasterSection(data) {
    if (data.id) { const s = SECTIONS.find(x => x.id === data.id); if (s) { Object.assign(s, data); return s; } }
    data.id = sectionCounter++; SECTIONS.push(data); return data;
}
function deleteMasterSection(id) { const i = SECTIONS.findIndex(s => s.id === id); if (i > -1) { SECTIONS.splice(i, 1); return true; } return false; }

// --- Subject CRUD (SUBJECTS exists at top) ---
let subjectCounter = 13;
function saveMasterSubject(data) {
    if (data.id) { const s = SUBJECTS.find(x => x.id === data.id); if (s) { Object.assign(s, data); return s; } }
    data.id = subjectCounter++; SUBJECTS.push(data); return data;
}
function deleteMasterSubject(id) { const i = SUBJECTS.findIndex(s => s.id === id); if (i > -1) { SUBJECTS.splice(i, 1); return true; } return false; }

// --- Exam Name ---
let EXAM_NAMES = [
    { id: 1, name: 'Unit Test - I', serialNo: 1, minMarks: 10, maxMarks: 25, status: 'Published' },
    { id: 2, name: 'Half Yearly', serialNo: 2, minMarks: 33, maxMarks: 100, status: 'Published' },
    { id: 3, name: 'Unit Test - II', serialNo: 3, minMarks: 10, maxMarks: 25, status: 'Published' },
    { id: 4, name: 'Annual Examination', serialNo: 4, minMarks: 33, maxMarks: 100, status: 'Published' },
    { id: 5, name: 'Pre-Board', serialNo: 5, minMarks: 33, maxMarks: 100, status: 'Draft' }
];
let examNameCounter = 6;
function saveExamName(data) {
    if (data.id) { const e = EXAM_NAMES.find(x => x.id === data.id); if (e) { Object.assign(e, data); return e; } }
    data.id = examNameCounter++; EXAM_NAMES.push(data); return data;
}
function deleteExamName(id) { const i = EXAM_NAMES.findIndex(e => e.id === id); if (i > -1) { EXAM_NAMES.splice(i, 1); return true; } return false; }

// --- Exam Group ---
let EXAM_GROUPS = [
    { id: 1, name: 'Full Session', examIds: [1, 2, 3, 4] },
    { id: 2, name: 'Board Preparation', examIds: [2, 4, 5] }
];
let examGroupCounter = 3;
function saveExamGroup(data) {
    if (data.id) { const g = EXAM_GROUPS.find(x => x.id === data.id); if (g) { Object.assign(g, data); return g; } }
    data.id = examGroupCounter++; EXAM_GROUPS.push(data); return data;
}
function deleteExamGroup(id) { const i = EXAM_GROUPS.findIndex(g => g.id === id); if (i > -1) { EXAM_GROUPS.splice(i, 1); return true; } return false; }

// --- Period ---
let MASTER_PERIODS = [
    { id: 1, name: '1st Period', serialNo: 1 },
    { id: 2, name: '2nd Period', serialNo: 2 },
    { id: 3, name: '3rd Period', serialNo: 3 },
    { id: 4, name: '4th Period', serialNo: 4 },
    { id: 5, name: '5th Period', serialNo: 5 },
    { id: 6, name: '6th Period', serialNo: 6 },
    { id: 7, name: '7th Period', serialNo: 7 },
    { id: 8, name: '8th Period', serialNo: 8 }
];
let periodMasterCounter = 9;
function saveMasterPeriod(data) {
    if (data.id) { const p = MASTER_PERIODS.find(x => x.id === data.id); if (p) { Object.assign(p, data); return p; } }
    data.id = periodMasterCounter++; MASTER_PERIODS.push(data); return data;
}
function deleteMasterPeriod(id) { const i = MASTER_PERIODS.findIndex(p => p.id === id); if (i > -1) { MASTER_PERIODS.splice(i, 1); return true; } return false; }

// --- Homework Type ---
let MASTER_HW_TYPES = [
    { id: 1, name: 'Assignment', serialNo: 1 },
    { id: 2, name: 'Worksheet', serialNo: 2 },
    { id: 3, name: 'Project', serialNo: 3 },
    { id: 4, name: 'Reading', serialNo: 4 },
    { id: 5, name: 'Practice', serialNo: 5 },
    { id: 6, name: 'Class Work', serialNo: 6 },
    { id: 7, name: 'Holiday Homework', serialNo: 7 }
];
let hwTypeCounter = 8;
function saveMasterHwType(data) {
    if (data.id) { const t = MASTER_HW_TYPES.find(x => x.id === data.id); if (t) { Object.assign(t, data); return t; } }
    data.id = hwTypeCounter++; MASTER_HW_TYPES.push(data); return data;
}
function deleteMasterHwType(id) { const i = MASTER_HW_TYPES.findIndex(t => t.id === id); if (i > -1) { MASTER_HW_TYPES.splice(i, 1); return true; } return false; }

// --- House ---
let HOUSES = [
    { id: 1, name: 'Red House', color: '#e53935' },
    { id: 2, name: 'Blue House', color: '#1e88e5' },
    { id: 3, name: 'Green House', color: '#43a047' },
    { id: 4, name: 'Yellow House', color: '#fdd835' }
];
let houseCounter = 5;
function saveMasterHouse(data) {
    if (data.id) { const h = HOUSES.find(x => x.id === data.id); if (h) { Object.assign(h, data); return h; } }
    data.id = houseCounter++; HOUSES.push(data); return data;
}
function deleteMasterHouse(id) { const i = HOUSES.findIndex(h => h.id === id); if (i > -1) { HOUSES.splice(i, 1); return true; } return false; }

// --- Stream ---
let STREAMS = [
    { id: 1, name: 'Science' },
    { id: 2, name: 'Commerce' },
    { id: 3, name: 'Arts / Humanities' }
];
let streamCounter = 4;
function saveMasterStream(data) {
    if (data.id) { const s = STREAMS.find(x => x.id === data.id); if (s) { Object.assign(s, data); return s; } }
    data.id = streamCounter++; STREAMS.push(data); return data;
}
function deleteMasterStream(id) { const i = STREAMS.findIndex(s => s.id === id); if (i > -1) { STREAMS.splice(i, 1); return true; } return false; }

// =====================================================================
// SETTINGS MODULE
// =====================================================================

// --- Branches ---
let BRANCHES = [
    { id: 1, name: 'VKIS Main Branch' },
    { id: 2, name: 'VKIS City Campus' }
];
let branchCounter = 3;
function saveBranch(data) {
    if (data.id) { const b = BRANCHES.find(x => x.id === data.id); if (b) { Object.assign(b, data); return b; } }
    data.id = branchCounter++; BRANCHES.push(data); return data;
}
function deleteBranch(id) { const i = BRANCHES.findIndex(b => b.id === id); if (i > -1) { BRANCHES.splice(i, 1); return true; } return false; }

// --- Branch School Settings ---
let BRANCH_SETTINGS = [
    { id: 1, branchId: 1, logo: '', schoolName: 'Vaish Khan International School', tagline: 'Excellence in Education Since 1995', address: 'Sector 12, Noida, Uttar Pradesh', contactPerson: 'Mr. Rajesh Kumar', phone: '0120-4567890', mobile: '9876543210', email: 'main@vkis.edu.in', udiseCode: '09241200501', academicSession: '2025-2026', erpSession: '2025-2026', timeFrom: '08:00', timeTo: '14:00', signingDesignation: 'Principal', signingName: 'Dr. Anita Sharma', signingSignature: '' },
    { id: 2, branchId: 2, logo: '', schoolName: 'VKIS City Campus', tagline: 'Nurturing Future Leaders', address: 'MG Road, New Delhi', contactPerson: 'Mrs. Priya Verma', phone: '011-2345678', mobile: '9876543211', email: 'city@vkis.edu.in', udiseCode: '07071600301', academicSession: '2025-2026', erpSession: '2025-2026', timeFrom: '07:30', timeTo: '13:30', signingDesignation: 'Vice Principal', signingName: 'Mr. Suresh Gupta', signingSignature: '' }
];
let branchSettingCounter = 3;
function saveBranchSetting(branchId, data) {
    let bs = BRANCH_SETTINGS.find(x => x.branchId === branchId);
    if (bs) { Object.assign(bs, data); return bs; }
    data.id = branchSettingCounter++; data.branchId = branchId; BRANCH_SETTINGS.push(data); return data;
}

// --- Settings Users ---
let SETTINGS_USERS = [
    { id: 1, username: 'admin', name: 'Admin User', mobile: '9876543210', email: 'admin@vkis.edu.in', password: 'admin123', branchId: 1 },
    { id: 2, username: 'rverma', name: 'Rajesh Verma', mobile: '9876543211', email: 'rajesh@vkis.edu.in', password: 'rajesh1', branchId: 1 },
    { id: 3, username: 'pkumar', name: 'Priya Kumar', mobile: '9876543212', email: 'priya@vkis.edu.in', password: 'priya12', branchId: 2 },
    { id: 4, username: 'ameena', name: 'Ameena Sheikh', mobile: '9876543213', email: 'ameena@vkis.edu.in', password: 'ameena1', branchId: 1 },
    { id: 5, username: 'skhan', name: 'Salman Khan', mobile: '9876543214', email: 'salman@vkis.edu.in', password: 'salman1', branchId: 2 }
];
let settingsUserCounter = 6;
function generateUsername(name) { return name.toLowerCase().replace(/\s+/g, '').substring(0, 8); }
function saveSettingsUser(data) {
    if (data.id) { const u = SETTINGS_USERS.find(x => x.id === data.id); if (u) { Object.assign(u, data); return u; } }
    data.id = settingsUserCounter++; if (!data.username) data.username = generateUsername(data.name); SETTINGS_USERS.push(data); return data;
}
function deleteSettingsUser(id) { const i = SETTINGS_USERS.findIndex(u => u.id === id); if (i > -1) { SETTINGS_USERS.splice(i, 1); return true; } return false; }

// --- Platform Modules (for permissions) ---
const PLATFORM_MODULES = [
    { key: 'dashboard', name: 'Dashboard', desc: 'Overview, statistics, charts, quick links' },
    { key: 'students', name: 'Students', desc: 'Student list, admission, promotion, assign subjects' },
    { key: 'attendance', name: 'Attendance', desc: 'Student attendance, reports, statistics' },
    { key: 'cards_certs', name: 'Cards & Certificates', desc: 'ID cards, admit cards, character & transfer certificates' },
    { key: 'academics', name: 'Academics', desc: 'Notice, timetable, schedule, syllabus, datesheet, homework, gallery' },
    { key: 'staff', name: 'Staff', desc: 'Staff list, attendance, permissions' },
    { key: 'fee', name: 'Fee', desc: 'Fee deposit, receipt, reports, due, demand bill, discount' },
    { key: 'fee_master', name: 'Fee Master', desc: 'Fee particulars, amount slab configuration' },
    { key: 'payroll', name: 'Payroll', desc: 'Deduction/allowance heads, salary settings, generate, list' },
    { key: 'accounts', name: 'Accounts', desc: 'Expenses, income, heads, cash deposit/withdraw, reports, vendors, bank' },
    { key: 'messaging', name: 'Messaging', desc: 'SMS to students, staff, SMS reports' },
    { key: 'result', name: 'Result', desc: 'Student-wise, subject-wise, consolidated, single/multiple exam results' },
    { key: 'transport', name: 'Transport', desc: 'Vehicles, registration, routes, route mapping' },
    { key: 'library', name: 'Library', desc: 'Books, issue, return, book types, settings' },
    { key: 'masters', name: 'Masters', desc: 'Academic session, designation, class, section, subject, exam, period, house, stream' },
    { key: 'settings', name: 'Settings', desc: 'Users, permissions, branches, options, exam settings' }
];

// --- User Permissions ---
let USER_PERMISSIONS = [];
// Initialize default permissions for user 1 (admin = all true)
PLATFORM_MODULES.forEach(m => { USER_PERMISSIONS.push({ userId: 1, module: m.key, access: true, modify: true, delete: true }); });
// User 2 - limited
PLATFORM_MODULES.forEach(m => { USER_PERMISSIONS.push({ userId: 2, module: m.key, access: ['dashboard', 'students', 'attendance', 'result'].includes(m.key), modify: ['students', 'attendance'].includes(m.key), delete: false }); });

function getUserPermissions(userId) { return PLATFORM_MODULES.map(m => { const p = USER_PERMISSIONS.find(x => x.userId === userId && x.module === m.key); return { module: m.key, moduleName: m.name, desc: m.desc, access: p ? p.access : false, modify: p ? p.modify : false, delete: p ? p.delete : false }; }); }
function saveUserPermissions(userId, perms) {
    USER_PERMISSIONS = USER_PERMISSIONS.filter(x => x.userId !== userId);
    perms.forEach(p => { USER_PERMISSIONS.push({ userId, module: p.module, access: !!p.access, modify: !!p.modify, delete: !!p.delete }); });
}

// --- Activity Log ---
let ACTIVITY_LOG = [
    { id: 1, userId: 1, userName: 'Admin User', activity: 'Logged in to the system', dateTime: '2025-12-01 09:00:15', ipAddress: '192.168.1.100' },
    { id: 2, userId: 1, userName: 'Admin User', activity: 'Viewed Student List', dateTime: '2025-12-01 09:05:30', ipAddress: '192.168.1.100' },
    { id: 3, userId: 2, userName: 'Rajesh Verma', activity: 'Added new student — Arjun Patel (Class 5-A)', dateTime: '2025-12-01 10:20:00', ipAddress: '192.168.1.105' },
    { id: 4, userId: 1, userName: 'Admin User', activity: 'Generated Fee Receipt #1024', dateTime: '2025-12-01 11:15:45', ipAddress: '192.168.1.100' },
    { id: 5, userId: 3, userName: 'Priya Kumar', activity: 'Printed Character Certificate for Riya Sharma', dateTime: '2025-12-02 08:45:10', ipAddress: '192.168.1.110' },
    { id: 6, userId: 2, userName: 'Rajesh Verma', activity: 'Edited attendance for Class 7-B', dateTime: '2025-12-02 09:30:00', ipAddress: '192.168.1.105' },
    { id: 7, userId: 1, userName: 'Admin User', activity: 'Deleted expense entry #45', dateTime: '2025-12-02 14:10:22', ipAddress: '192.168.1.100' },
    { id: 8, userId: 4, userName: 'Ameena Sheikh', activity: 'Viewed Salary List for December', dateTime: '2025-12-03 10:00:00', ipAddress: '192.168.1.112' },
    { id: 9, userId: 5, userName: 'Salman Khan', activity: 'Modified transport route — Route #3', dateTime: '2025-12-03 11:20:30', ipAddress: '192.168.1.115' },
    { id: 10, userId: 1, userName: 'Admin User', activity: 'Updated Branch School Settings', dateTime: '2025-12-03 15:45:00', ipAddress: '192.168.1.100' }
];

// --- Option Settings ---
let OPTION_SETTINGS = {
    academicStartMonth: 'April',
    enableFeeDueInstallment: true,
    enableFeeDueStudentPortal: true,
    enableDiscountInReceipt: false,
    enableSundayWorking: false,
    enableFeeDepositSms: true,
    enableAdmissionSms: true,
    enableAbsentSmsAuto: false,
    enablePresentSmsAuto: false,
    feeDemandBillNote: 'Please submit your fees as soon as possible.'
};

// --- Exam Settings ---
let ADMIT_CARD_INSTRUCTIONS = [
    { id: 1, text: 'Students must carry their admit card to the examination hall.' },
    { id: 2, text: 'No electronic devices are allowed during the exam.' },
    { id: 3, text: 'Students should reach the exam center 30 minutes before the scheduled time.' },
    { id: 4, text: 'Use only blue or black ink pen for writing answers.' }
];
let admitInstructionCounter = 5;
function saveAdmitInstruction(data) {
    if (data.id) { const a = ADMIT_CARD_INSTRUCTIONS.find(x => x.id === data.id); if (a) { a.text = data.text; return a; } }
    data.id = admitInstructionCounter++; ADMIT_CARD_INSTRUCTIONS.push(data); return data;
}
function deleteAdmitInstruction(id) { const i = ADMIT_CARD_INSTRUCTIONS.findIndex(a => a.id === id); if (i > -1) { ADMIT_CARD_INSTRUCTIONS.splice(i, 1); return true; } return false; }

let GRADING_SYSTEM = [
    { id: 1, grade: 'A+', minPercentage: 91, maxPercentage: 100 },
    { id: 2, grade: 'A', minPercentage: 81, maxPercentage: 90 },
    { id: 3, grade: 'B+', minPercentage: 71, maxPercentage: 80 },
    { id: 4, grade: 'B', minPercentage: 61, maxPercentage: 70 },
    { id: 5, grade: 'C+', minPercentage: 51, maxPercentage: 60 },
    { id: 6, grade: 'C', minPercentage: 41, maxPercentage: 50 },
    { id: 7, grade: 'D', minPercentage: 33, maxPercentage: 40 },
    { id: 8, grade: 'E', minPercentage: 0, maxPercentage: 32 }
];
let gradingCounter = 9;
function saveGrade(data) {
    if (data.id) { const g = GRADING_SYSTEM.find(x => x.id === data.id); if (g) { Object.assign(g, data); return g; } }
    data.id = gradingCounter++; GRADING_SYSTEM.push(data); return data;
}
function deleteGrade(id) { const i = GRADING_SYSTEM.findIndex(g => g.id === id); if (i > -1) { GRADING_SYSTEM.splice(i, 1); return true; } return false; }
