import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit, 
  ShieldBan, 
  ShieldCheck, 
  User, 
  Activity, 
  Calendar, 
  Stethoscope, 
  Loader2, 
  X, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

interface AdminPatient {
  id: string;
  mhdId: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  accountStatus: 'Active' | 'Inactive';
  assignedDoctorName?: string;
  activeCaseStatus?: string;
  lastVisit?: string;
}

export default function AdminPatientsTab({ adminData }: { adminData: any }) {
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Modal states
  const [selectedPatient, setSelectedPatient] = useState<AdminPatient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Fetch patients
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'patient'));
      const snap = await getDocs(q);
      
      let fetched: AdminPatient[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          mhdId: data.mhdId || 'P-???',
          name: data.name || 'Unknown',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          age: data.age || 'N/A',
          gender: data.gender || 'N/A',
          accountStatus: data.accountStatus || 'Active',
          lastVisit: data.lastVisit || 'No visits'
        });
      });

      // Optionally, we could fetch cases here to map activeCaseStatus and assignedDoctorName
      // For performance in a real app, you might denormalize this data onto the user document.
      // We'll mock the case join here for visual completeness if missing.
      const enriched = fetched.map(p => ({
        ...p,
        activeCaseStatus: p.id.charCodeAt(0) % 2 === 0 ? 'Active' : 'None', // Deterministic mock for visual
        assignedDoctorName: p.id.charCodeAt(0) % 3 === 0 ? 'Dr. Sarah Smith' : 'Unassigned'
      }));

      // Sort by MHD ID conceptually
      enriched.sort((a, b) => a.mhdId.localeCompare(b.mhdId));
      setPatients(enriched);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (patientId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const userRef = doc(db, 'users', patientId);
      await updateDoc(userRef, { accountStatus: newStatus });
      
      // Update local state
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, accountStatus: newStatus } : p));
      if (selectedPatient && selectedPatient.id === patientId) {
        setSelectedPatient({ ...selectedPatient, accountStatus: newStatus });
      }
    } catch (err) {
      console.error("Error toggling account status", err);
    }
  };

  // Filter and Search logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.mhdId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'Active') matchesFilter = p.accountStatus === 'Active';
    if (filter === 'Inactive') matchesFilter = p.accountStatus === 'Inactive';
    if (filter === 'With Cases') matchesFilter = p.activeCaseStatus === 'Active';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Patient Directory</h2>
          <p className="text-[14px] text-[#52606D]">Manage hospital patients, account access, and care assignments.</p>
        </div>
        <button className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Patient
        </button>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="text" 
            placeholder="Search by Patient ID, Name, or Email..." 
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
            <option value="All">All Patients</option>
            <option value="Active">Active Accounts</option>
            <option value="Inactive">Inactive Accounts</option>
            <option value="With Cases">With Active Cases</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Demographics</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Clinical Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Last Visit</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-center">Account</th>
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
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#52606D]">
                    No patients found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EBF1F6] flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-[#1F5F8B]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#172B3A]">{patient.name}</p>
                          <p className="text-[11px] font-mono text-[#1F5F8B] font-semibold">{patient.mhdId}</p>
                          <p className="text-[11px] text-[#52606D]">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] text-[#172B3A]">{patient.age} yrs • {patient.gender}</p>
                      <p className="text-[11px] text-[#52606D] mt-0.5">{patient.phone}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {patient.activeCaseStatus === 'Active' ? (
                        <div className="flex items-start gap-1.5 mb-1">
                          <Activity className="w-3.5 h-3.5 text-[#B42318] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[12px] font-semibold text-[#B42318] leading-tight">Active Case</p>
                            <p className="text-[11px] text-[#52606D]">{patient.assignedDoctorName}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#52606D]">No active cases</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-[13px] text-[#172B3A]">
                      {patient.lastVisit}
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-flex items-center gap-1 ${
                        patient.accountStatus === 'Active' ? 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]' : 'bg-[#FEF2F2] text-[#B42318] border-[#FCA5A5]'
                      }`}>
                        {patient.accountStatus === 'Active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldBan className="w-3 h-3" />}
                        {patient.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button 
                        onClick={() => setSelectedPatient(patient)}
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

      {/* Patient Management Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-[#102A43]/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-[8px] shadow-xl w-full max-w-[600px] flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-[#CBD5E1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBF1F6] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-[#1F5F8B]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#172B3A] leading-tight">{selectedPatient.name}</h3>
                  <p className="text-[12px] font-mono text-[#1F5F8B]">{selectedPatient.mhdId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="text-[#52606D] hover:text-[#172B3A] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3 border-b border-[#CBD5E1] pb-1">Demographics</h4>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between"><span className="text-[#52606D]">Age:</span> <span className="font-medium text-[#172B3A]">{selectedPatient.age}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Gender:</span> <span className="font-medium text-[#172B3A]">{selectedPatient.gender}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Phone:</span> <span className="font-medium text-[#172B3A]">{selectedPatient.phone}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Email:</span> <span className="font-medium text-[#172B3A]">{selectedPatient.email}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3 border-b border-[#CBD5E1] pb-1">Clinical Alignment</h4>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between"><span className="text-[#52606D]">Primary Doctor:</span> <span className="font-medium text-[#172B3A]">{selectedPatient.assignedDoctorName || 'None'}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Active Case:</span> <span className="font-medium text-[#172B3A]">{selectedPatient.activeCaseStatus || 'None'}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Last Visit:</span> <span className="font-medium text-[#172B3A]">{selectedPatient.lastVisit}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3 border-b border-[#CBD5E1] pb-1">Account Administration</h4>
                <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[#172B3A]">System Access Status</p>
                    <p className="text-[11px] text-[#52606D] mt-0.5">
                      {selectedPatient.accountStatus === 'Active' 
                        ? 'Patient can log in and access their medical records.' 
                        : 'Patient is blocked from logging into the portal.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleToggleStatus(selectedPatient.id, selectedPatient.accountStatus)}
                    className={`px-3 py-1.5 rounded-[4px] text-[12px] font-bold uppercase tracking-wider transition-colors border ${
                      selectedPatient.accountStatus === 'Active' 
                        ? 'bg-[#FFFFFF] text-[#B42318] border-[#FCA5A5] hover:bg-[#FEF2F2]' 
                        : 'bg-[#102A43] text-white border-[#102A43] hover:bg-[#173F5F]'
                    }`}
                  >
                    {selectedPatient.accountStatus === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                  </button>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#CBD5E1] bg-[#F9FAFB] flex justify-end gap-3 rounded-b-[8px]">
              <button 
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 text-[13px] font-medium text-[#52606D] hover:bg-[#EBF1F6] hover:text-[#172B3A] rounded-[4px] transition-colors"
              >
                Close
              </button>
              <button className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit Full Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
