/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Stethoscope, Shield, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, runTransaction } from 'firebase/firestore';

import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

type PortalType = 'patient' | 'doctor' | 'admin';

const DEMO_ACCOUNTS = {
  patient: { id: 'patient.demo@mhd.local', password: 'Demo@123' },
  doctor: { id: 'doctor.demo@mhd.local', password: 'Demo@123' },
  admin: { id: 'admin.demo@mhd.local', password: 'Demo@123' },
};

const Logo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0L30 8V24L16 32L2 24V8L16 0ZM16 4.6L6 10.4V21.6L16 27.4L26 21.6V10.4L16 4.6Z" />
    <rect x="12" y="12" width="8" height="8" />
  </svg>
);

export default function App() {
  const [portal, setPortal] = useState<PortalType | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState<PortalType | null>(null);

  // Registration specific fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [license, setLicense] = useState('');
  const [adminRole, setAdminRole] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const loadDemo = (type: PortalType) => {
    setPortal(type);
    setIsRegistering(false);
    setLoginId(DEMO_ACCOUNTS[type].id);
    setPassword(DEMO_ACCOUNTS[type].password);
    setAuthError('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!portal || !loginId || !password) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    setAuthLoading(true);

    try {
      // Demo access bypass (only for sign in)
      if (!isRegistering) {
        const demoAcct = DEMO_ACCOUNTS[portal];
        if (loginId === demoAcct.id && password === demoAcct.password) {
          setLoggedIn(portal);
          setAuthLoading(false);
          return;
        }
      }

      if (isRegistering) {
        // Create account in Firebase Auth
        const userCred = await createUserWithEmailAndPassword(auth, loginId, password);
        const uid = userCred.user.uid;

        // Generate unique ID securely via Transaction
        const counterRef = doc(db, 'system', 'counters');
        const newIdString = await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          let newCount = 1;

          if (!counterDoc.exists()) {
            transaction.set(counterRef, { [portal]: 1 });
          } else {
            const data = counterDoc.data();
            newCount = (data[portal] || 0) + 1;
            transaction.update(counterRef, { [portal]: newCount });
          }

          const prefix = portal === 'patient' ? 'P' : portal === 'doctor' ? 'D' : 'A';
          return `${prefix}-${newCount.toString().padStart(3, '0')}`;
        });

        // Prepare profile data based on role for Firestore
        const profileData: Record<string, any> = {
          name,
          email: loginId,
          role: portal,
          mhdId: newIdString,
          createdAt: new Date().toISOString()
        };

        if (portal === 'patient') {
          profileData.phone = phone;
          profileData.dob = dob;
        } else if (portal === 'doctor') {
          profileData.phone = phone;
          profileData.specialization = specialization;
          profileData.license = license;
        } else if (portal === 'admin') {
          profileData.adminRole = adminRole;
        }

        await setDoc(doc(db, 'users', uid), profileData);
        setLoggedIn(portal);
      } else {
        // Sign in via Firebase Auth
        await signInWithEmailAndPassword(auth, loginId, password);
        setLoggedIn(portal);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      // Clean up Firebase error message for users
      let errorMsg = error.message;
      if (error.code === 'auth/email-already-in-use') errorMsg = 'An account with this email already exists.';
      if (error.code === 'auth/invalid-credential') errorMsg = 'Invalid email or password.';
      if (error.code === 'auth/weak-password') errorMsg = 'Password should be at least 6 characters.';
      
      setAuthError(errorMsg || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const clearForm = () => {
    setLoginId('');
    setPassword('');
    setName('');
    setPhone('');
    setDob('');
    setSpecialization('');
    setLicense('');
    setAdminRole('');
    setAuthError('');
  };

  const selectPortal = (type: PortalType, registering: boolean) => {
    setPortal(type);
    setIsRegistering(registering);
    clearForm();
  };

  if (loggedIn) {
    if (loggedIn === 'patient') {
      return <PatientDashboard onLogout={() => setLoggedIn(null)} />;
    }
    if (loggedIn === 'doctor') {
      return <DoctorDashboard onLogout={() => setLoggedIn(null)} />;
    }
    if (loggedIn === 'admin') {
      return <AdminDashboard onLogout={() => setLoggedIn(null)} />;
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans text-[#172B3A] bg-[#F4F6F8]">
      {/* LEFT PANEL - BRANDING */}
      <div className="lg:w-[42%] bg-[#102A43] text-white flex flex-col justify-between p-10 lg:p-14">
        <div>
          <div className="flex items-center gap-4 mb-12">
            <Logo className="w-10 h-10 text-white" />
            <div>
              <h1 className="text-[24px] font-bold tracking-wide leading-none mb-1">MHD HOSPITAL</h1>
              <p className="text-[10px] text-[#CBD5E1] uppercase tracking-wider font-semibold">
                My Health Defense Hospital 24×7
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-[28px] lg:text-[32px] font-light leading-tight mb-12">
              One Patient.<br />One Medical Journey.
            </h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#CBD5E1]" strokeWidth={1.5} />
                <span className="text-[15px] font-medium text-white">24×7 Healthcare Access</span>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#CBD5E1]" strokeWidth={1.5} />
                <span className="text-[15px] font-medium text-white">Secure Health Records</span>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#CBD5E1]" strokeWidth={1.5} />
                <span className="text-[15px] font-medium text-white">Patient-Centered Care</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[12px] text-[#CBD5E1] mb-1 opacity-80">Supporting accessible, sustainable healthcare</p>
          <p className="text-[12px] font-semibold text-white">SDG 3 · Good Health and Well-being</p>
        </div>
      </div>

      {/* RIGHT PANEL - AUTHENTICATION */}
      <div className="lg:w-[58%] flex flex-col min-h-screen max-h-screen overflow-y-auto">
        {/* Header */}
        <header className="flex justify-end p-6 gap-6 text-[13px] font-medium text-[#52606D]">
          <a href="#" className="hover:text-[#172B3A] transition-colors">Help</a>
          <a href="#" className="hover:text-[#172B3A] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#172B3A] transition-colors">English</a>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-center items-center p-6 pb-12">
          <div className="w-full max-w-[640px]">
            
            {/* Title Section */}
            <div className="mb-8">
              <h2 className="text-[24px] md:text-[28px] font-semibold text-[#172B3A] mb-2">
                Welcome to MHD Hospital
              </h2>
              <p className="text-[14px] text-[#52606D]">
                Secure access to your healthcare services.
              </p>
            </div>

            {portal === null ? (
              /* Portal Selection List */
              <div className="space-y-4">
                {/* Patient Portal */}
                <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors hover:border-[#173F5F]">
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <User className="w-[24px] h-[24px] text-[#102A43] shrink-0" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#172B3A] mb-1">PATIENT PORTAL</h3>
                      <p className="text-[13px] text-[#52606D] leading-relaxed pr-2">
                        Access your medical records, medicines, appointments and care plan.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 w-full sm:w-[160px]">
                    <button
                      onClick={() => selectPortal('patient', false)}
                      className="h-[40px] px-4 bg-[#1F5F8B] text-[#FFFFFF] rounded-[6px] text-[13px] font-medium transition-colors hover:bg-[#173F5F] w-full"
                    >
                      Sign in as Patient
                    </button>
                    <button
                      onClick={() => selectPortal('patient', true)}
                      className="h-[40px] px-4 bg-[#FFFFFF] border border-[#CBD5E1] text-[#172B3A] rounded-[6px] text-[13px] font-medium transition-colors hover:bg-[#F4F6F8] w-full"
                    >
                      Create new account
                    </button>
                  </div>
                </div>

                {/* Doctor Portal */}
                <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors hover:border-[#173F5F]">
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <Stethoscope className="w-[24px] h-[24px] text-[#102A43] shrink-0" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#172B3A] mb-1">DOCTOR PORTAL</h3>
                      <p className="text-[13px] text-[#52606D] leading-relaxed pr-2">
                        Review patients, appointments, prescriptions and clinical records.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 w-full sm:w-[160px]">
                    <button
                      onClick={() => selectPortal('doctor', false)}
                      className="h-[40px] px-4 bg-[#1F5F8B] text-[#FFFFFF] rounded-[6px] text-[13px] font-medium transition-colors hover:bg-[#173F5F] w-full"
                    >
                      Sign in as Doctor
                    </button>
                    <button
                      onClick={() => selectPortal('doctor', true)}
                      className="h-[40px] px-4 bg-[#FFFFFF] border border-[#CBD5E1] text-[#172B3A] rounded-[6px] text-[13px] font-medium transition-colors hover:bg-[#F4F6F8] w-full"
                    >
                      Create new account
                    </button>
                  </div>
                </div>

                {/* Admin Portal */}
                <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors hover:border-[#173F5F]">
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <Shield className="w-[24px] h-[24px] text-[#102A43] shrink-0" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#172B3A] mb-1">ADMIN PORTAL</h3>
                      <p className="text-[13px] text-[#52606D] leading-relaxed pr-2">
                        Manage hospital operations, users, records and system access.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 w-full sm:w-[160px]">
                    <button
                      onClick={() => selectPortal('admin', false)}
                      className="h-[40px] px-4 bg-[#1F5F8B] text-[#FFFFFF] rounded-[6px] text-[13px] font-medium transition-colors hover:bg-[#173F5F] w-full"
                    >
                      Sign in as Admin
                    </button>
                    <button
                      onClick={() => selectPortal('admin', true)}
                      className="h-[40px] px-4 bg-[#FFFFFF] border border-[#CBD5E1] text-[#172B3A] rounded-[6px] text-[13px] font-medium transition-colors hover:bg-[#F4F6F8] w-full"
                    >
                      Create new account
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Auth Forms (Login / Register) */
              <div>
                <button 
                  onClick={() => selectPortal(null as unknown as PortalType, false)}
                  className="flex items-center text-[13px] font-medium text-[#52606D] hover:text-[#172B3A] mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to portal selection
                </button>

                <form onSubmit={handleAuth} className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-6 md:p-8">
                  <h3 className="text-[18px] font-semibold text-[#172B3A] mb-6 border-b border-[#CBD5E1] pb-4">
                    {portal === 'patient' && (isRegistering ? 'Create Patient Account' : 'Patient Sign In')}
                    {portal === 'doctor' && (isRegistering ? 'Create Doctor Account' : 'Doctor Sign In')}
                    {portal === 'admin' && (isRegistering ? 'Create Admin Account' : 'Administrator Sign In')}
                  </h3>
                  
                  {authError && (
                    <div className="mb-5 p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#B42318] text-[13px] rounded-[4px]">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Common Registration Field: Name */}
                    {isRegistering && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                          placeholder="Dr. John Doe"
                        />
                      </div>
                    )}

                    {/* Patient Specific Registration Fields */}
                    {isRegistering && portal === 'patient' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">Date of Birth</label>
                          <input
                            type="date"
                            required
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* Doctor Specific Registration Fields */}
                    {isRegistering && portal === 'doctor' && (
                      <>
                        <div>
                          <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">Specialization</label>
                            <input
                              type="text"
                              required
                              value={specialization}
                              onChange={(e) => setSpecialization(e.target.value)}
                              className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                              placeholder="e.g., Cardiology"
                            />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">License / Reg. Number</label>
                            <input
                              type="text"
                              required
                              value={license}
                              onChange={(e) => setLicense(e.target.value)}
                              className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                              placeholder="MD-XXXXXX"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Admin Specific Registration Fields */}
                    {isRegistering && portal === 'admin' && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">Admin Role / Department</label>
                        <input
                          type="text"
                          required
                          value={adminRole}
                          onChange={(e) => setAdminRole(e.target.value)}
                          className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                          placeholder="e.g., System Administrator, HR"
                        />
                      </div>
                    )}

                    {/* Common Email & Password */}
                    <div>
                      <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">
                        {isRegistering ? 'Email Address' : (
                          <>
                            {portal === 'patient' && 'Email / Health ID'}
                            {portal === 'doctor' && 'Doctor ID / Email'}
                            {portal === 'admin' && 'Admin ID / Email'}
                          </>
                        )}
                      </label>
                      <input
                        type={isRegistering ? "email" : "text"}
                        required
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                        placeholder={isRegistering ? `enter.${portal}@mhd.local` : ""}
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#172B3A] mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                        placeholder="••••••••"
                      />
                    </div>

                    {!isRegistering && portal === 'patient' && (
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-[13px] text-[#52606D] cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded-[2px] border-[#CBD5E1] text-[#1F5F8B] focus:ring-[#1F5F8B]" /> 
                          Remember me
                        </label>
                        <a href="#" className="text-[13px] font-medium text-[#1F5F8B] hover:underline">
                          Forgot password?
                        </a>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-[44px] bg-[#1F5F8B] text-[#FFFFFF] rounded-[6px] text-[14px] font-medium hover:bg-[#173F5F] transition-colors flex items-center justify-center disabled:opacity-80"
                      >
                        {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Create Account' : 'Sign In')}
                      </button>
                    </div>

                    <div className="pt-4 text-center">
                      <button 
                        type="button" 
                        onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} 
                        className="text-[13px] font-medium text-[#1F5F8B] hover:underline transition-colors"
                      >
                        {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Development / Demo Section */}
            {portal === null && (
              <div className="mt-10 pt-6 border-t border-[#CBD5E1]">
                <p className="text-[11px] font-semibold text-[#52606D] uppercase tracking-wider mb-2">
                  Development / Demo environment
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadDemo('patient')}
                    className="h-[32px] px-3 bg-transparent border border-[#CBD5E1] text-[#52606D] text-[12px] font-medium rounded-[4px] hover:bg-[#FFFFFF] hover:text-[#172B3A] transition-colors"
                  >
                    Patient Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemo('doctor')}
                    className="h-[32px] px-3 bg-transparent border border-[#CBD5E1] text-[#52606D] text-[12px] font-medium rounded-[4px] hover:bg-[#FFFFFF] hover:text-[#172B3A] transition-colors"
                  >
                    Doctor Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemo('admin')}
                    className="h-[32px] px-3 bg-transparent border border-[#CBD5E1] text-[#52606D] text-[12px] font-medium rounded-[4px] hover:bg-[#FFFFFF] hover:text-[#172B3A] transition-colors"
                  >
                    Admin Demo
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-[12px] text-[#52606D] flex flex-wrap justify-between items-center gap-4 mt-auto border-t border-[#CBD5E1]">
          <p>© {new Date().getFullYear()} MHD Hospital</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#172B3A] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#172B3A] transition-colors">Security</a>
            <a href="#" className="hover:text-[#172B3A] transition-colors">Help</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
