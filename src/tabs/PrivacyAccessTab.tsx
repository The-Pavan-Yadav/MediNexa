import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Shield, 
  Lock, 
  Eye, 
  Key, 
  Smartphone, 
  Trash2, 
  LogOut, 
  FileHeart,
  QrCode,
  Share2,
  AlertCircle
} from 'lucide-react';

// Reusable Clinical Toggle Component
const ClinicalToggle = ({ 
  checked, 
  onChange, 
  label, 
  description 
}: { 
  checked: boolean; 
  onChange: () => void; 
  label: string; 
  description: string;
}) => (
  <div className="flex items-start justify-between py-4">
    <div className="pr-6">
      <p className="text-[14px] font-semibold text-[#172B3A]">{label}</p>
      <p className="text-[13px] text-[#52606D] mt-0.5 leading-relaxed">{description}</p>
    </div>
    <button 
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-[#1F5F8B]' : 'bg-[#CBD5E1]'
      }`}
    >
      <span className="sr-only">Toggle {label}</span>
      <span 
        className={`pointer-events-none absolute left-0.5 inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`} 
      />
    </button>
  </div>
);

export default function PrivacyAccessTab({ patientData }: { patientData?: any }) {
  
  const handleSave = async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        preferences: toggles
      });
      alert('Preferences saved successfully!');
    }
  };

  const [toggles, setToggles] = useState({
    specialistSharing: true,
    researchConsent: false,
    qrEmergency: true,
    twoFactor: false,
    emailAlerts: true
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Privacy & Access</h2>
        <p className="text-[14px] text-[#52606D]">Manage your clinical data sharing, security preferences, and active sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data & Medical Records */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Medical Records Access */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#102A43]" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#172B3A]">Data Sharing & Visibility</h3>
            </div>
            <div className="p-2 px-5 divide-y divide-[#CBD5E1]">
              <ClinicalToggle 
                label="Specialist Auto-Sharing"
                description="Automatically grant temporary medical record access to specialists upon internal hospital referral."
                checked={toggles.specialistSharing}
                onChange={() => handleToggle('specialistSharing')}
              />
              <ClinicalToggle 
                label="Clinical Research Consent"
                description="Allow completely anonymized health metrics to be used in institutional medical research studies."
                checked={toggles.researchConsent}
                onChange={() => handleToggle('researchConsent')}
              />
            </div>
          </div>

          {/* QR & Health ID Controls */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#102A43]" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#172B3A]">Health ID & QR Controls</h3>
            </div>
            <div className="p-2 px-5 divide-y divide-[#CBD5E1]">
              <ClinicalToggle 
                label="Emergency Override Access"
                description="Permit emergency room responders to scan your QR code and access critical allergies and conditions without secondary PIN verification."
                checked={toggles.qrEmergency}
                onChange={() => handleToggle('qrEmergency')}
              />
            </div>
            <div className="bg-[#FEF6E7] border-t border-[#F6E0B5] p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#975A16] mt-0.5 shrink-0" />
              <p className="text-[12px] text-[#975A16] leading-relaxed">
                <strong>Note:</strong> Disabling emergency access requires all medical personnel to request a one-time SMS pin from you before accessing your records via QR code.
              </p>
            </div>
          </div>

          {/* Security & Authentication */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#102A43]" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#172B3A]">Security & Login Settings</h3>
            </div>
            
            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#CBD5E1]">
              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-[#52606D] mt-0.5" />
                <div>
                  <p className="text-[14px] font-semibold text-[#172B3A]">Password</p>
                  <p className="text-[13px] text-[#52606D] mt-0.5">Last changed 4 months ago</p>
                </div>
              </div>
              <button className="text-[13px] font-medium text-[#172B3A] bg-[#FFFFFF] border border-[#CBD5E1] px-4 py-2 rounded-[4px] hover:bg-[#F4F6F8] transition-colors whitespace-nowrap">
                Change Password
              </button>
            </div>

            <div className="p-2 px-5">
              <ClinicalToggle 
                label="Two-Factor Authentication (2FA)"
                description="Require an SMS code in addition to your password when logging in from unrecognized devices."
                checked={toggles.twoFactor}
                onChange={() => handleToggle('twoFactor')}
              />
              <ClinicalToggle 
                label="New Login Alerts"
                description="Receive an email immediately if your account is accessed from a new IP address or location."
                checked={toggles.emailAlerts}
                onChange={() => handleToggle('emailAlerts')}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Sessions & Danger Zone */}
        <div className="space-y-6">
          
          {/* Active Sessions */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#102A43]" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#172B3A]">Active Sessions</h3>
            </div>
            
            <div className="divide-y divide-[#CBD5E1]">
              <div className="p-4 flex items-start gap-3 bg-[#EBF1F6]">
                <div className="w-8 h-8 rounded-full bg-[#1F5F8B] flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#172B3A]">iPhone 14 Pro (Current)</p>
                  <p className="text-[12px] text-[#52606D]">Safari • Seattle, WA</p>
                  <p className="text-[11px] font-bold text-[#276749] mt-1 uppercase tracking-wider">Active Now</p>
                </div>
              </div>

              <div className="p-4 flex items-start gap-3 hover:bg-[#F9FAFB] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#F4F6F8] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4 text-[#52606D]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#172B3A]">MacBook Pro</p>
                  <p className="text-[12px] text-[#52606D]">Chrome • Seattle, WA</p>
                  <p className="text-[11px] text-[#52606D] mt-1">Last active 2 days ago</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#CBD5E1]">
              <button className="w-full text-[13px] font-medium text-[#172B3A] bg-[#FFFFFF] border border-[#CBD5E1] px-4 py-2 rounded-[4px] hover:bg-[#F4F6F8] transition-colors flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out All Devices
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#FFFFFF] border border-[#FCA5A5] rounded-[4px] overflow-hidden">
            <div className="bg-[#FEF2F2] border-b border-[#FCA5A5] p-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B42318]" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#B42318]">Account Management</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[13px] text-[#52606D] leading-relaxed">
                  Deactivating your account will suspend portal access, but medical records remain archived per federal regulations.
                </p>
              </div>
              <button className="w-full text-[13px] font-medium text-[#B42318] bg-[#FFFFFF] border border-[#FCA5A5] px-4 py-2.5 rounded-[4px] hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-2">
                Deactivate Portal Access
              </button>
              <button className="w-full text-[13px] font-medium text-[#52606D] hover:text-[#B42318] hover:underline transition-colors mt-2">
                Request Complete Data Deletion
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
