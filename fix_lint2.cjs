const fs = require('fs');

// DoctorDashboard.tsx
let docDash = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');
docDash = docDash.replace("<PatientsTab doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />", "<(PatientsTab as any) doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />");
// Oh wait, I couldn't cast because JSX doesn't allow <(Component as any) .../>. I will just pass them. Wait, `PatientsTab` in `DoctorDashboard.tsx` uses standard JSX `<PatientsTab .../>`
// I need to add globalSearchQuery and setGlobalSearchQuery to `CasesTab` and `HealthInputTab` maybe? Let's check which ones have the TS error.
// The error is on line 191 which might be `CasesTab` or `HealthInputTab`. I'll just change their props to accept it.
const tabsToFix = ['HealthInputTab.tsx', 'CasesTab.tsx'];
for (const t of tabsToFix) {
  const p = `src/tabs/doctor/${t}`;
  let code = fs.readFileSync(p, 'utf8');
  code = code.replace(
    /export default function [^({]+\({ doctorData, setActiveTab }: { doctorData: any, setActiveTab\?: any }\) {/g,
    (match) => match.replace("} ) {", ", globalSearchQuery?: any, setGlobalSearchQuery?: any }) {") // wrong replace
  );
  // Actually simpler:
  code = code.replace(
    /setActiveTab\?: any }\) {/,
    "setActiveTab?: any, globalSearchQuery?: any, setGlobalSearchQuery?: any }) {"
  );
  fs.writeFileSync(p, code);
}

// AppointmentsTab.tsx (patient)
let appt = fs.readFileSync('src/tabs/AppointmentsTab.tsx', 'utf8');
appt = appt.replace(/const upcoming = data\.filter\(\(a:any\) => a\.status === 'upcoming'/g, "const upcoming = data.filter((a:any) => a.status === 'upcoming' || a.status === 'Scheduled'");
appt = appt.replace(/data\.sort\(\(a, b\) => new Date\(a\.date\)/g, "data.sort((a:any, b:any) => new Date(a.date)");
fs.writeFileSync('src/tabs/AppointmentsTab.tsx', appt);

// PrivacyAccessTab.tsx
let priv = fs.readFileSync('src/tabs/PrivacyAccessTab.tsx', 'utf8');
priv = priv.replace(/dataSharing,/g, "");
fs.writeFileSync('src/tabs/PrivacyAccessTab.tsx', priv);

// AdminBillingTab.tsx
let adminBill = fs.readFileSync('src/tabs/admin/AdminBillingTab.tsx', 'utf8');
if (!adminBill.includes("CheckCircle2")) {
  adminBill = adminBill.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, CheckCircle2 } from 'lucide-react';");
}
fs.writeFileSync('src/tabs/admin/AdminBillingTab.tsx', adminBill);

// Doctor MessagesTab.tsx
let docMsg = fs.readFileSync('src/tabs/doctor/MessagesTab.tsx', 'utf8');
if (!docMsg.includes("MessageSquare")) {
  docMsg = docMsg.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, MessageSquare } from 'lucide-react';");
}
fs.writeFileSync('src/tabs/doctor/MessagesTab.tsx', docMsg);

