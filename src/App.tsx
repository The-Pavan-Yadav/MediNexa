/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Shield, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, runTransaction, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState<PortalType | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Registration specific fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [license, setLicense] = useState('');
  const [adminRole, setAdminRole] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role === 'patient' || data.role === 'doctor' || data.role === 'admin') {
              setLoggedIn(data.role as PortalType);
            }
          }
        } catch (error) {
          console.error("Error fetching user role on auth state change:", error);
        }
      } else {
        setLoggedIn(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const loadDemo = (type: PortalType) => {
    setPortal(type);
    setIsRegistering(false);
    setIsGoogleAuth(false);
    setLoginId(DEMO_ACCOUNTS[type].id);
    setPassword(DEMO_ACCOUNTS[type].password);
    setAuthError('');
  };


  const handleGoogleAuth = async () => {
    if (!portal) return;
    setAuthError('');
    setAuthLoading(true);
    try {
      let user: any;
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      } catch (authErr: any) {
        if (authErr.code === 'auth/unauthorized-domain') {
          console.warn("Using Demo Google Auth Bypass because domain is not authorized in Firebase.");
          // Demo bypass for unauthorized domains
          user = {
            uid: "demo-google-uid-123",
            email: `demo.google.${portal}@example.com`,
            displayName: "Demo Google User"
          };
        } else {
          throw authErr;
        }
      }
      

      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role !== portal) {
          const roleName = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'another role';
          setAuthError(`This account is registered as a ${roleName}. Please use the ${roleName} Portal.`);
          await auth.signOut();
          setAuthLoading(false);
          return;
        }
        setLoggedIn(portal);
      } else {
        if (portal === 'admin') {
          setAuthError("Only pre-authorized admins can sign in. Please contact IT.");
          await auth.signOut();
          setAuthLoading(false);
          return;
        }
        
        // Check if email already used by a different account type
        const emailQuery = query(collection(db, 'users'), where('email', '==', user.email || ''));
        const emailSnap = await getDocs(emailQuery);
        if (!emailSnap.empty) {
          setAuthError("An account with this email already exists. Please sign in with your email and password.");
          await auth.signOut();
          setAuthLoading(false);
          return;
        }

        setIsRegistering(true);
        setIsGoogleAuth(true);
        setName(user.displayName || '');
        setLoginId(user.email || '');
      }
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/account-exists-with-different-credential') {
         setAuthError('An account with this email exists. Please sign in with email and password to link.');
      } else if (error.code === 'auth/unauthorized-domain') {
         setAuthError(`Firebase Error: Unauthorized Domain. Please add "${window.location.hostname}" to the Authorized Domains in your Firebase Console (Authentication > Settings > Authorized domains).`);
      } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
         setAuthError(error.message || 'Google Sign-In failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!portal) {
      setAuthError('Portal not selected.');
      return;
    }

    if (isRegistering) {
      if (!isGoogleAuth && (!loginId || !password)) {
        setAuthError('Please fill in all required fields.');
        return;
      }
      if (!isGoogleAuth && password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }

      if (portal === 'patient') {
        if (!name || !phone || !dob || !gender || (!isGoogleAuth && !confirmPassword)) {
          setAuthError('Please fill in all required fields.');
          return;
        }
        if (!isGoogleAuth && password !== confirmPassword) {
          setAuthError('Passwords do not match.');
          return;
        }
      }
    } else {
      if (!loginId || !password) {
         setAuthError('Please fill in all required fields.');
         return;
      }
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
        let uid = '';
        if (isGoogleAuth) {
           if (!auth.currentUser && loginId !== `demo.google.${portal}@example.com`) {
               throw new Error("Google authentication lost. Please try again.");
           }
           uid = auth.currentUser ? auth.currentUser.uid : "demo-google-uid-123";
        } else {
           console.log("Attempting to create user with email:", loginId);
           const userCred = await createUserWithEmailAndPassword(auth, loginId, password);
           uid = userCred.user.uid;
           console.log("User created successfully in Auth, UID:", uid);
        }

        try {
          // Generate unique ID securely via Transaction
          console.log("Attempting to generate sequential ID via Firestore transaction...");
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
            return `${prefix}-${newCount}`;
          });
          console.log("Sequential ID generated successfully:", newIdString);

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
            profileData.gender = gender;
          } else if (portal === 'doctor') {
            profileData.phone = phone;
            profileData.specialization = specialization;
            profileData.license = license;
          } else if (portal === 'admin') {
            profileData.adminRole = adminRole;
          }

          console.log("Attempting to save user profile to Firestore users collection...");
          await setDoc(doc(db, 'users', uid), profileData);
          console.log("Profile saved successfully.");
          
          setLoggedIn(portal);
        } catch (dbError: any) {
          console.error("Database operation failed during registration, rolling back Auth user...", dbError);
          if (!isGoogleAuth && auth.currentUser) {
            try { await auth.currentUser.delete(); } catch(e) {}
          }
          throw dbError;
        }
      } else {
        // Sign in via Firebase Auth
        const userCred = await signInWithEmailAndPassword(auth, loginId, password);
        
        // Verify Role!
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role !== portal) {
                const roleName = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'another role';
                await auth.signOut();
                throw new Error(`This account is registered as a ${roleName}. Please use the ${roleName} Portal.`);
            }
            setLoggedIn(portal);
        } else {
            await auth.signOut();
            throw new Error("User profile not found. Please register or contact support.");
        }
      }
    } catch (error: any) {
      console.error("Auth error caught in handleAuth:", error);
      let errorMsg = error.message;
      if (error.code === 'auth/email-already-in-use') errorMsg = 'An account with this email already exists.';
      else if (error.code === 'auth/invalid-credential') errorMsg = 'Invalid email or password.';
      else if (error.code === 'auth/weak-password') errorMsg = 'Password should be at least 6 characters.';
      else if (error.code === 'permission-denied') errorMsg = 'Database permission denied. Please check Firestore security rules.';
      else if (error.code) errorMsg = `Firebase Error (${error.code}): ${error.message}`;
      else errorMsg = `Error: ${error.message || 'An unknown error occurred during registration.'}`;
      
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };
  const clearForm = () => {
    setLoginId('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setDob('');
    setGender('');
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setLoggedIn(null);
      setPortal(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#1F5F8B]" />
          <p className="text-[#52606D] font-medium animate-pulse">Initializing Security...</p>
        </div>
      </div>
    );
  }

  if (loggedIn) {
    if (loggedIn === 'patient') {
      return <PatientDashboard onLogout={handleLogout} />;
    }
    if (loggedIn === 'doctor') {
      return <DoctorDashboard onLogout={handleLogout} />;
    }
    if (loggedIn === 'admin') {
      return <AdminDashboard onLogout={handleLogout} />;
    }
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col lg:flex-row font-sans text-[#172B3A] bg-[#F4F6F8] box-border">
      {/* LEFT PANEL - BRANDING */}
      <div className="lg:w-[42%] bg-[#102A43] text-white flex flex-col justify-between p-10 lg:p-10">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <Logo className="w-10 h-10 text-white" />
            <div>
              <h1 className="text-[24px] font-bold tracking-wide leading-none mb-1">MHD HOSPITAL</h1>
              <p className="text-[10px] text-[#CBD5E1] uppercase tracking-wider font-semibold">
                My Health Defense Hospital 24×7
              </p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-[28px] lg:text-[32px] font-light leading-tight mb-8">
              One Patient.<br />One Medical Journey.
            </h2>

            <div className="space-y-3">
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
      <div className="lg:w-[58%] flex flex-col h-full lg:overflow-y-auto">
        {/* Header */}
        <header className="flex justify-end p-6 lg:pb-4 gap-6 text-[13px] font-medium text-[#52606D]">
          <a href="#" className="hover:text-[#172B3A] transition-colors">Help</a>
          <a href="#" className="hover:text-[#172B3A] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#172B3A] transition-colors">English</a>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-center items-center p-6 lg:pt-0 lg:pb-8">
          <div className="w-full max-w-[640px]">
            
            {/* Title Section */}
            <div className="mb-5">
              <h2 className="text-[24px] md:text-[28px] font-semibold text-[#172B3A] mb-1">
                Welcome to MHD Hospital
              </h2>
              <p className="text-[14px] text-[#52606D]">
                Secure access to your healthcare services.
              </p>
            </div>

            {portal === null ? (
              /* Portal Selection List */
              <div className="space-y-3">
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
                  className="flex items-center text-[13px] font-medium text-[#52606D] hover:text-[#172B3A] mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to portal selection
                </button>
                <form onSubmit={handleAuth} className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 lg:p-6 lg:py-5">
                  <h3 className="text-[18px] font-semibold text-[#172B3A] mb-4 border-b border-[#CBD5E1] pb-3">
                    {portal === 'patient' && (isRegistering ? 'Create Patient Account' : 'Patient Sign In')}
                    {portal === 'doctor' && (isRegistering ? 'Create Doctor Account' : 'Doctor Sign In')}
                    {portal === 'admin' && (isRegistering ? 'Create Admin Account' : 'Administrator Sign In')}
                  </h3>
                  
                  {authError && (
                    <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#B42318] text-[13px] rounded-[4px]">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Common Registration Field: Name */}
                    {isRegistering && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1">Full Name</label>
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
                        <div className="sm:col-span-2">
                          <label className="block text-[13px] font-medium text-[#172B3A] mb-1">Gender</label>
                          <select
                            required
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] bg-white focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                          >
                            <option value="" disabled>Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium text-[#172B3A] mb-1">Phone Number</label>
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
                          <label className="block text-[13px] font-medium text-[#172B3A] mb-1">Date of Birth</label>
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
                          <label className="block text-[13px] font-medium text-[#172B3A] mb-1">Phone Number</label>
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
                            <label className="block text-[13px] font-medium text-[#172B3A] mb-1">Specialization</label>
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
                            <label className="block text-[13px] font-medium text-[#172B3A] mb-1">License / Reg. Number</label>
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
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1">Admin Role / Department</label>
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
                      <label className="block text-[13px] font-medium text-[#172B3A] mb-1">
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
                        disabled={isGoogleAuth}
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder={isRegistering ? `enter.${portal}@mhd.local` : ""}
                      />
                    </div>

                    {!isGoogleAuth && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1">
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
                    )}

                    {!isGoogleAuth && isRegistering && portal === 'patient' && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    )}

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
                        {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? (isGoogleAuth ? 'Complete Registration' : 'Create Account') : 'Sign In')}
                      </button>
                    </div>

                    {!isGoogleAuth && (
                      <>
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#CBD5E1]"></div>
                          </div>
                          <div className="relative flex justify-center text-[11px]">
                            <span className="bg-[#FFFFFF] px-2 text-[#52606D] font-semibold uppercase tracking-wider">OR</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleGoogleAuth}
                          disabled={authLoading}
                          className="w-full h-[40px] bg-[#FFFFFF] border border-[#CBD5E1] text-[#172B3A] rounded-[4px] text-[13px] font-medium hover:bg-[#F4F6F8] transition-colors flex items-center justify-center gap-2 disabled:opacity-80"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Continue with Google
                        </button>
                      </>
                    )}

                    <div className="pt-3 text-center">
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
              <div className="mt-6 pt-4 border-t border-[#CBD5E1]">
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
        <footer className="p-4 lg:p-6 lg:py-4 text-[12px] text-[#52606D] flex flex-wrap justify-between items-center gap-4 mt-auto border-t border-[#CBD5E1]">
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
