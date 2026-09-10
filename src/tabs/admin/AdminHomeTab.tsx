import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  Activity, 
  Calendar, 
  FileCheck, 
  CreditCard,
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export default function AdminHomeTab({ adminData }: { adminData: any }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    activeCases: 0,
    todaysAppts: 0,
    pendingVerifications: 0,
    pendingBills: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Patients & Doctors
        const usersSnap = await getDocs(collection(db, 'users'));
        let pCount = 0;
        let dCount = 0;
        usersSnap.forEach(doc => {
          const r = doc.data().role;
          if (r === 'patient') pCount++;
          if (r === 'doctor') dCount++;
        });

        // Active Cases
        const casesSnap = await getDocs(query(collection(db, 'cases'), where('status', '==', 'Active')));
        const cCount = casesSnap.size;

        // Today's Appointments
        const todayStr = new Date().toISOString().split('T')[0];
        const apptsSnap = await getDocs(query(collection(db, 'appointments'), where('date', '==', todayStr)));
        const aCount = apptsSnap.size;

        setStats(prev => ({
          ...prev,
          totalPatients: pCount,
          totalDoctors: dCount,
          activeCases: cCount,
          todaysAppts: aCount
        }));
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, bgClass, borderClass }: any) => (
    <div className={`bg-[#FFFFFF] border ${borderClass} rounded-[4px] p-5 flex flex-col shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${colorClass}`}>{title}</p>
        <div className={`p-1.5 rounded-[4px] ${bgClass}`}>
          <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
      </div>
      <p className={`text-[28px] font-bold leading-none mb-1 text-[#172B3A]`}>
        {loading ? '...' : value}
      </p>
      <p className="text-[11px] text-[#52606D]">{subtitle}</p>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#102A43] mb-1">
            System Overview
          </h2>
          <p className="text-[14px] text-[#52606D]">
            Global administration and hospital operations dashboard.
          </p>
        </div>
        <div className="bg-[#102A43] border border-[#102A43] rounded-[4px] px-4 py-2 flex items-center gap-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#48BB78]" />
          <div>
            <p className="text-[10px] text-[#CBD5E1] uppercase tracking-wider font-semibold">System Status</p>
            <p className="text-[13px] font-bold text-white">All Systems Operational</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Total Patients" 
          value={stats.totalPatients} 
          subtitle="Registered accounts"
          icon={Users}
          colorClass="text-[#1F5F8B]"
          bgClass="bg-[#EBF1F6]"
          borderClass="border-[#CBD5E1]"
        />
        <StatCard 
          title="Total Doctors" 
          value={stats.totalDoctors} 
          subtitle="Active medical staff"
          icon={Stethoscope}
          colorClass="text-[#276749]"
          bgClass="bg-[#E8F2EC]"
          borderClass="border-[#CBD5E1]"
        />
        <StatCard 
          title="Active Cases" 
          value={stats.activeCases} 
          subtitle="Currently open/active"
          icon={Activity}
          colorClass="text-[#975A16]"
          bgClass="bg-[#FEF6E7]"
          borderClass="border-[#CBD5E1]"
        />
        <StatCard 
          title="Today's Appointments" 
          value={stats.todaysAppts} 
          subtitle="Scheduled across all depts"
          icon={Calendar}
          colorClass="text-[#1F5F8B]"
          bgClass="bg-[#EBF1F6]"
          borderClass="border-[#CBD5E1]"
        />
        <StatCard 
          title="Pending Verifications" 
          value={stats.pendingVerifications} 
          subtitle="Documents awaiting review"
          icon={FileCheck}
          colorClass="text-[#B42318]"
          bgClass="bg-[#FEF2F2]"
          borderClass="border-[#FCA5A5]"
        />
        <StatCard 
          title="Pending Bills" 
          value={stats.pendingBills} 
          subtitle="Invoices awaiting payment"
          icon={CreditCard}
          colorClass="text-[#B42318]"
          bgClass="bg-[#FEF2F2]"
          borderClass="border-[#FCA5A5]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Feed */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
          <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#172B3A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#102A43]" /> Recent System Activity
            </h3>
            <button className="text-[12px] font-medium text-[#1F5F8B] hover:underline">View Audit Log</button>
          </div>
          <div className="divide-y divide-[#CBD5E1]">
             <div className="p-8 text-center text-[13px] text-[#52606D]">No recent system activity available.</div>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
          <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4">
            <h3 className="text-[14px] font-semibold text-[#172B3A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#102A43]" /> Quick Admin Actions
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: 'Review Document Verifications', count: stats.pendingVerifications, color: 'text-[#B42318]', bg: 'bg-[#FEF2F2]' },
              { label: 'Process Pending Invoices', count: stats.pendingBills, color: 'text-[#975A16]', bg: 'bg-[#FEF6E7]' },
              { label: 'Manage Doctor Rosters', count: 0, color: 'text-[#52606D]', bg: 'bg-[#F4F6F8]' }
            ].map((action, i) => (
              <button key={i} className="w-full flex items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px] hover:bg-[#F4F6F8] transition-colors group">
                <span className="text-[13px] font-semibold text-[#172B3A]">{action.label}</span>
                <div className="flex items-center gap-3">
                  {action.count > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] ${action.color} ${action.bg}`}>
                      {action.count} Actionable
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-[#52606D] group-hover:text-[#1F5F8B] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
