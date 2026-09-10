const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Clock, Pill, CheckCircle2, XCircle, Info, Stethoscope, Calendar } from 'lucide-react';

export default function MedicinesTab({ patientData }: { patientData?: any }) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);

    const qRecords = query(collection(db, 'clinical_records'), where('patientId', '==', auth.currentUser.uid));
    const qCases = query(collection(db, 'cases'), where('patientId', '==', auth.currentUser.uid));
    
    let recordsData: any[] = [];
    let casesData: any[] = [];

    const processMedicines = () => {
      const allMeds: any[] = [];
      let nextId = 1;

      // Extract from cases
      casesData.forEach(c => {
        if (c.medicines && c.medicines.trim() !== '') {
          allMeds.push({
            id: 'c' + nextId++,
            name: c.medicines,
            dosage: 'As Prescribed',
            frequency: 'Follow Doctor instructions',
            duration: 'Active Case',
            prescribingDoctor: c.assignedDoctorName || 'Care Team',
            startDate: c.date,
            status: c.status === 'Closed' ? 'completed' : 'active',
            instructions: c.notes || 'No extra notes',
            iconColor: 'text-[#1F5F8B]',
            iconBg: 'bg-[#EBF1F6]'
          });
        }
      });

      // Extract from records
      recordsData.forEach(r => {
        if (r.data?.medications && r.data.medications.trim() !== '') {
          const timestamp = r.timestamp ? (r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp)) : new Date();
          allMeds.push({
            id: 'r' + nextId++,
            name: r.data.medications,
            dosage: 'Per Encounter',
            frequency: r.data?.plan?.treatment || 'Take as directed',
            duration: 'Current',
            prescribingDoctor: r.doctorName || 'Doctor',
            startDate: timestamp.toISOString().split('T')[0],
            status: 'active',
            instructions: 'As prescribed in clinical encounter',
            iconColor: 'text-[#276749]',
            iconBg: 'bg-[#E8F2EC]'
          });
        }
      });

      setPrescriptions(allMeds);
      setLoading(false);
    };

    const unsubRecords = onSnapshot(qRecords, (snap) => {
      recordsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processMedicines();
    });

    const unsubCases = onSnapshot(qCases, (snap) => {
      casesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processMedicines();
    });

    return () => {
      unsubRecords();
      unsubCases();
    };
  }, []);

  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Active', 'Completed'];

  const filteredMeds = filter === 'All' 
    ? prescriptions 
    : prescriptions.filter(m => m.status.toLowerCase() === filter.toLowerCase());

  if (loading) return <div className="p-8 text-center text-[#52606D]">Loading medications...</div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">My Medications</h2>
          <p className="text-[14px] text-[#52606D]">Manage your active prescriptions and daily schedule.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#F4F6F8] p-1 rounded-[4px] border border-[#CBD5E1] self-start md:self-auto">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`px-4 py-1.5 text-[13px] font-bold rounded-[3px] transition-all duration-200 uppercase tracking-wider \${
                filter === f 
                  ? 'bg-[#FFFFFF] text-[#102A43] shadow-sm border border-[#CBD5E1]' 
                  : 'text-[#52606D] hover:text-[#172B3A] border border-transparent'
              }\`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredMeds.length === 0 ? (
           <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-12 text-center">
             <Pill className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
             <p className="text-[14px] font-medium text-[#172B3A]">No medications found.</p>
             <p className="text-[13px] text-[#52606D] mt-1">Your prescribed medications will appear here.</p>
          </div>
        ) : filteredMeds.map((med) => (
          <div key={med.id} className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden hover:shadow-sm transition-shadow">
            
            {/* Med Header */}
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={\`w-12 h-12 rounded-[4px] flex items-center justify-center shrink-0 border \${med.iconBg} \${med.iconColor.replace('text-', 'border-').replace('1F5F8B', '90CDF4').replace('276749', 'BCE3C6')}\`}>
                  <Pill className={\`w-6 h-6 \${med.iconColor}\`} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#172B3A] leading-tight mb-1">{med.name}</h3>
                  <p className="text-[14px] font-medium text-[#1F5F8B]">{med.dosage}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className={\`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[4px] border \${
                  med.status === 'active' 
                    ? 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]'
                    : 'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]'
                }\`}>
                  {med.status}
                </span>
              </div>
            </div>

            {/* Med Details */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#52606D] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1">Frequency</p>
                    <p className="text-[13px] text-[#172B3A]">{med.frequency}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-[#52606D] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1">Instructions</p>
                    <p className="text-[13px] text-[#172B3A] bg-[#F4F6F8] p-2 rounded-[4px] border border-[#CBD5E1]">
                      {med.instructions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t md:border-t-0 md:border-l border-[#CBD5E1] pt-4 md:pt-0 md:pl-6">
                <div>
                  <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" /> Prescribed By
                  </p>
                  <p className="text-[13px] font-medium text-[#172B3A]">{med.prescribingDoctor}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Start Date
                  </p>
                  <p className="text-[13px] font-medium text-[#172B3A]">{med.startDate}</p>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/tabs/MedicinesTab.tsx', code);
console.log("Rewrote MedicinesTab to use real data via onSnapshot");
