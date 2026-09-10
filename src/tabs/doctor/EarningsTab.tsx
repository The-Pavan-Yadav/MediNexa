import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Download, 
  Activity,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

interface PaymentType {
  id: string;
  doctorId: string;
  patientId: string;
  patientMhdId: string;
  patientName: string;
  service: string;
  amount: number;
  status: 'Paid' | 'Pending';
  date: string;
}

export default function EarningsTab({ doctorData }: { doctorData: any }) {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dateFilter, setDateFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        if (!auth.currentUser) return;
        const q = query(
          collection(db, 'payments'),
          where('doctorId', '==', auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        
        let fetched: PaymentType[] = [];
        snapshot.forEach(docSnap => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as PaymentType);
        });

        // Seed mock data if empty for demonstration
        if (fetched.length === 0) {
          const mockPayments: Omit<PaymentType, 'id'>[] = [
            {
              doctorId: auth.currentUser.uid, patientId: 'mock-1', patientMhdId: 'P-045', patientName: 'James Wilson',
              service: 'General Consultation', amount: 150.00, status: 'Paid', date: new Date().toISOString().split('T')[0]
            },
            {
              doctorId: auth.currentUser.uid, patientId: 'mock-2', patientMhdId: 'P-084', patientName: 'Sarah Connor',
              service: 'Follow-up Visit', amount: 75.00, status: 'Pending', date: new Date().toISOString().split('T')[0]
            },
            {
              doctorId: auth.currentUser.uid, patientId: 'mock-3', patientMhdId: 'P-091', patientName: 'Michael Chang',
              service: 'Lab Results Review', amount: 100.00, status: 'Paid', date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
            },
            {
              doctorId: auth.currentUser.uid, patientId: 'mock-4', patientMhdId: 'P-102', patientName: 'Emily Rose',
              service: 'Initial Consultation', amount: 200.00, status: 'Paid', date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
            },
            {
              doctorId: auth.currentUser.uid, patientId: 'mock-5', patientMhdId: 'P-022', patientName: 'Linda Chen',
              service: 'Specialist Referral', amount: 150.00, status: 'Pending', date: new Date(Date.now() - 259200000).toISOString().split('T')[0]
            }
          ];
          
          for (const mp of mockPayments) {
            const docRef = await addDoc(collection(db, 'payments'), { ...mp, timestamp: serverTimestamp() });
            fetched.push({ id: docRef.id, ...mp } as PaymentType);
          }
        }
        
        // Sort descending by date
        fetched.sort((a, b) => b.date.localeCompare(a.date));
        setPayments(fetched);
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Calculate KPI values
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // e.g., "2026-09"
  
  const totalEarnings = payments.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const thisMonthEarnings = payments
    .filter(p => p.status === 'Paid' && p.date.startsWith(currentMonthPrefix))
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPaymentsAmount = payments.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const completedCount = payments.filter(p => p.status === 'Paid').length;

  // Prepare chart data (aggregate by date)
  const chartDataMap: Record<string, number> = {};
  // Create last 7 days baseline
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    chartDataMap[dateStr] = 0;
  }
  
  payments.forEach(p => {
    if (p.status === 'Paid' && chartDataMap[p.date] !== undefined) {
      chartDataMap[p.date] += p.amount;
    }
  });

  const chartData = Object.keys(chartDataMap).map(dateStr => {
    const dateObj = new Date(dateStr);
    return {
      date: dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      amount: chartDataMap[dateStr]
    };
  });

  const filteredPayments = payments.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    let matchesDate = true;
    if (dateFilter === 'This Month') {
      matchesDate = p.date.startsWith(currentMonthPrefix);
    } else if (dateFilter === 'Last 7 Days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchesDate = new Date(p.date) >= sevenDaysAgo;
    }
    return matchesStatus && matchesDate;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Financial & Earnings</h2>
          <p className="text-[14px] text-[#52606D]">Track your clinical revenue, pending invoices, and payment history.</p>
        </div>
        <button 
          className="bg-[#FFFFFF] text-[#172B3A] px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#F4F6F8] transition-colors border border-[#CBD5E1] flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Total Earnings</p>
            <DollarSign className="w-4 h-4 text-[#102A43]" />
          </div>
          <p className="text-[24px] font-bold text-[#172B3A] leading-none mb-1">${totalEarnings.toFixed(2)}</p>
          <p className="text-[11px] text-[#52606D]">Lifetime accrued</p>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider">This Month</p>
            <TrendingUp className="w-4 h-4 text-[#276749]" />
          </div>
          <p className="text-[24px] font-bold text-[#172B3A] leading-none mb-1">${thisMonthEarnings.toFixed(2)}</p>
          <p className="text-[11px] text-[#276749] font-medium flex items-center gap-1">
            Current billing cycle
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#FCA5A5] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-[#B42318] uppercase tracking-wider">Pending Payments</p>
            <Clock className="w-4 h-4 text-[#B42318]" />
          </div>
          <p className="text-[24px] font-bold text-[#B42318] leading-none mb-1">${pendingPaymentsAmount.toFixed(2)}</p>
          <p className="text-[11px] text-[#B42318]">Awaiting clearing</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Completed Consults</p>
            <CheckCircle2 className="w-4 h-4 text-[#1F5F8B]" />
          </div>
          <p className="text-[24px] font-bold text-[#172B3A] leading-none mb-1">{completedCount}</p>
          <p className="text-[11px] text-[#52606D]">Fully paid sessions</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#102A43]" />
          <h3 className="text-[14px] font-semibold text-[#172B3A]">Earnings Summary (Last 7 Days)</h3>
        </div>
        <div className="p-6 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
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
              />
              <Tooltip 
                cursor={{ fill: '#F4F6F8' }}
                contentStyle={{ borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#172B3A', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Bar dataKey="amount" fill="#1F5F8B" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters for Table */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[150px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-[160px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none"
          >
            <option value="All">All Time</option>
            <option value="This Month">This Month</option>
            <option value="Last 7 Days">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Clinical Service</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Amount</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1F5F8B] mx-auto mb-2" />
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#52606D]">
                    No financial records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 align-middle text-[13px] font-medium text-[#172B3A]">
                      {payment.date}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="text-[13px] font-semibold text-[#172B3A]">{payment.patientName}</p>
                      <p className="text-[11px] font-mono text-[#52606D]">{payment.patientMhdId}</p>
                    </td>
                    <td className="px-4 py-3 align-middle text-[13px] text-[#52606D]">
                      {payment.service}
                    </td>
                    <td className="px-4 py-3 align-middle text-right text-[14px] font-bold text-[#172B3A]">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-block ${
                        payment.status === 'Paid' ? 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]' : 'bg-[#FEF6E7] text-[#975A16] border-[#F6E0B5]'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
