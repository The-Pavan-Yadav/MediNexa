import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { 
  CalendarClock, 
  MapPin, 
  UserCircle, 
  Stethoscope, 
  CalendarPlus, 
  RefreshCw, 
  XCircle,
  FileText,
  CalendarCheck,
  CalendarX,
  AlertCircle
} from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  specialty: string;
  location: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  isNext?: boolean;
}

export default function AppointmentsTab({ patientData }: { patientData?: any }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchAppointments();
  }, [patientData]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'appointments'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const upcoming = data.filter(a => a.status === 'upcoming' || a.status === 'Scheduled');
      if (upcoming.length > 0) {
        upcoming[0].isNext = true;
      }
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [filter, setFilter] = useState('Upcoming');

  const filters = ['Upcoming', 'Completed', 'Cancelled'];

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'Upcoming' && (app.status === 'upcoming' || app.status === 'Scheduled')) return true;
    if (filter === 'Completed' && (app.status === 'completed' || app.status === 'Completed')) return true;
    if (filter === 'Cancelled' && (app.status === 'cancelled' || app.status === 'Cancelled')) return true;
    return false;
  });

  const nextAppointment = appointments.find(app => app.isNext && (app.status === 'upcoming' || app.status === 'Scheduled'));
  const regularUpcoming = filteredAppointments.filter(app => !app.isNext);

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Appointments</h2>
        <p className="text-[14px] text-[#52606D]">Manage your scheduled hospital visits, consultations, and medical procedures.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-[#CBD5E1] pb-4 overflow-x-auto custom-scrollbar">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors shrink-0 ${
              filter === f 
                ? 'bg-[#1F5F8B] text-white border border-[#1F5F8B]' 
                : 'bg-white border border-[#CBD5E1] text-[#52606D] hover:text-[#172B3A] hover:bg-[#F4F6F8]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Prominent Next Appointment */}
      {filter === 'Upcoming' && nextAppointment && (
        <div className="space-y-3">
          <h3 className="text-[15px] font-semibold text-[#172B3A]">Next Appointment</h3>
          
          <div className="bg-[#FFFFFF] border-l-4 border-[#1F5F8B] border-y border-r border-y-[#CBD5E1] border-r-[#CBD5E1] rounded-[4px] p-0 overflow-hidden">
            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Date & Time block */}
              <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-1 md:min-w-[140px]">
                <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-3 text-center min-w-[70px] md:w-full md:py-4">
                  <p className="text-[11px] text-[#52606D] uppercase font-bold tracking-wider">{nextAppointment.date.split(' ')[0]}</p>
                  <p className="text-[24px] font-bold text-[#102A43] leading-none my-1">{nextAppointment.date.split(' ')[1].replace(',', '')}</p>
                  <p className="text-[11px] text-[#52606D] uppercase font-bold tracking-wider">{nextAppointment.date.split(' ')[2]}</p>
                </div>
                <div className="flex flex-col md:w-full md:text-center mt-0 md:mt-2">
                  <span className="text-[16px] font-bold text-[#172B3A]">{nextAppointment.time}</span>
                  <span className="text-[12px] font-medium text-[#276749] flex items-center md:justify-center gap-1 mt-1">
                    <CalendarCheck className="w-3.5 h-3.5" /> Confirmed
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-[18px] font-semibold text-[#172B3A]">{nextAppointment.type}</h4>
                  <p className="text-[14px] text-[#1F5F8B] font-medium mt-0.5">{nextAppointment.provider}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Stethoscope className="w-4 h-4 text-[#52606D] mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-0.5">Specialty</p>
                      <p className="text-[13px] font-medium text-[#172B3A]">{nextAppointment.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#52606D] mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-[13px] font-medium text-[#172B3A]">{nextAppointment.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                <button className="w-full text-[13px] font-medium text-[#FFFFFF] bg-[#1F5F8B] border border-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#173F5F] transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" /> View Details
                </button>
                <button className="w-full text-[13px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#EBF1F6] transition-colors flex items-center justify-center gap-2">
                  <CalendarPlus className="w-4 h-4" /> Add to Calendar
                </button>
              </div>

            </div>
            
            {/* Secondary Actions Footer */}
            <div className="bg-[#F9FAFB] border-t border-[#CBD5E1] p-3 px-5 flex items-center justify-end gap-4">
              <button className="text-[12px] font-medium text-[#52606D] hover:text-[#172B3A] flex items-center gap-1.5 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Reschedule
              </button>
              <span className="text-[#CBD5E1]">|</span>
              <button className="text-[12px] font-medium text-[#B42318] hover:text-[#9B1C1C] flex items-center gap-1.5 transition-colors">
                <XCircle className="w-3.5 h-3.5" /> Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-[15px] font-semibold text-[#172B3A]">
          {filter === 'Upcoming' && nextAppointment ? 'Other Upcoming Appointments' : `${filter} Appointments`}
        </h3>
        
        {filteredAppointments.length === 0 || (filter === 'Upcoming' && regularUpcoming.length === 0 && nextAppointment) ? (
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-8 text-center">
            <CalendarX className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[14px] font-medium text-[#172B3A]">No appointments found</p>
            <p className="text-[13px] text-[#52606D] mt-1">You have no {filter.toLowerCase()} appointments.</p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] divide-y divide-[#CBD5E1] overflow-hidden">
            {(filter === 'Upcoming' ? regularUpcoming : filteredAppointments).map(app => (
              <div key={app.id} className="p-4 md:p-5 hover:bg-[#F9FAFB] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1">
                  <div className="min-w-[120px]">
                    <p className="text-[14px] font-bold text-[#172B3A]">{app.date}</p>
                    <p className="text-[13px] text-[#52606D] font-medium mt-0.5">{app.time}</p>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-[#172B3A] mb-0.5">{app.type}</h4>
                    <p className="text-[13px] font-medium text-[#1F5F8B]">{app.provider} <span className="text-[#52606D] font-normal mx-1">•</span> <span className="text-[#52606D] font-normal">{app.specialty}</span></p>
                    <p className="text-[12px] text-[#52606D] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {app.location}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 shrink-0">
                  {/* Status Badge */}
                  <div className="w-full sm:w-[90px] text-left sm:text-right">
                    {app.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 bg-[#F4F6F8] text-[#52606D] text-[11px] px-2 py-0.5 rounded-[4px] font-bold uppercase border border-[#CBD5E1]">
                        Completed
                      </span>
                    )}
                    {app.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 bg-[#FEF2F2] text-[#B42318] text-[11px] px-2 py-0.5 rounded-[4px] font-bold uppercase border border-[#FCA5A5]">
                        Cancelled
                      </span>
                    )}
                    {app.status === 'upcoming' && (
                      <span className="inline-flex items-center gap-1 bg-[#E8F2EC] text-[#276749] text-[11px] px-2 py-0.5 rounded-[4px] font-bold uppercase border border-[#BCE3C6]">
                        Confirmed
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none text-[13px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#1F5F8B] px-3 py-1.5 rounded-[4px] hover:bg-[#EBF1F6] transition-colors whitespace-nowrap">
                      View Details
                    </button>
                    {app.status === 'upcoming' && (
                      <button className="flex-1 sm:flex-none text-[13px] font-medium text-[#52606D] bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] hover:bg-[#F4F6F8] hover:text-[#172B3A] transition-colors whitespace-nowrap">
                        Options
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
