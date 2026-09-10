import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Activity, 
  Calendar, 
  ChevronRight, 
  UserCircle, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Clock
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

interface PatientType {
  uid: string;
  mhdId: string;
  name: string;
  dob?: string;
  gender?: string;
  // Mocked clinical fields for dashboard display
  primaryCondition?: string;
  lastVisit?: string;
  nextAppointment?: string;
  status?: 'Active Case' | 'Follow-up' | 'Recent' | 'Inactive';
}

export default function PatientsTab({ doctorData }: { doctorData: any }) {
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [addPatientId, setAddPatientId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addStatus, setAddStatus] = useState<{ type: 'idle' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });

  const fetchMyPatients = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) return;
      
      // Get latest doctor doc to ensure patientIds is up to date
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const pIds = data.patientIds || [];
        
        if (pIds.length > 0) {
          // Fetch all patients (since 'in' query is limited to 30)
          const q = query(collection(db, 'users'), where('role', '==', 'patient'));
          const snapshot = await getDocs(q);
          
          const fetchedPatients: PatientType[] = [];
          snapshot.forEach(dSnap => {
            if (pIds.includes(dSnap.id)) {
              const pData = dSnap.data();
              
              // Derive mock clinical data for UI completeness if not present
              // In a real app, this would be queried from clinical_records and appointments
              const ageMock = pData.dob ? calculateAge(pData.dob) : 'Unknown';
              const statusMock = ['Active Case', 'Follow-up', 'Recent', 'Inactive'][Math.floor(Math.random() * 4)] as any;
              
              fetchedPatients.push({
                uid: dSnap.id,
                mhdId: pData.mhdId || 'P-UNKNOWN',
                name: pData.name || 'Unknown Patient',
                dob: pData.dob,
                gender: pData.gender || 'Not Specified',
                primaryCondition: pData.primaryCondition || 'Pending Assessment',
                lastVisit: pData.lastVisit || '2026-08-15',
                nextAppointment: pData.nextAppointment || '2026-09-20',
                status: statusMock,
                ...pData
              });
            }
          });
          setPatients(fetchedPatients);
        } else {
          setPatients([]);
        }
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPatients();
  }, []);

  const calculateAge = (dobString: string) => {
    if (!dobString) return 'Unknown';
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPatientId.trim()) return;
    
    setIsAdding(true);
    setAddStatus({ type: 'idle', msg: '' });
    
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'patient'), where('mhdId', '==', addPatientId.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setAddStatus({ type: 'error', msg: 'Patient ID not found.' });
        setIsAdding(false);
        return;
      }

      const patientDoc = querySnapshot.docs[0];
      
      if (!auth.currentUser) throw new Error("Not authenticated");
      const doctorRef = doc(db, 'users', auth.currentUser.uid);
      
      await updateDoc(doctorRef, {
        patientIds: arrayUnion(patientDoc.id)
      });
      
      setAddStatus({ type: 'success', msg: `Added ${patientDoc.data().name}` });
      setAddPatientId('');
      
      // Refresh list
      await fetchMyPatients();
      
      setTimeout(() => {
        setAddStatus({ type: 'idle', msg: '' });
      }, 3000);
      
    } catch (err) {
      console.error(err);
      setAddStatus({ type: 'error', msg: 'Failed to add patient.' });
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'Active Case': return 'bg-[#FEF2F2] text-[#B42318] border-[#FCA5A5]';
      case 'Follow-up': return 'bg-[#FEF6E7] text-[#975A16] border-[#F6E0B5]';
      case 'Recent': return 'bg-[#EBF1F6] text-[#1F5F8B] border-[#90CDF4]';
      case 'Inactive': return 'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]';
      default: return 'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]';
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.mhdId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || p.status === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header & Add Patient */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">My Patients</h2>
          <p className="text-[14px] text-[#52606D]">Manage your authorized patient roster and access clinical records.</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 shadow-sm w-full lg:w-[400px] shrink-0">
          <label className="block text-[12px] font-bold text-[#172B3A] mb-2 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-[#1F5F8B]" /> Add Patient to Roster
          </label>
          <form onSubmit={handleAddPatient} className="flex gap-2">
            <input 
              type="text" 
              value={addPatientId}
              onChange={(e) => setAddPatientId(e.target.value)}
              placeholder="Enter Patient ID (e.g. P-001)" 
              className="flex-1 bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
            />
            <button 
              type="submit"
              disabled={isAdding}
              className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors border border-[#102A43] disabled:opacity-70 flex items-center gap-2"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Add'}
            </button>
          </form>
          {addStatus.msg && (
            <div className={`mt-2 text-[12px] font-medium flex items-center gap-1.5 ${addStatus.type === 'success' ? 'text-[#276749]' : 'text-[#B42318]'}`}>
              {addStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {addStatus.msg}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="text" 
            placeholder="Search ID or Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[260px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-[160px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] appearance-none cursor-pointer"
          >
            <option value="All">All Patients</option>
            <option value="Active Case">Active Cases</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Recent">Recent</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient Identity</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Demographics</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Clinical Summary</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Timeline</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1F5F8B] mx-auto mb-2" />
                    <p className="text-[13px] text-[#52606D]">Loading patient roster...</p>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <UserCircle className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                    <p className="text-[14px] font-medium text-[#172B3A] mb-1">No patients found</p>
                    <p className="text-[13px] text-[#52606D]">Add a patient using their Health ID or adjust your search.</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.uid} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EBF1F6] flex items-center justify-center border border-[#CBD5E1] shrink-0">
                          <UserCircle className="w-6 h-6 text-[#1F5F8B]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#172B3A] leading-tight mb-0.5">{p.name}</p>
                          <span className="bg-[#102A43] text-white text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold uppercase tracking-wider">
                            {p.mhdId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-[13px] text-[#172B3A] font-medium">{p.dob ? `${calculateAge(p.dob)} yrs` : 'Age Unknown'}</p>
                      <p className="text-[12px] text-[#52606D] mt-0.5">{p.gender}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-[#52606D] shrink-0 mt-0.5" />
                        <p className="text-[13px] text-[#172B3A] font-medium line-clamp-2">{p.primaryCondition}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className="text-[12px] text-[#52606D] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Last: <span className="text-[#172B3A] font-medium">{p.lastVisit}</span>
                        </p>
                        <p className="text-[12px] text-[#52606D] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Next: <span className="text-[#172B3A] font-medium">{p.nextAppointment}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-[4px] border inline-block ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <button 
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] hover:bg-[#F4F6F8] transition-colors"
                      >
                        Open Chart <ChevronRight className="w-3.5 h-3.5" />
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
