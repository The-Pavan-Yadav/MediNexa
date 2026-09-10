import React, { useState } from 'react';
import { 
  Pill, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Stethoscope,
  Info
} from 'lucide-react';

interface ScheduleItem {
  id: string;
  time: string;
  medicine: string;
  dosage: string;
  instructions: string;
  status: 'taken' | 'upcoming' | 'missed';
}

interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  instructions: string;
  provider: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'completed';
}

const SCHEDULE_DATA: ScheduleItem[] = [
  {
    id: 's1',
    time: '8:00 AM',
    medicine: 'Lisinopril',
    dosage: '10mg',
    instructions: 'Take with food',
    status: 'taken'
  },
  {
    id: 's2',
    time: '1:00 PM',
    medicine: 'Cholecalciferol (Vitamin D3)',
    dosage: '1000 IU',
    instructions: 'Take after lunch',
    status: 'upcoming'
  },
  {
    id: 's3',
    time: '8:00 PM',
    medicine: 'Atorvastatin',
    dosage: '20mg',
    instructions: 'Take after dinner',
    status: 'upcoming'
  }
];

const PRESCRIPTION_DATA: Prescription[] = [
  {
    id: 'p1',
    medicine: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    instructions: 'Take in the morning with food. Avoid potassium supplements.',
    provider: 'Dr. Emily Chen',
    startDate: 'Sep 02, 2026',
    endDate: null,
    status: 'active'
  },
  {
    id: 'p2',
    medicine: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    instructions: 'Take in the evening. Avoid grapefruit juice.',
    provider: 'Dr. Emily Chen',
    startDate: 'Sep 02, 2026',
    endDate: null,
    status: 'active'
  },
  {
    id: 'p3',
    medicine: 'Cholecalciferol (Vitamin D3)',
    dosage: '1000 IU',
    frequency: 'Once daily',
    instructions: 'Take with a meal containing fat for better absorption.',
    provider: 'Dr. Sarah Jenkins',
    startDate: 'Oct 15, 2026',
    endDate: null,
    status: 'active'
  },
  {
    id: 'p4',
    medicine: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'Three times daily',
    instructions: 'Take until finished. For sinus infection.',
    provider: 'Urgent Care Center',
    startDate: 'Jul 10, 2026',
    endDate: 'Jul 20, 2026',
    status: 'completed'
  }
];

export default function MedicinesTab() {
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Today', 'Active', 'Completed'];

  const showSchedule = filter === 'All' || filter === 'Today';
  const showActive = filter === 'All' || filter === 'Active';
  const showCompleted = filter === 'All' || filter === 'Completed';

  const filteredPrescriptions = PRESCRIPTION_DATA.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Active' && p.status === 'active') return true;
    if (filter === 'Completed' && p.status === 'completed') return true;
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
            {SCHEDULE_DATA.map(item => (
              <div 
                key={item.id} 
                className={`border rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  item.status === 'taken' 
                    ? 'bg-[#F9FAFB] border-[#CBD5E1]' 
                    : item.status === 'missed'
                    ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                    : 'bg-[#FFFFFF] border-[#CBD5E1] hover:border-[#173F5F]'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-0.5 shrink-0">
                    {item.status === 'taken' && <CheckCircle2 className="w-5 h-5 text-[#276749]" />}
                    {item.status === 'missed' && <XCircle className="w-5 h-5 text-[#B42318]" />}
                    {item.status === 'upcoming' && <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1]"></div>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[13px] font-bold tracking-wide uppercase ${item.status === 'taken' ? 'text-[#52606D]' : 'text-[#1F5F8B]'}`}>
                        {item.time}
                      </span>
                      {item.status === 'taken' && (
                        <span className="text-[11px] font-semibold text-[#276749] bg-[#E8F2EC] px-2 py-0.5 rounded-[4px] border border-[#BCE3C6]">
                          Taken
                        </span>
                      )}
                      {item.status === 'missed' && (
                        <span className="text-[11px] font-semibold text-[#B42318] bg-[#FEF2F2] px-2 py-0.5 rounded-[4px] border border-[#FCA5A5]">
                          Missed
                        </span>
                      )}
                    </div>
                    <p className={`text-[15px] font-semibold ${item.status === 'taken' ? 'text-[#52606D] line-through opacity-80' : 'text-[#172B3A]'}`}>
                      {item.medicine} <span className="font-normal text-[#52606D] ml-1">{item.dosage}</span>
                    </p>
                    <p className="text-[13px] text-[#52606D] mt-0.5">{item.instructions}</p>
                  </div>
                </div>
                
                {item.status === 'upcoming' && (
                  <button className="text-[13px] font-medium text-[#1F5F8B] border border-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#EBF1F6] transition-colors shrink-0 whitespace-nowrap">
                    Mark as Taken
                  </button>
                )}
              </div>
            ))}
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
