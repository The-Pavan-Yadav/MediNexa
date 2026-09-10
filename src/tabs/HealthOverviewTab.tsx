import React from 'react';
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
  ArrowRight
} from 'lucide-react';

export default function HealthOverviewTab() {
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
              Overall Status
            </h3>
            <span className="bg-[#E8F2EC] text-[#276749] text-[11px] px-2.5 py-1 rounded-[4px] font-bold border border-[#BCE3C6] uppercase tracking-wider">
              Stable & Improving
            </span>
          </div>
          <p className="text-[13px] text-[#172B3A] leading-relaxed">
            Your cardiovascular metrics are responding well to the current treatment plan. Blood pressure is trending downward towards the clinical target. Continued adherence to medication and lifestyle adjustments is recommended.
          </p>
          <div className="mt-4 pt-4 border-t border-[#CBD5E1] flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#52606D]">Last updated: Oct 15, 2026</span>
            <span className="text-[12px] font-semibold text-[#102A43] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Dr. Emily Chen
            </span>
          </div>
        </div>

        {/* Progress & Care Plan Focus */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5">
          <h3 className="text-[14px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#102A43]" strokeWidth={2} />
            Primary Goal: Hypertension Management
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Target Goal Progress</span>
                <span className="text-[13px] font-bold text-[#1F5F8B]">75%</span>
              </div>
              <div className="w-full h-2.5 bg-[#F4F6F8] rounded-full border border-[#CBD5E1] overflow-hidden">
                <div className="h-full bg-[#1F5F8B] rounded-r-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="bg-[#F9FAFB] border border-[#CBD5E1] rounded-[4px] p-3 mt-4">
              <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-2">Current Milestones</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-[12px] text-[#172B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#276749] mt-0.5 shrink-0" />
                  Initiate daily Lisinopril 10mg
                </li>
                <li className="flex items-start gap-2 text-[12px] text-[#172B3A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#276749] mt-0.5 shrink-0" />
                  Reduce sodium intake to &lt;1,500mg/day
                </li>
                <li className="flex items-start gap-2 text-[12px] text-[#172B3A]">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#CBD5E1] mt-0.5 shrink-0"></div>
                  Achieve sustained BP below 120/80
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Grid */}
      <div>
        <h3 className="text-[15px] font-semibold text-[#172B3A] mb-3">Recent Vital Signs & Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Blood Pressure */}
          <div className="bg-[#FFFFFF] border border-[#F6E0B5] rounded-[4px] p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#975A16]"></div>
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="w-4 h-4 text-[#975A16]" />
              <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Blood Pressure</p>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-[24px] font-bold text-[#172B3A]">128/82</p>
              <p className="text-[12px] font-medium text-[#52606D]">mmHg</p>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="bg-[#FEF6E7] text-[#975A16] text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold uppercase border border-[#F6E0B5]">
                Elevated
              </span>
              <span className="text-[11px] text-[#52606D] font-medium">↓ from 135/88</span>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#276749]"></div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[#52606D]" />
              <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Heart Rate</p>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-[24px] font-bold text-[#172B3A]">72</p>
              <p className="text-[12px] font-medium text-[#52606D]">bpm</p>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="bg-[#E8F2EC] text-[#276749] text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold uppercase border border-[#BCE3C6]">
                Normal
              </span>
              <span className="text-[11px] text-[#52606D] font-medium">Resting</span>
            </div>
          </div>

          {/* Weight */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#276749]"></div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-[#52606D]" />
              <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Weight</p>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-[24px] font-bold text-[#172B3A]">174.5</p>
              <p className="text-[12px] font-medium text-[#52606D]">lbs</p>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="bg-[#E8F2EC] text-[#276749] text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold uppercase border border-[#BCE3C6]">
                Normal
              </span>
              <span className="text-[11px] text-[#52606D] font-medium">BMI: 24.3</span>
            </div>
          </div>

          {/* Blood Sugar (Fasting) */}
          <div className="bg-[#FFFFFF] border border-[#F6E0B5] rounded-[4px] p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#975A16]"></div>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-[#975A16]" />
              <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Glucose</p>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-[24px] font-bold text-[#172B3A]">108</p>
              <p className="text-[12px] font-medium text-[#52606D]">mg/dL</p>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="bg-[#FEF6E7] text-[#975A16] text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold uppercase border border-[#F6E0B5]">
                Monitor
              </span>
              <span className="text-[11px] text-[#52606D] font-medium">Fasting</span>
            </div>
          </div>

        </div>
      </div>

      {/* Conditions & Allergies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Conditions */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-0 overflow-hidden">
          <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4">
            <h3 className="text-[14px] font-semibold text-[#172B3A] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#102A43]" /> Active Conditions
            </h3>
          </div>
          <div className="divide-y divide-[#CBD5E1]">
            <div className="p-4 flex items-center justify-between hover:bg-[#F4F6F8] transition-colors">
              <div>
                <p className="text-[14px] font-medium text-[#172B3A]">Essential (primary) hypertension</p>
                <p className="text-[12px] text-[#52606D] mt-0.5">Diagnosed Sep 2026 • Controlled</p>
              </div>
              <button className="text-[#1F5F8B] hover:text-[#173F5F] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-[#F4F6F8] transition-colors">
              <div>
                <p className="text-[14px] font-medium text-[#172B3A]">Hyperlipidemia</p>
                <p className="text-[12px] text-[#52606D] mt-0.5">Diagnosed Sep 2026 • Actively Managed</p>
              </div>
              <button className="text-[#1F5F8B] hover:text-[#173F5F] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Allergies & Intolerances */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-0 overflow-hidden">
          <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4">
            <h3 className="text-[14px] font-semibold text-[#172B3A] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#102A43]" /> Allergies & Intolerances
            </h3>
          </div>
          <div className="divide-y divide-[#CBD5E1]">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[14px] font-medium text-[#172B3A]">Penicillin G</p>
                  <p className="text-[12px] text-[#52606D] mt-0.5">Reaction: Mild skin rash (Hives)</p>
                </div>
                <span className="bg-[#F4F6F8] text-[#52606D] text-[11px] px-2 py-0.5 rounded-[4px] font-semibold border border-[#CBD5E1] w-fit">
                  Mild Severity
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-[13px] text-[#52606D] italic">
                <CheckCircle2 className="w-4 h-4 text-[#276749]" /> No other known allergies on file.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
