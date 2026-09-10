import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Pill, 
  User, 
  Stethoscope, 
  Calendar, 
  Loader2, 
  X, 
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Save,
  AlertCircle
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface AdminMedicine {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  doctorId: string;
  doctorName: string;
  startDate: string;
  endDate: string;
  status: string; // Active, Completed, Pending
  verificationStatus: string; // Verified, Pending Verification
}

export default function AdminMedicinesTab({ adminData }: { adminData: any }) {
  const [medicines, setMedicines] = useState<AdminMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verifyFilter, setVerifyFilter] = useState('All');
  
  // Modal states
  const [selectedMed, setSelectedMed] = useState<AdminMedicine | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editVerifyStatus, setEditVerifyStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const medRef = collection(db, 'medicines');
      const snap = await getDocs(medRef);
      
      let fetched: AdminMedicine[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          patientId: data.patientId || 'P-UNKNOWN',
          patientName: data.patientName || 'Unknown Patient',
          medicineName: data.medicineName || data.name || 'Unknown Medication',
          dosage: data.dosage || 'Not specified',
          frequency: data.frequency || 'Not specified',
          doctorId: data.doctorId || '',
          doctorName: data.doctorName || data.prescribedBy || 'Unknown Doctor',
          startDate: data.startDate || new Date().toISOString().split('T')[0],
          endDate: data.endDate || 'Ongoing',
          status: data.status || 'Active',
          verificationStatus: data.verificationStatus || 'Pending Verification'
        });
      });

      // Sort by start date (newest first)
      fetched.sort((a, b) => b.startDate.localeCompare(a.startDate));
      setMedicines(fetched);
    } catch (err) {
      console.error("Error fetching medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMed = (med: AdminMedicine) => {
    setSelectedMed(med);
    setEditStatus(med.status);
    setEditVerifyStatus(med.verificationStatus);
  };

  const handleSaveChanges = async () => {
    if (!selectedMed) return;
    setSaving(true);
    try {
      const medRef = doc(db, 'medicines', selectedMed.id);
      
      const updatedData = {
        status: editStatus,
        verificationStatus: editVerifyStatus
      };

      await updateDoc(medRef, updatedData);
      
      setMedicines(prev => prev.map(m => 
        m.id === selectedMed.id ? { ...m, ...updatedData } : m
      ));
      setSelectedMed(null);
    } catch (err) {
      console.error("Error updating medicine record:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = 
      m.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = m.status === statusFilter;
    }

    let matchesVerify = true;
    if (verifyFilter !== 'All') {
      matchesVerify = m.verificationStatus === verifyFilter;
    }

    return matchesSearch && matchesStatus && matchesVerify;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-[#1F5F8B] bg-[#EBF1F6] border-[#B8D4E8]';
      case 'Completed': return 'text-[#276749] bg-[#E8F2EC] border-[#BCE3C6]';
      case 'Pending': return 'text-[#975A16] bg-[#FEF6E7] border-[#F6E0B5]';
      default: return 'text-[#52606D] bg-[#F4F6F8] border-[#CBD5E1]';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Medication Management</h2>
          <p className="text-[14px] text-[#52606D]">Global oversight of hospital prescriptions and administrative verification.</p>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="text" 
            placeholder="Search Medicine or Patient..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[150px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="relative">
          <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <select 
            value={verifyFilter}
            onChange={(e) => setVerifyFilter(e.target.value)}
            className="w-full sm:w-[170px] bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] cursor-pointer appearance-none"
          >
            <option value="All">All Verifications</option>
            <option value="Verified">Verified</option>
            <option value="Pending Verification">Unverified</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Medication</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Prescriber</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Timeline</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-center">Verification</th>
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
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#52606D]">
                    No medication records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-[4px] bg-[#EBF1F6] flex items-center justify-center shrink-0 mt-0.5">
                          <Pill className="w-4 h-4 text-[#1F5F8B]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#172B3A]">{med.medicineName}</p>
                          <p className="text-[11px] text-[#1F5F8B] font-medium">{med.dosage}</p>
                          <p className="text-[11px] text-[#52606D]">{med.frequency}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] font-bold text-[#172B3A]">{med.patientName}</p>
                      <p className="text-[11px] font-mono text-[#52606D]">{med.patientId}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] text-[#172B3A] flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-[#52606D]" /> {med.doctorName}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[12px] text-[#172B3A] flex items-center gap-1.5 mb-0.5">
                        <Calendar className="w-3 h-3 text-[#52606D]" /> 
                        {med.startDate}
                      </p>
                      <p className="text-[11px] text-[#52606D]">
                        To: {med.endDate}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-flex items-center ${getStatusColor(med.status)}`}>
                          {med.status}
                        </span>
                        {med.verificationStatus === 'Verified' ? (
                          <span className="text-[10px] flex items-center gap-1 text-[#276749] font-medium">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] flex items-center gap-1 text-[#B42318] font-medium">
                            <ShieldAlert className="w-3 h-3" /> Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button 
                        onClick={() => handleOpenMed(med)}
                        className="text-[12px] font-medium text-[#1F5F8B] hover:underline inline-flex items-center gap-1 mt-2"
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

      {/* Medication Management Modal */}
      {selectedMed && (
        <div className="fixed inset-0 bg-[#102A43]/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-[8px] shadow-xl w-full max-w-[500px] flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-[#CBD5E1] bg-[#F9FAFB] rounded-t-[8px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#EBF1F6] flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-[#1F5F8B]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#172B3A] leading-tight">Prescription Review</h3>
                  <p className="text-[12px] font-mono text-[#52606D]">ID: {selectedMed.id.substring(0,8).toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMed(null)}
                className="text-[#52606D] hover:text-[#172B3A] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Clinical Snapshot */}
              <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-4 text-[13px]">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div className="col-span-2">
                    <span className="text-[#52606D] block mb-1">Medication & Regimen:</span>
                    <span className="font-semibold text-[#172B3A] text-[15px] block">{selectedMed.medicineName}</span>
                    <span className="text-[#1F5F8B] block mt-0.5 font-medium">{selectedMed.dosage} • {selectedMed.frequency}</span>
                  </div>
                  <div>
                    <span className="text-[#52606D] block mb-1">Patient:</span>
                    <span className="font-semibold text-[#172B3A]">{selectedMed.patientName}</span>
                  </div>
                  <div>
                    <span className="text-[#52606D] block mb-1">Prescriber:</span>
                    <span className="font-semibold text-[#172B3A]">{selectedMed.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-[#52606D] block mb-1">Start Date:</span>
                    <span className="font-semibold text-[#172B3A]">{selectedMed.startDate}</span>
                  </div>
                  <div>
                    <span className="text-[#52606D] block mb-1">End Date:</span>
                    <span className="font-semibold text-[#172B3A]">{selectedMed.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Administrative Controls */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider border-b border-[#CBD5E1] pb-1">Administrative Verification</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Verification Status</label>
                    <select 
                      value={editVerifyStatus}
                      onChange={(e) => setEditVerifyStatus(e.target.value)}
                      className={`w-full bg-[#FFFFFF] border rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] ${editVerifyStatus === 'Verified' ? 'border-[#BCE3C6] text-[#276749] font-medium bg-[#F0FDF4]' : 'border-[#CBD5E1] text-[#172B3A]'}`}
                    >
                      <option value="Verified">Verified</option>
                      <option value="Pending Verification">Pending Verification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Medication Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-[#52606D] bg-[#F4F6F8] border border-[#CBD5E1] p-3 rounded-[4px] mt-4">
                  <AlertCircle className="w-4 h-4 text-[#52606D] shrink-0" />
                  <p>
                    Clinical decisions remain with authorized doctors. Administrative modifications are restricted to verification clearing and status logging for compliance tracing.
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#CBD5E1] bg-[#F9FAFB] flex justify-end gap-3 rounded-b-[8px]">
              <button 
                onClick={() => setSelectedMed(null)}
                className="px-4 py-2 text-[13px] font-medium text-[#52606D] hover:bg-[#EBF1F6] hover:text-[#172B3A] rounded-[4px] transition-colors"
                disabled={saving}
              >
                Close
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
