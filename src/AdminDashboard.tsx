import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  FileText, 
  Calendar, 
  Pill, 
  FileCheck, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ShieldCheck
} from 'lucide-react';
import AdminHomeTab from './tabs/admin/AdminHomeTab';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdminData(docSnap.data());
        }
      }
    };
    fetchAdminData();
  }, []);

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[4px] mb-1 transition-all duration-200 ${
        active 
          ? 'bg-[#1F5F8B] text-white shadow-sm font-medium' 
          : 'text-[#52606D] hover:bg-[#EBF1F6] hover:text-[#102A43]'
      }`}
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
      <span className="text-[14px]">{label}</span>
    </button>
  );

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <h3 className="px-4 text-[10px] font-bold text-[#52606D] uppercase tracking-wider mb-2 mt-4">
      {children}
    </h3>
  );

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#FFFFFF] border-r border-[#CBD5E1] flex flex-col shadow-sm shrink-0">
        {/* Brand */}
        <div className="h-[64px] flex items-center px-6 border-b border-[#CBD5E1] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[4px] bg-[#102A43] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[16px] font-bold text-[#102A43] tracking-tight leading-none">MHD Admin</h1>
              <p className="text-[10px] text-[#52606D] font-medium tracking-wide">SYSTEM CONTROL</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <SectionHeading>Workspace</SectionHeading>
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          
          <SectionHeading>Directory</SectionHeading>
          <NavItem icon={Users} label="Patients" active={activeTab === 'Patients'} onClick={() => setActiveTab('Patients')} />
          <NavItem icon={Stethoscope} label="Doctors" active={activeTab === 'Doctors'} onClick={() => setActiveTab('Doctors')} />
          
          <SectionHeading>Clinical</SectionHeading>
          <NavItem icon={FileText} label="Cases" active={activeTab === 'Cases'} onClick={() => setActiveTab('Cases')} />
          <NavItem icon={Calendar} label="Appointments" active={activeTab === 'Appointments'} onClick={() => setActiveTab('Appointments')} />
          <NavItem icon={Pill} label="Medicines" active={activeTab === 'Medicines'} onClick={() => setActiveTab('Medicines')} />
          
          <SectionHeading>Operations</SectionHeading>
          <NavItem icon={FileCheck} label="Verify Documents" active={activeTab === 'Verify Documents'} onClick={() => setActiveTab('Verify Documents')} />
          <NavItem icon={CreditCard} label="Billing" active={activeTab === 'Billing'} onClick={() => setActiveTab('Billing')} />
          <NavItem icon={BarChart3} label="Reports" active={activeTab === 'Reports'} onClick={() => setActiveTab('Reports')} />
          
          <SectionHeading>System</SectionHeading>
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
        <header className="h-[64px] bg-[#FFFFFF] border-b border-[#CBD5E1] flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-1.5 w-[300px]">
            <Search className="w-4 h-4 text-[#52606D] mr-2" strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder="Search patients, doctors, cases..." 
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
              <div className="w-8 h-8 rounded-full bg-[#102A43] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[13px] font-semibold text-[#172B3A] leading-tight">
                  {adminData?.name ? adminData.name : 'System Admin'}
                </p>
                <p className="text-[11px] text-[#52606D] font-mono">ID: ADMIN-01</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'Dashboard' && <AdminHomeTab adminData={adminData} />}
          
          {activeTab !== 'Dashboard' && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-200 opacity-70">
              <ShieldCheck className="w-12 h-12 text-[#CBD5E1] mb-4" strokeWidth={1} />
              <h2 className="text-[20px] font-semibold text-[#172B3A] mb-2">{activeTab} Administration</h2>
              <p className="text-[14px] text-[#52606D]">This administrative module is currently being configured.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
