import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  TestTube2, 
  Scan, 
  FileQuestion,
  ChevronRight,
  Clock
} from 'lucide-react';

interface Metric {
  name: string;
  value: string;
  range: string;
  isAbnormal: boolean;
}

interface TestResult {
  id: string;
  title: string;
  date: string;
  type: 'blood' | 'imaging' | 'other';
  status: 'completed' | 'pending';
  flag: 'normal' | 'abnormal' | 'none';
  provider: string;
  summary: string;
  metrics?: Metric[];
}

const RESULTS_DATA: TestResult[] = [
  {
    id: 'r1',
    title: 'Comprehensive Metabolic Panel (CMP)',
    date: 'Oct 15, 2026',
    type: 'blood',
    status: 'completed',
    flag: 'abnormal',
    provider: 'Dr. Emily Chen',
    summary: 'Most values within normal limits. Fasting glucose is slightly elevated. Advise continuing dietary modifications and monitoring.',
    metrics: [
      { name: 'Sodium', value: '140 mEq/L', range: '135 - 145', isAbnormal: false },
      { name: 'Potassium', value: '4.2 mEq/L', range: '3.5 - 5.1', isAbnormal: false },
      { name: 'Calcium', value: '9.4 mg/dL', range: '8.5 - 10.2', isAbnormal: false },
      { name: 'Glucose (Fasting)', value: '108 mg/dL', range: '70 - 99', isAbnormal: true },
    ]
  },
  {
    id: 'r2',
    title: 'Complete Blood Count (CBC)',
    date: 'Oct 15, 2026',
    type: 'blood',
    status: 'completed',
    flag: 'normal',
    provider: 'Dr. Emily Chen',
    summary: 'All hematology values are within normal clinical ranges. No signs of infection or anemia.',
    metrics: [
      { name: 'WBC Count', value: '6.8 x10^3/uL', range: '4.0 - 11.0', isAbnormal: false },
      { name: 'RBC Count', value: '4.9 x10^6/uL', range: '4.5 - 5.9', isAbnormal: false },
      { name: 'Hemoglobin', value: '14.5 g/dL', range: '13.5 - 17.5', isAbnormal: false },
      { name: 'Platelets', value: '250 x10^3/uL', range: '150 - 400', isAbnormal: false },
    ]
  },
  {
    id: 'r3',
    title: 'Echocardiogram (ECG)',
    date: 'Sep 02, 2026',
    type: 'imaging',
    status: 'completed',
    flag: 'normal',
    provider: 'Dr. Emily Chen',
    summary: 'Normal sinus rhythm. No acute ST-T wave changes. Normal left ventricular systolic function.',
  },
  {
    id: 'r4',
    title: 'Routine Urinalysis',
    date: 'Nov 12, 2026',
    type: 'other',
    status: 'pending',
    flag: 'none',
    provider: 'Dr. Sarah Jenkins',
    summary: 'Specimen received by laboratory. Analysis in progress.',
  }
];

export default function ResultsTab({ patientData }: { patientData?: any }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchResults();
  }, [patientData]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Map cases to "results"
      const mappedResults = data.map(d => ({
        id: d.id,
        date: d.date,
        type: d.diagnosis,
        orderedBy: d.doctorName || 'Clinical Team',
        status: 'Final',
        summary: d.symptoms || 'Case closed or active.',
        flag: d.priority === 'High' ? 'Abnormal' : 'Normal'
      }));
      setResults(mappedResults);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Blood Tests', 'Imaging', 'Other'];

  const filteredResults = RESULTS_DATA.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Blood Tests' && r.type === 'blood') return true;
    if (filter === 'Imaging' && r.type === 'imaging') return true;
    if (filter === 'Other' && r.type === 'other') return true;
    return false;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'blood': return <TestTube2 className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />;
      case 'imaging': return <Scan className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />;
      default: return <FileQuestion className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Laboratory & Diagnostic Results</h2>
        <p className="text-[14px] text-[#52606D]">Review your recent lab work, imaging reports, and clinical tests.</p>
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

      {/* Results Feed */}
      <div className="space-y-6">
        {filteredResults.map(result => (
          <div key={result.id} className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            
            {/* Header Section */}
            <div className="p-5 border-b border-[#CBD5E1] bg-[#F9FAFB] flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 bg-[#FFFFFF] p-2 rounded-[4px] border border-[#CBD5E1]">
                  {getIcon(result.type)}
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#172B3A]">{result.title}</h3>
                  <p className="text-[13px] text-[#52606D] mt-0.5">Ordered by {result.provider} • {result.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {result.status === 'pending' && (
                  <span className="bg-[#F4F6F8] text-[#52606D] text-[11px] px-2.5 py-1 rounded-[4px] font-semibold border border-[#CBD5E1] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Processing
                  </span>
                )}
                {result.status === 'completed' && result.flag === 'normal' && (
                  <span className="bg-[#E8F2EC] text-[#276749] text-[11px] px-2.5 py-1 rounded-[4px] font-semibold border border-[#BCE3C6] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                  </span>
                )}
                {result.status === 'completed' && result.flag === 'abnormal' && (
                  <span className="bg-[#FEF6E7] text-[#975A16] text-[11px] px-2.5 py-1 rounded-[4px] font-semibold border border-[#F6E0B5] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Notice
                  </span>
                )}
              </div>
            </div>

            {/* Body Section */}
            <div className="p-5 space-y-5">
              
              {/* Summary */}
              <div>
                <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1.5">Result Summary</p>
                <p className="text-[13px] text-[#172B3A] leading-relaxed">{result.summary}</p>
              </div>

              {/* Metrics Table (if applicable) */}
              {result.metrics && result.metrics.length > 0 && (
                <div className="border border-[#CBD5E1] rounded-[4px] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F4F6F8] border-b border-[#CBD5E1] text-[11px] font-semibold text-[#52606D] uppercase tracking-wider">
                        <th className="p-3">Metric</th>
                        <th className="p-3">Value</th>
                        <th className="p-3">Reference Range</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] text-[#172B3A] divide-y divide-[#CBD5E1]">
                      {result.metrics.map((metric, idx) => (
                        <tr key={idx} className={metric.isAbnormal ? "bg-[#FEFCE8]" : ""}>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-2">
                              {metric.isAbnormal && <AlertCircle className="w-3.5 h-3.5 text-[#975A16]" />}
                              {metric.name}
                            </div>
                          </td>
                          <td className={`p-3 font-semibold ${metric.isAbnormal ? 'text-[#975A16]' : 'text-[#102A43]'}`}>
                            {metric.value}
                          </td>
                          <td className="p-3 text-[#52606D]">{metric.range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {result.status === 'completed' && (
              <div className="bg-[#F9FAFB] border-t border-[#CBD5E1] p-4 flex flex-wrap items-center gap-3">
                <button className="text-[13px] font-medium text-[#FFFFFF] bg-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#173F5F] transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> View Full Report
                </button>
                <button className="text-[13px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#EBF1F6] transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            )}
            
          </div>
        ))}
      </div>

    </div>
  );
}
