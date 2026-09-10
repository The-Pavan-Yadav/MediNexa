import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CalendarDays, 
  Loader2,
  Plus,
  AlertCircle,
  UserCircle,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { getDoc, collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

interface AppointmentType {
  id: string;
  patientId: string;
  patientMhdId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  department: string;
  type: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  timestamp?: any;
}

export default function AppointmentsTab({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: any }) {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<{ type: 'idle' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });
  
  // For dropdown actions
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [newAppt, setNewAppt] = useState({
    patientId: '',
    patientMhdId: '',
    date: '',
    time: '',
    type: 'Consultation',
    notes: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      
      let fetched: AppointmentType[] = [];
      snapshot.forEach(docSnap => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as AppointmentType);
      });

      
      
      // Sort by date then time (rudimentary)
      fetched.sort((a, b) => {
        if (a.date !== b.date) return a.date > b.date ? 1 : -1;
        return a.time > b.time ? 1 : -1;
      });

      setAppointments(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorData]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
      setActiveDropdown(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientMhdId || !newAppt.date || !newAppt.time) return;
    
    setIsScheduling(true);
    setScheduleStatus({ type: 'idle', msg: '' });

    try {
      // Find patient
      const q = query(collection(db, 'users'), where('role', '==', 'patient'), where('mhdId', '==', newAppt.patientMhdId.trim().toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setScheduleStatus({ type: 'error', msg: 'Patient ID not found.' });
        setIsScheduling(false);
        return;
      }

      const pDoc = snap.docs[0];
      const pData = pDoc.data();

      // Check if patient is authorized (in doctor's array)
      const docRef = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      const myPatients = docRef.data()?.patientIds || [];
      
      if (!myPatients.includes(pDoc.id)) {
        setScheduleStatus({ type: 'error', msg: 'Patient not in your authorized roster.' });
        setIsScheduling(false);
        return;
      }

      await addDoc(collection(db, 'appointments'), {
        patientId: pDoc.id,
        patientMhdId: pData.mhdId,
        patientName: pData.name,
        doctorId: auth.currentUser!.uid,
        doctorName: doctorData?.name || 'Dr. Smith',
        date: newAppt.date,
        time: newAppt.time,
        department: doctorData?.specialization || 'General Medicine',
        type: newAppt.type,
        status: 'Scheduled',
        notes: newAppt.notes,
        timestamp: serverTimestamp()
      });

      setScheduleStatus({ type: 'success', msg: 'Appointment scheduled successfully.' });
      setNewAppt({ patientId: '', patientMhdId: '', date: '', time: '', type: 'Consultation', notes: '' });
      await fetchAppointments();
      
      setTimeout(() => {
        setShowScheduleForm(false);
        setScheduleStatus({ type: 'idle', msg: '' });
      }, 2000);

    } catch (err) {
      console.error(err);
      setScheduleStatus({ type: 'error', msg: 'Failed to schedule.' });
    } finally {
      setIsScheduling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Scheduled': return 'bg-[#EBF1F6] text-[#1F5F8B] border-[#90CDF4]';
      case 'Confirmed': return 'bg-[#FEF6E7] text-[#975A16] border-[#F6E0B5]';
      case 'Completed': return 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]';
      case 'Cancelled': return 'bg-[#FEF2F2] text-[#B42318] border-[#FCA5A5]';
      default: return 'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.patientMhdId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesDate = dateFilter === '' || a.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const todaysQueue = filteredAppointments.filter(a => a.date === todayStr);
  const upcomingQueue = filteredAppointments.filter(a => a.date > todayStr);
  const pastQueue = filteredAppointments.filter(a => a.date < todayStr);

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header & Schedule CTA */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Appointments & Schedule</h2>
          <p className="text-[14px] text-[#52606D]">Manage your clinical calendar and daily patient queue.</p>
        </div>
        <button 
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="bg-[#102A43] text-white px-5 py-2.5 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors border border-[#102A43] flex items-center gap-2 w-full md:w-auto justify-center"
        >
          {showScheduleForm ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showScheduleForm ? 'Close Form' : 'Schedule Appointment'}
        </button>
      </div>

      {/* Schedule Form Panel */}
      {showScheduleForm && (
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 shadow-sm animate-in slide-in-from-top-2">
          <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4">Book New Appointment</h3>
          <form onSubmit={handleScheduleAppt} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Patient ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. P-045"
                  value={newAppt.patientMhdId}
                  onChange={(e) => setNewAppt({...newAppt, patientMhdId: e.target.value})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Date</label>
                <input 
                  type="date" 
                  required
                  min={todayStr}
                  value={newAppt.date}
                  onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Time</label>
                <input 
                  type="time" 
                  required
                  value={newAppt.time}
                  onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Type</label>
                <select 
                  value={newAppt.type}
                  onChange={(e) => setNewAppt({...newAppt, type: e.target.value})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] cursor-pointer"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Lab Review">Lab Review</option>
                  <option value="Procedure">Procedure</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Notes (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Reason for visit..."
                  value={newAppt.notes}
                  onChange={(e) => setNewAppt({...newAppt, notes: e.target.value})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                />
              </div>
              <button 
                type="submit"
                disabled={isScheduling}
                className="bg-[#1F5F8B] text-white px-6 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors border border-[#1F5F8B] disabled:opacity-70 flex items-center justify-center min-w-[140px]"
              >
                {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
              </button>
            </div>
            
            {scheduleStatus.msg && (
              <div className={`mt-2 text-[12px] font-medium flex items-center gap-1.5 ${scheduleStatus.type === 'success' ? 'text-[#276749]' : 'text-[#B42318]'}`}>
                {scheduleStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {scheduleStatus.msg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="text" 
            placeholder="Search Patient..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[220px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[150px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none"
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-[160px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]"
          />
        </div>
        {dateFilter && (
          <button 
            onClick={() => setDateFilter('')}
            className="text-[12px] font-medium text-[#B42318] hover:underline flex items-center px-2"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Tables Section */}
      <div className="space-y-6">
        
        {/* Today's Queue */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
          <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-3 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#172B3A] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#102A43]" /> Today's Queue
            </h3>
            <span className="bg-[#EBF1F6] text-[#1F5F8B] text-[11px] font-bold px-2 py-0.5 rounded-[4px]">
              {todaysQueue.length} Appointments
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#CBD5E1]">
                  <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider w-[120px]">Time</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Visit Details</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#1F5F8B] mx-auto mb-2" />
                    </td>
                  </tr>
                ) : todaysQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#52606D]">
                      No appointments scheduled for today.
                    </td>
                  </tr>
                ) : (
                  todaysQueue.map((appt) => (
                    <tr key={appt.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 align-middle text-[14px] font-bold text-[#172B3A]">{appt.time}</td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          <UserCircle className="w-8 h-8 text-[#CBD5E1]" />
                          <div>
                            <p className="text-[13px] font-semibold text-[#172B3A]">{appt.patientName}</p>
                            <p className="text-[11px] font-mono text-[#52606D]">{appt.patientMhdId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <p className="text-[13px] font-medium text-[#172B3A]">{appt.type}</p>
                        <p className="text-[12px] text-[#52606D]">{appt.department}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-block ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === appt.id ? null : appt.id)}
                            className="p-1.5 rounded-[4px] hover:bg-[#F4F6F8] text-[#52606D]"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdown === appt.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] shadow-lg z-20 py-1">
                              <button onClick={() => handleUpdateStatus(appt.id, 'Confirmed')} className="w-full text-left px-4 py-1.5 text-[12px] text-[#172B3A] hover:bg-[#F9FAFB]">Mark Confirmed</button>
                              <button onClick={() => handleUpdateStatus(appt.id, 'Completed')} className="w-full text-left px-4 py-1.5 text-[12px] text-[#276749] hover:bg-[#F9FAFB]">Mark Completed</button>
                              <button onClick={() => handleUpdateStatus(appt.id, 'Cancelled')} className="w-full text-left px-4 py-1.5 text-[12px] text-[#B42318] hover:bg-[#F9FAFB]">Cancel</button>
                              <div className="h-px bg-[#CBD5E1] my-1"></div>
                              <button className="w-full text-left px-4 py-1.5 text-[12px] font-medium text-[#1F5F8B] hover:bg-[#F9FAFB]">View Chart</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Queue */}
        {upcomingQueue.length > 0 && (
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-3 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#172B3A] flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#102A43]" /> Upcoming Appointments
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-[#CBD5E1]">
                  {upcomingQueue.map((appt) => (
                    <tr key={appt.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 align-middle w-[150px]">
                        <p className="text-[13px] font-bold text-[#172B3A]">{appt.date}</p>
                        <p className="text-[12px] text-[#52606D]">{appt.time}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <p className="text-[13px] font-semibold text-[#172B3A]">{appt.patientName} <span className="text-[11px] font-normal text-[#52606D]">({appt.patientMhdId})</span></p>
                        <p className="text-[12px] text-[#52606D]">{appt.type}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-block ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                         <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === appt.id ? null : appt.id)}
                            className="p-1.5 rounded-[4px] hover:bg-[#F4F6F8] text-[#52606D]"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdown === appt.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] shadow-lg z-20 py-1">
                              <button onClick={() => handleUpdateStatus(appt.id, 'Confirmed')} className="w-full text-left px-4 py-1.5 text-[12px] text-[#172B3A] hover:bg-[#F9FAFB]">Mark Confirmed</button>
                              <button onClick={() => handleUpdateStatus(appt.id, 'Cancelled')} className="w-full text-left px-4 py-1.5 text-[12px] text-[#B42318] hover:bg-[#F9FAFB]">Cancel</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
