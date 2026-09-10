import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare,
  DollarSign,
  Settings,
  LogOut,
  Bell,
  Search,
  UserCircle,
  Stethoscope
} from 'lucide-react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Tab imports
import DoctorHomeTab from './tabs/doctor/DoctorHomeTab';
import HealthInputTab from './tabs/doctor/HealthInputTab';
import CasesTab from './tabs/doctor/CasesTab';
import PatientsTab from './tabs/doctor/PatientsTab';
import AppointmentsTab from './tabs/doctor/AppointmentsTab';
import MessagesTab from './tabs/doctor/MessagesTab';
import EarningsTab from './tabs/doctor/EarningsTab';
import SettingsTab from './tabs/doctor/SettingsTab';

interface DoctorDashboardProps {
  onLogout: () => void;
}

const Logo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0L30 8V24L16 32L2 24V8L16 0ZM16 4.6L6 10.4V21.6L16 27.4L26 21.6V10.4L16 4.6Z" />
    <rect x="12" y="12" width="8" height="8" />
  </svg>
);

export default function DoctorDashboard({ onLogout }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [doctorData, setDoctorData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setDoctorData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const NavItem = ({ icon: Icon, label, active, onClick, danger }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[4px] text-[13px] font-medium transition-colors ${
        active
          ? 'bg-[#EBF1F6] text-[#1F5F8B]'
          : danger
          ? 'text-[#B42318] hover:bg-[#FEF2F2]'
          : 'text-[#52606D] hover:bg-[#F4F6F8] hover:text-[#172B3A]'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-[#1F5F8B]' : danger ? 'text-[#B42318]' : 'text-[#52606D]'}`} strokeWidth={1.5} />
      {label}
    </button>
  );

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-[11px] font-semibold text-[#52606D] uppercase tracking-wider mb-2 mt-6 px-4">
      {children}
    </h4>
  );

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans text-[#172B3A]">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#FFFFFF] border-r border-[#CBD5E1] flex flex-col h-full shrink-0">
        {/* Logo Area */}
        <div className="h-[64px] flex items-center gap-3 px-6 border-b border-[#CBD5E1]">
          <Logo className="w-8 h-8 text-[#102A43]" />
          <div>
            <h1 className="text-[16px] font-bold tracking-wide leading-none text-[#102A43]">MHD HOSPITAL</h1>
            <p className="text-[9px] text-[#52606D] uppercase tracking-wider font-semibold">Doctor Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <SectionHeading>Workspace</SectionHeading>
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={Activity} label="Health Input" active={activeTab === 'Health Input'} onClick={() => setActiveTab('Health Input')} />
          
          <SectionHeading>Clinical</SectionHeading>
          <NavItem icon={FileText} label="Cases" active={activeTab === 'Cases'} onClick={() => setActiveTab('Cases')} />
          <NavItem icon={Users} label="Patients" active={activeTab === 'Patients'} onClick={() => setActiveTab('Patients')} />
          <NavItem icon={Calendar} label="Appointments" active={activeTab === 'Appointments'} onClick={() => setActiveTab('Appointments')} />
          
          <SectionHeading>Office</SectionHeading>
          <NavItem icon={MessageSquare} label="Messages" active={activeTab === 'Messages'} onClick={() => setActiveTab('Messages')} />
          <NavItem icon={DollarSign} label="Earnings" active={activeTab === 'Earnings'} onClick={() => setActiveTab('Earnings')} />
          <NavItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#CBD5E1] space-y-1">
          <NavItem icon={LogOut} label="Logout" onClick={onLogout} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-[64px] bg-[#FFFFFF] border-b border-[#CBD5E1] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-1.5 w-[300px]">
            <Search className="w-4 h-4 text-[#52606D] mr-2" strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder="Search patients, ID, cases..." 
              className="bg-transparent border-none outline-none text-[13px] text-[#172B3A] w-full placeholder:text-[#52606D]"
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-[#52606D] hover:text-[#102A43] transition-colors">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B42318] rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-[#CBD5E1]"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EBF1F6] flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[#1F5F8B]" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[13px] font-semibold text-[#172B3A] leading-tight">
                  {doctorData?.name ? `Dr. ${doctorData.name}` : 'Doctor Profile'}
                </p>
                <p className="text-[11px] text-[#52606D]">ID: {doctorData?.mhdId || 'D-PENDING'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'Dashboard' && <DoctorHomeTab doctorData={doctorData} />}
          {activeTab === 'Health Input' && <HealthInputTab doctorData={doctorData} />}
          {activeTab === 'Cases' && <CasesTab doctorData={doctorData} />}
          {activeTab === 'Patients' && <PatientsTab doctorData={doctorData} />}
          {activeTab === 'Appointments' && <AppointmentsTab doctorData={doctorData} />}
          {activeTab === 'Messages' && <MessagesTab doctorData={doctorData} />}
          {activeTab === 'Earnings' && <EarningsTab doctorData={doctorData} />}
          {activeTab === 'Settings' && <SettingsTab doctorData={doctorData} />}

          {activeTab !== 'Dashboard' && activeTab !== 'Health Input' && activeTab !== 'Cases' && activeTab !== 'Patients' && activeTab !== 'Appointments' && activeTab !== 'Messages' && activeTab !== 'Earnings' && activeTab !== 'Settings' && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-200">
              <h2 className="text-[20px] font-semibold text-[#172B3A] mb-2">{activeTab}</h2>
              <p className="text-[14px] text-[#52606D]">This module is currently being provisioned.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
