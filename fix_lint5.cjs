const fs = require('fs');

// PrivacyAccessTab
let priv = fs.readFileSync('src/tabs/PrivacyAccessTab.tsx', 'utf8');
priv = priv.replace(/await updateDoc\(doc\(db, 'users', auth.currentUser.uid\), {[\s\S]*?}\);/, `await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        preferences: toggles
      });`);
fs.writeFileSync('src/tabs/PrivacyAccessTab.tsx', priv);

// AdminBillingTab
let adminBill = fs.readFileSync('src/tabs/admin/AdminBillingTab.tsx', 'utf8');
if (!adminBill.includes("CheckCircle2")) {
  adminBill = adminBill.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, CheckCircle2 } from 'lucide-react';");
}
fs.writeFileSync('src/tabs/admin/AdminBillingTab.tsx', adminBill);

// Doctor MessagesTab
let docMsg = fs.readFileSync('src/tabs/doctor/MessagesTab.tsx', 'utf8');
if (!docMsg.includes("MessageSquare")) {
  docMsg = docMsg.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, MessageSquare } from 'lucide-react';");
}
fs.writeFileSync('src/tabs/doctor/MessagesTab.tsx', docMsg);

console.log("Fixed last lint issues!");
