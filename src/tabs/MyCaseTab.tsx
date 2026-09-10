import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
    if (patientData?.mhdId) fetchCase();
  }, [patientData]);

  const fetchCase = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeCases = data.filter(c => c.status !== 'Closed');
      if (activeCases.length > 0) {
        setCaseData(activeCases[0]);
      } else if (data.length > 0) {
        setCaseData(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#52606D]">Loading case...</div>;
  if (!caseData) return <div className="p-8 text-center text-[#52606D]">No active clinical cases found.</div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Clinical Case: {caseData.diagnosis}</h2>
          <p className="text-[14px] text-[#52606D]">Case ID: {caseData.id} • Initiated {caseData.date ? new Date(caseData.date).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-[#EBF1F6] text-[#1F5F8B] text-[12px] px-3 py-1 rounded-[4px] font-semibold border border-[#1F5F8B]">
            Active Monitoring
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Left Column, spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Provider Overview */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <UserCircle className="w-10 h-10 text-[#52606D]" strokeWidth={1.5} />
              <div>
                <p className="text-[11px] text-[#52606D] font-bold uppercase tracking-wider mb-0.5">Primary Provider</p>
                <p className="text-[15px] font-semibold text-[#172B3A]">{caseData.doctorName || 'Assigned Doctor'}</p>
                <p className="text-[13px] text-[#52606D]">Department of Cardiology</p>
              </div>
            </div>
            <button className="text-[12px] font-medium text-[#1F5F8B] border border-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#EBF1F6] transition-colors">
              Message Doctor
            </button>
          </div>

          {/* Assessment & Diagnosis */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-0 overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />
              <h3 className="text-[15px] font-semibold text-[#172B3A]">Diagnosis & Clinical Assessment</h3>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1">Primary Diagnosis</p>
                <p className="text-[14px] font-medium text-[#172B3A]">{caseData.diagnosis}</p>
                <p className="text-[12px] text-[#52606D] mt-0.5">ICD-10 Code: I10</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1">Provider Assessment</p>
                <p className="text-[13px] text-[#172B3A] leading-relaxed">
                  {caseData.symptoms || 'No specific symptoms recorded.'}
                </p>
              </div>
            </div>
          </div>

          {/* Symptoms & Patient History */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
            <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />
              Symptoms & Medical History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Reported Symptoms</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[13px] text-[#172B3A]">
                    <div className="w-1 h-1 rounded-full bg-[#52606D] mt-1.5 shrink-0"></div>
                    Occasional morning headaches
                  </li>
                  <li className="flex items-start gap-2 text-[13px] text-[#172B3A]">
                    <div className="w-1 h-1 rounded-full bg-[#52606D] mt-1.5 shrink-0"></div>
                    Mild fatigue during strenuous exercise
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Relevant History</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[13px] text-[#172B3A]">
                    <div className="w-1 h-1 rounded-full bg-[#52606D] mt-1.5 shrink-0"></div>
                    Family history of cardiovascular disease (Father)
                  </li>
                  <li className="flex items-start gap-2 text-[13px] text-[#172B3A]">
                    <div className="w-1 h-1 rounded-full bg-[#52606D] mt-1.5 shrink-0"></div>
                    Non-smoker
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Treatment & Medicines */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#172B3A] flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />
                Prescribed Treatment Plan
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F9FAFB]">
                <div>
                  <p className="text-[14px] font-medium text-[#172B3A]">Lisinopril (Zestril) 10mg</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Take 1 tablet daily by mouth in the morning.</p>
                </div>
                <span className="text-[11px] font-semibold text-[#1F5F8B] bg-[#EBF1F6] px-2 py-1 rounded-[4px] border border-[#1F5F8B] whitespace-nowrap">
                  Active Prescription
                </span>
              </div>
              
              <div className="border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-[#172B3A]">Atorvastatin (Lipitor) 20mg</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Take 1 tablet daily by mouth in the evening.</p>
                </div>
                <span className="text-[11px] font-semibold text-[#1F5F8B] bg-[#EBF1F6] px-2 py-1 rounded-[4px] border border-[#1F5F8B] whitespace-nowrap">
                  Active Prescription
                </span>
              </div>
            </div>
          </div>

          {/* Lab & Test Results */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
            <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />
              Associated Lab & Test Results
            </h3>
            <div className="border border-[#CBD5E1] rounded-[4px] divide-y divide-[#CBD5E1]">
              <div className="flex items-center justify-between p-3 hover:bg-[#F4F6F8] transition-colors cursor-pointer group">
                <div>
                  <p className="text-[13px] font-medium text-[#172B3A]">Complete Blood Count & Lipid Panel</p>
                  <p className="text-[11px] text-[#52606D] mt-0.5">Oct 15, 2026 • Ordered by Dr. Chen</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#52606D] group-hover:text-[#1F5F8B]" />
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-[#F4F6F8] transition-colors cursor-pointer group">
                <div>
                  <p className="text-[13px] font-medium text-[#172B3A]">Electrocardiogram (ECG)</p>
                  <p className="text-[11px] text-[#52606D] mt-0.5">Sep 02, 2026 • Normal Sinus Rhythm</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#52606D] group-hover:text-[#1F5F8B]" />
              </div>
            </div>
          </div>

          {/* Doctor's Notes */}
          <div className="bg-[#FEFCE8] border border-[#F6E0B5] rounded-[4px] p-5">
            <h3 className="text-[14px] font-semibold text-[#975A16] mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              Recent Clinical Note
            </h3>
            <p className="text-[13px] text-[#744210] leading-relaxed italic">
              "Patient is responding well to the initial Lisinopril dosage. Blood pressure trending downward towards target goal. Emphasized the importance of strict adherence to a low-sodium (DASH) diet and instructed to complete a minimum of 150 minutes of moderate cardiovascular exercise weekly. Will re-evaluate in 30 days."
            </p>
            <p className="text-[11px] font-semibold text-[#975A16] mt-3">— Dr. Emily Chen, Oct 15, 2026</p>
          </div>

        </div>

        {/* Sidebar Content (Right Column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Follow-up Instructions */}
          <div className="bg-[#FFFFFF] border-l-4 border-[#1F5F8B] border-y border-r border-[#CBD5E1] rounded-[4px] p-5">
            <h3 className="text-[14px] font-semibold text-[#102A43] flex items-center gap-2 mb-4">
              <ClipboardList className="w-4 h-4 text-[#1F5F8B]" strokeWidth={2} />
              Follow-up Instructions
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#276749] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-[#172B3A]">Log Home BP Readings</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Record blood pressure twice weekly (morning and evening).</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#B42318] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-[#172B3A]">Dietary Restrictions</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Limit sodium intake to under 1,500 mg per day.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#1F5F8B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-[#172B3A]">30-Day Medication Review</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Scheduled for Nov 12, 2026 at 10:00 AM.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Case Timeline mini */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
            <h3 className="text-[14px] font-semibold text-[#172B3A] mb-5">Case Timeline</h3>
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#CBD5E1]"></div>
              <div className="space-y-5 relative">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#FFFFFF] border-2 border-[#1F5F8B] z-10 mt-0.5 shrink-0"></div>
                  <div>
                    <p className="text-[13px] font-medium text-[#172B3A]">Upcoming Review</p>
                    <p className="text-[11px] text-[#52606D]">Nov 12, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#EBF1F6] border-2 border-[#CBD5E1] z-10 mt-0.5 shrink-0"></div>
                  <div>
                    <p className="text-[13px] font-medium text-[#172B3A]">Medication Adjustment & Labs</p>
                    <p className="text-[11px] text-[#52606D]">Oct 15, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#EBF1F6] border-2 border-[#CBD5E1] z-10 mt-0.5 shrink-0"></div>
                  <div>
                    <p className="text-[13px] font-medium text-[#172B3A]">Initial Diagnosis</p>
                    <p className="text-[11px] text-[#52606D]">Sep 02, 2026</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 text-[12px] font-medium text-[#172B3A] border border-[#CBD5E1] py-2 rounded-[4px] hover:bg-[#F4F6F8] transition-colors">
              View Full History
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
