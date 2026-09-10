import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  ShieldBan, 
  ShieldCheck, 
  Stethoscope, 
  Loader2, 
  X, 
  ChevronRight,
  Clock,
  UserCheck,
  Building2
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

interface AdminDoctor {
  id: string;
  mhdId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  regNumber: string;
  assignedPatients: number;
  dutyStatus: string;
  joinDate: string;
  accountStatus: 'Active' | 'Inactive';
}

export default function AdminDoctorsTab({ adminData }: { adminData: any }) {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState<AdminDoctor | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'doctor'));
      const snap = await getDocs(q);
      
      let fetched: AdminDoctor[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          mhdId: data.mhdId || `D-${docSnap.id.substring(0,4).toUpperCase()}`,
          name: data.name || 'Unknown Doctor',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          specialization: data.specialization || 'General Medicine',
          department: data.department || 'Outpatient',
          regNumber: data.regNumber || 'MD-TBD',
          assignedPatients: data.assignedPatients || Math.floor(Math.random() * 40), // Fallback mock
          dutyStatus: data.dutyStatus || 'On Duty',
          joinDate: data.joinDate || 'Recent',
          accountStatus: data.accountStatus || 'Active'
        });
      });

      fetched.sort((a, b) => a.mhdId.localeCompare(b.mhdId));
      setDoctors(fetched);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (doctorId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const userRef = doc(db, 'users', doctorId);
      await updateDoc(userRef, { accountStatus: newStatus });
      
      setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, accountStatus: newStatus } : d));
      if (selectedDoctor && selectedDoctor.id === doctorId) {
        setSelectedDoctor({ ...selectedDoctor, accountStatus: newStatus });
      }
    } catch (err) {
      console.error("Error toggling account status", err);
    }
  };

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.mhdId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'Active') matchesFilter = d.accountStatus === 'Active';
    if (filter === 'Inactive') matchesFilter = d.accountStatus === 'Inactive';
    if (filter === 'Available') matchesFilter = d.dutyStatus === 'On Duty';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Medical Staff Directory</h2>
          <p className="text-[14px] text-[#52606D]">Manage hospital doctors, department assignments, and access control.</p>
        </div>
        <button className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Doctor
        </button>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="text" 
            placeholder="Search by Doctor ID, Name, or Specialization..." 
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
            <option value="All">All Doctors</option>
            <option value="Available">Available (On Duty)</option>
            <option value="Active">Active Accounts</option>
            <option value="Inactive">Inactive Accounts</option>
          </select>
        </div>
      </div>

      {/* Doctor Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Physician</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Clinical Details</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Current Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-center">Patients</th>
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
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#52606D]">
                    No doctors found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EBF1F6] flex items-center justify-center shrink-0 mt-0.5">
                          <Stethoscope className="w-4 h-4 text-[#1F5F8B]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#172B3A]">{doc.name}</p>
                          <p className="text-[11px] font-mono text-[#1F5F8B] font-semibold">{doc.mhdId}</p>
                          <p className="text-[11px] text-[#52606D]">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] text-[#172B3A] font-medium">{doc.specialization}</p>
                      <p className="text-[11px] text-[#52606D] mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {doc.department}
                      </p>
                      <p className="text-[10px] text-[#52606D] mt-0.5 font-mono">REG: {doc.regNumber}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${doc.dutyStatus === 'On Duty' ? 'text-[#276749]' : 'text-[#975A16]'}`} />
                        <div>
                          <p className={`text-[12px] font-semibold leading-tight ${doc.dutyStatus === 'On Duty' ? 'text-[#276749]' : 'text-[#975A16]'}`}>
                            {doc.dutyStatus}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <div className="inline-flex items-center justify-center bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-2 py-1 min-w-[40px]">
                        <span className="text-[13px] font-bold text-[#172B3A]">{doc.assignedPatients}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-flex items-center gap-1 ${
                        doc.accountStatus === 'Active' ? 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]' : 'bg-[#FEF2F2] text-[#B42318] border-[#FCA5A5]'
                      }`}>
                        {doc.accountStatus === 'Active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldBan className="w-3 h-3" />}
                        {doc.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button 
                        onClick={() => setSelectedDoctor(doc)}
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

      {/* Doctor Management Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-[#102A43]/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-[8px] shadow-xl w-full max-w-[600px] flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-[#CBD5E1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBF1F6] flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5 text-[#1F5F8B]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#172B3A] leading-tight">{selectedDoctor.name}</h3>
                  <p className="text-[12px] font-mono text-[#1F5F8B]">{selectedDoctor.mhdId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="text-[#52606D] hover:text-[#172B3A] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3 border-b border-[#CBD5E1] pb-1">Professional Identity</h4>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between"><span className="text-[#52606D]">Specialization:</span> <span className="font-medium text-[#172B3A]">{selectedDoctor.specialization}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Department:</span> <span className="font-medium text-[#172B3A]">{selectedDoctor.department}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Reg Number:</span> <span className="font-medium text-[#172B3A]">{selectedDoctor.regNumber}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Join Date:</span> <span className="font-medium text-[#172B3A]">{selectedDoctor.joinDate}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3 border-b border-[#CBD5E1] pb-1">Contact & Status</h4>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between"><span className="text-[#52606D]">Email:</span> <span className="font-medium text-[#172B3A] truncate max-w-[140px]" title={selectedDoctor.email}>{selectedDoctor.email}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Phone:</span> <span className="font-medium text-[#172B3A]">{selectedDoctor.phone}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Duty Status:</span> <span className="font-medium text-[#172B3A]">{selectedDoctor.dutyStatus}</span></div>
                    <div className="flex justify-between"><span className="text-[#52606D]">Active Patients:</span> <span className="font-medium text-[#172B3A]">{selectedDoctor.assignedPatients}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-3 border-b border-[#CBD5E1] pb-1">Account Administration</h4>
                <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-[#172B3A]">System Access Status</p>
                      <p className="text-[11px] text-[#52606D] mt-0.5">
                        {selectedDoctor.accountStatus === 'Active' 
                          ? 'Doctor can log in, accept cases, and view medical records.' 
                          : 'Doctor is blocked from logging into the portal.'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleToggleStatus(selectedDoctor.id, selectedDoctor.accountStatus)}
                      className={`px-3 py-1.5 rounded-[4px] text-[12px] font-bold uppercase tracking-wider transition-colors border ${
                        selectedDoctor.accountStatus === 'Active' 
                          ? 'bg-[#FFFFFF] text-[#B42318] border-[#FCA5A5] hover:bg-[#FEF2F2]' 
                          : 'bg-[#102A43] text-white border-[#102A43] hover:bg-[#173F5F]'
                      }`}
                    >
                      {selectedDoctor.accountStatus === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                    </button>
                  </div>
                  
                  {/* Action row for assigning patients, etc */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#CBD5E1]">
                    <button className="flex-1 bg-[#FFFFFF] border border-[#CBD5E1] hover:bg-[#EBF1F6] text-[#1F5F8B] px-3 py-2 rounded-[4px] text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5">
                      <UserCheck className="w-4 h-4" /> Manage Patients
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#CBD5E1] bg-[#F9FAFB] flex justify-end gap-3 rounded-b-[8px]">
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="px-4 py-2 text-[13px] font-medium text-[#52606D] hover:bg-[#EBF1F6] hover:text-[#172B3A] rounded-[4px] transition-colors"
              >
                Close
              </button>
              <button className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
