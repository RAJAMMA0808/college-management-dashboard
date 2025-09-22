import React from 'react';
import { DashboardData } from '../types';
import DashboardCard from './DashboardCard';
import PieChart from './PieChart';
import { AcademicCapIcon, CheckCircleIcon, UsersIcon, XCircleIcon } from './icons';

type MetricSectionProps = {
  title: string;
  metrics: DashboardData[keyof DashboardData];
  type: 'student' | 'academic' | 'faculty' | 'staff';
}

const MetricSection: React.FC<MetricSectionProps> = ({ title, metrics, type }) => {
    const getPieChartData = () => {
        switch(type) {
            case 'student':
                const sa = metrics as DashboardData['studentAttendance'];
                return [
                    { name: 'Full Day', value: sa.fullDay, color: '#10B981' }, // Emerald-500
                    { name: 'Half Day', value: sa.halfDay, color: '#EAB308' }, // Yellow-500
                    { name: 'Absent', value: sa.absent, color: '#F43F5E' },  // Rose-500
                ];
            case 'academic':
                const sc = metrics as DashboardData['studentAcademics'];
                return [
                    { name: 'Passed', value: sc.passCount, color: '#3B82F6' },  // Blue-500
                    { name: 'Failed', value: sc.failCount, color: '#F97316' },  // Orange-500
                ];
            case 'faculty':
                const fm = metrics as DashboardData['facultyMetrics'];
                return [
                    { name: 'Full Day', value: fm.fullDay, color: '#8B5CF6' },  // Violet-500
                    { name: 'Half Day', value: fm.halfDay, color: '#EAB308' }, // Yellow-500
                    { name: 'Absent', value: fm.absent, color: '#D946EF' },   // Fuchsia-500
                ];
            case 'staff':
                const sm = metrics as DashboardData['staffMetrics'];
                return [
                    { name: 'Full Day', value: sm.fullDay, color: '#06B6D4' },   // Cyan-500
                    { name: 'Half Day', value: sm.halfDay, color: '#EAB308' }, // Yellow-500
                    { name: 'Absent', value: sm.absent, color: '#EC4899' },   // Pink-500
                ];
            default:
                return [];
        }
    };
  
    const renderCards = () => {
        switch(type) {
            case 'student':
                const sa = metrics as DashboardData['studentAttendance'];
                return <>
                    <DashboardCard title="Total Students" value={sa.total} icon={<UsersIcon className="h-6 w-6 text-white" />} color="blue" />
                    <DashboardCard title="Present" value={sa.present} icon={<CheckCircleIcon className="h-6 w-6 text-white" />} color="green" />
                    <DashboardCard title="Absent" value={sa.absent} icon={<XCircleIcon className="h-6 w-6 text-white" />} color="red" />
                    <DashboardCard title="Half Day" value={sa.halfDay} icon={<CheckCircleIcon className="h-6 w-6 text-white" />} color="yellow" />
                </>;
            case 'academic':
                 const sc = metrics as DashboardData['studentAcademics'];
                return <>
                    <DashboardCard title="Pass %" value={`${sc.passPercentage}%`} icon={<AcademicCapIcon className="h-6 w-6 text-white" />} color="indigo" />
                    <DashboardCard title="Passed" value={sc.passCount} icon={<CheckCircleIcon className="h-6 w-6 text-white" />} color="green" />
                    <DashboardCard title="Failed" value={sc.failCount} icon={<XCircleIcon className="h-6 w-6 text-white" />} color="red" />
                </>;
            case 'faculty':
                const fm = metrics as DashboardData['facultyMetrics'];
                return <>
                    <DashboardCard title="Total Faculty" value={fm.total} icon={<UsersIcon className="h-6 w-6 text-white" />} color="blue" />
                    <DashboardCard title="Full Day" value={fm.fullDay} icon={<CheckCircleIcon className="h-6 w-6 text-white" />} color="green" />
                    <DashboardCard title="Half Day" value={fm.halfDay} icon={<CheckCircleIcon className="h-6 w-6 text-white" />} color="yellow" />
                    <DashboardCard title="Absent" value={fm.absent} icon={<XCircleIcon className="h-6 w-6 text-white" />} color="red" />
                </>;
            case 'staff':
                const sm = metrics as DashboardData['staffMetrics'];
                return <>
                    <DashboardCard title="Total Staff" value={sm.total} icon={<UsersIcon className="h-6 w-6 text-white" />} color="blue" />
                    <DashboardCard title="Present" value={sm.present} icon={<CheckCircleIcon className="h-6 w-6 text-white" />} color="green" />
                    <DashboardCard title="Absent" value={sm.absent} icon={<XCircleIcon className="h-6 w-6 text-white" />} color="red" />
                    <DashboardCard title="Half Day" value={sm.halfDay} icon={<CheckCircleIcon className="h-6 w-6 text-white" />} color="yellow" />
                </>;
            default:
                return null;
        }
    };
    
    return (
    <div className="bg-slate-900 p-6 rounded-xl flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {renderCards()}
      </div>
      <div className="mt-6 bg-slate-800 p-4 rounded-lg flex-1 flex items-center justify-center">
        <PieChart data={getPieChartData()} size={220} />
      </div>
    </div>
  );
};

export default MetricSection;