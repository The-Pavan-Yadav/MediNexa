import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Loader2, 
  X, 
  ChevronRight,
  Activity,
  Calendar,
  User,
  Stethoscope,
  Clock,
  History,
  Save,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

interface AdminCase {
  id: string;
  patientId: string;
  patientName: string;
  assignedDoctorId: string;
  assignedDoctor: string;
  condition: string;
  priority: string;
  status: string;
  date: string;
  updatedAt?: string;
  notes?: string;
}

interface DoctorMin {
  id: string;
  name: string;
}

export default function AdminCasesTab({ adminData }: { adminData: any }) {
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [doctors, setDoctors] = useState<DoctorMin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Modal states
  const [selectedCase, setSelectedCase] = useState<AdminCase | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editDoctorId, setEditDoctorId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch cases
      const casesRef = collection(db, 'cases');
      const snap = await getDocs(casesRef);
      let fetchedCases: AdminCase[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        fetchedCases.push({
          id: docSnap.id,
          patientId: data.patientId || 'P-UNKNOWN',
          patientName: data.patientName || 'Unknown Patient',
          assignedDoctorId: data.assignedDoctorId || '',
          assignedDoctor: data.assignedDoctor || 'Unassigned',
          condition: data.condition || 'Not specified',
          priority: data.priority || 'Medium',
          status: data.status || 'Waiting',
          date: data.date || new Date().toISOString().split('T')[0],
          updatedAt: data.updatedAt || data.date,
          notes: data.notes || ''
        });
      });

      // Sort by most recent updated date
      fetchedCases.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      setCases(fetchedCases);

      // Fetch doctors for reassignment dropdown
      const usersRef = collection(db, 'users');
      const docsQ = query(usersRef, where('role', '==', 'doctor'));
      const docsSnap = await getDocs(docsQ);
      let fetchedDocs: DoctorMin[] = [];
      docsSnap.forEach(d => {
        fetchedDocs.push({ id: d.id, name: d.data().name || 'Unknown Doctor' });
      });
      setDoctors(fetchedDocs);

    } catch (err) {
      console.error("Error fetching cases or doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCase = (c: AdminCase) => {
    setSelectedCase(c);
    setEditStatus(c.status);
    setEditDoctorId(c.assignedDoctorId);
  };

  const handleSaveChanges = async () => {
    if (!selectedCase) return;
    setSaving(true);
    try {
      const caseRef = doc(db, 'cases', selectedCase.id);
      
      const newDoctor = doctors.find(d => d.id === editDoctorId);
      const updatedData = {
        status: editStatus,
        assignedDoctorId: editDoctorId,
        assignedDoctor: newDoctor ? newDoctor.name : 'Unassigned',
        updatedAt: new Date().toISOString()
      };

      await updateDoc(caseRef, updatedData);
      
      // Update local state
      setCases(prev => prev.map(c => 
        c.id === selectedCase.id ? { ...c, ...updatedData } : c
      ));
      setSelectedCase(null);
    } catch (err) {
      console.error("Error updating case:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.condition.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'Active') matchesFilter = c.status === 'Active';
    if (filter === 'Waiting') matchesFilter = c.status === 'Waiting';
    if (filter === 'Reviewed') matchesFilter = c.status === 'Reviewed';
    if (filter === 'Closed') matchesFilter = c.status === 'Closed';
    if (filter === 'High Priority') matchesFilter = c.priority === 'High';

    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-[#B42318] bg-[#FEF2F2] border-[#FCA5A5]';
      case 'Medium': return 'text-[#975A16] bg-[#FEF6E7] border-[#F6E0B5]';
      case 'Low': return 'text-[#276749] bg-[#E8F2EC] border-[#BCE3C6]';
      default: return 'text-[#52606D] bg-[#F4F6F8] border-[#CBD5E1]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-[#1F5F8B] bg-[#EBF1F6] border-[#B8D4E8]';
      case 'Waiting': return 'text-[#975A16] bg-[#FEF6E7] border-[#F6E0B5]';
      case 'Reviewed': return 'text-[#553C9A] bg-[#FAF5FF] border-[#E9D8FD]';
      case 'Closed': return 'text-[#52606D] bg-[#F4F6F8] border-[#CBD5E1]';
      default: return 'text-[#52606D] bg-[#FFFFFF] border-[#CBD5E1]';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Clinical Cases</h2>
          <p className="text-[14px] text-[#52606D]">Global oversight of hospital cases, assignments, and statuses.</p>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="text" 
            placeholder="Search by Case ID, Patient, or Diagnosis..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-[160px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none"
          >
            <option value="All">All Cases</option>
            <option value="Active">Active</option>
            <option value="Waiting">Waiting</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Closed">Closed</option>
            <option value="High Priority">High Priority</option>
          </select>
        </div>
      </div>

      {/* Case Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Case Info</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Diagnosis</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Assignment</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Timeline</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-center">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1F5F8B] mx-auto mb-2" />
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#52606D]">
                    No cases found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-[4px] bg-[#EBF1F6] flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-[#1F5F8B]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#172B3A]">{c.patientName}</p>
                          <p className="text-[11px] font-mono text-[#1F5F8B]">{c.patientId}</p>
                          <p className="text-[10px] text-[#52606D] font-mono mt-0.5" title={c.id}>ID: {c.id.substring(0,6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] text-[#172B3A] font-medium line-clamp-1">{c.condition}</p>
                      <div className="mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-flex items-center ${getPriorityColor(c.priority)}`}>
                          {c.priority} Priority
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#52606D]" />
                        <p className="text-[13px] text-[#172B3A]">{c.assignedDoctor}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[12px] text-[#172B3A] flex items-center gap-1 mb-0.5">
                        <Calendar className="w-3 h-3 text-[#52606D]" /> 
                        {new Date(c.date).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-[#52606D] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'No updates'}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-flex items-center ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button 
                        onClick={() => handleOpenCase(c)}
                        className="text-[12px] font-medium text-[#1F5F8B] hover:underline inline-flex items-center gap-1"
                      >
                        Manage <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Management Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-[#102A43]/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-[8px] shadow-xl w-full max-w-[700px] flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-[#CBD5E1] bg-[#F9FAFB] rounded-t-[8px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#102A43] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#172B3A] leading-tight">Admin Case Review</h3>
                  <p className="text-[12px] font-mono text-[#52606D]">CASE: {selectedCase.id.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                className="text-[#52606D] hover:text-[#172B3A] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Clinical Snapshot */}
              <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-4">
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3">Clinical Snapshot</h4>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <span className="text-[#52606D] block mb-1">Patient:</span>
                    <span className="font-semibold text-[#172B3A] flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#1F5F8B]" /> {selectedCase.patientName} ({selectedCase.patientId})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#52606D] block mb-1">Primary Diagnosis/Condition:</span>
                    <span className="font-semibold text-[#172B3A] flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#1F5F8B]" /> {selectedCase.condition}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#52606D] block mb-1">Clinical Notes:</span>
                    <div className="bg-[#FFFFFF] border border-[#CBD5E1] p-3 rounded-[4px] text-[13px] text-[#172B3A] min-h-[60px] whitespace-pre-wrap">
                      {selectedCase.notes || 'No clinical notes recorded.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Administration Controls */}
              <div>
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3 border-b border-[#CBD5E1] pb-1">Case Administration</h4>
                
                <div className="grid grid-cols-2 gap-6 mt-4">
                  
                  {/* Status Assignment */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Case Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="Active">Active</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Doctor Assignment */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Assigned Physician</label>
                    <select 
                      value={editDoctorId}
                      onChange={(e) => setEditDoctorId(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                    >
                      <option value="">Unassigned</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Audit Warning */}
                <div className="mt-4 flex items-start gap-2 text-[11px] text-[#52606D] bg-[#FEF6E7] border border-[#F6E0B5] p-3 rounded-[4px]">
                  <AlertCircle className="w-4 h-4 text-[#975A16] shrink-0" />
                  <p>
                    Reassigning a case or altering its status will immediately update the respective doctor and patient portals. This action is logged in the system audit trail.
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#CBD5E1] bg-[#F9FAFB] flex justify-end gap-3 rounded-b-[8px]">
              <button 
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 text-[13px] font-medium text-[#52606D] hover:bg-[#EBF1F6] hover:text-[#172B3A] rounded-[4px] transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
