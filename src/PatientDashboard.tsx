import React, { useState, useEffect } from 'react';
import UpcomingTab from './tabs/UpcomingTab';
import TimelineTab from './tabs/TimelineTab';
import MyCaseTab from './tabs/MyCaseTab';
import MedicinesTab from './tabs/MedicinesTab';
import ResultsTab from './tabs/ResultsTab';
import MyDoctorsTab from './tabs/MyDoctorsTab';
import HealthOverviewTab from './tabs/HealthOverviewTab';
import AppointmentsTab from './tabs/AppointmentsTab';
import MyQRTab from './tabs/MyQRTab';
import PrivacyAccessTab from './tabs/PrivacyAccessTab';
import BillingTab from './tabs/BillingTab';
import EmergencyTab from './tabs/EmergencyTab';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import {
  LayoutDashboard,
  CalendarClock,
  History,
  FileText,
  Pill,
  Activity,
  Users,
  FileHeart,
  Calendar,
  QrCode,
  Lock,
  CreditCard,
  AlertCircle,
  LogOut,
  Bell,
  Search,
  UserCircle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  FileDown,
  Clock
} from 'lucide-react';

interface PatientDashboardProps {
  onLogout: () => void;
}

const Logo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0L30 8V24L16 32L2 24V8L16 0ZM16 4.6L6 10.4V21.6L16 27.4L26 21.6V10.4L16 4.6Z" />
    <rect x="12" y="12" width="8" height="8" />
  </svg>
);

export default function PatientDashboard({ onLogout }: PatientDashboardProps) {
  const [patientData, setPatientData] = useState<any>(null);
  
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setPatientData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const [latestNote, setLatestNote] = useState<any>(null);
  const [vitals, setVitals] = useState<any>(null);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!patientData?.mhdId) return;

    setDashboardLoading(true);
    let unsubRecords: any, unsubAppts: any, unsubMeds: any;

    try {
      // 1. Listen to latest clinical record
      const recordsQ = query(
        collection(db, 'clinical_records'),
        where('patientMhdId', '==', patientData.mhdId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      unsubRecords = onSnapshot(recordsQ, (recordsSnap) => {
        if (!recordsSnap.empty) {
          const latestRecord = recordsSnap.docs[0].data();
          setVitals(latestRecord.data?.vitals || null);
          setLatestNote({
            doctorName: latestRecord.doctorName || 'Care Team',
            note: latestRecord.data?.assessment?.notes || latestRecord.data?.plan?.treatment || 'No recent notes.'
          });
        } else {
          setVitals(null);
          setLatestNote(null);
        }
      });

      // 2. Listen to Next Appointment
      const apptsQ = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientData.mhdId)
      );
      unsubAppts = onSnapshot(apptsQ, (apptsSnap) => {
        const allAppts = apptsSnap.docs.map(doc => doc.data());
        const upcomingAppts = allAppts
          .filter(a => (a.status === 'upcoming' || a.status === 'Scheduled') && new Date(a.date).getTime() >= new Date().setHours(0,0,0,0))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (upcomingAppts.length > 0) {
          setNextAppointment(upcomingAppts[0]);
        } else {
          setNextAppointment(null);
        }
      });

      // 3. Listen to Medicines
      const medsQ = query(
        collection(db, 'medicines'),
        where('patientId', '==', patientData.mhdId)
      );
      unsubMeds = onSnapshot(medsQ, (medsSnap) => {
        const allMeds = medsSnap.docs.map(doc => doc.data());
        const activeMeds = allMeds.filter(m => m.status !== 'Discontinued');
        setMedicines(activeMeds);
        setDashboardLoading(false); // Can set to false here as this is the last one
      });

    } catch (err) {
      console.error("Error setting up dashboard listeners:", err);
      setDashboardLoading(false);
    }

    return () => {
      if (unsubRecords) unsubRecords();
      if (unsubAppts) unsubAppts();
      if (unsubMeds) unsubMeds();
    };
  }, [patientData]);

  const NavItem = ({ icon: Icon, label, active, onClick, danger = false }: any) => (
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
            <p className="text-[9px] text-[#52606D] uppercase tracking-wider font-semibold">Patient Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <SectionHeading>Overview</SectionHeading>
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={CalendarClock} label="Upcoming" active={activeTab === 'Upcoming'} onClick={() => setActiveTab('Upcoming')} />
          <NavItem icon={History} label="Timeline" active={activeTab === 'Timeline'} onClick={() => setActiveTab('Timeline')} />

          <SectionHeading>Care</SectionHeading>
          <NavItem icon={FileText} label="My Case" active={activeTab === 'My Case'} onClick={() => setActiveTab('My Case')} />
          <NavItem icon={Pill} label="Medicines" active={activeTab === 'Medicines'} onClick={() => setActiveTab('Medicines')} />
          <NavItem icon={Activity} label="Results" active={activeTab === 'Results'} onClick={() => setActiveTab('Results')} />
          <NavItem icon={Users} label="My Doctors" active={activeTab === 'My Doctors'} onClick={() => setActiveTab('My Doctors')} />
          <NavItem icon={FileHeart} label="Health Overview" active={activeTab === 'Health Overview'} onClick={() => setActiveTab('Health Overview')} />

          <SectionHeading>Services</SectionHeading>
          <NavItem icon={Calendar} label="Appointments" active={activeTab === 'Appointments'} onClick={() => setActiveTab('Appointments')} />
          <NavItem icon={QrCode} label="My QR" active={activeTab === 'My QR'} onClick={() => setActiveTab('My QR')} />

          <SectionHeading>Account</SectionHeading>
          <NavItem icon={Lock} label="Privacy & Access" active={activeTab === 'Privacy & Access'} onClick={() => setActiveTab('Privacy & Access')} />
          <NavItem icon={CreditCard} label="Billing" active={activeTab === 'Billing'} onClick={() => setActiveTab('Billing')} />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#CBD5E1] space-y-1">
          <NavItem icon={AlertCircle} label="Emergency" active={activeTab === 'Emergency'} danger onClick={() => setActiveTab('Emergency')} />
          <NavItem icon={LogOut} label="Sign Out" onClick={onLogout} />
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
              placeholder="Search records, medicines..." 
              className="bg-transparent border-none outline-none text-[13px] text-[#172B3A] w-full placeholder:text-[#52606D]"
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-[#52606D] hover:text-[#102A43] transition-colors">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B42318] rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-[#CBD5E1]"></div>
            <button className="flex items-center gap-2 hover:bg-[#F4F6F8] p-1.5 rounded-[4px] transition-colors">
              <UserCircle className="w-7 h-7 text-[#1F5F8B]" strokeWidth={1.5} />
              <div className="text-left hidden md:block">
                <p className="text-[13px] font-semibold text-[#172B3A] leading-tight">{patientData?.name || "Patient"}</p>
                <p className="text-[11px] text-[#52606D]">ID: {patientData?.mhdId || "Loading..."}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'Dashboard' && (
            <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
              
              {/* 1. Patient Welcome */}
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Good morning, {patientData?.name ? patientData.name.split(" ")[0] : "Patient"}.</h2>
                <p className="text-[14px] text-[#52606D]">Here is your healthcare summary for today.</p>
              </div>
              <div className="flex gap-6 text-[13px] flex-wrap">
                <div>
                  <p className="text-[#52606D] mb-0.5">Date of Birth</p>
                  <p className="font-medium text-[#172B3A]">{patientData?.dob ? new Date(patientData.dob).toLocaleDateString() : "Not Set"}</p>
                </div>
                <div className="w-px bg-[#CBD5E1] hidden sm:block"></div>
                <div>
                  <p className="text-[#52606D] mb-0.5">Gender</p>
                  <p className="font-medium text-[#172B3A] capitalize">{patientData?.gender || "Not Set"}</p>
                </div>
                <div className="w-px bg-[#CBD5E1] hidden sm:block"></div>
                <div>
                  <p className="text-[#52606D] mb-0.5">Contact</p>
                  <p className="font-medium text-[#172B3A]">{patientData?.phone || "Not Set"}</p>
                </div>
                <div className="w-px bg-[#CBD5E1] hidden sm:block"></div>
                <div>
                  <p className="text-[#52606D] mb-0.5">Primary Care</p>
                  <p className="font-medium text-[#172B3A]">{patientData?.primaryDoctor || "Not Assigned"}</p>
                </div>
              </div>
            </div>

            {/* 2. Doctor Status */}
            {latestNote ? (
            <div className="bg-[#EBF1F6] border-l-4 border-[#1F5F8B] border-y border-r border-y-[#CBD5E1] border-r-[#CBD5E1] rounded-[4px] p-4 flex items-start gap-4">
              <Activity className="w-5 h-5 text-[#1F5F8B] mt-0.5 shrink-0" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#102A43] mb-1">Care Team Note from {latestNote.doctorName}</h3>
                <p className="text-[13px] text-[#172B3A] leading-relaxed">
                  {latestNote.note}
                </p>
              </div>
            </div>
            ) : (
            <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-4 flex items-start gap-4">
              <Activity className="w-5 h-5 text-[#52606D] mt-0.5 shrink-0" />
              <div>
                <h3 className="text-[14px] font-semibold text-[#102A43] mb-1">No Recent Notes</h3>
                <p className="text-[13px] text-[#52606D] leading-relaxed">
                  You do not have any new care team notes at this time.
                </p>
              </div>
            </div>
            )}

            {/* 3. Health Status & Next Appointment (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Status */}
              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
                <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#52606D]" /> Recent Vitals
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-[#F4F6F8] rounded-[4px] border border-[#CBD5E1]">
                    <p className="text-[11px] text-[#52606D] uppercase font-semibold mb-1">Blood Pressure</p>
                    <p className="text-[18px] font-semibold text-[#172B3A]">{vitals?.bp || '--/--'}</p>
                  </div>
                  <div className="p-3 bg-[#F4F6F8] rounded-[4px] border border-[#CBD5E1]">
                    <p className="text-[11px] text-[#52606D] uppercase font-semibold mb-1">Heart Rate</p>
                    <p className="text-[18px] font-semibold text-[#172B3A]">{vitals?.hr || '--'} <span className="text-[12px] text-[#52606D] font-normal">bpm</span></p>
                  </div>
                  <div className="p-3 bg-[#F4F6F8] rounded-[4px] border border-[#CBD5E1]">
                    <p className="text-[11px] text-[#52606D] uppercase font-semibold mb-1">Weight</p>
                    <p className="text-[18px] font-semibold text-[#172B3A]">{vitals?.weight || '--'} <span className="text-[12px] text-[#52606D] font-normal">lbs</span></p>
                  </div>
                </div>
              </div>

              {/* Next Appointment */}
              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-[#172B3A] flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-[#52606D]" /> Next Appointment
                  </h3>
                </div>
                {nextAppointment ? (
                <div className="flex items-start gap-4">
                  <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-3 text-center min-w-[70px]">
                    <p className="text-[11px] text-[#52606D] uppercase font-bold">{new Date(nextAppointment.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-[20px] font-bold text-[#102A43]">{new Date(nextAppointment.date).getDate()}</p>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-medium text-[#172B3A]">{nextAppointment.type || 'Follow-up'}</h4>
                    <p className="text-[13px] text-[#52606D] mt-1">{nextAppointment.provider} • {nextAppointment.specialty || 'General'}</p>
                    <p className="text-[13px] text-[#52606D] mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {nextAppointment.time || 'TBD'}
                    </p>
                  </div>
                </div>
                ) : (
                  <p className="text-[13px] text-[#52606D] mt-4">You have no upcoming appointments scheduled.</p>
                )}
              </div>
            </div>

            {/* 4. Medicines & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Medicines */}
              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
                <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#52606D]" /> Active Medicines
                </h3>
                <div className="space-y-3">
                  {medicines.length > 0 ? medicines.map((med: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px]">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1] flex-shrink-0"></div>
                      <div>
                        <p className="text-[14px] font-medium text-[#172B3A]">{med.name} {med.dosage}</p>
                        <p className="text-[12px] text-[#52606D]">{med.instructions}</p>
                      </div>
                    </div>
                  </div>
                  )) : (
                    <p className="text-[13px] text-[#52606D]">No active medicines found.</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
                <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button className="flex items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px] hover:border-[#173F5F] transition-colors group">
                    <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-[#1F5F8B]" strokeWidth={1.5} />
                      <span className="text-[14px] font-medium text-[#172B3A]">Request Prescription Refill</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#52606D] group-hover:text-[#102A43]" />
                  </button>
                  <button className="flex items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px] hover:border-[#173F5F] transition-colors group">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-[#1F5F8B]" strokeWidth={1.5} />
                      <span className="text-[14px] font-medium text-[#172B3A]">Message Care Team</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#52606D] group-hover:text-[#102A43]" />
                  </button>
                  <button className="flex items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px] hover:border-[#173F5F] transition-colors group">
                    <div className="flex items-center gap-3">
                      <FileDown className="w-5 h-5 text-[#1F5F8B]" strokeWidth={1.5} />
                      <span className="text-[14px] font-medium text-[#172B3A]">Download Medical Records</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#52606D] group-hover:text-[#102A43]" />
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Care Progress */}
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
              <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4">Care Plan Progress: Hypertension Management</h3>
              <div className="relative pt-2 pb-6">
                <div className="absolute left-4 top-4 bottom-0 w-px bg-[#CBD5E1]"></div>
                <div className="space-y-6 relative">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E8F2EC] flex items-center justify-center shrink-0 border border-[#276749] z-10 relative mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#276749]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#172B3A]">Initial Consultation</p>
                      <p className="text-[12px] text-[#52606D]">Completed Oct 15</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#1F5F8B] flex items-center justify-center shrink-0 border border-[#102A43] z-10 relative mt-0.5">
                      <Activity className="w-4 h-4 text-[#FFFFFF]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#172B3A]">30-Day Medication Review</p>
                      <p className="text-[12px] text-[#1F5F8B] font-medium">In Progress • Scheduled Nov 12</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F4F6F8] flex items-center justify-center shrink-0 border border-[#CBD5E1] z-10 relative mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#CBD5E1]"></div>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#52606D]">Follow-up Blood Work</p>
                      <p className="text-[12px] text-[#52606D]">Pending completion of review</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Results / Billing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Results */}
              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-[#172B3A]">Recent Results</h3>
                  <button className="text-[12px] font-medium text-[#1F5F8B] hover:underline">View All</button>
                </div>
                <div className="flex items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px]">
                  <div>
                    <p className="text-[14px] font-medium text-[#172B3A]">Complete Blood Count</p>
                    <p className="text-[12px] text-[#52606D]">Ordered Oct 15 • Dr. Jenkins</p>
                  </div>
                  <span className="bg-[#E8F2EC] text-[#276749] text-[11px] px-2 py-0.5 rounded-[4px] font-semibold border border-[#BCE3C6]">
                    Normal
                  </span>
                </div>
              </div>

              {/* Billing */}
              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-[#172B3A]">Billing Overview</h3>
                  <button className="text-[12px] font-medium text-[#1F5F8B] hover:underline">Make Payment</button>
                </div>
                <div className="flex items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px] bg-[#F9FAFB]">
                  <div>
                    <p className="text-[12px] text-[#52606D]">Outstanding Balance</p>
                    <p className="text-[20px] font-semibold text-[#172B3A] mt-0.5">$0.00</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-[#276749]" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            </div>
          )}

          {activeTab === 'Upcoming' && <UpcomingTab patientData={patientData} />}
          {activeTab === 'Timeline' && <TimelineTab patientData={patientData} />}
          {activeTab === 'My Case' && <MyCaseTab patientData={patientData} />}
          {activeTab === 'Medicines' && <MedicinesTab patientData={patientData} />}
          {activeTab === 'Results' && <ResultsTab patientData={patientData} />}
          {activeTab === 'My Doctors' && <MyDoctorsTab patientData={patientData} />}
          {activeTab === 'Health Overview' && <HealthOverviewTab patientData={patientData} />}
          {activeTab === 'Appointments' && <AppointmentsTab patientData={patientData} />}
          {activeTab === 'My QR' && <MyQRTab patientData={patientData} />}
          {activeTab === 'Privacy & Access' && <PrivacyAccessTab patientData={patientData} />}
          {activeTab === 'Billing' && <BillingTab patientData={patientData} />}
          {activeTab === 'Emergency' && <EmergencyTab patientData={patientData} />}

          {activeTab !== 'Dashboard' && activeTab !== 'Upcoming' && activeTab !== 'Timeline' && activeTab !== 'My Case' && activeTab !== 'Medicines' && activeTab !== 'Results' && activeTab !== 'My Doctors' && activeTab !== 'Health Overview' && activeTab !== 'Appointments' && activeTab !== 'My QR' && activeTab !== 'Privacy & Access' && activeTab !== 'Billing' && activeTab !== 'Emergency' && (
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
