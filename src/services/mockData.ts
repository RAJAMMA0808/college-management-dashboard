import { Student, StudentMark, StudentAttendance, Faculty, FacultyAttendance, Staff, StaffAttendance } from '../types';
import { LATEST_ATTENDANCE_DATE } from '../constants';

const colleges = [
    { prefix: 'K', code: 'KNRCER' },
    { prefix: 'B', code: 'BIET' },
    { prefix: 'G', code: 'BGIIT' },
];

const departments = [
    'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'HS', 'CSM', 'CSD', 'CSC'
];

const years = [2020, 2021, 2022, 2023, 2024, 2025];
const studentsPerDept = 60;

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Anika', 'Anvi', 'Diya', 'Pari', 'Myra', 'Sara'];
const lastNames = ['Kumar', 'Singh', 'Gupta', 'Sharma', 'Patel', 'Reddy', 'Khan', 'Verma', 'Yadav', 'Jain'];

// --- Date Range for Attendance ---
const endDate = new Date(LATEST_ATTENDANCE_DATE);
const startDate = new Date(endDate);
startDate.setDate(endDate.getDate() - 90); // 90 days of attendance data

const dateRange: string[] = [];
let currentDate = new Date(startDate);
while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
        dateRange.push(currentDate.toISOString().split('T')[0]);
    }
    currentDate.setDate(currentDate.getDate() + 1);
}

// --- Student Data Generation ---
const generatedStudents: Student[] = [];
const generatedMarks: StudentMark[] = [];
const generatedStudentAttendance: StudentAttendance[] = [];

let studentCounter = 0;

colleges.forEach(college => {
    departments.forEach(dept => {
        years.forEach(year => {
            for (let i = 1; i <= studentsPerDept; i++) {
                const rollNo = i.toString().padStart(3, '0');
                const admissionNumber = `${college.prefix}${dept}${year}${rollNo}`;
                
                const studentName = `${firstNames[studentCounter % firstNames.length]} ${lastNames[studentCounter % lastNames.length]}`;
                const gender = studentCounter % 2 === 0 ? 'M' : 'F';
                
                generatedStudents.push({
                    collegeCode: college.code,
                    programCode: dept,
                    admissionNumber,
                    studentName,
                    gender,
                });
                
                const marksObtained = Math.floor(Math.random() * 30) + 10;
                generatedMarks.push({
                    admissionNumber,
                    semester: 1,
                    subjectCode: `${dept}101`,
                    subjectName: `Intro to ${dept}`,
                    marksObtained: marksObtained,
                    maxMarks: 40,
                });

                // Generate attendance for the date range
                dateRange.forEach(date => {
                    const morning = Math.random() > 0.1 ? 'Present' : 'Absent';
                    const afternoon = morning === 'Present' && Math.random() > 0.2 ? 'Present' : 'Absent';
                    generatedStudentAttendance.push({
                        admissionNumber,
                        date,
                        morning,
                        afternoon,
                    });
                });

                studentCounter++;
            }
        });
    });
});

export const mockStudents: Student[] = generatedStudents;
export const mockStudentMarks: StudentMark[] = generatedMarks;
export const mockStudentAttendance: StudentAttendance[] = generatedStudentAttendance;

// --- Faculty Data Generation ---
const facultyJoinData = {
    KNRCER: { CSE: { date: '15042020', count: 10 }, ECE: { date: '12052021', count: 5 }, EEE: { date: '01012022', count: 8 }, MECH: { date: '20032020', count: 6 }, CIVIL: { date: '10022021', count: 4 }, HS: { date: '25082020', count: 3 }, CSM: { date: '18072021', count: 2 }, CSD: { date: '05062022', count: 3 }, CSC: { date: '15092021', count: 2 } },
    BIET: { CSE: { date: '01032020', count: 5 }, ECE: { date: '10072020', count: 2 }, EEE: { date: '15082021', count: 4 }, MECH: { date: '22012022', count: 3 }, CIVIL: { date: '05022020', count: 4 }, HS: { date: '12032021', count: 3 }, CSM: { date: '18042022', count: 2 }, CSD: { date: '20062020', count: 2 }, CSC: { date: '08072021', count: 2 } },
    BGIIT: { CSE: { date: '05012021', count: 3 }, ECE: { date: '15022020', count: 2 }, EEE: { date: '12032022', count: 2 }, MECH: { date: '05012022', count: 2 }, CIVIL: { date: '20042020', count: 2 }, HS: { date: '10062021', count: 2 }, CSM: { date: '15072022', count: 2 }, CSD: { date: '25082021', count: 2 }, CSC: { date: '30092020', count: 2 } },
};
const generatedFaculty: Faculty[] = [];
const generatedFacultyAttendance: FacultyAttendance[] = [];
let facultyCounter = 0;

Object.entries(facultyJoinData).forEach(([collegeCode, depts]) => {
    const collegePrefix = colleges.find(c => c.code === collegeCode)!.prefix;
    Object.entries(depts).forEach(([deptCode, details]) => {
        for (let i = 1; i <= details.count; i++) {
            const serialNo = i.toString().padStart(3, '0');
            const facultyId = `${collegePrefix}${deptCode}${details.date}-${serialNo}`;
            const facultyName = `Prof. ${firstNames[(facultyCounter + 5) % firstNames.length]} ${lastNames[(facultyCounter + 5) % lastNames.length]}`;
            const gender = facultyCounter % 3 === 0 ? 'F' : 'M';

            generatedFaculty.push({
                collegeCode,
                programCode: deptCode,
                facultyId,
                facultyName,
                gender,
            });
            
            dateRange.forEach(date => {
                const morning = Math.random() > 0.05 ? 'Present' : 'Absent';
                const afternoon = morning === 'Present' && Math.random() > 0.1 ? 'Present' : 'Absent';
                generatedFacultyAttendance.push({
                    facultyId,
                    date,
                    morning,
                    afternoon,
                });
            });
            facultyCounter++;
        }
    });
});

export const mockFaculty: Faculty[] = generatedFaculty;
export const mockFacultyAttendance: FacultyAttendance[] = generatedFacultyAttendance;

// --- Staff Data Generation ---
const generatedStaff: Staff[] = [];
const generatedStaffAttendance: StaffAttendance[] = [];
let staffCounter = 0;

colleges.forEach(college => {
    for (let i = 1; i <= 5; i++) { // Generate 5 staff members per college
        const staffId = `${college.prefix}STF${i.toString().padStart(3, '0')}`;
        const staffName = `${firstNames[(staffCounter + 10) % firstNames.length]} ${lastNames[(staffCounter + 10) % lastNames.length]}`;
        const gender = staffCounter % 2 === 0 ? 'M' : 'F';

        generatedStaff.push({
            collegeCode: college.code,
            staffId,
            staffName,
            gender,
        });

        dateRange.forEach(date => {
            const morning = Math.random() > 0.08 ? 'Present' : 'Absent';
            const afternoon = morning === 'Present' && Math.random() > 0.15 ? 'Present' : 'Absent';
            generatedStaffAttendance.push({
                staffId,
                date,
                morning,
                afternoon,
            });
        });
        staffCounter++;
    }
});

export const mockStaff: Staff[] = generatedStaff;
export const mockStaffAttendance: StaffAttendance[] = generatedStaffAttendance;
