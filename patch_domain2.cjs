const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCatch = `      } else if (error.code === 'auth/unauthorized-domain') {
         setAuthError('Firebase Error: Unauthorized Domain. Please add this app\\'s URL to the Authorized Domains in your Firebase Console (Authentication > Settings > Authorized domains).');`;

const newCatch = `      } else if (error.code === 'auth/unauthorized-domain') {
         setAuthError(\`Firebase Error: Unauthorized Domain. Please add "\${window.location.hostname}" to the Authorized Domains in your Firebase Console (Authentication > Settings > Authorized domains).\`);`;

code = code.replace(oldCatch, newCatch);
fs.writeFileSync('src/App.tsx', code);
console.log("Successfully patched domain error message to include hostname");
