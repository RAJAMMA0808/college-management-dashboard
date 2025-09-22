export enum Role {
  CHAIRMAN = 'CHAIRMAN',
  HOD = 'HOD',
  FACULTY = 'FACULTY',
  STAFF = 'STAFF',
}

export enum College {
  ALL = 'ALL',
  BIET = 'BIET',
  BGIIT = 'BGIIT',
  KNRCER = 'KNRCER',
}

export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string;
  role: Role;
  college: College | null;
}

export interface Student {
  collegeCode: string;
  programCode: string;
  admissionNumber: string;
  studentName: string;
  gender: 'M' | 'F';
}

export interface StudentMark {
  admissionNumber: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
}

export interface StudentAttendance {
  admissionNumber: string;
  date: string;
  morning: 'Present' | 'Absent';
  afternoon: 'Present' | 'Absent';
}

export interface Faculty {
    collegeCode: string;
    programCode: string;
    facultyId: string;
    facultyName: string;
    gender: 'M' | 'F';
}

export interface FacultyAttendance {
    facultyId: string;
    date: string;
    morning: 'Present' | 'Absent';
    afternoon: 'Present' | 'Absent';
}

export interface Staff {
    collegeCode: string;
    staffId: string;
    staffName: string;
    gender: 'M' | 'F';
}

export interface StaffAttendance {
    staffId: string;
    date: string;
    morning: 'Present' | 'Absent';
    afternoon: 'Present' | 'Absent';
}


export interface DashboardData {
    studentAttendance: {
        total: number;
        present: number;
        absent: number;
        fullDay: number;
        halfDay: number;
    };
    studentAcademics: {
        passPercentage: number;
        passCount: number;
        failCount: number;
    };
    facultyMetrics: {
        total: number;
        fullDay: number;
        halfDay: number;
        absent: number;
    };
    staffMetrics: {
        total: number;
        present: number;
        absent: number;
        fullDay: number;
        halfDay: number;
    };
}

export interface StudentDetailsType extends Student {
  marks: StudentMark[];
  attendance: StudentAttendance[];
}

export interface DetailedStudentCSVData {
    admissionNumber: string;
    studentName: string;
    collegeCode: string;
    programCode: string;
    gender: 'M' | 'F';
    totalDays: number;
    presentDays: number;
    absentDays: number;
    halfDays: number;
    academicResult: string;
}

export interface DetailedFacultyCSVData {
    facultyId: string;
    facultyName: string;
    collegeCode: string;
    programCode: string;
    gender: 'M' | 'F';
    totalDays: number;
    presentDays: number;
    absentDays: number;
    halfDays: number;
}

export interface DetailedStaffCSVData {
    staffId: string;
    staffName: string;
    collegeCode: string;
    gender: 'M' | 'F';
    totalDays: number;
    presentDays: number;
    absentDays: number;
    halfDays: number;
}