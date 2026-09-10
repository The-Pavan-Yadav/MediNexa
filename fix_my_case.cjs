const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  FileText, 
  Stethoscope, 
  Activity, 
  Pill, 
  ClipboardList, 
  Clock, 
  AlertCircle,
  FileSearch,
  CheckCircle2,
  ChevronRight,
  UserCircle
} from 'lucide-react';

export default function MyCaseTab({ patientData }: { patientData?: any }) {
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);

    const q = query(collection(db, 'cases'), where('patientId', '==', auth.currentUser.uid));
    
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date (desc)
      data.sort((a:any, b:any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      
      const activeCases = data.filter(c => c.status !== 'Closed');
      if (activeCases.length > 0) {
        setCaseData(activeCases[0]);
      } else if (data.length > 0) {
        setCaseData(data[0]);
      } else {
        setCaseData(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="p-8 text-center text-[#52606D]">Loading case...</div>;
  if (!caseData) return <div className="p-8 text-center text-[#52606D]">No active clinical cases found.</div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[22px] font-semibold text-[#102A43]">Primary Case File</h2>
            <span className={\`text-[11px] px-2.5 py-1 rounded-[4px] font-bold uppercase tracking-wider border \${
              caseData.status === 'Closed' ? 'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]' :
              caseData.status === 'Waiting' ? 'bg-[#FEF6E7] text-[#975A16] border-[#F6E0B5]' :
              'bg-[#EBF1F6] text-[#1F5F8B] border-[#90CDF4]'
            }\`}>
              {caseData.status || 'Active'}
            </span>
            {caseData.priority === 'High' && (
              <span className="bg-[#FEF2F2] text-[#B42318] border border-[#FCA5A5] text-[11px] px-2.5 py-1 rounded-[4px] font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> High Priority
              </span>
            )}
          </div>
          <p className="text-[14px] text-[#52606D]">Opened on {caseData.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Clinical Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 sm:p-5 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-[#102A43]" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#172B3A]">Clinical Overview</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              
              <div>
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Reported Symptoms</h4>
                <p className="text-[14px] text-[#172B3A] leading-relaxed bg-[#F4F6F8] p-3 rounded-[4px]">
                  {caseData.symptoms || 'No symptoms documented.'}
                </p>
              </div>

              <div className="border-t border-[#CBD5E1] pt-6">
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Physician Assessment</h4>
                <div className="bg-[#EBF1F6] border border-[#90CDF4] rounded-[4px] p-4 text-[#102A43]">
                  <p className="text-[14px] font-bold mb-1">Working Diagnosis:</p>
                  <p className="text-[15px] leading-relaxed mb-3">
                    {caseData.diagnosis || 'Diagnosis pending clinical review.'}
                  </p>
                  
                  <p className="text-[12px] font-bold mt-4 mb-1 uppercase tracking-wider opacity-80">Clinical Notes</p>
                  <p className="text-[13px] leading-relaxed opacity-90">
                    {caseData.notes || 'No additional clinical notes provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 sm:p-5 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#102A43]" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#172B3A]">Care & Treatment Plan</h3>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              
              <div>
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Action Items</h4>
                {caseData.treatment ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#276749] mt-0.5 shrink-0" />
                    <p className="text-[14px] text-[#172B3A] leading-relaxed">{caseData.treatment}</p>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#52606D]">Treatment plan not yet established.</p>
                )}
              </div>

              {caseData.medicines && (
                <div className="border-t border-[#CBD5E1] pt-6">
                  <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Prescribed Medications</h4>
                  <div className="flex items-start gap-3 bg-[#FEF2F2] border border-[#FCA5A5] p-3 rounded-[4px]">
                    <Pill className="w-5 h-5 text-[#B42318] mt-0.5 shrink-0" />
                    <p className="text-[14px] text-[#172B3A] leading-relaxed">{caseData.medicines}</p>
                  </div>
                </div>
              )}

              {caseData.testRequests && (
                <div className="border-t border-[#CBD5E1] pt-6">
                  <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Requested Diagnostics</h4>
                  <p className="text-[14px] text-[#172B3A] leading-relaxed bg-[#F4F6F8] p-3 rounded-[4px]">
                    {caseData.testRequests}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
            <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-4">Assigned Care Team</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F4F6F8] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-[#1F5F8B]" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#172B3A]">{caseData.assignedDoctorName || 'Not Assigned'}</p>
                <p className="text-[12px] text-[#52606D]">Primary Physician</p>
              </div>
            </div>
          </div>
          
          {caseData.followUpDate && (
             <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
              <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-4">Follow-up</h4>
              <div className="flex items-center gap-3 bg-[#FEF6E7] border border-[#F6E0B5] p-3 rounded-[4px]">
                <Clock className="w-5 h-5 text-[#975A16]" />
                <p className="text-[13px] font-bold text-[#975A16]">{caseData.followUpDate}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/tabs/MyCaseTab.tsx', code);
console.log("Rewrote MyCaseTab via onSnapshot");
