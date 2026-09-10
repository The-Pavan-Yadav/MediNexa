import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Clock, 
  Globe, 
  Moon, 
  Shield, 
  MonitorSmartphone, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function SettingsTab({ doctorData }: { doctorData: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'idle' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });

  const [formData, setFormData] = useState({
    name: doctorData?.name || '',
    specialization: doctorData?.specialization || 'General Medicine',
    phone: doctorData?.phone || '',
    dutyStatus: doctorData?.dutyStatus || 'On Duty',
    notifEmail: true,
    notifSMS: true,
    notifEmergency: true,
    language: 'English (US)',
    theme: 'Light (Default)'
  });

  useEffect(() => {
    if (doctorData) {
      setFormData(prev => ({
        ...prev,
        name: doctorData.name || '',
        specialization: doctorData.specialization || 'General Medicine',
        phone: doctorData.phone || '',
        dutyStatus: doctorData.dutyStatus || 'On Duty'
      }));
    }
  }, [doctorData]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    setSaveStatus({ type: 'idle', msg: '' });

    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(docRef, {
        name: formData.name,
        specialization: formData.specialization,
        phone: formData.phone,
        dutyStatus: formData.dutyStatus,
        updatedAt: new Date()
      });

      setSaveStatus({ type: 'success', msg: 'Settings updated successfully.' });
      setTimeout(() => setSaveStatus({ type: 'idle', msg: '' }), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveStatus({ type: 'error', msg: 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, description }: any) => (
    <div className="mb-4">
      <h3 className="text-[15px] font-semibold text-[#172B3A] flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#102A43]" /> {title}
      </h3>
      {description && <p className="text-[12px] text-[#52606D] mt-1 ml-6">{description}</p>}
    </div>
  );

  const Toggle = ({ label, checked, onChange }: any) => (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-[13px] font-medium text-[#172B3A]">{label}</span>
      <div className="relative inline-block w-8 h-4">
        <input 
          type="checkbox" 
          className="peer sr-only" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-8 h-4 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1F5F8B]"></div>
      </div>
    </label>
  );

  return (
    <div className="max-w-[800px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">System Settings</h2>
        <p className="text-[14px] text-[#52606D]">Manage your professional profile, preferences, and account security.</p>
      </div>

      <div className="space-y-6">
        
        {/* Professional Profile */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6 shadow-sm">
          <SectionHeader 
            icon={User} 
            title="Professional Profile" 
            description="Your clinical identity visible to administration and peers." 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
            <div>
              <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Specialization</label>
              <input 
                type="text" 
                value={formData.specialization}
                onChange={e => setFormData({...formData, specialization: e.target.value})}
                className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Email Address</label>
              <input 
                type="email" 
                disabled
                value={auth.currentUser?.email || ''}
                className="w-full bg-[#EBF1F6] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] text-[#52606D] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Contact Phone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
              />
            </div>
          </div>
        </div>

        {/* Availability / Duty Status */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6 shadow-sm">
          <SectionHeader 
            icon={Clock} 
            title="Availability & Duty Status" 
            description="Update your current clinical availability for urgent case assignments." 
          />
          <div className="ml-6">
            <select 
              value={formData.dutyStatus}
              onChange={e => setFormData({...formData, dutyStatus: e.target.value})}
              className="w-[200px] bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] cursor-pointer"
            >
              <option value="On Duty">On Duty</option>
              <option value="On Call">On Call</option>
              <option value="Off Duty">Off Duty</option>
              <option value="In Surgery">In Surgery</option>
            </select>
          </div>
        </div>

        {/* Notifications & Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6 shadow-sm">
            <SectionHeader 
              icon={Bell} 
              title="Notifications" 
            />
            <div className="ml-6 divide-y divide-[#CBD5E1]">
              <Toggle 
                label="Email Notifications" 
                checked={formData.notifEmail} 
                onChange={(val: boolean) => setFormData({...formData, notifEmail: val})} 
              />
              <Toggle 
                label="SMS Alerts" 
                checked={formData.notifSMS} 
                onChange={(val: boolean) => setFormData({...formData, notifSMS: val})} 
              />
              <Toggle 
                label="Critical Emergency Overrides" 
                checked={formData.notifEmergency} 
                onChange={(val: boolean) => setFormData({...formData, notifEmergency: val})} 
              />
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6 shadow-sm">
            <SectionHeader 
              icon={Globe} 
              title="System Preferences" 
            />
            <div className="ml-6 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Language
                </label>
                <select 
                  value={formData.language}
                  onChange={e => setFormData({...formData, language: e.target.value})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] cursor-pointer"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" /> Theme
                </label>
                <select 
                  value={formData.theme}
                  onChange={e => setFormData({...formData, theme: e.target.value})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] cursor-pointer"
                >
                  <option value="Light (Default)">Light (Hospital Default)</option>
                  <option value="Dark">Dark Mode</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6 shadow-sm">
          <SectionHeader 
            icon={Shield} 
            title="Privacy & Security" 
            description="Manage your password and active sessions." 
          />
          <div className="ml-6 space-y-4 mt-2">
            <div className="flex items-center justify-between p-3 bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px]">
              <div>
                <p className="text-[13px] font-semibold text-[#172B3A] flex items-center gap-1.5"><Lock className="w-4 h-4 text-[#52606D]" /> Account Password</p>
                <p className="text-[11px] text-[#52606D] mt-0.5">Last changed 45 days ago</p>
              </div>
              <button className="text-[12px] font-medium text-[#1F5F8B] hover:underline">Change Password</button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px]">
              <div>
                <p className="text-[13px] font-semibold text-[#172B3A] flex items-center gap-1.5"><MonitorSmartphone className="w-4 h-4 text-[#52606D]" /> Device Sessions</p>
                <p className="text-[11px] text-[#52606D] mt-0.5">2 active devices connected</p>
              </div>
              <button className="text-[12px] font-medium text-[#B42318] hover:underline">Sign out all devices</button>
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#CBD5E1]">
          {saveStatus.msg && (
            <span className={`text-[13px] font-medium flex items-center gap-1.5 ${saveStatus.type === 'success' ? 'text-[#276749]' : 'text-[#B42318]'}`}>
              {saveStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {saveStatus.msg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#102A43] text-white px-6 py-2.5 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors border border-[#102A43] disabled:opacity-70 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
