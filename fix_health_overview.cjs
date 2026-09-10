const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { 
  Activity, 
  HeartPulse, 
  Scale, 
  Droplets, 
  AlertCircle, 
  CheckCircle2, 
  Stethoscope, 
  ClipboardList,
  ShieldAlert,
  ArrowRight,
  Thermometer
} from 'lucide-react';

export default function HealthOverviewTab({ patientData }: { patientData?: any }) {
  const [latestRecord, setLatestRecord] = useState<any>(null);
  const [latestCase, setLatestCase] = useState<any>(null);
  
  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Listen to latest clinical record
    const qRecord = query(
      collection(db, 'clinical_records'),
      where('patientId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const unsubRecord = onSnapshot(qRecord, (snap) => {
      if (!snap.empty) {
        setLatestRecord({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setLatestRecord(null);
      }
    });

    // Listen to latest case
    const qCase = query(
      collection(db, 'cases'),
      where('patientId', '==', auth.currentUser.uid),
      orderBy('lastUpdated', 'desc'),
      limit(1)
    );

    const unsubCase = onSnapshot(qCase, (snap) => {
      if (!snap.empty) {
        setLatestCase({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setLatestCase(null);
      }
    });

    return () => {
      unsubRecord();
      unsubCase();
    };
  }, []);

  const d = latestRecord?.data;
  const v = d?.vitals || {};
  const a = d?.assessment || {};
  
  const formatDate = (ts: any) => {
    if (!ts) return 'Unknown date';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Health Overview</h2>
        <p className="text-[14px] text-[#52606D]">A comprehensive summary of your current health status, vitals, and active care plans.</p>
      </div>

      {/* Top Section: Status & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Overall Health Status */}
        <div className="bg-[#FFFFFF] border-l-4 border-[#1F5F8B] border-y border-r border-[#CBD5E1] rounded-[4px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-[#102A43] flex items-center gap-2">
              <Activity className="w-4 h-4" strokeWidth={2} />
              Clinical Assessment
            </h3>
            <span className="bg-[#E8F2EC] text-[#276749] text-[11px] px-2.5 py-1 rounded-[4px] font-bold border border-[#BCE3C6] uppercase tracking-wider">
              {latestCase?.status || 'Active'}
            </span>
          </div>
          
          <div className="text-[13px] text-[#172B3A] leading-relaxed mb-4">
            {a.diagnosis ? (
              <p><strong>Diagnosis:</strong> {a.diagnosis}</p>
            ) : latestCase?.diagnosis ? (
              <p><strong>Diagnosis:</strong> {latestCase.diagnosis}</p>
            ) : (
              <p>No recent diagnosis recorded.</p>
            )}
            
            {a.notes ? (
              <p className="mt-2 text-[#52606D]">{a.notes}</p>
            ) : latestCase?.notes ? (
              <p className="mt-2 text-[#52606D]">{latestCase.notes}</p>
            ) : null}
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#CBD5E1] flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#52606D]">
              Last updated: {latestRecord ? formatDate(latestRecord.timestamp) : (latestCase ? formatDate(latestCase.lastUpdated) : 'N/A')}
            </span>
            <span className="text-[12px] font-semibold text-[#102A43] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> 
              {latestRecord?.doctorName || latestCase?.assignedDoctorName || 'Clinical Team'}
            </span>
          </div>
        </div>

        {/* Progress & Care Plan Focus */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
          <h3 className="text-[14px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#102A43]" strokeWidth={2} />
            Primary Care Plan
          </h3>
          
          <div className="space-y-4">
            <div className="bg-[#F9FAFB] border border-[#CBD5E1] rounded-[4px] p-3">
              <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Prescribed Treatment</p>
              <ul className="space-y-2">
                {d?.plan?.treatment ? (
                  <li className="flex items-start gap-2 text-[12px] text-[#172B3A]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#276749] mt-0.5 shrink-0" />
                    {d.plan.treatment}
                  </li>
                ) : latestCase?.treatment ? (
                  <li className="flex items-start gap-2 text-[12px] text-[#172B3A]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#276749] mt-0.5 shrink-0" />
                    {latestCase.treatment}
                  </li>
                ) : (
                  <li className="text-[12px] text-[#52606D]">No specific treatment plan logged.</li>
                )}
                
                {d?.plan?.followUp ? (
                  <li className="flex items-start gap-2 text-[12px] text-[#172B3A] mt-2 border-t border-[#CBD5E1] pt-2">
                    <Activity className="w-3.5 h-3.5 text-[#1F5F8B] mt-0.5 shrink-0" />
                    Follow up: {d.plan.followUp}
                  </li>
                ) : null}
              </ul>
            </div>
            
            {(d?.medications || latestCase?.medicines) && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-[4px] p-3">
                <p className="text-[11px] font-bold text-[#B42318] uppercase tracking-wider mb-2">Active Medications</p>
                <p className="text-[12px] text-[#172B3A]">
                  {d?.medications || latestCase?.medicines}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vitals & Key Metrics Board */}
      <h3 className="text-[14px] font-semibold text-[#102A43] pt-2">Latest Clinical Vitals</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Blood Pressure</span>
            <HeartPulse className="w-4 h-4 text-[#B42318]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[28px] font-bold text-[#172B3A] leading-none">{v.bp || '--/--'}</span>
            <span className="text-[12px] text-[#52606D] font-medium mb-1">mmHg</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Heart Rate</span>
            <Activity className="w-4 h-4 text-[#975A16]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[28px] font-bold text-[#172B3A] leading-none">{v.hr || '--'}</span>
            <span className="text-[12px] text-[#52606D] font-medium mb-1">bpm</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Body Temp</span>
            <Thermometer className="w-4 h-4 text-[#1F5F8B]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[28px] font-bold text-[#172B3A] leading-none">{v.temp || '--'}</span>
            <span className="text-[12px] text-[#52606D] font-medium mb-1">°F</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Weight</span>
            <Scale className="w-4 h-4 text-[#52606D]" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[28px] font-bold text-[#172B3A] leading-none">{v.weight || '--'}</span>
            <span className="text-[12px] text-[#52606D] font-medium mb-1">lbs</span>
          </div>
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/tabs/HealthOverviewTab.tsx', code);
console.log("Rewrote HealthOverviewTab to use real data via onSnapshot");
