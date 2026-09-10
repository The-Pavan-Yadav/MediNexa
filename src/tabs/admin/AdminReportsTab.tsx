import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Stethoscope, 
  FileText, 
  CreditCard,
  Filter,
  Calendar,
  Loader2,
  Activity
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface ReportStats {
  totalPatients: number;
  totalDoctors: number;
  activeCases: number;
  totalRevenue: number;
}

export default function AdminReportsTab({ adminData }: { adminData: any }) {
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateRange, setDateRange] = useState('6m');
  const [department, setDepartment] = useState('All');
  
  // Stats
  const [stats, setStats] = useState<ReportStats>({
    totalPatients: 0,
    totalDoctors: 0,
    activeCases: 0,
    totalRevenue: 0
  });

  // Chart Data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [appointmentData, setAppointmentData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, department]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users (Patients & Doctors)
      const usersSnap = await getDocs(collection(db, 'users'));
      let pCount = 0;
      let dCount = 0;
      usersSnap.forEach(doc => {
        const role = doc.data().role;
        if (role === 'patient') pCount++;
        if (role === 'doctor') {
          if (department === 'All' || doc.data().department === department) {
            dCount++;
          }
        }
      });

      // 2. Fetch Cases
      const casesSnap = await getDocs(collection(db, 'cases'));
      let aCases = 0;
      casesSnap.forEach(doc => {
        if (doc.data().status === 'Active') aCases++;
      });

      // 3. Fetch Billing & Build Revenue Chart Data
      const billingSnap = await getDocs(collection(db, 'billing'));
      let tRev = 0;
      
      // Initialize last 6 months for chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentDate = new Date();
      const revChartMap: { [key: string]: number } = {};
      
      // Build skeleton for the last N months based on dateRange
      const numMonths = dateRange === '1y' ? 12 : 6;
      for (let i = numMonths - 1; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        revChartMap[`${months[d.getMonth()]} ${d.getFullYear()}`] = 0;
      }

      billingSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Paid') {
          const amt = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount || '0');
          tRev += amt;
          
          if (data.date) {
            const bDate = new Date(data.date);
            const key = `${months[bDate.getMonth()]} ${bDate.getFullYear()}`;
            if (revChartMap[key] !== undefined) {
              revChartMap[key] += amt;
            }
          }
        }
      });

      const formattedRevData = Object.keys(revChartMap).map(key => ({
        month: key,
        revenue: revChartMap[key]
      }));

      // 4. Fetch Appointments & Build Chart Data
      const apptSnap = await getDocs(collection(db, 'appointments'));
      const apptChartMap: { [key: string]: { completed: number, cancelled: number } } = {};
      
      // Build skeleton
      for (let i = numMonths - 1; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        apptChartMap[`${months[d.getMonth()]} ${d.getFullYear()}`] = { completed: 0, cancelled: 0 };
      }

      apptSnap.forEach(doc => {
        const data = doc.data();
        if (department !== 'All' && data.department !== department) return;

        if (data.date) {
          const aDate = new Date(data.date);
          const key = `${months[aDate.getMonth()]} ${aDate.getFullYear()}`;
          if (apptChartMap[key] !== undefined) {
            if (data.status === 'Completed') apptChartMap[key].completed++;
            if (data.status === 'Cancelled') apptChartMap[key].cancelled++;
          }
        }
      });

      const formattedApptData = Object.keys(apptChartMap).map(key => ({
        month: key,
        completed: apptChartMap[key].completed,
        cancelled: apptChartMap[key].cancelled
      }));

      setStats({
        totalPatients: pCount,
        totalDoctors: dCount,
        activeCases: aCases,
        totalRevenue: tRev
      });
      
      setRevenueData(formattedRevData);
      setAppointmentData(formattedApptData);

    } catch (err) {
      console.error("Error generating reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] p-3 shadow-sm rounded-[4px]">
          <p className="text-[13px] font-bold text-[#172B3A] mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-[12px]" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' ? '$' : ''}{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Analytics & Reports</h2>
          <p className="text-[14px] text-[#52606D]">Hospital performance metrics, financial trends, and clinical statistics.</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-[140px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none text-[#172B3A]"
            >
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 12 Months</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-[160px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none text-[#172B3A]"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="General">General Practice</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1F5F8B]" />
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[100px]">
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-semibold text-[#52606D] uppercase tracking-wider">Total Patients</span>
                <Users className="w-4 h-4 text-[#1F5F8B]" />
              </div>
              <p className="text-[24px] font-bold text-[#172B3A]">{stats.totalPatients.toLocaleString()}</p>
            </div>
            
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[100px]">
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-semibold text-[#52606D] uppercase tracking-wider">Active Doctors</span>
                <Stethoscope className="w-4 h-4 text-[#276749]" />
              </div>
              <p className="text-[24px] font-bold text-[#172B3A]">{stats.totalDoctors.toLocaleString()}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[100px]">
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-semibold text-[#52606D] uppercase tracking-wider">Active Cases</span>
                <Activity className="w-4 h-4 text-[#975A16]" />
              </div>
              <p className="text-[24px] font-bold text-[#172B3A]">{stats.activeCases.toLocaleString()}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[100px]">
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-semibold text-[#52606D] uppercase tracking-wider">Total Revenue</span>
                <CreditCard className="w-4 h-4 text-[#102A43]" />
              </div>
              <p className="text-[24px] font-bold text-[#172B3A]">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Revenue Trend Chart */}
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
              <div className="flex items-center gap-2 mb-6 border-b border-[#CBD5E1] pb-3">
                <TrendingUp className="w-4 h-4 text-[#1F5F8B]" />
                <h3 className="text-[14px] font-bold text-[#172B3A] uppercase tracking-wider">Revenue Over Time</h3>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#52606D' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#52606D' }}
                      tickFormatter={(value) => `$${value}`}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue" 
                      stroke="#102A43" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#102A43', strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointment Trend Chart */}
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
              <div className="flex items-center gap-2 mb-6 border-b border-[#CBD5E1] pb-3">
                <BarChart3 className="w-4 h-4 text-[#1F5F8B]" />
                <h3 className="text-[14px] font-bold text-[#172B3A] uppercase tracking-wider">Appointment Activity</h3>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#52606D' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#52606D' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                      iconType="circle"
                    />
                    <Bar dataKey="completed" name="Completed" fill="#1F5F8B" radius={[2, 2, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="cancelled" name="Cancelled" fill="#CBD5E1" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Department Breakdown Table */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm mt-6">
            <div className="p-4 border-b border-[#CBD5E1] bg-[#F9FAFB]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#52606D]" />
                <h3 className="text-[13px] font-bold text-[#172B3A] uppercase tracking-wider">Department Summary</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-[13px] text-[#52606D]">
                Detailed departmental statistical breakdown is aggregated via the primary hospital pipeline. Use the filters above to scope the visual analytics to a specific department.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
