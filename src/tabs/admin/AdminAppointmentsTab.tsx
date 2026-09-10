import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Building2, 
  Loader2, 
  X, 
  ChevronRight,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface AdminAppointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

export default function AdminAppointmentsTab({ adminData }: { adminData: any }) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewTab, setViewTab] = useState<'Today' | 'Upcoming' | 'All'>('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [selectedAppt, setSelectedAppt] = useState<AdminAppointment | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const apptRef = collection(db, 'appointments');
      const snap = await getDocs(apptRef);
      
      let fetched: AdminAppointment[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          patientId: data.patientId || 'P-UNKNOWN',
          patientName: data.patientName || 'Unknown Patient',
          doctorId: data.doctorId || '',
          doctorName: data.doctorName || 'Unknown Doctor',
          department: data.department || 'General',
          date: data.date || new Date().toISOString().split('T')[0],
          time: data.time || '00:00',
          type: data.type || 'Consultation',
          status: data.status || 'Scheduled'
        });
      });

      // Sort by date and time
      fetched.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      });
      
      setAppointments(fetched);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    // Format YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleOpenAppt = (appt: AdminAppointment) => {
    setSelectedAppt(appt);
    setEditStatus(appt.status);
    setEditDate(appt.date);
    setEditTime(appt.time);
  };

  const handleSaveChanges = async () => {
    if (!selectedAppt) return;
    setSaving(true);
    try {
      const apptRef = doc(db, 'appointments', selectedAppt.id);
      
      const updatedData = {
        status: editStatus,
        date: editDate,
        time: editTime
      };

      await updateDoc(apptRef, updatedData);
      
      setAppointments(prev => prev.map(a => 
        a.id === selectedAppt.id ? { ...a, ...updatedData } : a
      ));
      setSelectedAppt(null);
    } catch (err) {
      console.error("Error updating appointment:", err);
    } finally {
      setSaving(false);
    }
  };

  const todayStr = getTodayString();

  const filteredAppointments = appointments.filter(a => {
    // View Tab Filter
    if (viewTab === 'Today' && a.date !== todayStr) return false;
    if (viewTab === 'Upcoming' && a.date <= todayStr) return false;
    
    // Search Query
    const matchesSearch = 
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status Filter
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = a.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-[#1F5F8B] bg-[#EBF1F6] border-[#B8D4E8]';
      case 'Confirmed': return 'text-[#276749] bg-[#E8F2EC] border-[#BCE3C6]';
      case 'Completed': return 'text-[#52606D] bg-[#F4F6F8] border-[#CBD5E1]';
      case 'Cancelled': return 'text-[#B42318] bg-[#FEF2F2] border-[#FCA5A5]';
      default: return 'text-[#52606D] bg-[#FFFFFF] border-[#CBD5E1]';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Scheduling & Appointments</h2>
          <p className="text-[14px] text-[#52606D]">Global calendar oversight, patient queues, and booking management.</p>
        </div>
        <button className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Appointment
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-[#CBD5E1] gap-6">
        {['Today', 'Upcoming', 'All'].map((tab) => (
          <button
            key={tab}
            onClick={() => setViewTab(tab as any)}
            className={`pb-3 text-[14px] font-medium transition-colors relative ${
              viewTab === tab 
                ? 'text-[#102A43] border-b-2 border-[#102A43]' 
                : 'text-[#52606D] hover:text-[#172B3A]'
            }`}
          >
            {tab === 'Today' ? "Today's Queue" : tab === 'Upcoming' ? "Upcoming" : "All Appointments"}
          </button>
        ))}
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="text" 
            placeholder="Search Patient or Doctor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[180px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Schedule</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Provider</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1F5F8B] mx-auto mb-2" />
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#52606D]">
                    No appointments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <p className="text-[13px] font-bold text-[#172B3A] flex items-center gap-1.5 mb-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1F5F8B]" /> 
                        {new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[12px] text-[#52606D] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 
                        {appt.time}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] font-bold text-[#172B3A]">{appt.patientName}</p>
                      <p className="text-[11px] font-mono text-[#1F5F8B]">{appt.patientId}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] text-[#172B3A] flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#52606D]" /> {appt.doctorName}
                      </p>
                      <p className="text-[11px] text-[#52606D] flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" /> {appt.department}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-[12px] text-[#172B3A]">{appt.type}</span>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-flex items-center ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button 
                        onClick={() => handleOpenAppt(appt)}
                        className="text-[12px] font-medium text-[#1F5F8B] hover:underline inline-flex items-center gap-1"
                      >
                        Manage <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Management Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-[#102A43]/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-[8px] shadow-xl w-full max-w-[500px] flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-[#CBD5E1] bg-[#F9FAFB] rounded-t-[8px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#EBF1F6] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#1F5F8B]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#172B3A] leading-tight">Manage Appointment</h3>
                  <p className="text-[12px] font-mono text-[#52606D]">ID: {selectedAppt.id.substring(0,8).toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAppt(null)}
                className="text-[#52606D] hover:text-[#172B3A] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Snapshot */}
              <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-4 text-[13px]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#52606D] block mb-1">Patient:</span>
                    <span className="font-semibold text-[#172B3A]">{selectedAppt.patientName}</span>
                  </div>
                  <div>
                    <span className="text-[#52606D] block mb-1">Doctor:</span>
                    <span className="font-semibold text-[#172B3A]">{selectedAppt.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-[#52606D] block mb-1">Department:</span>
                    <span className="font-semibold text-[#172B3A]">{selectedAppt.department}</span>
                  </div>
                  <div>
                    <span className="text-[#52606D] block mb-1">Type:</span>
                    <span className="font-semibold text-[#172B3A]">{selectedAppt.type}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider border-b border-[#CBD5E1] pb-1">Scheduling & Status</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Date</label>
                    <input 
                      type="date" 
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Time</label>
                    <input 
                      type="time" 
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Appointment Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {editStatus === 'Cancelled' && (
                  <div className="flex items-start gap-2 text-[11px] text-[#B42318] bg-[#FEF2F2] border border-[#FCA5A5] p-3 rounded-[4px]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>
                      Cancelling this appointment will notify both the assigned doctor and the patient. This action cannot be easily undone.
                    </p>
                  </div>
                )}
              </div>

            </div>

            <div className="p-4 border-t border-[#CBD5E1] bg-[#F9FAFB] flex justify-end gap-3 rounded-b-[8px]">
              <button 
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 text-[13px] font-medium text-[#52606D] hover:bg-[#EBF1F6] hover:text-[#172B3A] rounded-[4px] transition-colors"
                disabled={saving}
              >
                Close
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
