import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Stethoscope, 
  Pill, 
  FileText, 
  CalendarClock, 
  Activity,
  FileHeart
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: 'consultation' | 'medicine' | 'result' | 'appointment' | 'case';
  title: string;
  provider: string;
  department: string;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  hasDetails: boolean;
}

export default function TimelineTab({ patientData }: { patientData?: any }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) {
      fetchTimeline();
    }
  }, [patientData]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const allEvents: TimelineEvent[] = [];
      const pid = patientData.mhdId;

      // Fetch Appointments
      const apptSnap = await getDocs(query(collection(db, 'appointments'), where('patientId', '==', pid)));
      apptSnap.forEach(doc => {
        const d = doc.data();
        allEvents.push({
          id: doc.id,
          date: d.date,
          time: d.time || '12:00 PM',
          type: 'appointment',
          title: d.type || 'Appointment',
          provider: d.doctorName || d.provider || 'Unknown',
          department: d.department || d.specialty || 'General',
          description: `Status: ${d.status}`,
          icon: CalendarClock,
          iconBg: 'bg-[#FFFFFF]',
          iconColor: 'text-[#52606D]',
          borderColor: 'border-[#CBD5E1]',
          hasDetails: false,
          timestamp: new Date(d.date + ' ' + (d.time || '12:00 PM')).getTime()
        });
      });

      // Fetch Medicines
      const medSnap = await getDocs(query(collection(db, 'medicines'), where('patientId', '==', pid)));
      medSnap.forEach(doc => {
        const d = doc.data();
        allEvents.push({
          id: doc.id,
          date: d.startDate || new Date().toISOString().split('T')[0],
          time: '08:00 AM',
          type: 'medicine',
          title: `Prescription: ${d.name} ${d.dosage}`,
          provider: d.doctorName || d.prescribingDoctor || 'Unknown',
          department: 'Pharmacy',
          description: d.frequency || 'Take as directed',
          icon: Pill,
          iconBg: 'bg-[#F0F5FA]',
          iconColor: 'text-[#1F5F8B]',
          borderColor: 'border-[#1F5F8B]',
          hasDetails: true,
          timestamp: new Date(d.startDate || new Date()).getTime()
        });
      });

      // Fetch Cases
      const caseSnap = await getDocs(query(collection(db, 'cases'), where('patientId', '==', pid)));
      caseSnap.forEach(doc => {
        const d = doc.data();
        allEvents.push({
          id: doc.id,
          date: d.date || new Date().toISOString().split('T')[0],
          time: '12:00 PM',
          type: 'case',
          title: `Diagnosis: ${d.diagnosis}`,
          provider: d.doctorName || 'Unknown',
          department: d.department || 'Clinical',
          description: `Case Status: ${d.status}`,
          icon: Activity,
          iconBg: 'bg-[#FEF6E7]',
          iconColor: 'text-[#975A16]',
          borderColor: 'border-[#F6E0B5]',
          hasDetails: true,
          timestamp: new Date(d.date || new Date()).getTime()
        });
      });

      // Sort descending
      allEvents.sort((a, b) => (b as any).timestamp - (a as any).timestamp);
      
      setEvents(allEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Consultations', 'Medicines', 'Results', 'Appointments'];

  const filteredEvents = events.filter(event => {
    if (filter === 'All') return true;
    if (filter === 'Consultations' && (event.type === 'consultation' || event.type === 'case')) return true;
    if (filter === 'Medicines' && event.type === 'medicine') return true;
    if (filter === 'Results' && event.type === 'result') return true;
    if (filter === 'Appointments' && event.type === 'appointment') return true;
    return false;
  });

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Medical Timeline</h2>
        <p className="text-[14px] text-[#52606D]">A chronological record of your healthcare journey, consultations, and clinical events.</p>
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

      {/* Timeline List */}
      <div className="relative pt-4 pb-12">
        {/* Continuous Vertical Spine */}
        <div className="absolute left-[15px] top-6 bottom-0 w-px bg-[#CBD5E1]"></div>
        
        <div className="space-y-8 relative">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <div key={event.id} className="flex items-start gap-4 md:gap-6">
                
                {/* Timeline Node */}
                <div className={`w-8 h-8 rounded-full ${event.iconBg} flex items-center justify-center shrink-0 border ${event.borderColor} z-10 relative mt-1`}>
                  <event.icon className={`w-4 h-4 ${event.iconColor}`} strokeWidth={2} />
                </div>
                
                {/* Content Card */}
                <div className="flex-1">
                  <div className="mb-2 pl-1">
                    <span className="text-[12px] font-bold text-[#52606D] tracking-wide uppercase">
                      {event.date} <span className="mx-1 font-normal text-[#CBD5E1]">|</span> {event.time}
                    </span>
                  </div>
                  
                  <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 hover:border-[#173F5F] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[15px] font-semibold text-[#172B3A] leading-tight">{event.title}</h4>
                        <p className="text-[13px] text-[#52606D] mt-1 font-medium flex items-center gap-1.5">
                          {event.provider} <span className="text-[#CBD5E1]">•</span> {event.department}
                        </p>
                        <p className="text-[13px] text-[#172B3A] mt-3 leading-relaxed max-w-[700px]">
                          {event.description}
                        </p>
                      </div>
                      
                      {event.hasDetails && (
                        <button className="text-[12px] font-medium text-[#1F5F8B] border border-[#1F5F8B] px-4 py-1.5 rounded-[4px] hover:bg-[#EBF1F6] transition-colors shrink-0 whitespace-nowrap mt-2 md:mt-0">
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-8 text-center ml-12">
              <FileHeart className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[14px] font-medium text-[#172B3A]">No events found</p>
              <p className="text-[13px] text-[#52606D] mt-1">Try adjusting your filters to see more history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
