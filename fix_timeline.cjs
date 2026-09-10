const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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
  timestamp: number;
}

export default function TimelineTab({ patientData }: { patientData?: any }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);

    const qAppts = query(collection(db, 'appointments'), where('patientId', '==', auth.currentUser.uid));
    const qCases = query(collection(db, 'cases'), where('patientId', '==', auth.currentUser.uid));
    const qRecords = query(collection(db, 'clinical_records'), where('patientId', '==', auth.currentUser.uid));

    let apptsData: any[] = [];
    let casesData: any[] = [];
    let recordsData: any[] = [];

    const updateEvents = () => {
      const allEvents: TimelineEvent[] = [];

      apptsData.forEach(d => {
        allEvents.push({
          id: d.id,
          date: d.date || new Date().toISOString().split('T')[0],
          time: d.time || '12:00 PM',
          type: 'appointment',
          title: d.type || 'Appointment',
          provider: d.doctorName || 'Unknown',
          department: d.department || 'General',
          description: \`Status: \${d.status}\`,
          icon: CalendarClock,
          iconBg: 'bg-[#FFFFFF]',
          iconColor: 'text-[#52606D]',
          borderColor: 'border-[#CBD5E1]',
          hasDetails: false,
          timestamp: new Date((d.date || '') + ' ' + (d.time || '12:00 PM')).getTime() || Date.now()
        });
      });

      casesData.forEach(d => {
        allEvents.push({
          id: d.id,
          date: d.date || new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          type: 'case',
          title: d.diagnosis || 'Clinical Case Opened',
          provider: d.assignedDoctorName || 'Assigned Doctor',
          department: 'Care Team',
          description: d.symptoms || 'Awaiting initial assessment',
          icon: FileHeart,
          iconBg: 'bg-[#FEF2F2]',
          iconColor: 'text-[#B42318]',
          borderColor: 'border-[#FCA5A5]',
          hasDetails: true,
          timestamp: new Date(d.date || new Date().toISOString()).getTime() || Date.now()
        });
      });

      recordsData.forEach(d => {
        const timestamp = d.timestamp ? (d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp)) : new Date();
        allEvents.push({
          id: d.id,
          date: timestamp.toISOString().split('T')[0],
          time: timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          type: 'consultation',
          title: 'Clinical Encounter',
          provider: d.doctorName || 'Clinical Team',
          department: 'Vitals & Assessment',
          description: d.data?.assessment?.diagnosis || 'Routine review.',
          icon: Stethoscope,
          iconBg: 'bg-[#EBF1F6]',
          iconColor: 'text-[#1F5F8B]',
          borderColor: 'border-[#90CDF4]',
          hasDetails: true,
          timestamp: timestamp.getTime()
        });
      });

      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      setEvents(allEvents);
      setLoading(false);
    };

    const unsubAppts = onSnapshot(qAppts, (snap) => {
      apptsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateEvents();
    });
    const unsubCases = onSnapshot(qCases, (snap) => {
      casesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateEvents();
    });
    const unsubRecords = onSnapshot(qRecords, (snap) => {
      recordsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateEvents();
    });

    return () => {
      unsubAppts();
      unsubCases();
      unsubRecords();
    };
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-[14px] text-[#52606D] font-medium">Loading timeline...</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Medical Timeline</h2>
          <p className="text-[14px] text-[#52606D]">A chronological history of your care journey.</p>
        </div>
      </div>

      <div className="relative">
        
        {/* Vertical Line */}
        <div className="absolute left-6 top-6 bottom-0 w-px bg-[#CBD5E1] hidden sm:block"></div>

        <div className="space-y-8">
          {events.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-12 text-center ml-0 sm:ml-16">
              <Activity className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[14px] font-medium text-[#172B3A]">No medical history found.</p>
              <p className="text-[13px] text-[#52606D] mt-1">Your interactions and records will appear here.</p>
            </div>
          ) : events.map((event, idx) => {
            const Icon = event.icon;
            return (
              <div key={idx} className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 group">
                
                {/* Node */}
                <div className="hidden sm:flex flex-col items-center z-10 shrink-0 w-12 pt-1">
                  <div className={\`w-12 h-12 rounded-full border-[3px] \${event.borderColor} \${event.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200\`}>
                    <Icon className={\`w-5 h-5 \${event.iconColor}\`} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 sm:p-5 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="sm:hidden flex items-center justify-center w-6 h-6 rounded-full border \${event.borderColor} \${event.iconBg}">
                          <Icon className={\`w-3 h-3 \${event.iconColor}\`} strokeWidth={2} />
                        </span>
                        <h3 className="text-[15px] font-bold text-[#172B3A]">{event.title}</h3>
                      </div>
                      <p className="text-[13px] font-medium text-[#1F5F8B]">{event.provider}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-[13px] font-bold text-[#172B3A]">{event.date}</p>
                      <p className="text-[12px] text-[#52606D]">{event.time}</p>
                    </div>
                  </div>
                  
                  <p className="text-[13px] text-[#172B3A] leading-relaxed mb-4">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-[#CBD5E1] pt-3 mt-auto">
                    <span className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider bg-[#F4F6F8] px-2 py-1 rounded-[4px]">
                      {event.department}
                    </span>
                    {event.hasDetails && (
                      <button className="text-[12px] font-bold text-[#1F5F8B] hover:underline uppercase tracking-wider">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/tabs/TimelineTab.tsx', code);
console.log("Rewrote TimelineTab to use real data via onSnapshot");
