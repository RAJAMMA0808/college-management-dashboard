import { College, Role, User } from '@shared/types';

export const COLLEGE_NAMES: { [key in College]: string } = {
  [College.ALL]: 'All Colleges Overview',
  [College.BIET]: 'BIET - Big Institute of Engineering and Technology',
  [College.BGIIT]: 'BGIIT - Brilliant Institute of Engineering and Technology',
  [College.KNRCER]: 'KNRCER - Kasireddy Narayanreddy College of Engineering',
};

export const MOCK_USERS: User[] = [
    { id: 'CHAIRMAN01', name: 'Dr. Chairman', email: 'chairman@edu.com', password: 'password123', role: Role.CHAIRMAN, college: null },
    { id: 'dharmaraj', name: 'Dharmaraj', email: 'dharma@edu.com', password: 'password123', role: Role.CHAIRMAN, college: null },
    { id: 'KCSEHOD01', name: 'Dr. K. Sharma (HOD)', email: 'hod.kcser@edu.com', password: 'password123', role: Role.HOD, college: College.KNRCER },
    { id: 'BCSEF2021-21001', name: 'Prof. B. Verma', email: 'faculty.biet@edu.com', password: 'password123', role: Role.FACULTY, college: College.BIET },
];

export const DEPARTMENTS = [
    'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'HS', 'CSM', 'CSD', 'CSC'
];

export const LATEST_ATTENDANCE_DATE = '2025-09-15';
