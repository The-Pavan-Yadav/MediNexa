import React, { useState } from 'react';
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

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    date: 'Nov 09, 2026',
    time: '2:30 PM',
    type: 'medicine',
    title: 'New Prescription: Lisinopril 10mg',
    provider: 'Dr. Sarah Jenkins',
    department: 'Primary Care',
    description: 'Prescribed to manage blood pressure. Take one tablet daily in the morning with food. Avoid potassium supplements.',
    icon: Pill,
    iconBg: 'bg-[#F0F5FA]',
    iconColor: 'text-[#1F5F8B]',
    borderColor: 'border-[#1F5F8B]',
    hasDetails: true
  },
  {
    id: '2',
    date: 'Nov 09, 2026',
    time: '1:00 PM',
    type: 'consultation',
    title: 'Primary Care Consultation',
    provider: 'Dr. Sarah Jenkins',
    department: 'Primary Care',
    description: 'Routine 30-day medication review and hypertension management check-in. Vitals recorded and blood pressure is trending downward to 120/80.',
    icon: Stethoscope,
    iconBg: 'bg-[#FFFFFF]',
    iconColor: 'text-[#102A43]',
    borderColor: 'border-[#102A43]',
    hasDetails: true
  },
  {
    id: '3',
    date: 'Oct 15, 2026',
    time: '9:00 AM',
    type: 'result',
    title: 'Lab Results: Complete Blood Count',
    provider: 'Lab Services',
    department: 'Pathology',
    description: 'All values within normal clinical ranges. Lipid panel shows 15% improvement since last quarter. No further action required at this time.',
    icon: FileText,
    iconBg: 'bg-[#E8F2EC]',
    iconColor: 'text-[#276749]',
    borderColor: 'border-[#276749]',
    hasDetails: true
  },
  {
    id: '4',
    date: 'Oct 12, 2026',
    time: '10:15 AM',
    type: 'appointment',
    title: 'Annual Physical Exam',
    provider: 'Dr. Sarah Jenkins',
    department: 'Primary Care',
    description: 'Completed annual physical. Patient reports feeling well. Ordered standard preventative blood panels and ECG screening.',
    icon: CalendarClock,
    iconBg: 'bg-[#FFFFFF]',
    iconColor: 'text-[#52606D]',
    borderColor: 'border-[#CBD5E1]',
    hasDetails: false
  },
  {
    id: '5',
    date: 'Sep 02, 2026',
    time: '11:45 AM',
    type: 'case',
    title: 'Diagnosis: Essential Hypertension',
    provider: 'Dr. Emily Chen',
    department: 'Cardiology',
    description: 'Diagnosed with Stage 1 Essential Hypertension. Initiated formal care plan, lifestyle modification tracking, and sodium restriction guidelines.',
    icon: Activity,
    iconBg: 'bg-[#FEF6E7]',
    iconColor: 'text-[#975A16]',
    borderColor: 'border-[#F6E0B5]',
    hasDetails: true
  }
];

export default function TimelineTab() {
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Consultations', 'Medicines', 'Results', 'Appointments'];

  const filteredEvents = TIMELINE_EVENTS.filter(event => {
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
