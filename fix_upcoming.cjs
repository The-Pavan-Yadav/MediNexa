const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  CalendarClock, 
  MapPin, 
  UserCircle, 
  Stethoscope, 
  Video, 
  Clock, 
  Pill, 
  AlertCircle 
} from 'lucide-react';

export default function UpcomingTab({ patientData }: { patientData?: any }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);

    const apptQ = query(collection(db, 'appointments'), where('patientId', '==', auth.currentUser.uid));
    const medQ = query(collection(db, 'medicines'), where('patientId', '==', auth.currentUser.uid));
    const casesQ = query(collection(db, 'cases'), where('patientId', '==', auth.currentUser.uid));
    const recordsQ = query(collection(db, 'clinical_records'), where('patientId', '==', auth.currentUser.uid));

    let apptsData: any[] = [];
    let medsData: any[] = [];
    let casesData: any[] = [];
    let recordsData: any[] = [];

    const processData = () => {
      const upcomingAppts = apptsData.filter(a => a.status === 'Scheduled' || a.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAppointments(upcomingAppts);

      const allMeds: any[] = [];
      medsData.forEach(d => {
        allMeds.push(d);
      });
      casesData.forEach(c => {
        if (c.medicines && c.medicines.trim() !== '' && c.status !== 'Closed') {
          allMeds.push({
             name: c.medicines,
             dosage: 'Prescribed',
             frequency: 'Follow instructions',
             icon: Pill
          });
        }
      });
      recordsData.forEach(r => {
        if (r.data?.medications && r.data.medications.trim() !== '') {
          allMeds.push({
             name: r.data.medications,
             dosage: 'Prescribed',
             frequency: r.data?.plan?.treatment || 'Take as directed',
             icon: Pill
          });
        }
      });
      setMedicines(allMeds);
      setLoading(false);
    };

    const unsubAppt = onSnapshot(apptQ, snap => {
      apptsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processData();
    });
    const unsubMed = onSnapshot(medQ, snap => {
      medsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processData();
    });
    const unsubCases = onSnapshot(casesQ, snap => {
      casesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processData();
    });
    const unsubRecords = onSnapshot(recordsQ, snap => {
      recordsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processData();
    });

    return () => {
      unsubAppt();
      unsubMed();
      unsubCases();
      unsubRecords();
    };
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-[14px] text-[#52606D]">Loading schedule...</div>;
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#102A43] to-[#1F5F8B] rounded-[4px] p-6 text-[#FFFFFF] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-[24px] font-semibold mb-2 leading-tight">
            Hello, {patientData?.name?.split(' ')[0] || 'Patient'}
          </h2>
          <p className="text-[14px] text-[#BCE3C6] font-medium">You have {appointments.length} upcoming appointments.</p>
        </div>
        <div className="flex gap-4 opacity-90 shrink-0">
          <div className="bg-[#FFFFFF]/10 backdrop-blur-sm border border-[#FFFFFF]/20 p-3 rounded-[4px] min-w-[120px]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#BCE3C6] mb-1">MHD ID</p>
            <p className="text-[16px] font-mono font-semibold">{patientData?.mhdId || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content: Next Appointment */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-[16px] font-semibold text-[#102A43]">Next Appointment</h3>
          
          {appointments.length > 0 ? (
            <div className="bg-[#FFFFFF] border-l-4 border-[#1F5F8B] border-y border-r border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#E8F2EC] text-[#276749] text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-[3px] border border-[#BCE3C6]">
                      Confirmed
                    </span>
                    <span className="text-[13px] font-bold text-[#1F5F8B]">{appointments[0].type || 'Consultation'}</span>
                  </div>
                  
                  <h4 className="text-[20px] font-bold text-[#172B3A] mb-4">
                    {appointments[0].date} at {appointments[0].time || '12:00 PM'}
                  </h4>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-[14px] text-[#172B3A]">
                      <Stethoscope className="w-4 h-4 text-[#52606D]" />
                      <span className="font-medium">{appointments[0].doctorName || 'Dr. Emily Chen'}</span>
                      <span className="text-[#52606D]">•</span>
                      <span className="text-[#52606D]">{appointments[0].department || 'Cardiology'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[14px] text-[#172B3A]">
                      <MapPin className="w-4 h-4 text-[#52606D]" />
                      <span>{appointments[0].location || 'Medical Center - Room 402'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-[#CBD5E1] pt-4 sm:pt-0 sm:pl-6 gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F4F6F8] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                    <CalendarClock className="w-6 h-6 text-[#1F5F8B]" />
                  </div>
                  <button className="w-full sm:w-auto bg-[#FFFFFF] border border-[#CBD5E1] text-[#102A43] px-4 py-2 text-[13px] font-bold rounded-[3px] hover:bg-[#F4F6F8] transition-colors whitespace-nowrap">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-8 text-center text-[#52606D]">
               No upcoming appointments.
            </div>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button className="bg-[#F9FAFB] border border-[#CBD5E1] p-5 rounded-[4px] text-left hover:border-[#1F5F8B] hover:bg-[#F4F6F8] transition-all group flex flex-col justify-between h-full">
               <div className="w-10 h-10 rounded-full bg-[#EBF1F6] border border-[#90CDF4] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                 <Video className="w-5 h-5 text-[#1F5F8B]" />
               </div>
               <div>
                 <h4 className="text-[14px] font-bold text-[#172B3A] mb-1">Telehealth Walk-in</h4>
                 <p className="text-[12px] text-[#52606D]">Connect with an available clinician online in minutes.</p>
               </div>
             </button>

             <button className="bg-[#F9FAFB] border border-[#CBD5E1] p-5 rounded-[4px] text-left hover:border-[#975A16] hover:bg-[#FEF6E7] transition-all group flex flex-col justify-between h-full">
               <div className="w-10 h-10 rounded-full bg-[#FEF6E7] border border-[#F6E0B5] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                 <CalendarClock className="w-5 h-5 text-[#975A16]" />
               </div>
               <div>
                 <h4 className="text-[14px] font-bold text-[#172B3A] mb-1">Book Appointment</h4>
                 <p className="text-[12px] text-[#52606D]">Schedule a visit with your primary care team.</p>
               </div>
             </button>
          </div>

        </div>

        {/* Sidebar: Daily Plan */}
        <div className="space-y-6">
          
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#172B3A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#102A43]" /> Today's Plan
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {medicines.length === 0 && appointments.length === 0 ? (
                <p className="text-[13px] text-[#52606D] text-center py-4">No tasks for today.</p>
              ) : (
                <>
                  {medicines.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-center shrink-0 mt-0.5">
                        <Pill className="w-4 h-4 text-[#B42318]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#172B3A] leading-tight">{m.name}</p>
                        <p className="text-[11px] text-[#52606D]">{m.dosage} • {m.frequency}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/tabs/UpcomingTab.tsx', code);
console.log("Rewrote UpcomingTab");
