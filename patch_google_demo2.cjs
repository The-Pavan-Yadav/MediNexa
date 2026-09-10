const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCheck = `        if (isGoogleAuth) {
           if (!auth.currentUser) throw new Error("Google authentication lost. Please try again.");
           uid = auth.currentUser.uid;
        } else {`;

const newCheck = `        if (isGoogleAuth) {
           if (!auth.currentUser && loginId !== \`demo.google.\${portal}@example.com\`) {
               throw new Error("Google authentication lost. Please try again.");
           }
           uid = auth.currentUser ? auth.currentUser.uid : "demo-google-uid-123";
        } else {`;

code = code.replace(oldCheck, newCheck);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched Submit bypass");
