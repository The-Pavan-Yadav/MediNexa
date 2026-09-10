const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
  const handleGoogleAuth = async () => {
    if (!portal) return;
    setAuthError('');
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role !== portal) {
          const roleName = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'another role';
          setAuthError(\`This account is registered as a \${roleName}. Please use the \${roleName} Portal.\`);
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
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
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
           if (!auth.currentUser) throw new Error("Google authentication lost. Please try again.");
           uid = auth.currentUser.uid;
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
            return \`\${prefix}-\${newCount}\`;
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
            await auth.currentUser.delete();
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
                throw new Error(\`This account is registered as a \${roleName}. Please use the \${roleName} Portal.\`);
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
      else if (error.code) errorMsg = \`Firebase Error (\${error.code}): \${error.message}\`;
      else errorMsg = \`Error: \${error.message || 'An unknown error occurred during registration.'}\`;
      
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };
`;

const startIndex = code.indexOf('  const handleAuth = async (e: React.FormEvent) => {');
const endIndex = code.indexOf('  const clearForm = () => {');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully patched App.tsx handleAuth logic.");
} else {
  console.error("Could not find start/end indices.");
}
