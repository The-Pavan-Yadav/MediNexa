const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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

interface ResultRecord {
  id: string;
  date: string;
  type: string;
  title: string;
  provider: string;
  status: 'completed' | 'processing' | 'scheduled';
  summary?: string;
  flag?: 'normal' | 'abnormal' | 'review';
  metrics?: Metric[];
}

export default function ResultsTab({ patientData }: { patientData?: any }) {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);

    const q = query(
      collection(db, 'cases'), 
      where('patientId', '==', auth.currentUser.uid)
    );

    const qRecords = query(
      collection(db, 'clinical_records'),
      where('patientId', '==', auth.currentUser.uid)
    );

    let casesData: any[] = [];
    let recordsData: any[] = [];

    const processData = () => {
      const mappedResults: ResultRecord[] = [];
      
      casesData.forEach(d => {
        mappedResults.push({
          id: d.id,
          date: d.date || new Date().toISOString().split('T')[0],
          type: d.diagnosis || 'Clinical Case',
          title: d.diagnosis || 'Clinical Case',
          provider: d.assignedDoctorName || 'Clinical Team',
          status: 'completed',
          summary: d.symptoms || 'Case closed or active.',
          flag: d.priority === 'High' ? 'abnormal' : 'normal',
          metrics: []
        });
      });

      recordsData.forEach(d => {
        const v = d.data?.vitals || {};
        const timestamp = d.timestamp ? (d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp)) : new Date();
        mappedResults.push({
          id: d.id,
          date: timestamp.toISOString().split('T')[0],
          type: 'Health Input',
          title: 'Doctor Encounter & Vitals',
          provider: d.doctorName || 'Clinical Team',
          status: 'completed',
          summary: d.data?.assessment?.diagnosis || 'Routine check',
          flag: 'normal',
          metrics: [
             { name: 'Blood Pressure', value: v.bp || 'N/A', range: '120/80', isAbnormal: false },
             { name: 'Heart Rate', value: v.hr || 'N/A', range: '60-100 bpm', isAbnormal: false },
             { name: 'Weight', value: v.weight || 'N/A', range: 'N/A', isAbnormal: false }
          ].filter(m => m.value !== 'N/A')
        });
      });

      // Sort by date desc
      mappedResults.sort((a, b) => (new Date(b.date).getTime()) - (new Date(a.date).getTime()));
      
      setResults(mappedResults);
      setLoading(false);
    };

    const unsubCases = onSnapshot(q, (snap) => {
      casesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processData();
    });

    const unsubRecords = onSnapshot(qRecords, (snap) => {
      recordsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processData();
    });

    return () => {
      unsubCases();
      unsubRecords();
    };
  }, []);

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('blood') || t.includes('lab') || t.includes('input')) return <TestTube2 className="w-5 h-5 text-[#1F5F8B]" strokeWidth={1.5} />;
    if (t.includes('scan') || t.includes('mri') || t.includes('x-ray')) return <Scan className="w-5 h-5 text-[#975A16]" strokeWidth={1.5} />;
    return <FileText className="w-5 h-5 text-[#52606D]" strokeWidth={1.5} />;
  };

  if (loading) {
    return <div className="p-12 text-center text-[14px] text-[#52606D] font-medium">Loading medical records...</div>;
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Test Results & Records</h2>
          <p className="text-[14px] text-[#52606D]">Review your laboratory tests, imaging scans, and clinical notes.</p>
        </div>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-12 text-center">
             <FileText className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
             <p className="text-[14px] font-medium text-[#172B3A]">No records found.</p>
             <p className="text-[13px] text-[#52606D] mt-1">Your clinical results and doctor encounters will appear here.</p>
          </div>
        ) : results.map((result) => (
          <div key={result.id} className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden transition-all hover:shadow-sm">
            
            {/* Primary Row */}
            <div 
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
              onClick={() => setSelectedResult(selectedResult === result.id ? null : result.id)}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F4F6F8] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                  {getIcon(result.type)}
                </div>
                
                <div>
                  <h3 className="text-[15px] font-bold text-[#172B3A] leading-tight mb-1">{result.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#52606D]">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {result.date}</span>
                    <span className="hidden sm:inline text-[#CBD5E1]">•</span>
                    <span>{result.provider}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 self-start sm:self-center pl-14 sm:pl-0">
                {result.flag === 'abnormal' && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#B42318] bg-[#FEF2F2] px-2 py-1 rounded-[4px] uppercase tracking-wider border border-[#FCA5A5]">
                    <AlertCircle className="w-3.5 h-3.5" /> Action Required
                  </span>
                )}
                {result.flag === 'normal' && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#276749] bg-[#E8F2EC] px-2 py-1 rounded-[4px] uppercase tracking-wider border border-[#BCE3C6]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                  </span>
                )}
                <ChevronRight className={\`w-5 h-5 text-[#52606D] transition-transform duration-200 \${selectedResult === result.id ? 'rotate-90' : ''}\`} strokeWidth={1.5} />
              </div>
            </div>

            {/* Expanded Content Area */}
            {selectedResult === result.id && (
              <div className="border-t border-[#CBD5E1] bg-[#F9FAFB] p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                
                {result.summary && (
                  <div className="mb-6">
                    <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Clinical Summary</h4>
                    <p className="text-[13px] text-[#172B3A] leading-relaxed bg-[#FFFFFF] border border-[#CBD5E1] p-3 rounded-[4px]">
                      {result.summary}
                    </p>
                  </div>
                )}
                
                {result.metrics && result.metrics.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3">Key Metrics</h4>
                    <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F4F6F8] border-b border-[#CBD5E1]">
                            <th className="px-4 py-2 text-[11px] font-bold text-[#52606D] uppercase tracking-wider w-[40%]">Test / Metric</th>
                            <th className="px-4 py-2 text-[11px] font-bold text-[#52606D] uppercase tracking-wider w-[30%]">Result</th>
                            <th className="px-4 py-2 text-[11px] font-bold text-[#52606D] uppercase tracking-wider hidden sm:table-cell">Standard Range</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CBD5E1]">
                          {result.metrics.map((m, idx) => (
                            <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                              <td className="px-4 py-3 text-[13px] font-medium text-[#172B3A]">{m.name}</td>
                              <td className="px-4 py-3">
                                <span className={\`text-[13px] font-bold px-2 py-0.5 rounded-[4px] \${m.isAbnormal ? 'bg-[#FEF2F2] text-[#B42318]' : 'text-[#172B3A]'}\`}>
                                  {m.value}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[12px] text-[#52606D] hidden sm:table-cell">{m.range}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/tabs/ResultsTab.tsx', code);
console.log("Rewrote ResultsTab to use real data via onSnapshot");
