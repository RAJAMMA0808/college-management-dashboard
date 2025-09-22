import React, { useState, useEffect } from 'react';
import { College, DashboardData } from '../types';
import { getDashboardData } from '../services/api';
import { LATEST_ATTENDANCE_DATE } from '../constants';

// --- Tooltip State ---
interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

// --- Chart Data Interfaces ---
interface ChartBar {
    label: string;
    value: number;
    color: string;
}

// --- Comparison Data Structure ---
interface CollegeData {
    college: College;
    data: DashboardData;
}

const COLLEGE_COLORS: { [key in College]?: string } = {
    [College.BIET]: '#3B82F6', // blue-500
    [College.BGIIT]: '#10B981', // emerald-500
    [College.KNRCER]: '#F97316', // orange-500
};

// --- BarChart Component ---
const BarChart: React.FC<{ bars: ChartBar[] }> = ({ bars }) => {
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });
    const maxValue = 100; // For percentages
    const chartHeight = 200;
    const barWidth = 50;
    const barMargin = 30;
    const chartWidth = bars.length * (barWidth + barMargin);

    const handleMouseMove = (e: React.MouseEvent, content: string) => {
        setTooltip({ visible: true, content, x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, visible: false });
    };
    
    return (
        <>
            {tooltip.visible && (
                <div 
                    className="z-20 px-3 py-1 text-sm font-semibold text-white bg-slate-950 rounded-md shadow-lg"
                    style={{ 
                        position: 'fixed', 
                        left: tooltip.x, 
                        top: tooltip.y, 
                        transform: 'translate(15px, -30px)', // offset from cursor
                        pointerEvents: 'none' 
                    }}
                    aria-live="polite"
                >
                    {tooltip.content}
                </div>
            )}
            <div className="flex justify-center items-end h-[250px] p-4" role="figure" aria-label="Bar chart of college metrics">
                <svg width={chartWidth} height={chartHeight} className="overflow-visible" aria-hidden="true">
                    <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#475569" strokeWidth="1" />
                    <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#475569" strokeWidth="1" />
                    
                    {[0, 25, 50, 75, 100].map(val => (
                        <text key={val} x="-10" y={chartHeight - (val / maxValue) * chartHeight + 5} textAnchor="end" fill="#94a3b8" fontSize="12">
                            {val}%
                        </text>
                    ))}

                    {bars.map((bar, index) => {
                        const barHeight = (bar.value / maxValue) * chartHeight;
                        const x = index * (barWidth + barMargin) + barMargin / 2;
                        return (
                            <g key={bar.label} role="presentation">
                                <rect
                                    x={x}
                                    y={chartHeight - barHeight}
                                    width={barWidth}
                                    height={barHeight}
                                    fill={bar.color}
                                    className="transition-opacity duration-200 hover:opacity-80"
                                    onMouseMove={(e) => handleMouseMove(e, `${bar.label}: ${bar.value.toFixed(1)}%`)}
                                    onMouseLeave={handleMouseLeave}
                                    aria-label={`${bar.label} value ${bar.value.toFixed(1)}%`}
                                />
                                <text x={x + barWidth / 2} y={chartHeight + 20} textAnchor="middle" fill="#94a3b8" fontSize="12">
                                    {bar.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </>
    );
};

// --- Chart Card Wrapper ---
const ComparisonChartCard: React.FC<{ title: string, data: ChartBar[] }> = ({ title, data }) => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <BarChart bars={data} />
    </div>
);


const CollegeComparison: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comparisonData, setComparisonData] = useState<CollegeData[]>([]);

    useEffect(() => {
        const fetchComparisonData = async () => {
            try {
                setLoading(true);
                const collegesToCompare: College[] = [College.BIET, College.BGIIT, College.KNRCER];
                const dataPromises = collegesToCompare.map(college => 
                    getDashboardData(college, 'all', 'all', 'all', 'all', 'all', LATEST_ATTENDANCE_DATE, LATEST_ATTENDANCE_DATE)
                );
                const results = await Promise.all(dataPromises);
                
                const formattedData = collegesToCompare.map((college, i) => ({
                    college,
                    data: results[i],
                }));

                setComparisonData(formattedData);
            } catch (err) {
                setError('Failed to load comparison data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchComparisonData();
    }, []);

    if (loading) {
        return <div className="flex-1 p-8 text-white flex items-center justify-center">Loading comparison data...</div>;
    }

    if (error) {
        return <div className="flex-1 p-8 text-red-400 flex items-center justify-center">{error}</div>;
    }

    // NOTE: These calculations now reflect a single day's attendance (LATEST_ATTENDANCE_DATE)
    const studentAttendanceData: ChartBar[] = comparisonData.map(d => ({
        label: d.college,
        value: d.data.studentAttendance.total > 0 ? (d.data.studentAttendance.present / (d.data.studentAttendance.present + d.data.studentAttendance.absent)) * 100 : 0,
        color: COLLEGE_COLORS[d.college] || '#ccc',
    }));

    const studentAcademicsData: ChartBar[] = comparisonData.map(d => ({
        label: d.college,
        value: d.data.studentAcademics.passPercentage,
        color: COLLEGE_COLORS[d.college] || '#ccc',
    }));

    const facultyAttendanceData: ChartBar[] = comparisonData.map(d => ({
        label: d.college,
        value: d.data.facultyMetrics.total > 0 ? ((d.data.facultyMetrics.fullDay + d.data.facultyMetrics.halfDay) / d.data.facultyMetrics.total) * 100 : 0,
        color: COLLEGE_COLORS[d.college] || '#ccc',
    }));
    
    const staffAttendanceData: ChartBar[] = comparisonData.map(d => ({
        label: d.college,
        value: d.data.staffMetrics.total > 0 ? (d.data.staffMetrics.present / d.data.staffMetrics.total) * 100 : 0,
        color: COLLEGE_COLORS[d.college] || '#ccc',
    }));

    return (
        <main className="flex-1 p-8 bg-transparent overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-8">College Performance Comparison</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ComparisonChartCard title="Student Attendance (Present %)" data={studentAttendanceData} />
                <ComparisonChartCard title="Student Academics (Pass %)" data={studentAcademicsData} />
                <ComparisonChartCard title="Faculty Attendance (Present %)" data={facultyAttendanceData} />
                <ComparisonChartCard title="Staff Attendance (Present %)" data={staffAttendanceData} />
            </div>
        </main>
    );
};

export default CollegeComparison;