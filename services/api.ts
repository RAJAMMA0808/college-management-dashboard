import {
  College,
  DashboardData,
  DetailedFacultyCSVData,
  DetailedStaffCSVData,
  DetailedStudentCSVData,
  Faculty,
  Staff,
  Student,
  StudentDetailsType,
} from '../types';
import {
  mockFaculty,
  mockFacultyAttendance,
  mockStaff,
  mockStaffAttendance,
  mockStudentAttendance,
  mockStudentMarks,
  mockStudents,
} from './mockData';

const PASSING_PERCENTAGE = 0.4;

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStudentsForCollege = (college: College, year: string, department: string, rollNo: string): Student[] => {
  let filteredStudents: Student[];
  
  if (college === College.ALL) {
    filteredStudents = mockStudents;
  } else {
    filteredStudents = mockStudents.filter(s => s.collegeCode === college);
  }

  if (year !== 'all') {
      filteredStudents = filteredStudents.filter(student => {
          const match = student.admissionNumber.match(/\d{4}/);
          return match ? match[0] === year : false;
      });
  }

  if (department !== 'all') {
    filteredStudents = filteredStudents.filter(student => student.programCode === department);
  }

  if (rollNo !== 'all') {
    filteredStudents = filteredStudents.filter(student => student.admissionNumber.endsWith(rollNo));
  }
  
  return filteredStudents;
};

const getFacultyForCollege = (college: College): Faculty[] => {
    if (college === College.ALL) {
      return mockFaculty;
    }
    return mockFaculty.filter(f => f.collegeCode === college);
};

const getStaffForCollege = (college: College): Staff[] => {
    if (college === College.ALL) {
        return mockStaff;
    }
    return mockStaff.filter(s => s.collegeCode === college);
};


export const getDashboardData = async (
    college: College, 
    year: string, 
    department: string, 
    rollNo: string, 
    facultyId: string,
    staffId: string,
    startDate: string,
    endDate: string
): Promise<DashboardData> => {
  await simulateDelay(500);
  
  const emptyStudentAttendance = { total: 0, present: 0, absent: 0, fullDay: 0, halfDay: 0 };
  const emptyStudentAcademics = { passPercentage: 0, passCount: 0, failCount: 0 };
  const emptyFacultyMetrics = { total: 0, fullDay: 0, halfDay: 0, absent: 0 };
  const emptyStaffMetrics = { total: 0, present: 0, absent: 0, fullDay: 0, halfDay: 0 };

  // --- Faculty ID Specific View ---
  if (facultyId && facultyId !== 'all') {
      const facultyMember = mockFaculty.find(f => f.facultyId.toLowerCase() === facultyId.toLowerCase());
      if (facultyMember) {
          const attendance = mockFacultyAttendance.filter(att => att.facultyId === facultyMember.facultyId && att.date >= startDate && att.date <= endDate);
          const fullDay = attendance.filter(a => a.morning === 'Present' && a.afternoon === 'Present').length;
          const halfDay = attendance.filter(a => (a.morning === 'Present' && a.afternoon === 'Absent') || (a.morning === 'Absent' && a.afternoon === 'Present')).length;
          
          return {
              studentAttendance: emptyStudentAttendance,
              studentAcademics: emptyStudentAcademics,
              facultyMetrics: {
                  total: 1, fullDay, halfDay, absent: attendance.length - fullDay - halfDay,
              },
              staffMetrics: emptyStaffMetrics,
          };
      }
  }
  
  // --- Staff ID Specific View ---
   if (staffId && staffId !== 'all') {
      const staffMember = mockStaff.find(s => s.staffId.toLowerCase() === staffId.toLowerCase());
       if (staffMember) {
           const attendance = mockStaffAttendance.filter(att => att.staffId === staffMember.staffId && att.date >= startDate && att.date <= endDate);
           const fullDay = attendance.filter(a => a.morning === 'Present' && a.afternoon === 'Present').length;
           const halfDay = attendance.filter(a => (a.morning === 'Present' && a.afternoon === 'Absent') || (a.morning === 'Absent' && a.afternoon === 'Present')).length;
           const present = fullDay + halfDay;
           const absent = attendance.filter(a => a.morning === 'Absent' && a.afternoon === 'Absent').length;

           return {
               studentAttendance: emptyStudentAttendance,
               studentAcademics: emptyStudentAcademics,
               facultyMetrics: emptyFacultyMetrics,
               staffMetrics: {
                   total: 1, present, absent, fullDay, halfDay,
               },
           };
       }
   }

  // --- Standard Aggregated View ---
  const relevantStudents = getStudentsForCollege(college, year, department, rollNo);
  const studentIds = relevantStudents.map(s => s.admissionNumber);
  
  const relevantAttendance = mockStudentAttendance.filter(
    att => studentIds.includes(att.admissionNumber) && att.date >= startDate && att.date <= endDate
  );

  const fullDayStudents = relevantAttendance.filter(att => att.morning === 'Present' && att.afternoon === 'Present').length;
  const halfDayStudents = relevantAttendance.filter(att => (att.morning === 'Present' && att.afternoon === 'Absent') || (att.morning === 'Absent' && att.afternoon === 'Present')).length;
  const presentStudents = fullDayStudents + halfDayStudents;
  const absentStudents = relevantAttendance.filter(att => att.morning === 'Absent' && att.afternoon === 'Absent').length;

  // Note: Academics are not filtered by date
  const relevantMarks = mockStudentMarks.filter(mark => studentIds.includes(mark.admissionNumber));
  
  const studentPassFail = relevantStudents.map(student => {
    const marks = relevantMarks.filter(m => m.admissionNumber === student.admissionNumber);
    if (marks.length === 0) return 'pass'; 
    const totalMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMaxMarks = marks.reduce((sum, m) => sum + m.maxMarks, 0);
    return (totalMarks / totalMaxMarks) >= PASSING_PERCENTAGE ? 'pass' : 'fail';
  });

  const passCount = studentPassFail.filter(s => s === 'pass').length;
  const failCount = studentPassFail.filter(s => s === 'fail').length;
  const passPercentage = relevantStudents.length > 0 ? (passCount / relevantStudents.length) * 100 : 0;

  const relevantFaculty = getFacultyForCollege(college);
  const facultyIds = relevantFaculty.map(f => f.facultyId);

  const relevantFacultyAttendance = mockFacultyAttendance.filter(
    att => facultyIds.includes(att.facultyId) && att.date >= startDate && att.date <= endDate
  );

  const fullDayFaculty = relevantFacultyAttendance.filter(att => att.morning === 'Present' && att.afternoon === 'Present').length;
  const halfDayFaculty = relevantFacultyAttendance.filter(att => (att.morning === 'Present' && att.afternoon === 'Absent') || (att.morning === 'Absent' && att.afternoon === 'Present')).length;
  const absentFaculty = relevantFacultyAttendance.filter(att => att.morning === 'Absent' && att.afternoon === 'Absent').length;

  const relevantStaff = getStaffForCollege(college);
  const staffIds = relevantStaff.map(s => s.staffId);

  const relevantStaffAttendance = mockStaffAttendance.filter(
    att => staffIds.includes(att.staffId) && att.date >= startDate && att.date <= endDate
  );

  const fullDayStaff = relevantStaffAttendance.filter(att => att.morning === 'Present' && att.afternoon === 'Present').length;
  const halfDayStaff = relevantStaffAttendance.filter(att => (att.morning === 'Present' && att.afternoon === 'Absent') || (att.morning === 'Absent' && att.afternoon === 'Present')).length;
  const presentStaff = fullDayStaff + halfDayStaff;
  const absentStaff = relevantStaffAttendance.filter(att => att.morning === 'Absent' && att.afternoon === 'Absent').length;
  
  return {
    studentAttendance: {
      total: relevantStudents.length, // Total unique students
      present: presentStudents,
      absent: absentStudents,
      fullDay: fullDayStudents,
      halfDay: halfDayStudents,
    },
    studentAcademics: {
      passPercentage: parseFloat(passPercentage.toFixed(1)),
      passCount,
      failCount,
    },
    facultyMetrics: {
        total: relevantFaculty.length,
        fullDay: fullDayFaculty,
        halfDay: halfDayFaculty,
        absent: absentFaculty,
    },
    staffMetrics: {
        total: relevantStaff.length,
        present: presentStaff,
        absent: absentStaff,
        fullDay: fullDayStaff,
        halfDay: halfDayStaff,
    }
  };
};

export const getStudents = async (college: College): Promise<Student[]> => {
    await simulateDelay(300);
    return getStudentsForCollege(college, 'all', 'all', 'all');
};

export const searchStudents = async (query: string, college: College): Promise<Student[]> => {
    await simulateDelay(200);
    const students = getStudentsForCollege(college, 'all', 'all', 'all');
    if (!query) return students;

    const lowerCaseQuery = query.toLowerCase();
    return students.filter(student => 
        student.studentName.toLowerCase().includes(lowerCaseQuery) ||
        student.admissionNumber.toLowerCase().includes(lowerCaseQuery)
    );
};

export const getStudentDetails = async (admissionNumber: string): Promise<StudentDetailsType | null> => {
    await simulateDelay(400);
    const student = mockStudents.find(s => s.admissionNumber === admissionNumber);
    if (!student) return null;

    const marks = mockStudentMarks.filter(m => m.admissionNumber === admissionNumber);
    const attendance = mockStudentAttendance.filter(a => a.admissionNumber === admissionNumber);

    return {
        ...student,
        marks,
        attendance,
    };
};

export const getFilteredStudentDetails = async (
    college: College, year: string, department: string, rollNo: string, startDate: string, endDate: string
): Promise<DetailedStudentCSVData[]> => {
    const relevantStudents = getStudentsForCollege(college, year, department, rollNo);

    const detailedStudents = relevantStudents.map(student => {
        const attendanceInRange = mockStudentAttendance.filter(
            att => att.admissionNumber === student.admissionNumber && att.date >= startDate && att.date <= endDate
        );
        
        const fullDays = attendanceInRange.filter(a => a.morning === 'Present' && a.afternoon === 'Present').length;
        const halfDays = attendanceInRange.filter(a => (a.morning === 'Present' && a.afternoon === 'Absent') || (a.morning === 'Absent' && a.afternoon === 'Present')).length;
        const absentDays = attendanceInRange.filter(a => a.morning === 'Absent' && a.afternoon === 'Absent').length;

        const marks = mockStudentMarks.filter(m => m.admissionNumber === student.admissionNumber);
        let academicResult = 'Pass';
        if (marks.length > 0) {
            const totalMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0);
            const totalMaxMarks = marks.reduce((sum, m) => sum + m.maxMarks, 0);
            if ((totalMarks / totalMaxMarks) < PASSING_PERCENTAGE) {
                academicResult = 'Fail';
            }
        }

        return {
            admissionNumber: student.admissionNumber,
            studentName: student.studentName,
            collegeCode: student.collegeCode,
            programCode: student.programCode,
            gender: student.gender,
            totalDays: attendanceInRange.length,
            presentDays: fullDays,
            absentDays: absentDays,
            halfDays: halfDays,
            academicResult: academicResult,
        };
    });

    return detailedStudents;
};

export const getFilteredFacultyDetails = async (facultyId: string, startDate: string, endDate: string): Promise<DetailedFacultyCSVData[]> => {
    if (!facultyId || facultyId === 'all') {
        return [];
    }
    const facultyMember = mockFaculty.find(f => f.facultyId.toLowerCase() === facultyId.toLowerCase());
    if (!facultyMember) {
        return [];
    }
    
    const attendanceInRange = mockFacultyAttendance.filter(
        att => att.facultyId === facultyMember.facultyId && att.date >= startDate && att.date <= endDate
    );

    const fullDays = attendanceInRange.filter(a => a.morning === 'Present' && a.afternoon === 'Present').length;
    const halfDays = attendanceInRange.filter(a => (a.morning === 'Present' && a.afternoon === 'Absent') || (a.morning === 'Absent' && a.afternoon === 'Present')).length;
    const absentDays = attendanceInRange.filter(a => a.morning === 'Absent' && a.afternoon === 'Absent').length;

    const result: DetailedFacultyCSVData = {
        facultyId: facultyMember.facultyId,
        facultyName: facultyMember.facultyName,
        collegeCode: facultyMember.collegeCode,
        programCode: facultyMember.programCode,
        gender: facultyMember.gender,
        totalDays: attendanceInRange.length,
        presentDays: fullDays,
        absentDays: absentDays,
        halfDays: halfDays,
    };
    return [result];
};

export const getFilteredStaffDetails = async (staffId: string, startDate: string, endDate: string): Promise<DetailedStaffCSVData[]> => {
    if (!staffId || staffId === 'all') {
        return [];
    }
    const staffMember = mockStaff.find(s => s.staffId.toLowerCase() === staffId.toLowerCase());
    if (!staffMember) {
        return [];
    }

    const attendanceInRange = mockStaffAttendance.filter(
        att => att.staffId === staffMember.staffId && att.date >= startDate && att.date <= endDate
    );

    const fullDays = attendanceInRange.filter(a => a.morning === 'Present' && a.afternoon === 'Present').length;
    const halfDays = attendanceInRange.filter(a => (a.morning === 'Present' && a.afternoon === 'Absent') || (a.morning === 'Absent' && a.afternoon === 'Present')).length;
    const absentDays = attendanceInRange.filter(a => a.morning === 'Absent' && a.afternoon === 'Absent').length;

    const result: DetailedStaffCSVData = {
        staffId: staffMember.staffId,
        staffName: staffMember.staffName,
        collegeCode: staffMember.collegeCode,
        gender: staffMember.gender,
        totalDays: attendanceInRange.length,
        presentDays: fullDays,
        absentDays: absentDays,
        halfDays: halfDays,
    };
    return [result];
};