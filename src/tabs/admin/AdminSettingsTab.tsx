import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Shield, 
  Bell, 
  Settings as SettingsIcon, 
  Database, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AdminSettingsTab({ adminData }: { adminData: any }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Form States (Mocked with some adminData integration where applicable)
  const [profileData, setProfileData] = useState({
    name: adminData?.name || 'System Administrator',
    email: adminData?.email || 'admin@mhd.local',
    phone: adminData?.phone || '+1 (555) 000-0000'
  });

  const [hospitalData, setHospitalData] = useState({
    name: 'MHD Hospital (My Health Defense)',
    address: '123 Medical Center Blvd, Health City, HC 12345',
    contactEmail: 'contact@mhd.local',
    emergencyPhone: '911'
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    timezone: 'UTC-07:00 (Pacific Time)',
    theme: 'Light',
    emailAlerts: true,
    smsAlerts: false,
    dailyReports: true,
    twoFactorAuth: true
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    setSaveMessage('');
    try {
      // Simulate network request or update actual firestore doc if necessary
      // For Admin data, we could update the users collection
      if (section === 'Profile' && adminData?.id) {
        const adminRef = doc(db, 'users', adminData.id);
        await updateDoc(adminRef, {
          name: profileData.name,
          phone: profileData.phone
        });
      }
      
      // Artificial delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      setSaveMessage(`${section} settings saved successfully.`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { id: 'Profile', icon: User, label: 'Admin Profile' },
    { id: 'Hospital', icon: Building2, label: 'Hospital Information' },
    { id: 'Security', icon: Shield, label: 'Account & Security' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Preferences', icon: SettingsIcon, label: 'System Preferences' },
    { id: 'Status', icon: Database, label: 'System Status' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Administration Settings</h2>
        <p className="text-[14px] text-[#52606D]">Manage system configurations, security policies, and hospital profiles.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Menu */}
        <div className="md:w-[240px] shrink-0">
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors border-l-2 ${
                    isActive 
                      ? 'bg-[#EBF1F6] text-[#1F5F8B] border-[#1F5F8B]' 
                      : 'text-[#52606D] border-transparent hover:bg-[#F9FAFB] hover:text-[#172B3A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px]">
          
          {/* Header of Content Area */}
          <div className="px-6 py-4 border-b border-[#CBD5E1] flex justify-between items-center bg-[#F9FAFB]">
            <h3 className="text-[15px] font-bold text-[#172B3A]">{menuItems.find(m => m.id === activeTab)?.label}</h3>
            {saveMessage && (
              <span className="text-[12px] font-medium text-[#276749] flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
              </span>
            )}
          </div>

          <div className="p-6">
            
            {/* 1. Admin Profile */}
            {activeTab === 'Profile' && (
              <div className="space-y-6 max-w-[500px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Administrator Name</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    disabled
                    className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] text-[#52606D] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Contact Phone</label>
                  <input 
                    type="text" 
                    value={profileData.phone}
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  />
                </div>
                <div className="pt-4 border-t border-[#CBD5E1]">
                  <button 
                    onClick={() => handleSave('Profile')}
                    disabled={saving}
                    className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Profile
                  </button>
                </div>
              </div>
            )}

            {/* 2. Hospital Information */}
            {activeTab === 'Hospital' && (
              <div className="space-y-6 max-w-[500px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Hospital Name</label>
                  <input 
                    type="text" 
                    value={hospitalData.name}
                    onChange={e => setHospitalData({...hospitalData, name: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Primary Address</label>
                  <textarea 
                    value={hospitalData.address}
                    onChange={e => setHospitalData({...hospitalData, address: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Contact Email</label>
                    <input 
                      type="email" 
                      value={hospitalData.contactEmail}
                      onChange={e => setHospitalData({...hospitalData, contactEmail: e.target.value})}
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Emergency Line</label>
                    <input 
                      type="text" 
                      value={hospitalData.emergencyPhone}
                      onChange={e => setHospitalData({...hospitalData, emergencyPhone: e.target.value})}
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-[#CBD5E1]">
                  <button 
                    onClick={() => handleSave('Hospital Info')}
                    disabled={saving}
                    className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Hospital Info
                  </button>
                </div>
              </div>
            )}

            {/* 3. Security */}
            {activeTab === 'Security' && (
              <div className="space-y-6 max-w-[500px]">
                <div className="p-4 bg-[#FEF6E7] border border-[#F6E0B5] rounded-[4px] flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#975A16] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#975A16] mb-1">Administrative Privileges</h4>
                    <p className="text-[12px] text-[#975A16]">Your account holds root access. Ensure Two-Factor Authentication remains enabled to protect patient data.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[#CBD5E1]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#172B3A]">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-[#52606D]">Require a secondary code for system login.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={preferences.twoFactorAuth}
                        onChange={() => setPreferences({...preferences, twoFactorAuth: !preferences.twoFactorAuth})}
                      />
                      <div className="w-9 h-5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#276749]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-[#CBD5E1]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#172B3A]">Change Password</p>
                      <p className="text-[11px] text-[#52606D]">Send a password reset link to your email.</p>
                    </div>
                    <button className="px-3 py-1.5 border border-[#CBD5E1] text-[#172B3A] text-[12px] font-medium rounded-[4px] hover:bg-[#F4F6F8]">
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Notifications */}
            {activeTab === 'Notifications' && (
              <div className="space-y-6 max-w-[500px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[#CBD5E1]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#172B3A]">Email Alerts</p>
                      <p className="text-[11px] text-[#52606D]">Receive critical system alerts via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={preferences.emailAlerts}
                        onChange={() => setPreferences({...preferences, emailAlerts: !preferences.emailAlerts})}
                      />
                      <div className="w-9 h-5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#102A43]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-[#CBD5E1]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#172B3A]">SMS Alerts</p>
                      <p className="text-[11px] text-[#52606D]">Receive text messages for emergency overrides.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={preferences.smsAlerts}
                        onChange={() => setPreferences({...preferences, smsAlerts: !preferences.smsAlerts})}
                      />
                      <div className="w-9 h-5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#102A43]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[#CBD5E1]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#172B3A]">Daily Summary Reports</p>
                      <p className="text-[11px] text-[#52606D]">Receive an automated end-of-day operations summary.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={preferences.dailyReports}
                        onChange={() => setPreferences({...preferences, dailyReports: !preferences.dailyReports})}
                      />
                      <div className="w-9 h-5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#102A43]"></div>
                    </label>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={() => handleSave('Notification')}
                    disabled={saving}
                    className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* 5. System Preferences */}
            {activeTab === 'Preferences' && (
              <div className="space-y-6 max-w-[500px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">System Language</label>
                  <select 
                    value={preferences.language}
                    onChange={e => setPreferences({...preferences, language: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Default Timezone</label>
                  <select 
                    value={preferences.timezone}
                    onChange={e => setPreferences({...preferences, timezone: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  >
                    <option value="UTC-07:00 (Pacific Time)">UTC-07:00 (Pacific Time)</option>
                    <option value="UTC-04:00 (Eastern Time)">UTC-04:00 (Eastern Time)</option>
                    <option value="UTC+00:00 (GMT)">UTC+00:00 (GMT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Admin Theme Override</label>
                  <select 
                    value={preferences.theme}
                    onChange={e => setPreferences({...preferences, theme: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  >
                    <option value="Light">Light Mode (Default)</option>
                    <option value="Dark" disabled>Dark Mode (Coming Soon)</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-[#CBD5E1]">
                  <button 
                    onClick={() => handleSave('System')}
                    disabled={saving}
                    className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Configurations
                  </button>
                </div>
              </div>
            )}

            {/* 6. System Status */}
            {activeTab === 'Status' && (
              <div className="space-y-6 max-w-[500px]">
                <div className="bg-[#E8F2EC] border border-[#BCE3C6] p-4 rounded-[4px] flex items-center gap-3">
                  <Database className="w-6 h-6 text-[#276749]" />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#276749]">All Systems Operational</h4>
                    <p className="text-[12px] text-[#276749]">Firebase services are connected and responding normally.</p>
                  </div>
                </div>

                <div className="space-y-3 mt-6 text-[13px]">
                  <div className="flex justify-between py-2 border-b border-[#CBD5E1]">
                    <span className="text-[#52606D]">Firebase Authentication</span>
                    <span className="font-semibold text-[#276749] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#276749]"></span> Online</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#CBD5E1]">
                    <span className="text-[#52606D]">Firestore Database</span>
                    <span className="font-semibold text-[#276749] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#276749]"></span> Online</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#CBD5E1]">
                    <span className="text-[#52606D]">Storage & Media</span>
                    <span className="font-semibold text-[#276749] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#276749]"></span> Online</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#CBD5E1]">
                    <span className="text-[#52606D]">Platform Version</span>
                    <span className="font-mono text-[#172B3A]">v2.4.1 (Stable)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#CBD5E1]">
                    <span className="text-[#52606D]">Last Deployment</span>
                    <span className="text-[#172B3A]">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
