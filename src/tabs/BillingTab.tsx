import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CreditCard, Download, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type InvoiceStatus = 'paid' | 'pending' | 'overdue' | string;

export default function BillingTab({ patientData }: { patientData?: any }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchBilling();
  }, [patientData]);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'billing'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [filter, setFilter] = useState<'All' | 'Pending' | 'Paid' | 'Overdue'>('All');

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'All') return true;
    return inv.status?.toLowerCase() === filter.toLowerCase();
  });

  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'Paid')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const totalOverdue = invoices
    .filter(i => i.status === 'overdue' || i.status === 'Overdue')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#E8F2EC] text-[#276749] text-[11px] px-2 py-0.5 rounded-[4px] font-bold uppercase border border-[#BCE3C6]">
          <CheckCircle2 className="w-3 h-3" /> Paid
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#FEF6E7] text-[#975A16] text-[11px] px-2 py-0.5 rounded-[4px] font-bold uppercase border border-[#F6E0B5]">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-[#FEF2F2] text-[#B42318] text-[11px] px-2 py-0.5 rounded-[4px] font-bold uppercase border border-[#FCA5A5]">
        <AlertCircle className="w-3 h-3" /> Overdue
      </span>
    );
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Billing & Invoices</h2>
        <p className="text-[14px] text-[#52606D]">Manage your hospital accounts, outstanding balances, and payment history.</p>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Outstanding Balance */}
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider mb-1">Total Outstanding</p>
            <p className={`text-[28px] font-bold leading-none ${totalOutstanding > 0 ? 'text-[#172B3A]' : 'text-[#276749]'}`}>
              ${totalOutstanding.toFixed(2)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${totalOutstanding > 0 ? 'bg-[#F4F6F8] border border-[#CBD5E1]' : 'bg-[#E8F2EC] border border-[#BCE3C6]'}`}>
            <CreditCard className={`w-6 h-6 ${totalOutstanding > 0 ? 'text-[#102A43]' : 'text-[#276749]'}`} />
          </div>
        </div>

        {/* Action Required / Overdue */}
        <div className={`bg-[#FFFFFF] border rounded-[4px] p-5 flex items-center justify-between ${totalOverdue > 0 ? 'border-[#FCA5A5]' : 'border-[#CBD5E1]'}`}>
          <div>
            <p className={`text-[12px] font-bold uppercase tracking-wider mb-1 ${totalOverdue > 0 ? 'text-[#B42318]' : 'text-[#52606D]'}`}>
              Overdue Amount
            </p>
            <p className={`text-[28px] font-bold leading-none ${totalOverdue > 0 ? 'text-[#B42318]' : 'text-[#172B3A]'}`}>
              ${totalOverdue.toFixed(2)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${totalOverdue > 0 ? 'bg-[#FEF2F2]' : 'bg-[#F4F6F8]'}`}>
            <AlertCircle className={`w-6 h-6 ${totalOverdue > 0 ? 'text-[#B42318]' : 'text-[#52606D]'}`} />
          </div>
        </div>

        {/* Quick Payment Action */}
        <div className="bg-[#102A43] border border-[#102A43] rounded-[4px] p-5 flex flex-col justify-center">
          <p className="text-[13px] text-[#CBD5E1] mb-3">Make a secure online payment towards your outstanding balance.</p>
          <button 
            disabled={totalOutstanding === 0}
            className="w-full text-[13px] font-medium text-[#102A43] bg-[#FFFFFF] px-4 py-2 rounded-[4px] hover:bg-[#F4F6F8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" /> Pay Balance Now
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="bg-[#F9FAFB] border-b border-[#CBD5E1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {['All', 'Pending', 'Overdue', 'Paid'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors shrink-0 ${
                  filter === f 
                    ? 'bg-[#1F5F8B] text-white border border-[#1F5F8B]' 
                    : 'bg-white border border-[#CBD5E1] text-[#52606D] hover:text-[#172B3A] hover:bg-[#EBF1F6]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F4F6F8] border-b border-[#CBD5E1]">
                <th className="px-5 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Invoice Date</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-[#52606D] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CBD5E1]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Receipt className="w-8 h-8 text-[#CBD5E1] mx-auto mb-3" />
                    <p className="text-[14px] font-medium text-[#172B3A]">No invoices found</p>
                    <p className="text-[13px] text-[#52606D] mt-1">There are no {filter.toLowerCase()} bills at this time.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-5 py-4 align-top">
                      <p className="text-[13px] font-semibold text-[#172B3A] whitespace-nowrap">{inv.date}</p>
                      <p className="text-[12px] text-[#52606D] mt-0.5">{inv.id}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="text-[14px] font-medium text-[#172B3A]">{inv.description}</p>
                      <p className="text-[12px] text-[#52606D] mt-0.5">{inv.category}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="text-[15px] font-bold text-[#172B3A]">${inv.amount.toFixed(2)}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusBadge status={inv.status} />
                      {inv.dueDate && inv.status !== 'paid' && (
                        <p className="text-[11px] text-[#52606D] mt-1.5 whitespace-nowrap">Due: {inv.dueDate}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status !== 'paid' && (
                          <button className="text-[12px] font-medium text-[#FFFFFF] bg-[#1F5F8B] px-3 py-1.5 rounded-[4px] hover:bg-[#173F5F] transition-colors border border-[#1F5F8B]">
                            Pay
                          </button>
                        )}
                        <button className="text-[12px] font-medium text-[#52606D] bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] hover:bg-[#F4F6F8] hover:text-[#172B3A] transition-colors flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> View
                        </button>
                        <button className="text-[12px] font-medium text-[#52606D] hover:text-[#1F5F8B] p-1.5 rounded-[4px] hover:bg-[#EBF1F6] transition-colors" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
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
