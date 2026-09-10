const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCatch = `    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/account-exists-with-different-credential') {
         setAuthError('An account with this email exists. Please sign in with email and password to link.');
      } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
         setAuthError(error.message || 'Google Sign-In failed.');
      }
    } finally {`;

const newCatch = `    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === 'auth/account-exists-with-different-credential') {
         setAuthError('An account with this email exists. Please sign in with email and password to link.');
      } else if (error.code === 'auth/unauthorized-domain') {
         setAuthError('Firebase Error: Unauthorized Domain. Please add this app\\'s URL to the Authorized Domains in your Firebase Console (Authentication > Settings > Authorized domains).');
      } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
         setAuthError(error.message || 'Google Sign-In failed.');
      }
    } finally {`;

code = code.replace(oldCatch, newCatch);
fs.writeFileSync('src/App.tsx', code);
console.log("Successfully patched domain error message");
