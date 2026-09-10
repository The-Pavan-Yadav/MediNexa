import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Clock, Pill, CheckCircle2, XCircle, Info, Stethoscope, Calendar } from 'lucide-react';

export default function MedicinesTab({ patientData }: { patientData?: any }) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchMedicines();
  }, [patientData]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'medicines'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Today', 'Active', 'Completed'];

  const showSchedule = filter === 'All' || filter === 'Today';
  const showActive = filter === 'All' || filter === 'Active';
  const showCompleted = filter === 'All' || filter === 'Completed';

  const filteredPrescriptions = prescriptions.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Active' && p.status !== 'Discontinued') return true;
    if (filter === 'Completed' && p.status === 'Discontinued') return true;
    if (filter === 'Today') return false; // Today only shows schedule
    return false;
  });

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Medicines</h2>
        <p className="text-[14px] text-[#52606D]">Manage your active prescriptions and daily medication schedule.</p>
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

      {/* Today's Schedule */}
      {showSchedule && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />
            <h3 className="text-[15px] font-semibold text-[#172B3A]">Today's Schedule</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {prescriptions.filter(p => p.status !== 'Discontinued').map((item, idx) => (
              <div 
                key={item.id || idx} 
                className={`border rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors bg-[#FFFFFF] border-[#CBD5E1] hover:border-[#173F5F]`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1]"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[13px] font-bold tracking-wide uppercase text-[#1F5F8B]`}>
                        {item.frequency || 'Daily'}
                      </span>
                    </div>
                    <p className={`text-[15px] font-semibold text-[#172B3A]`}>
                      {item.name || item.medicine} <span className="font-normal text-[#52606D] ml-1">{item.dosage}</span>
                    </p>
                    <p className="text-[13px] text-[#52606D] mt-0.5">{item.instructions}</p>
                  </div>
                </div>
                
                <button className="text-[13px] font-medium text-[#1F5F8B] border border-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#EBF1F6] transition-colors shrink-0 whitespace-nowrap">
                  Mark as Taken
                </button>
              </div>
            ))}
            {prescriptions.filter(p => p.status !== 'Discontinued').length === 0 && (
              <p className="text-[13px] text-[#52606D]">No schedule available.</p>
            )}
          </div>
        </div>
      )}

      {/* Clinical Prescriptions Table */}
      {(showActive || showCompleted) && filteredPrescriptions.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />
            <h3 className="text-[15px] font-semibold text-[#172B3A]">Clinical Prescriptions</h3>
          </div>
          
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1] text-[11px] font-semibold text-[#52606D] uppercase tracking-wider">
                    <th className="p-4 py-3 w-[25%]">Medication & Dosage</th>
                    <th className="p-4 py-3 w-[30%]">Instructions & Frequency</th>
                    <th className="p-4 py-3 w-[20%]">Prescriber</th>
                    <th className="p-4 py-3 w-[15%]">Date Range</th>
                    <th className="p-4 py-3 w-[10%]">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#172B3A] divide-y divide-[#CBD5E1]">
                  {filteredPrescriptions.map(p => (
                    <tr key={p.id} className="hover:bg-[#F4F6F8] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-[#102A43]">{p.medicine}</div>
                        <div className="text-[#52606D] mt-0.5">{p.dosage}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{p.frequency}</div>
                        <div className="text-[#52606D] mt-0.5 text-[12px] leading-relaxed">{p.instructions}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Stethoscope className="w-3.5 h-3.5 text-[#52606D]" />
                          {p.provider}
                        </div>
                      </td>
                      <td className="p-4 text-[#52606D] text-[12px]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {p.startDate}
                        </div>
                        {p.endDate ? (
                          <div className="pl-5 text-[#102A43] font-medium">End: {p.endDate}</div>
                        ) : (
                          <div className="pl-5 italic opacity-80">Ongoing</div>
                        )}
                      </td>
                      <td className="p-4">
                        {p.status === 'active' ? (
                          <span className="text-[#1F5F8B] bg-[#EBF1F6] px-2 py-0.5 rounded-[4px] text-[11px] border border-[#1F5F8B] font-medium whitespace-nowrap">
                            Active
                          </span>
                        ) : (
                          <span className="text-[#52606D] bg-[#F4F6F8] px-2 py-0.5 rounded-[4px] text-[11px] border border-[#CBD5E1] font-medium whitespace-nowrap">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-4 bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] mt-4">
            <Info className="w-4 h-4 text-[#52606D] shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-[12px] text-[#52606D] leading-relaxed">
              This list contains current and past medications prescribed within the MHD Hospital network. Please consult your physician before altering any active medication schedules. To request a refill, navigate to the Quick Actions menu on your dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
