import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserCircle, 
  Activity, 
  FileText, 
  Pill, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2,
  Save,
  Clock
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';



interface HealthInputTabProps {
  doctorData: any;
  setActiveTab?: (t: string) => void;
  globalSearchQuery?: string;
  setGlobalSearchQuery?: (s: string) => void;
}
export default function HealthInputTab({ doctorData, globalSearchQuery, setGlobalSearchQuery }: HealthInputTabProps) {
  const [localSearchId, setLocalSearchId] = useState('');
  const searchId = globalSearchQuery !== undefined ? globalSearchQuery : localSearchId;
  const setSearchId = (val: string) => {
     if (setGlobalSearchQuery) setGlobalSearchQuery(val);
     else setLocalSearchId(val);
  };
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'idle' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });

  useEffect(() => {
    if (searchId.trim() && !selectedPatient) {
      handleSearch();
    }
  }, []);

  const [formData, setFormData] = useState({
    vitals: { bp: '', hr: '', temp: '', spo2: '', weight: '' },
    assessment: { symptoms: '', diagnosis: '', notes: '' },
    medications: '',
    allergies: '',
    plan: { treatment: '', followUp: '' }
  });

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSelectedPatient(null);
    setSaveStatus({ type: 'idle', msg: '' });

    try {
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'patient'), 
        where('mhdId', '==', searchId.trim().toUpperCase())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setSearchError(`No patient found with ID: ${searchId.toUpperCase()}`);
      } else {
        const pDoc = snapshot.docs[0];
        setSelectedPatient({ uid: pDoc.id, ...pDoc.data() });
        // Reset form data on new patient
        setFormData({
          vitals: { bp: '', hr: '', temp: '', spo2: '', weight: '' },
          assessment: { symptoms: '', diagnosis: '', notes: '' },
          medications: '',
          allergies: '',
          plan: { treatment: '', followUp: '' }
        });
      }
    } catch (err) {
      console.error(err);
      setSearchError('An error occurred while searching for the patient.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setSearchId('');
    setSearchError('');
    setSaveStatus({ type: 'idle', msg: '' });
  };

  const handleSaveRecord = async () => {
    if (!selectedPatient || !auth.currentUser) return;
    
    setIsSaving(true);
    setSaveStatus({ type: 'idle', msg: '' });

    try {
      await addDoc(collection(db, 'clinical_records'), {
        patientId: selectedPatient.uid,
        patientMhdId: selectedPatient.mhdId,
        doctorId: auth.currentUser.uid,
        doctorName: doctorData?.name || 'Unknown',
        doctorMhdId: doctorData?.mhdId || 'Unknown',
        recordType: 'encounter',
        data: formData,
        timestamp: serverTimestamp(),
      });

      setSaveStatus({ type: 'success', msg: 'Clinical record saved securely to patient file.' });
      
      // Optionally scroll to top or reset form
      setTimeout(() => {
        setSaveStatus({ type: 'idle', msg: '' });
      }, 5000);

    } catch (err) {
      console.error("Error saving record:", err);
      setSaveStatus({ type: 'error', msg: 'Failed to save clinical record. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-3 flex items-center gap-2">
      <Icon className="w-4 h-4 text-[#102A43]" />
      <h3 className="text-[14px] font-semibold text-[#172B3A]">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Health Input Workspace</h2>
        <p className="text-[14px] text-[#52606D]">Record clinical encounters, vitals, and treatment plans directly into the patient's secure file.</p>
      </div>

      {/* Search / Context Bar */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 shadow-sm">
        {!selectedPatient ? (
          <div className="max-w-[500px]">
            <h3 className="text-[14px] font-semibold text-[#172B3A] mb-3">Select Patient Context</h3>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#52606D]" />
                </div>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Patient ID (e.g., P-001)"
                  className="block w-full pl-10 pr-3 py-2 border border-[#CBD5E1] rounded-[4px] text-[13px] bg-[#F4F6F8] focus:outline-none focus:ring-1 focus:ring-[#1F5F8B] focus:border-[#1F5F8B] text-[#172B3A]"
                  disabled={isSearching}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchId.trim()}
                className="bg-[#102A43] text-white px-5 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors border border-[#102A43] disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
                Load Chart
              </button>
            </form>
            {searchError && (
              <div className="mt-3 flex items-center gap-2 text-[#B42318] bg-[#FEF2F2] p-2 rounded-[4px] border border-[#FCA5A5]">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[12px] font-medium">{searchError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EBF1F6] border border-[#CBD5E1] rounded-full flex items-center justify-center shrink-0">
                <UserCircle className="w-7 h-7 text-[#1F5F8B]" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider mb-0.5">Active Patient Context</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-[18px] font-bold text-[#172B3A] leading-none">{selectedPatient.name}</h3>
                  <span className="bg-[#E8F2EC] text-[#276749] text-[11px] px-2 py-0.5 rounded-[4px] font-bold uppercase border border-[#BCE3C6]">
                    {selectedPatient.mhdId}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={clearPatient}
              className="text-[12px] font-medium text-[#52606D] hover:text-[#172B3A] bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] hover:bg-[#F4F6F8] transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Close Chart
            </button>
          </div>
        )}
      </div>

      {/* Clinical Form - Only visible if patient is selected */}
      {selectedPatient && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Vitals */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
            <SectionHeader icon={Activity} title="Vital Signs" />
            <div className="p-5 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1.5">BP (mmHg)</label>
                <input 
                  type="text" 
                  placeholder="120/80" 
                  value={formData.vitals.bp}
                  onChange={e => setFormData({...formData, vitals: {...formData.vitals, bp: e.target.value}})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1.5">HR (bpm)</label>
                <input 
                  type="number" 
                  placeholder="72" 
                  value={formData.vitals.hr}
                  onChange={e => setFormData({...formData, vitals: {...formData.vitals, hr: e.target.value}})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1.5">Temp (°C)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="37.0" 
                  value={formData.vitals.temp}
                  onChange={e => setFormData({...formData, vitals: {...formData.vitals, temp: e.target.value}})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1.5">SpO2 (%)</label>
                <input 
                  type="number" 
                  placeholder="98" 
                  value={formData.vitals.spo2}
                  onChange={e => setFormData({...formData, vitals: {...formData.vitals, spo2: e.target.value}})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1.5">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="70.5" 
                  value={formData.vitals.weight}
                  onChange={e => setFormData({...formData, vitals: {...formData.vitals, weight: e.target.value}})}
                  className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment & Diagnosis */}
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden flex flex-col">
              <SectionHeader icon={FileText} title="Clinical Assessment" />
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Chief Complaint / Symptoms</label>
                  <textarea 
                    rows={2}
                    placeholder="Describe patient symptoms..."
                    value={formData.assessment.symptoms}
                    onChange={e => setFormData({...formData, assessment: {...formData.assessment, symptoms: e.target.value}})}
                    className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Primary Diagnosis</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Acute Bronchitis (J20.9)"
                    value={formData.assessment.diagnosis}
                    onChange={e => setFormData({...formData, assessment: {...formData.assessment, diagnosis: e.target.value}})}
                    className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Clinical Notes</label>
                  <textarea 
                    rows={4}
                    placeholder="Detailed examination notes..."
                    value={formData.assessment.notes}
                    onChange={e => setFormData({...formData, assessment: {...formData.assessment, notes: e.target.value}})}
                    className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Meds, Allergies & Plan */}
            <div className="space-y-6">
              
              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
                <SectionHeader icon={Pill} title="Medications & Allergies" />
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">New Prescriptions</label>
                    <textarea 
                      rows={2}
                      placeholder="Medication name, dosage, frequency..."
                      value={formData.medications}
                      onChange={e => setFormData({...formData, medications: e.target.value})}
                      className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-[#975A16]" /> Updated Allergies
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g., Penicillin, Latex"
                      value={formData.allergies}
                      onChange={e => setFormData({...formData, allergies: e.target.value})}
                      className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
                <SectionHeader icon={ClipboardList} title="Care Plan & Follow-up" />
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Treatment Plan / Orders</label>
                    <textarea 
                      rows={2}
                      placeholder="Orders for labs, imaging, or therapy..."
                      value={formData.plan.treatment}
                      onChange={e => setFormData({...formData, plan: {...formData.plan, treatment: e.target.value}})}
                      className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Follow-up Instructions</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Return to clinic in 2 weeks"
                      value={formData.plan.followUp}
                      onChange={e => setFormData({...formData, plan: {...formData.plan, followUp: e.target.value}})}
                      className="w-full bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#52606D]" />
              <div>
                <p className="text-[13px] font-semibold text-[#172B3A]">Ready to save encounter</p>
                <p className="text-[11px] text-[#52606D]">Record will be securely time-stamped and signed by {doctorData?.name ? `Dr. ${doctorData.name}` : 'you'}.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {saveStatus.msg && (
                <span className={`text-[12px] font-medium flex items-center gap-1.5 ${saveStatus.type === 'success' ? 'text-[#276749]' : 'text-[#B42318]'}`}>
                  {saveStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {saveStatus.msg}
                </span>
              )}
              
              <button
                onClick={handleSaveRecord}
                disabled={isSaving}
                className="w-full sm:w-auto bg-[#102A43] text-white px-6 py-2.5 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors border border-[#102A43] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Clinical Record
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
