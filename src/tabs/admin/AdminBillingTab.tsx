import React, { useState, useEffect } from 'react';
import { CheckCircle2, 
  Search, 
  Filter, 
  DollarSign, 
  CreditCard, 
  Clock, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2, 
  X, 
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface AdminBill {
  id: string;
  patientId: string;
  patientName: string;
  service: string;
  date: string;
  amount: number;
  status: string; // Paid, Pending, Overdue, Cancelled
  notes?: string;
}

export default function AdminBillingTab({ adminData }: { adminData: any }) {
  const [bills, setBills] = useState<AdminBill[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [selectedBill, setSelectedBill] = useState<AdminBill | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      // Assuming 'billing' collection exists. If not, it will return empty, which is fine.
      const billingRef = collection(db, 'billing');
      const snap = await getDocs(billingRef);
      
      let fetched: AdminBill[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          patientId: data.patientId || 'P-UNKNOWN',
          patientName: data.patientName || 'Unknown Patient',
          service: data.service || data.consultation || 'General Consultation',
          date: data.date || new Date().toISOString().split('T')[0],
          amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount || '0'),
          status: data.status || 'Pending',
          notes: data.notes || ''
        });
      });

      // Sort by date descending
      fetched.sort((a, b) => b.date.localeCompare(a.date));
      setBills(fetched);
    } catch (err) {
      console.error("Error fetching billing records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBill = (bill: AdminBill) => {
    setSelectedBill(bill);
    setEditStatus(bill.status);
  };

  const handleSaveChanges = async () => {
    if (!selectedBill) return;
    setSaving(true);
    try {
      const billRef = doc(db, 'billing', selectedBill.id);
      const updatedData = { status: editStatus };
      await updateDoc(billRef, updatedData);
      
      setBills(prev => prev.map(b => 
        b.id === selectedBill.id ? { ...b, ...updatedData } : b
      ));
      setSelectedBill(null);
    } catch (err) {
      console.error("Error updating billing record:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredBills = bills.filter(b => {
    const matchesSearch = 
      b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = b.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const outstandingAmount = bills.filter(b => b.status === 'Pending' || b.status === 'Overdue').reduce((sum, b) => sum + b.amount, 0);
  const paidInvoicesCount = bills.filter(b => b.status === 'Paid').length;
  const pendingInvoicesCount = bills.filter(b => b.status === 'Pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-[#276749] bg-[#E8F2EC] border-[#BCE3C6]';
      case 'Pending': return 'text-[#975A16] bg-[#FEF6E7] border-[#F6E0B5]';
      case 'Overdue': return 'text-[#B42318] bg-[#FEF2F2] border-[#FCA5A5]';
      case 'Cancelled': return 'text-[#52606D] bg-[#F4F6F8] border-[#CBD5E1]';
      default: return 'text-[#52606D] bg-[#FFFFFF] border-[#CBD5E1]';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Financial Operations</h2>
          <p className="text-[14px] text-[#52606D]">Global oversight of hospital billing, payments, and revenue.</p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-start justify-between">
            <span className="text-[12px] font-semibold text-[#52606D] uppercase tracking-wider">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#276749]" />
          </div>
          <p className="text-[24px] font-bold text-[#172B3A]">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-start justify-between">
            <span className="text-[12px] font-semibold text-[#52606D] uppercase tracking-wider">Outstanding Amount</span>
            <AlertCircle className="w-4 h-4 text-[#975A16]" />
          </div>
          <p className="text-[24px] font-bold text-[#172B3A]">${outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-start justify-between">
            <span className="text-[12px] font-semibold text-[#52606D] uppercase tracking-wider">Paid Invoices</span>
            <CheckCircle className="w-4 h-4 text-[#1F5F8B]" />
          </div>
          <p className="text-[24px] font-bold text-[#172B3A]">{paidInvoicesCount}</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-4 flex flex-col justify-between h-[100px]">
          <div className="flex items-start justify-between">
            <span className="text-[12px] font-semibold text-[#52606D] uppercase tracking-wider">Pending Payments</span>
            <Clock className="w-4 h-4 text-[#52606D]" />
          </div>
          <p className="text-[24px] font-bold text-[#172B3A]">{pendingInvoicesCount}</p>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#52606D]" />
          <input 
            type="text" 
            placeholder="Search by Patient, ID, or Service..." 
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
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#CBD5E1]">
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Invoice ID / Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Service</th>
                <th className="px-4 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Amount</th>
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
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#52606D]">
                    No billing records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <p className="text-[12px] font-mono font-bold text-[#172B3A] flex items-center gap-1.5 mb-0.5">
                        <Receipt className="w-3.5 h-3.5 text-[#1F5F8B]" />
                        INV-{bill.id.substring(0,6).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-[#52606D] ml-5">{new Date(bill.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] font-bold text-[#172B3A]">{bill.patientName}</p>
                      <p className="text-[11px] font-mono text-[#52606D]">{bill.patientId}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-[13px] text-[#172B3A] max-w-[200px] truncate" title={bill.service}>
                        {bill.service}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <p className="text-[13px] font-bold text-[#172B3A]">
                        ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border inline-flex items-center ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button 
                        onClick={() => handleOpenBill(bill)}
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

      {/* Invoice Management Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-[#102A43]/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-[8px] shadow-xl w-full max-w-[500px] flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-[#CBD5E1] bg-[#F9FAFB] rounded-t-[8px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#102A43] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#172B3A] leading-tight">Invoice Management</h3>
                  <p className="text-[12px] font-mono text-[#52606D]">INV-{selectedBill.id.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBill(null)}
                className="text-[#52606D] hover:text-[#172B3A] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Invoice Details */}
              <div className="bg-[#F4F6F8] border border-[#CBD5E1] rounded-[4px] p-4 text-[13px]">
                <div className="flex justify-between items-start border-b border-[#CBD5E1] pb-3 mb-3">
                  <div>
                    <span className="text-[#52606D] block mb-1">Patient Name</span>
                    <span className="font-bold text-[#172B3A]">{selectedBill.patientName}</span>
                    <span className="text-[#52606D] font-mono text-[11px] block mt-0.5">{selectedBill.patientId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#52606D] block mb-1">Invoice Date</span>
                    <span className="font-semibold text-[#172B3A]">{new Date(selectedBill.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#172B3A]">{selectedBill.service}</span>
                  <span className="font-bold text-[#172B3A]">
                    ${selectedBill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-[#CBD5E1] mt-1 pt-3">
                  <span className="text-[14px] font-bold text-[#172B3A]">Total Amount</span>
                  <span className="text-[16px] font-bold text-[#172B3A]">
                    ${selectedBill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Administrative Controls */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider border-b border-[#CBD5E1] pb-1">Payment Status</h4>
                
                <div>
                  <label className="block text-[12px] font-semibold text-[#172B3A] mb-1.5">Update Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#1F5F8B] text-[#172B3A]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[#CBD5E1] bg-[#F9FAFB] flex justify-end gap-3 rounded-b-[8px]">
              <button 
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 text-[13px] font-medium text-[#52606D] hover:bg-[#EBF1F6] hover:text-[#172B3A] rounded-[4px] transition-colors"
                disabled={saving}
              >
                Close
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={saving || editStatus === selectedBill.status}
                className="bg-[#102A43] text-white px-4 py-2 rounded-[4px] text-[13px] font-medium hover:bg-[#173F5F] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Update Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
