import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Activity, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export default function DoctorHomeTab({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: any }) {
  const [patientIdInput, setPatientIdInput] = useState('');
  const [addPatientStatus, setAddPatientStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);

  // We could fetch the doctor's actual patients array here for display
  const [stats, setStats] = useState({ waitingCases: 0, urgent: 0, patientsToday: 0, completedToday: 0, totalPatients: 0 });
  const [todayAppts, setTodayAppts] = useState<any[]>([]);
  const [awaitingReview, setAwaitingReview] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!auth.currentUser) return;
      
      const totalPatients = doctorData?.patientIds?.length || 0;
      
      // Fetch cases
      const casesQ = query(collection(db, 'cases'), where('assignedDoctorId', '==', auth.currentUser.uid));
      const casesSnap = await getDocs(casesQ);
      let waiting = 0;
      let urgent = 0;
      const reviews: any[] = [];
      casesSnap.forEach(d => {
        const c = d.data();
        if (c.status === 'Waiting') {
           waiting++;
           if (c.priority === 'High') urgent++;
           reviews.push({ name: c.patientName, id: c.patientMhdId, reason: c.symptoms || 'Awaiting Review' });
        }
      });
      setAwaitingReview(reviews.slice(0, 5));

      // Fetch appointments
      const today = new Date().toISOString().split('T')[0];
      const apptQ = query(collection(db, 'appointments'), where('doctorId', '==', auth.currentUser.uid), where('date', '==', today));
      const apptSnap = await getDocs(apptQ);
      
      let pToday = 0;
      let cToday = 0;
      const appts: any[] = [];
      apptSnap.forEach(d => {
        pToday++;
        const a = d.data();
        if (a.status === 'Completed') cToday++;
        appts.push(a);
      });
      setTodayAppts(appts);
      
      setStats({
        waitingCases: waiting,
        urgent,
        patientsToday: pToday,
        completedToday: cToday,
        totalPatients
      });
    };
    fetchDashboardData();
  }, [doctorData]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput.trim()) return;
    
    setAddPatientStatus({ type: 'loading', msg: 'Verifying Patient ID...' });
    
    try {
      // Find patient by MHD ID
      const q = query(collection(db, 'users'), where('role', '==', 'patient'), where('mhdId', '==', patientIdInput.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setAddPatientStatus({ type: 'error', msg: 'Patient ID not found.' });
        return;
      }

      const patientDoc = querySnapshot.docs[0];
      
      if (!auth.currentUser) throw new Error("Not authenticated");
      const doctorRef = doc(db, 'users', auth.currentUser.uid);
      
      await updateDoc(doctorRef, {
        patientIds: arrayUnion(patientDoc.id)
      });
      
      setAddPatientStatus({ type: 'success', msg: `Successfully added ${patientDoc.data().name} to your roster.` });
      setPatientIdInput('');
      
      setTimeout(() => {
        setAddPatientStatus({ type: 'idle', msg: '' });
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      setAddPatientStatus({ type: 'error', msg: 'Failed to add patient.' });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Section: Profile & Quick Add */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Doctor Profile Summary */}
        <div className="flex-1 bg-[#102A43] border border-[#102A43] rounded-[4px] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-[24px] font-bold mb-1">
              {doctorData?.name ? `Dr. ${doctorData.name}` : 'Welcome, Doctor'}
            </h2>
            <p className="text-[14px] text-[#CBD5E1] mb-4">
              {doctorData?.specialization || 'General Medicine'} • {doctorData?.mhdId || 'D-XXX'}
            </p>
            <div className="flex gap-4">
              <div className="bg-[#173F5F] px-3 py-1.5 rounded-[4px] border border-[#1F5F8B]">
                <p className="text-[10px] text-[#CBD5E1] uppercase tracking-wider font-semibold">Shift Status</p>
                <p className="text-[13px] font-bold text-[#48BB78]">On Duty</p>
              </div>
              <div className="bg-[#173F5F] px-3 py-1.5 rounded-[4px] border border-[#1F5F8B]">
                <p className="text-[10px] text-[#CBD5E1] uppercase tracking-wider font-semibold">Location</p>
                <p className="text-[13px] font-bold text-white">Main Wing, Fl 3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Patient Widget */}
        <div className="w-full md:w-[350px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 shrink-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-5 h-5 text-[#102A43]" />
            <h3 className="text-[14px] font-semibold text-[#172B3A]">Add Patient to Roster</h3>
          </div>
          <form onSubmit={handleAddPatient} className="flex gap-2">
            <input 
              type="text" 
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value)}
              placeholder="e.g. P-001" 
              className="flex-1 bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B]"
            />
            <button 
              type="submit"
              disabled={addPatientStatus.type === 'loading'}
              className="bg-[#1F5F8B] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors border border-[#1F5F8B] disabled:opacity-70"
            >
              Add
            </button>
          </form>
          {addPatientStatus.msg && (
            <p className={`text-[12px] mt-2 font-medium ${addPatientStatus.type === 'success' ? 'text-[#276749]' : addPatientStatus.type === 'error' ? 'text-[#B42318]' : 'text-[#52606D]'}`}>
              {addPatientStatus.msg}
            </p>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Waiting Cases</p>
            <Clock className="w-4 h-4 text-[#975A16]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">{stats.waitingCases}</p>
          <p className="text-[11px] text-[#52606D]">{stats.urgent} urgent requests</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Patients Today</p>
            <Users className="w-4 h-4 text-[#1F5F8B]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">{stats.patientsToday}</p>
          <p className="text-[11px] text-[#52606D]">{stats.completedToday} completed, {stats.patientsToday - stats.completedToday} upcoming</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Total Patients</p>
            <Activity className="w-4 h-4 text-[#276749]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">{stats.totalPatients}</p>
          <p className="text-[11px] text-[#52606D]">Active on your roster</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#FCA5A5] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#B42318] uppercase tracking-wider">Pending Meds</p>
            <FileText className="w-4 h-4 text-[#B42318]" />
          </div>
          <p className="text-[28px] font-bold text-[#B42318] leading-none mb-1">0</p>
          <p className="text-[11px] text-[#B42318]">Verifications required</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Schedule */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
          <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#172B3A]">Today's Schedule</h3>
            <button onClick={() => setActiveTab && setActiveTab('Appointments')} className="text-[12px] font-medium text-[#1F5F8B] hover:underline">View Calendar</button>
          </div>
          <div className="divide-y divide-[#CBD5E1]">
            {todayAppts.length === 0 ? (
               <div className="p-8 text-center text-[13px] text-[#52606D]">No appointments today.</div>
            ) : todayAppts.map((apt, i) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-[#F9FAFB] transition-colors">
                <div className="w-[80px] shrink-0">
                  <p className="text-[13px] font-bold text-[#172B3A]">{apt.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#172B3A]">{apt.patientName} <span className="text-[12px] font-normal text-[#52606D] ml-1">({apt.patientMhdId})</span></p>
                  <p className="text-[12px] text-[#52606D]">{apt.type}</p>
                </div>
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border ${
                    apt.status === 'Completed' ? 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]' :
                    apt.status === 'Confirmed' ? 'bg-[#EBF1F6] text-[#1F5F8B] border-[#90CDF4]' :
                    apt.status === 'Scheduled' ? 'bg-[#FEF6E7] text-[#975A16] border-[#F6E0B5]' :
                    'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Clinical Alerts */}
          <div className="bg-[#FFFFFF] border border-[#FCA5A5] rounded-[4px] overflow-hidden">
            <div className="bg-[#FEF2F2] border-b border-[#FCA5A5] p-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B42318]" />
              <h3 className="text-[15px] font-semibold text-[#B42318]">Critical Alerts</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-8 text-center text-[13px] text-[#52606D]">No critical alerts at this time.</div>
            </div>
          </div>

          {/* Patients Awaiting Review */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#172B3A]">Awaiting Review</h3>
            </div>
            <div className="divide-y divide-[#CBD5E1]">
              {awaitingReview.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[#52606D]">No patients awaiting review.</div>
              ) : awaitingReview.map((patient, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
                  <div>
                    <p className="text-[13px] font-semibold text-[#172B3A]">{patient.name} <span className="text-[#52606D] font-normal">({patient.id})</span></p>
                    <p className="text-[12px] text-[#52606D] mt-0.5">{patient.reason}</p>
                  </div>
                  <button onClick={() => setActiveTab && setActiveTab('Cases')} className="w-8 h-8 rounded-[4px] bg-[#FFFFFF] border border-[#CBD5E1] flex items-center justify-center text-[#52606D] hover:text-[#1F5F8B] hover:border-[#1F5F8B] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
