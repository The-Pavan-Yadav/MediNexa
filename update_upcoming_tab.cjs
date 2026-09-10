const fs = require('fs');

let content = fs.readFileSync('src/tabs/UpcomingTab.tsx', 'utf8');

// Add imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db } from '../../firebase';\nimport { collection, query, where, getDocs } from 'firebase/firestore';"
);

// Add state and fetch logic
const componentStart = 'export default function UpcomingTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  componentStart,
  `${componentStart}
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
  };`
);

// Render loading state if needed. Or just replace hardcoded Next Appointment
// Next appointment
content = content.replace(
  /{showAppts && \(\s*<div className="bg-\[#FFFFFF\] border-l-4 border-\[#1F5F8B\] border-y border-r border-y-\[#CBD5E1\] border-r-\[#CBD5E1\] rounded-\[4px\] p-5">[\s\S]*?<\/div>\s*\)}/,
  `{showAppts && appointments.length > 0 && (
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
      )}`
);

// Upcoming appointments list
content = content.replace(
  /<tbody>[\s\S]*?<\/tbody>/,
  `<tbody>
                {appointments.slice(1).map((app, i) => (
                  <tr key={i} className="hover:bg-[#F9FAFB] transition-colors border-b border-[#CBD5E1] last:border-0">
                    <td className="p-4 align-top">
                      <p className="text-[13px] font-semibold text-[#172B3A]">{new Date(app.date).toLocaleDateString()}</p>
                      <p className="text-[12px] text-[#52606D] mt-0.5">{app.time}</p>
                    </td>
                    <td className="p-4 align-top text-[13px] font-medium text-[#172B3A]">{app.doctorName || app.provider}</td>
                    <td className="p-4 align-top text-[13px] text-[#52606D]">{app.department || app.specialty}</td>
                    <td className="p-4 align-top text-[13px] text-[#52606D]">{app.location || 'Main Clinic'}</td>
                    <td className="p-4 align-top">
                      <span className="bg-[#E8F2EC] text-[#276749] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] border border-[#BCE3C6]">
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {appointments.length <= 1 && (
                  <tr><td colSpan={5} className="p-4 text-center text-[#52606D] text-[13px]">No additional upcoming appointments.</td></tr>
                )}
              </tbody>`
);

// Active medications
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*\)}/m,
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((med, i) => (
              <div key={i} className="p-4 border border-[#CBD5E1] rounded-[4px] bg-[#FFFFFF] hover:border-[#1F5F8B] transition-colors flex items-start gap-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#F4F6F8] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-[#102A43]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#172B3A]">{med.name} {med.dosage}</h4>
                  <p className="text-[12px] text-[#52606D] mt-1">{med.frequency}</p>
                  <p className="text-[11px] text-[#52606D] mt-2">Prescribed by {med.doctorName}</p>
                </div>
              </div>
            ))}
            {medicines.length === 0 && <p className="text-[#52606D] text-[13px]">No active medications.</p>}
          </div>
        </div>
      )}`
);

fs.writeFileSync('src/tabs/UpcomingTab.tsx', content);
