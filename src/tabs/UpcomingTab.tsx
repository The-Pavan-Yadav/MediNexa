import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  CalendarClock, 
  MapPin, 
  Clock, 
  Stethoscope, 
  Pill, 
  ClipboardList, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2 
} from 'lucide-react';

export default function UpcomingTab({ patientData }: { patientData?: any }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) {
      fetchData();
    }
  }, [patientData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apptQ = query(collection(db, 'appointments'), where('patientId', '==', patientData.mhdId));
      const apptSnap = await getDocs(apptQ);
      const apptData = apptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const upcomingAppts = apptData.filter(a => a.status === 'Scheduled' || a.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAppointments(upcomingAppts);

      const medQ = query(collection(db, 'medicines'), where('patientId', '==', patientData.mhdId));
      const medSnap = await getDocs(medQ);
      const medData = medSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeMeds = medData.filter(m => m.status === 'Active');
      setMedicines(activeMeds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const [filter, setFilter] = useState('All');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const filters = ['All', 'Appointments', 'Follow-ups', 'Medicines'];

  const showAppts = filter === 'All' || filter === 'Appointments';
  const showFollowUps = filter === 'All' || filter === 'Follow-ups';
  const showMeds = filter === 'All' || filter === 'Medicines';

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Upcoming</h2>
        <p className="text-[14px] text-[#52606D]">Manage your scheduled appointments, follow-ups, and medications.</p>
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

      {/* Next Appointment */}
      {showAppts && appointments.length > 0 && (
        <div className="bg-[#FFFFFF] border-l-4 border-[#1F5F8B] border-y border-r border-y-[#CBD5E1] border-r-[#CBD5E1] rounded-[4px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-[#102A43] uppercase tracking-wide">Next Appointment</h3>
            <span className="bg-[#E8F2EC] text-[#276749] text-[11px] px-2 py-0.5 rounded-[4px] font-semibold border border-[#BCE3C6]">
              {appointments[0].status}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-3 text-center min-w-[70px]">
                <p className="text-[11px] text-[#52606D] uppercase font-bold">{new Date(appointments[0].date).toLocaleString('default', { month: 'short' })}</p>
                <p className="text-[20px] font-bold text-[#102A43]">{new Date(appointments[0].date).getDate()}</p>
              </div>
              <div>
                <h4 className="text-[16px] font-semibold text-[#172B3A]">{appointments[0].type || 'Consultation'}</h4>
                <p className="text-[13px] text-[#172B3A] font-medium mt-1">{appointments[0].doctorName || appointments[0].provider}</p>
                <div className="flex flex-wrap gap-4 mt-2">
                  <span className="text-[12px] text-[#52606D] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5"/> {appointments[0].time}
                  </span>
                  <span className="text-[12px] text-[#52606D] flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5"/> {appointments[0].department || appointments[0].specialty}
                  </span>
                </div>
              </div>
            </div>
            <button className="text-[13px] font-medium text-[#1F5F8B] border border-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#EBF1F6] transition-colors whitespace-nowrap">
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Appointments List */}
      {showAppts && (
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
          <div className="p-4 border-b border-[#CBD5E1] bg-[#F9FAFB]">
            <h3 className="text-[14px] font-semibold text-[#172B3A]">Upcoming Appointments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#FFFFFF] border-b border-[#CBD5E1] text-[11px] font-semibold text-[#52606D] uppercase tracking-wider">
                  <th className="p-4 py-3">Date & Time</th>
                  <th className="p-4 py-3">Provider</th>
                  <th className="p-4 py-3">Department</th>
                  <th className="p-4 py-3">Location</th>
                  <th className="p-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#172B3A] divide-y divide-[#CBD5E1]">
                <tr className="hover:bg-[#F4F6F8] transition-colors">
                  <td className="p-4">
                    <div className="font-medium">Nov 28, 2026</div>
                    <div className="text-[#52606D] text-[12px]">2:15 PM</div>
                  </td>
                  <td className="p-4">Dr. S. Jenkins</td>
                  <td className="p-4 text-[#52606D]">Primary Care</td>
                  <td className="p-4 text-[#52606D]">Clinic A, Level 1</td>
                  <td className="p-4">
                    <span className="text-[#975A16] bg-[#FEF6E7] px-2 py-0.5 rounded-[4px] text-[11px] border border-[#F6E0B5] font-medium">
                      Action Needed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#F4F6F8] transition-colors">
                  <td className="p-4">
                    <div className="font-medium">Dec 05, 2026</div>
                    <div className="text-[#52606D] text-[12px]">9:00 AM</div>
                  </td>
                  <td className="p-4">Lab Services</td>
                  <td className="p-4 text-[#52606D]">Pathology</td>
                  <td className="p-4 text-[#52606D]">Lab B, Level 2</td>
                  <td className="p-4">
                    <span className="text-[#276749] bg-[#E8F2EC] px-2 py-0.5 rounded-[4px] text-[11px] border border-[#BCE3C6] font-medium">
                      Confirmed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Follow-ups and Medications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Follow-ups */}
        {showFollowUps && (
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
            <h3 className="text-[14px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#52606D]" /> Follow-up Reminders
            </h3>
            <div className="space-y-3">
              <div className="p-3 border border-[#CBD5E1] rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-[#172B3A]">Complete Pre-visit Questionnaire</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Due Nov 10 • Cardiology Follow-up</p>
                </div>
                <span className="text-[#B42318] bg-[#FEF2F2] px-2 py-0.5 rounded-[4px] text-[11px] font-semibold border border-[#FCA5A5] whitespace-nowrap text-center">
                  Pending
                </span>
              </div>
              <div className="p-3 border border-[#CBD5E1] rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F9FAFB]">
                <div>
                  <p className="text-[13px] font-medium text-[#172B3A]">Fasting Blood Sugar Log</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Due Nov 26 • Primary Care</p>
                </div>
                <span className="text-[#52606D] bg-[#F4F6F8] px-2 py-0.5 rounded-[4px] text-[11px] font-semibold border border-[#CBD5E1] whitespace-nowrap text-center">
                  Not Yet Due
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Medications */}
        {showMeds && (
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
            <h3 className="text-[14px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#52606D]" /> Upcoming Medication Doses
            </h3>
            <div className="space-y-3">
              <div className="p-3 border border-[#CBD5E1] rounded-[4px] flex items-start gap-3">
                <div className="mt-0.5">
                  <Clock className="w-4 h-4 text-[#1F5F8B]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] font-semibold text-[#172B3A]">1:00 PM</p>
                    <p className="text-[11px] font-medium text-[#1F5F8B]">In 2 hours</p>
                  </div>
                  <p className="text-[13px] font-medium text-[#172B3A]">Lisinopril 10mg</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Take with food</p>
                </div>
              </div>
              <div className="p-3 border border-[#CBD5E1] rounded-[4px] flex items-start gap-3 bg-[#F9FAFB]">
                <div className="mt-0.5">
                  <Clock className="w-4 h-4 text-[#52606D]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] font-semibold text-[#52606D]">8:00 PM</p>
                    <p className="text-[11px] font-medium text-[#52606D]">Tonight</p>
                  </div>
                  <p className="text-[13px] font-medium text-[#172B3A]">Atorvastatin 20mg</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Take after dinner</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* History */}
      {showAppts && (
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full flex items-center justify-between p-4 bg-[#F9FAFB] hover:bg-[#F4F6F8] transition-colors"
          >
            <h3 className="text-[14px] font-semibold text-[#172B3A]">Recent & Completed Appointments</h3>
            {isHistoryOpen ? <ChevronUp className="w-5 h-5 text-[#52606D]" /> : <ChevronDown className="w-5 h-5 text-[#52606D]" />}
          </button>
          
          {isHistoryOpen && (
            <div className="border-t border-[#CBD5E1] p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px] bg-[#FFFFFF]">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="w-6 h-6 rounded-full bg-[#E8F2EC] flex items-center justify-center shrink-0 border border-[#BCE3C6]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#276749]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#172B3A]">Annual Physical Exam</p>
                    <p className="text-[12px] text-[#52606D] mt-0.5">Oct 15, 2026 • Dr. S. Jenkins</p>
                  </div>
                </div>
                <button className="text-[12px] font-medium text-[#1F5F8B] hover:underline border border-transparent">
                  View Visit Summary
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between p-3 border border-[#CBD5E1] rounded-[4px] bg-[#FFFFFF]">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="w-6 h-6 rounded-full bg-[#E8F2EC] flex items-center justify-center shrink-0 border border-[#BCE3C6]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#276749]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#172B3A]">Blood Draw (CBC & Lipid)</p>
                    <p className="text-[12px] text-[#52606D] mt-0.5">Oct 15, 2026 • Lab Services</p>
                  </div>
                </div>
                <button className="text-[12px] font-medium text-[#1F5F8B] hover:underline border border-transparent">
                  View Results
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
