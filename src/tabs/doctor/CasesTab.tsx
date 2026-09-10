import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowLeft,
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Activity, 
  Pill, 
  Calendar,
  Save,
  Loader2,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';

interface CaseType {
  id: string;
  patientId: string;
  patientMhdId: string;
  patientName: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'New' | 'Waiting' | 'Active' | 'Reviewed' | 'Closed';
  symptoms: string;
  diagnosis: string;
  assignedDoctorId: string;
  assignedDoctorName: string;
  lastUpdated?: any;
  notes: string;
  medicines: string;
  treatment: string;
  testRequests: string;
  followUpDate: string;
}

export default function CasesTab({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: any, globalSearchQuery?: any, setGlobalSearchQuery?: any }) {
  const [cases, setCases] = useState<CaseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
  const [editForm, setEditForm] = useState<Partial<CaseType>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'idle' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });

  const fetchCases = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'));
      const snapshot = await getDocs(q);
      
      let fetchedCases: CaseType[] = [];
      snapshot.forEach(docSnap => {
        fetchedCases.push({ id: docSnap.id, ...docSnap.data() } as CaseType);
      });

      

      setCases(fetchedCases);
    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOpenCase = (c: CaseType) => {
    setSelectedCase(c);
    setEditForm({
      diagnosis: c.diagnosis || '',
      notes: c.notes || '',
      medicines: c.medicines || '',
      treatment: c.treatment || '',
      testRequests: c.testRequests || '',
      followUpDate: c.followUpDate || '',
      status: c.status
    });
    setSaveStatus({ type: 'idle', msg: '' });
  };

  const handleUpdateCase = async () => {
    if (!selectedCase) return;
    setIsSaving(true);
    setSaveStatus({ type: 'idle', msg: '' });

    try {
      const caseRef = doc(db, 'cases', selectedCase.id);
      await updateDoc(caseRef, {
        ...editForm,
        lastUpdated: serverTimestamp()
      });

      // Update local state
      setCases(cases.map(c => c.id === selectedCase.id ? { ...c, ...editForm } as CaseType : c));
      setSaveStatus({ type: 'success', msg: 'Case updated successfully.' });
      
      setTimeout(() => {
        setSaveStatus({ type: 'idle', msg: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus({ type: 'error', msg: 'Failed to update case.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-[#EBF1F6] text-[#1F5F8B] border-[#90CDF4]';
      case 'Waiting': return 'bg-[#FEF6E7] text-[#975A16] border-[#F6E0B5]';
      case 'Active': return 'bg-[#EBF1F6] text-[#1F5F8B] border-[#90CDF4]';
      case 'Reviewed': return 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]';
      case 'Closed': return 'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]';
      default: return 'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-[#B42318] bg-[#FEF2F2] border-[#FCA5A5]';
      case 'Medium': return 'text-[#975A16] bg-[#FEF6E7] border-[#F6E0B5]';
      case 'Low': return 'text-[#52606D] bg-[#F4F6F8] border-[#CBD5E1]';
      default: return 'text-[#52606D] bg-[#F4F6F8] border-[#CBD5E1]';
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.patientMhdId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (selectedCase) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300 pb-12">
        {/* Detail View Header */}
        <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#CBD5E1] p-4 rounded-[4px] shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedCase(null)}
              className="w-8 h-8 flex items-center justify-center rounded-[4px] border border-[#CBD5E1] hover:bg-[#F4F6F8] transition-colors text-[#52606D]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-[18px] font-bold text-[#172B3A] leading-none">{selectedCase.patientName}</h2>
                <span className="bg-[#102A43] text-white text-[11px] px-2 py-0.5 rounded-[4px] font-bold uppercase">
                  {selectedCase.patientMhdId}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border ${getPriorityColor(selectedCase.priority)}`}>
                  {selectedCase.priority} Priority
                </span>
              </div>
              <p className="text-[12px] text-[#52606D]">Case opened: {selectedCase.date} • Assigned to: {selectedCase.assignedDoctorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <label className="text-[10px] font-bold text-[#52606D] uppercase tracking-wider mb-1">Update Status</label>
              <select 
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                className={`text-[12px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[4px] border outline-none cursor-pointer ${getStatusColor(editForm.status || 'New')}`}
              >
                <option value="New">New</option>
                <option value="Waiting">Waiting</option>
                <option value="Active">Active</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Notes & Assessment */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden flex flex-col">
              <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#102A43]" />
                <h3 className="text-[14px] font-semibold text-[#172B3A]">Clinical Assessment</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#52606D] uppercase tracking-wider mb-1.5">Reported Symptoms</label>
                  <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-3 text-[13px] text-[#172B3A]">
                    {selectedCase.symptoms || 'No symptoms recorded.'}
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Working Diagnosis</label>
                  <input 
                    type="text" 
                    value={editForm.diagnosis}
                    onChange={(e) => setEditForm({...editForm, diagnosis: e.target.value})}
                    placeholder="Enter primary diagnosis..."
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Clinical Notes (History & Physical)</label>
                  <textarea 
                    rows={6}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Document examination findings, history of present illness..."
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] resize-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Plan & Meds */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
              <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#102A43]" />
                <h3 className="text-[14px] font-semibold text-[#172B3A]">Treatment & Meds</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Medicines Prescribed</label>
                  <textarea 
                    rows={3}
                    value={editForm.medicines}
                    onChange={(e) => setEditForm({...editForm, medicines: e.target.value})}
                    placeholder="Medication names, dosage..."
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Treatment Plan</label>
                  <textarea 
                    rows={3}
                    value={editForm.treatment}
                    onChange={(e) => setEditForm({...editForm, treatment: e.target.value})}
                    placeholder="Non-pharmacological treatment, therapies..."
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
              <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#102A43]" />
                <h3 className="text-[14px] font-semibold text-[#172B3A]">Labs & Follow-up</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Test Requests / Results</label>
                  <textarea 
                    rows={2}
                    value={editForm.testRequests}
                    onChange={(e) => setEditForm({...editForm, testRequests: e.target.value})}
                    placeholder="Requested labs, imaging..."
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#172B3A] mb-1.5">Follow-up Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
                    <input 
                      type="date" 
                      value={editForm.followUpDate}
                      onChange={(e) => setEditForm({...editForm, followUpDate: e.target.value})}
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="bg-[#102A43] rounded-[4px] p-4 flex items-center justify-between shadow-lg sticky bottom-6 z-10">
          <div className="flex items-center gap-3 text-white">
            <Clock className="w-5 h-5 text-[#CBD5E1]" />
            <div>
              <p className="text-[13px] font-semibold">Ready to update case record</p>
              <p className="text-[11px] text-[#CBD5E1]">Modifications will be timestamped and logged.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {saveStatus.msg && (
              <span className={`text-[13px] font-medium flex items-center gap-1.5 ${saveStatus.type === 'success' ? 'text-[#48BB78]' : 'text-[#FCA5A5]'}`}>
                {saveStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {saveStatus.msg}
              </span>
            )}
            
            <button
              onClick={handleUpdateCase}
              disabled={isSaving}
              className="bg-[#FFFFFF] text-[#102A43] px-6 py-2 rounded-[4px] text-[13px] font-bold hover:bg-[#F4F6F8] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Case Updates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Clinical Cases</h2>
          <p className="text-[14px] text-[#52606D]">Manage and review active patient cases, diagnoses, and treatment plans.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[220px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-[140px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] appearance-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Waiting">Waiting</option>
              <option value="Active">Active</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full sm:w-[130px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Date & Priority</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Clinical Summary</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1F5F8B] mx-auto mb-2" />
                    <p className="text-[13px] text-[#52606D]">Loading cases...</p>
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-[14px] font-medium text-[#172B3A] mb-1">No cases found</p>
                    <p className="text-[13px] text-[#52606D]">Adjust your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-4 py-4 align-top">
                      <p className="text-[14px] font-semibold text-[#172B3A] leading-tight">{c.patientName}</p>
                      <p className="text-[11px] text-[#52606D] font-mono mt-0.5">{c.patientMhdId}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-[13px] font-medium text-[#172B3A]">{c.date}</p>
                      <div className="mt-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-block ${getPriorityColor(c.priority)}`}>
                          {c.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top max-w-[300px]">
                      <p className="text-[12px] text-[#172B3A] font-semibold truncate mb-1">
                        <span className="text-[#52606D] font-normal mr-1">Dx:</span> 
                        {c.diagnosis || 'Pending Diagnosis'}
                      </p>
                      <p className="text-[12px] text-[#52606D] line-clamp-2 leading-relaxed">
                        <span className="font-semibold text-[#52606D] mr-1">Sx:</span>
                        {c.symptoms}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-[4px] border inline-block ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-[#52606D]" />
                        <p className="text-[13px] text-[#172B3A]">{c.assignedDoctorName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <button 
                        onClick={() => handleOpenCase(c)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] hover:bg-[#F4F6F8] transition-colors"
                      >
                        Review <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
