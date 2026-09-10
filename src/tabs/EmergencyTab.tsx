import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  AlertTriangle, 
  PhoneCall, 
  Ambulance, 
  MapPin, 
  UserCircle, 
  HeartPulse, 
  Activity, 
  ShieldAlert,
  Loader2,
  Clock,
  Pill,
  Users
} from 'lucide-react';

export default function EmergencyTab() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#B42318] animate-spin mb-4" />
        <p className="text-[14px] text-[#52606D] font-medium">Loading emergency protocol...</p>
      </div>
    );
  }

  const displayId = userData?.mhdId || 'P-PENDING';
  const qrValue = JSON.stringify({ mhdId: displayId, role: userData?.role, type: 'emergency' });

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-[#B42318]" /> 
          Emergency Assistance
        </h2>
        <p className="text-[14px] text-[#52606D]">Immediate access to critical care, hospital contacts, and vital medical information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Actions & Contacts */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Critical Actions */}
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-[4px] p-5">
            <h3 className="text-[13px] font-bold text-[#B42318] uppercase tracking-wider mb-4">Immediate Response</h3>
            
            <div className="space-y-3">
              <button className="w-full bg-[#B42318] hover:bg-[#991B1B] text-white transition-colors border border-[#991B1B] rounded-[4px] py-4 px-4 flex flex-col items-center justify-center gap-2">
                <PhoneCall className="w-6 h-6" />
                <span className="text-[15px] font-bold tracking-wide">CALL 911</span>
              </button>
              
              <button className="w-full bg-white hover:bg-[#F9FAFB] text-[#172B3A] transition-colors border border-[#CBD5E1] rounded-[4px] py-3 px-4 flex flex-col items-center justify-center gap-1 shadow-sm">
                <Ambulance className="w-5 h-5 text-[#B42318]" />
                <span className="text-[13px] font-semibold">Request MHD Ambulance</span>
                <span className="text-[11px] text-[#52606D]">Avg. dispatch: 2-3 mins</span>
              </button>
              
              <button className="w-full bg-white hover:bg-[#F9FAFB] text-[#172B3A] transition-colors border border-[#CBD5E1] rounded-[4px] py-3 px-4 flex flex-col items-center justify-center gap-1 shadow-sm">
                <MapPin className="w-5 h-5 text-[#1F5F8B]" />
                <span className="text-[13px] font-semibold">Share Current Location</span>
                <span className="text-[11px] text-[#52606D]">Send GPS to Dispatch</span>
              </button>
            </div>
          </div>

          {/* Hospital Contacts */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4">
              <h3 className="text-[14px] font-semibold text-[#172B3A]">MHD Hospital Contacts</h3>
            </div>
            <div className="p-0 divide-y divide-[#CBD5E1]">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-[#172B3A]">Emergency Dept (24/7)</p>
                  <p className="text-[13px] text-[#1F5F8B] font-medium mt-0.5">+1 (555) 911-0001</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#EBF1F6] flex items-center justify-center text-[#1F5F8B] hover:bg-[#D1E0EC] transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-[#172B3A]">Main Reception</p>
                  <p className="text-[13px] text-[#1F5F8B] font-medium mt-0.5">+1 (555) 000-0000</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#EBF1F6] flex items-center justify-center text-[#1F5F8B] hover:bg-[#D1E0EC] transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Personal Emergency Contacts */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#102A43]" />
              <h3 className="text-[14px] font-semibold text-[#172B3A]">Personal Contacts</h3>
            </div>
            <div className="p-0 divide-y divide-[#CBD5E1]">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-[#172B3A]">Sarah Johnson</p>
                  <p className="text-[11px] text-[#52606D] uppercase tracking-wider mb-0.5">Spouse</p>
                  <p className="text-[13px] text-[#1F5F8B] font-medium">+1 (555) 123-4567</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#EBF1F6] flex items-center justify-center text-[#1F5F8B] hover:bg-[#D1E0EC] transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Medical Info & QR */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity & QR Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Identity */}
            <div className="bg-[#102A43] border border-[#102A43] rounded-[4px] p-6 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-[11px] font-bold text-[#CBD5E1] uppercase tracking-wider mb-4">Patient Identity</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
                    <UserCircle className="w-7 h-7 text-[#102A43]" />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold leading-tight">{userData?.name || 'Unknown Patient'}</p>
                    <p className="text-[13px] text-[#CBD5E1] mt-0.5">DOB: {userData?.dob || 'Jan 15, 1980'} (46 Yrs)</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#173F5F] p-4 rounded-[4px] border border-[#1F5F8B]">
                <p className="text-[11px] font-bold text-[#CBD5E1] uppercase tracking-wider mb-1">Health ID</p>
                <p className="text-[20px] font-mono font-bold tracking-widest">{displayId}</p>
              </div>
            </div>

            {/* Emergency QR */}
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-white p-3 rounded-[4px] border border-[#B42318] shadow-sm mb-4">
                <QRCodeSVG
                  value={qrValue}
                  size={120}
                  level="H"
                  fgColor="#B42318"
                  bgColor="#FFFFFF"
                />
              </div>
              <h3 className="text-[14px] font-semibold text-[#172B3A] mb-1">Scan for Medical Record</h3>
              <p className="text-[12px] text-[#52606D] max-w-[200px]">Allows EMTs to access critical allergies and conditions instantly.</p>
            </div>
          </div>

          {/* Critical Medical Information */}
          <div className="bg-[#FFFFFF] border border-[#FCA5A5] rounded-[4px] overflow-hidden">
            <div className="bg-[#FEF2F2] border-b border-[#FCA5A5] p-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#B42318]" />
              <h3 className="text-[15px] font-semibold text-[#B42318]">Critical Medical Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#CBD5E1]">
              <div className="p-5">
                <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Allergies
                </p>
                <ul className="space-y-2">
                  <li className="text-[14px] font-semibold text-[#B42318] bg-[#FEF2F2] border border-[#FCA5A5] px-3 py-1.5 rounded-[4px] inline-block w-full">Penicillin (Severe)</li>
                  <li className="text-[14px] font-medium text-[#172B3A] bg-[#F4F6F8] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] inline-block w-full">Latex (Mild)</li>
                </ul>
              </div>

              <div className="p-5">
                <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Conditions
                </p>
                <ul className="space-y-2">
                  <li className="text-[14px] font-medium text-[#172B3A] bg-[#F4F6F8] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] block">Type 2 Diabetes</li>
                  <li className="text-[14px] font-medium text-[#172B3A] bg-[#F4F6F8] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] block">Hypertension</li>
                </ul>
              </div>

              <div className="p-5">
                <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" /> Key Medications
                </p>
                <ul className="space-y-2">
                  <li className="text-[13px] font-medium text-[#172B3A]">Metformin <span className="text-[#52606D] font-normal block text-[12px]">500mg (Daily)</span></li>
                  <li className="text-[13px] font-medium text-[#172B3A]">Lisinopril <span className="text-[#52606D] font-normal block text-[12px]">10mg (Daily)</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#F9FAFB] border border-[#CBD5E1] rounded-[4px] p-5">
            <h3 className="text-[13px] font-bold text-[#102A43] uppercase tracking-wider mb-2">Emergency Instructions</h3>
            <p className="text-[13px] text-[#52606D] leading-relaxed mb-4">
              If you are experiencing chest pain, severe bleeding, difficulty breathing, or sudden numbness, call 911 immediately. Do not drive yourself to the hospital.
            </p>
            <p className="text-[13px] text-[#52606D] leading-relaxed">
              When the ambulance arrives, present the red QR code above to the EMTs. This allows them to instantly load your health records and notify the hospital emergency department of your arrival.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
