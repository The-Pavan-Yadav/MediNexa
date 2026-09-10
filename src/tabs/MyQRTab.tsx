import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { QrCode, Download, Printer, Loader2, ShieldCheck, UserCircle, MapPin } from 'lucide-react';

export default function MyQRTab() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#1F5F8B] animate-spin mb-4" />
        <p className="text-[14px] text-[#52606D] font-medium">Loading your secure QR code...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-[14px] text-[#B42318] font-medium">Unable to load patient profile.</p>
      </div>
    );
  }

  // Fallback ID if migration hasn't happened for older accounts, though new ones will have mhdId.
  const displayId = userData.mhdId || 'P-PENDING';
  const qrValue = JSON.stringify({ mhdId: displayId, role: userData.role });

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">My QR Identity</h2>
        <p className="text-[14px] text-[#52606D]">Your secure, permanent digital identifier for hospital check-ins and records.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Column - The QR Card */}
        <div className="w-full md:w-[400px] shrink-0">
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] overflow-hidden shadow-sm">
            {/* ID Card Header */}
            <div className="bg-[#102A43] p-6 text-center text-white border-b-4 border-[#1F5F8B]">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-[#1F5F8B]" strokeWidth={2} />
                </div>
              </div>
              <h3 className="text-[18px] font-bold tracking-wide leading-none mb-1">MHD HOSPITAL</h3>
              <p className="text-[10px] text-[#CBD5E1] uppercase tracking-wider font-semibold">
                Patient Identification Card
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-8 flex flex-col items-center bg-[#F9FAFB]">
              <div className="bg-white p-4 rounded-[4px] border border-[#CBD5E1] shadow-sm mb-6">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  level="H"
                  fgColor="#172B3A"
                  bgColor="#FFFFFF"
                />
              </div>

              <div className="text-center w-full">
                <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider mb-1">Unique ID</p>
                <div className="bg-[#EBF1F6] border border-[#1F5F8B] text-[#1F5F8B] text-[20px] font-bold tracking-widest py-2 px-4 rounded-[4px] inline-block mb-4">
                  {displayId}
                </div>
              </div>
            </div>

            {/* Patient Info Footer */}
            <div className="bg-white p-6 border-t border-[#CBD5E1]">
              <div className="flex items-center gap-3 mb-4">
                <UserCircle className="w-10 h-10 text-[#52606D]" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-wider">Patient Name</p>
                  <p className="text-[16px] font-bold text-[#172B3A]">{userData.name || 'Unknown Patient'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-semibold text-[#52606D]">Health ID</span>
                  <span className="font-bold text-[#172B3A]">{displayId}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-semibold text-[#52606D]">Status</span>
                  <span className="bg-[#E8F2EC] text-[#276749] text-[10px] px-2 py-0.5 rounded-[4px] font-bold uppercase border border-[#BCE3C6]">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-semibold text-[#52606D]">Registered</span>
                  <span className="font-medium text-[#172B3A]">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Instructions & Actions */}
        <div className="flex-1 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6">
            <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#102A43]" /> How to use this QR Code
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EBF1F6] text-[#1F5F8B] flex items-center justify-center shrink-0 font-bold text-[12px] mt-0.5">1</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#172B3A]">Hospital Check-in</p>
                  <p className="text-[13px] text-[#52606D] mt-0.5">Scan this code at the reception kiosk to instantly verify your identity and notify your doctor.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EBF1F6] text-[#1F5F8B] flex items-center justify-center shrink-0 font-bold text-[12px] mt-0.5">2</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#172B3A]">Pharmacy Pickup</p>
                  <p className="text-[13px] text-[#52606D] mt-0.5">Show this ID at the hospital pharmacy to authorize and collect your prescribed medicines.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EBF1F6] text-[#1F5F8B] flex items-center justify-center shrink-0 font-bold text-[12px] mt-0.5">3</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#172B3A]">Emergency Access</p>
                  <p className="text-[13px] text-[#52606D] mt-0.5">In case of emergency, medical staff can scan this to securely pull your allergies, conditions, and history.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6">
            <h3 className="text-[15px] font-semibold text-[#172B3A] mb-4">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 text-[13px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#1F5F8B] px-4 py-2.5 rounded-[4px] hover:bg-[#EBF1F6] transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Card
              </button>
              <button className="flex-1 text-[13px] font-medium text-[#FFFFFF] bg-[#1F5F8B] border border-[#1F5F8B] px-4 py-2.5 rounded-[4px] hover:bg-[#173F5F] transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
            <p className="text-[12px] text-[#52606D] mt-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Your data is encrypted and securely linked to this ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
