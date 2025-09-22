import React, { useState, useEffect, useCallback } from 'react';
import { College, DashboardData, Role, User } from '../types';
import { getDashboardData, getFilteredStudentDetails, getFilteredFacultyDetails, getFilteredStaffDetails } from '../services/api';
import { COLLEGE_NAMES, LATEST_ATTENDANCE_DATE, DEPARTMENTS } from '../constants';
import MetricSection from './MetricSection';
import { DownloadIcon } from './icons';

interface DashboardProps {
  user: User;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const getInitialDate = () => {
    const today = new Date(LATEST_ATTENDANCE_DATE);
    return formatDate(today);
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  const initialCollege = user.role === Role.CHAIRMAN ? College.ALL : user.college!;
  const [selectedCollege, setSelectedCollege] = useState<College>(initialCollege);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRollNo, setSelectedRollNo] = useState<string>('all');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('all');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [isDownloading, setIsDownloading] = useState(false);

  // --- Filter Exclusivity Logic ---
  useEffect(() => {
    if (selectedFacultyId !== 'all') {
      setSelectedDepartment('all');
      setSelectedYear('all');
      setSelectedRollNo('all');
      setSelectedStaffId('all');
    }
  }, [selectedFacultyId]);
  
  useEffect(() => {
      if (selectedStaffId !== 'all') {
          setSelectedDepartment('all');
          setSelectedYear('all');
          setSelectedRollNo('all');
          setSelectedFacultyId('all');
      }
  }, [selectedStaffId]);

  useEffect(() => {
    if (selectedDepartment !== 'all' || selectedYear !== 'all' || selectedRollNo !== 'all') {
      setSelectedFacultyId('all');
      setSelectedStaffId('all');
    }
  }, [selectedDepartment, selectedYear, selectedRollNo]);
  
  // --- Auto-select college from ID for Chairman ---
  useEffect(() => {
    if (user.role === Role.CHAIRMAN) {
        const id = selectedFacultyId !== 'all' ? selectedFacultyId : selectedStaffId;
        if (id && id !== 'all') {
            const prefix = id.charAt(0).toUpperCase();
            let collegeToSet: College | null = null;
            if (prefix === 'K') collegeToSet = College.KNRCER;
            else if (prefix === 'B') collegeToSet = College.BIET;
            else if (prefix === 'G') collegeToSet = College.BGIIT;

            if (collegeToSet && collegeToSet !== selectedCollege) {
                setSelectedCollege(collegeToSet);
            }
        }
    }
  }, [selectedFacultyId, selectedStaffId, user.role, selectedCollege]);
  
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const data = await getDashboardData(
        selectedCollege, 
        selectedYear, 
        selectedDepartment, 
        selectedRollNo, 
        selectedFacultyId,
        selectedStaffId,
        selectedDate,
        selectedDate
    );
    setDashboardData(data);
    setLoading(false);
  }, [selectedCollege, selectedYear, selectedDepartment, selectedRollNo, selectedFacultyId, selectedStaffId, selectedDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
 const handleDownload = async () => {
    setIsDownloading(true);
    try {
        if (selectedFacultyId !== 'all') {
            const facultyData = await getFilteredFacultyDetails(selectedFacultyId, selectedDate, selectedDate);
            if (facultyData.length === 0) { alert('No faculty data found for the given ID in this period.'); return; }
            const headers = ['Faculty ID', 'Faculty Name', 'College', 'Department', 'Gender', 'Total Days', 'Present Days', 'Absent Days', 'Half Days'];
            const csvRows = [headers.join(',')];
            facultyData.forEach(f => {
                const row = [`"${f.facultyId}"`, `"${f.facultyName}"`, `"${f.collegeCode}"`, `"${f.programCode}"`, `"${f.gender}"`, f.totalDays, f.presentDays, f.absentDays, f.halfDays];
                csvRows.push(row.join(','));
            });
            downloadCsv(csvRows, `faculty_${selectedFacultyId}_data.csv`);

        } else if (selectedStaffId !== 'all') {
            const staffData = await getFilteredStaffDetails(selectedStaffId, selectedDate, selectedDate);
            if (staffData.length === 0) { alert('No staff data found for the given ID in this period.'); return; }
            const headers = ['Staff ID', 'Staff Name', 'College', 'Gender', 'Total Days', 'Present Days', 'Absent Days', 'Half Days'];
            const csvRows = [headers.join(',')];
            staffData.forEach(s => {
                const row = [`"${s.staffId}"`, `"${s.staffName}"`, `"${s.collegeCode}"`, `"${s.gender}"`, s.totalDays, s.presentDays, s.absentDays, s.halfDays];
                csvRows.push(row.join(','));
            });
            downloadCsv(csvRows, `staff_${selectedStaffId}_data.csv`);

        } else {
            const studentData = await getFilteredStudentDetails(selectedCollege, selectedYear, selectedDepartment, selectedRollNo, selectedDate, selectedDate);
            if (studentData.length === 0) { alert('No student data to download for the current selection.'); return; }
            const headers = ['Admission Number', 'Student Name', 'College', 'Department', 'Gender', 'Total Days', 'Present Days', 'Absent Days', 'Half Days', 'Academic Result'];
            const csvRows = [headers.join(',')];
            studentData.forEach(s => {
                const row = [`"${s.admissionNumber}"`, `"${s.studentName}"`, `"${s.collegeCode}"`, `"${s.programCode}"`, `"${s.gender}"`, s.totalDays, s.presentDays, s.absentDays, s.halfDays, `"${s.academicResult}"`];
                csvRows.push(row.join(','));
            });
            downloadCsv(csvRows, 'student_data.csv');
        }
    } catch (error) {
        console.error("Failed to download CSV:", error);
        alert('An error occurred while preparing the download.');
    } finally {
        setIsDownloading(false);
    }
};

const downloadCsv = (rows: string[], filename: string) => {
    const csvString = rows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


  const renderHeader = () => (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white">Welcome back, {user.name}!</h2>
            <p className="text-slate-400 mt-1 text-sm">
                Showing attendance for: <span className="font-semibold text-white">{selectedDate}</span>
            </p>
        </div>
        <div className="flex items-center gap-4">
            <label htmlFor="attendance-date" className="text-sm font-medium text-slate-400">Select Date:</label>
             <input 
                id="attendance-date"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            />
        </div>
    </div>
  );

  const isStudentFilterActive = selectedDepartment !== 'all' || selectedYear !== 'all' || selectedRollNo !== 'all';
  const isFacultyFilterActive = selectedFacultyId !== 'all';
  const isStaffFilterActive = selectedStaffId !== 'all';
  const isIndividualFilterActive = isFacultyFilterActive || isStaffFilterActive;
  
  const commonSelectClass = "bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed";
  const commonInputClass = "bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed";

  const renderFilters = () => {
    const years = ['all', '2020', '2021', '2022', '2023', '2024', '2025'];
    const rollNumbers = Array.from({ length: 60 }, (_, i) => (i + 1).toString().padStart(3, '0'));
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8 items-end">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">College</label>
                    {user.role === Role.CHAIRMAN ? (
                        <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value as College)} className={commonSelectClass}>
                            {Object.entries(COLLEGE_NAMES).map(([key, name]) => (<option key={key} value={key}>{name}</option>))}
                        </select>
                    ) : (
                        <div className={commonSelectClass + " pt-2.5"}>{COLLEGE_NAMES[selectedCollege]}</div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Department</label>
                    <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} disabled={isIndividualFilterActive} className={commonSelectClass}>
                      <option value="all">All Depts</option>
                      {DEPARTMENTS.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Admission Year</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} disabled={isIndividualFilterActive} className={commonSelectClass}>
                      <option value="all">All Years</option>
                      {years.filter(y => y !== 'all').map(year => (<option key={year} value={year}>{year}</option>))}
                    </select>
                </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Roll No.</label>
                    <select value={selectedRollNo} onChange={(e) => setSelectedRollNo(e.target.value)} disabled={isIndividualFilterActive} className={commonSelectClass}>
                      <option value="all">All Roll Nos</option>
                      {rollNumbers.map(rn => (<option key={rn} value={rn}>{rn}</option>))}
                    </select>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Faculty ID</label>
                        <input type="text" placeholder="Enter Faculty ID" value={selectedFacultyId === 'all' ? '' : selectedFacultyId} onChange={(e) => setSelectedFacultyId(e.target.value || 'all')} disabled={isStudentFilterActive || isStaffFilterActive} className={commonInputClass} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Staff ID</label>
                        <input type="text" placeholder="Enter Staff ID" value={selectedStaffId === 'all' ? '' : selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value || 'all')} disabled={isStudentFilterActive || isFacultyFilterActive} className={commonInputClass} />
                    </div>
                </div>
            </div>
            
             <div className="col-span-full flex justify-end">
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <DownloadIcon className="h-5 w-5" />
                    <span>Download CSV</span>
                </button>
            </div>
        </div>
    );
};
  
  if (loading || !dashboardData) {
    return <div className="flex-1 p-8 text-white flex items-center justify-center">Loading dashboard...</div>;
  }
  
  return (
    <main className="flex-1 p-8 bg-transparent overflow-y-auto">
      {renderHeader()}
      {renderFilters()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isStudentFilterActive && (
            <>
                <MetricSection title="Student Attendance" metrics={dashboardData.studentAttendance} type="student" />
                <MetricSection title="Student Academic Performance" metrics={dashboardData.studentAcademics} type="academic" />
            </>
        )}
        
        {isFacultyFilterActive && (
             <MetricSection title="Faculty Metrics" metrics={dashboardData.facultyMetrics} type="faculty" />
        )}
        
        {isStaffFilterActive && (
             <MetricSection title="Staff Metrics" metrics={dashboardData.staffMetrics} type="staff" />
        )}
        
        {!isStudentFilterActive && !isFacultyFilterActive && !isStaffFilterActive && (
             <>
                <MetricSection title="Student Attendance" metrics={dashboardData.studentAttendance} type="student" />
                <MetricSection title="Student Academic Performance" metrics={dashboardData.studentAcademics} type="academic" />
                <MetricSection title="Faculty Metrics" metrics={dashboardData.facultyMetrics} type="faculty" />
                <MetricSection title="Staff Metrics" metrics={dashboardData.staffMetrics} type="staff" />
             </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;