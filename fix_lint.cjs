const fs = require('fs');

// DoctorDashboard.tsx
let dash = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');
dash = dash.replace("<PatientsTab doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />", "<(PatientsTab as any) doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />");
fs.writeFileSync('src/DoctorDashboard.tsx', dash);

// AppointmentsTab.tsx (patient)
let appt = fs.readFileSync('src/tabs/AppointmentsTab.tsx', 'utf8');
appt = appt.replace(/const upcoming = data\.filter\(a => a\.status === 'upcoming'/g, "const upcoming = data.filter((a:any) => a.status === 'upcoming'");
fs.writeFileSync('src/tabs/AppointmentsTab.tsx', appt);

// BillingTab.tsx (patient)
let bill = fs.readFileSync('src/tabs/BillingTab.tsx', 'utf8');
bill = bill.replace(/data\.sort\(\(a, b\) => new Date\(b\.date\)/g, "data.sort((a:any, b:any) => new Date(b.date)");
bill = bill.replace(/<Receipt className/g, "<FileText className"); // Receipt not found, use FileText
if (!bill.includes("FileText")) {
  bill = bill.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, FileText } from 'lucide-react';");
}
fs.writeFileSync('src/tabs/BillingTab.tsx', bill);

// MyCaseTab.tsx (patient)
let mycase = fs.readFileSync('src/tabs/MyCaseTab.tsx', 'utf8');
mycase = mycase.replace(/data\.filter\(c => c\.status !== 'Closed'\)/g, "data.filter((c:any) => c.status !== 'Closed')");
fs.writeFileSync('src/tabs/MyCaseTab.tsx', mycase);

// PrivacyAccessTab.tsx (patient)
let priv = fs.readFileSync('src/tabs/PrivacyAccessTab.tsx', 'utf8');
priv = priv.replace(/emailAlerts,/g, "");
priv = priv.replace(/smsAlerts,/g, "");
priv = priv.replace(/dataSharing,/g, "");
fs.writeFileSync('src/tabs/PrivacyAccessTab.tsx', priv);

// UpcomingTab.tsx (patient)
let upc = fs.readFileSync('src/tabs/UpcomingTab.tsx', 'utf8');
upc = upc.replace(/fetchData/g, "");
upc = upc.replace(/data\.filter\(a => a\.status === 'upcoming'/g, "data.filter((a:any) => a.status === 'upcoming'");
fs.writeFileSync('src/tabs/UpcomingTab.tsx', upc);

// admin tabs
let adminAppt = fs.readFileSync('src/tabs/admin/AdminAppointmentsTab.tsx', 'utf8');
adminAppt = adminAppt.replace(/<Save className/g, "<CheckCircle2 className");
fs.writeFileSync('src/tabs/admin/AdminAppointmentsTab.tsx', adminAppt);

let adminBill = fs.readFileSync('src/tabs/admin/AdminBillingTab.tsx', 'utf8');
adminBill = adminBill.replace(/<Save className/g, "<CheckCircle2 className");
fs.writeFileSync('src/tabs/admin/AdminBillingTab.tsx', adminBill);

// doctor Appt
let docAppt = fs.readFileSync('src/tabs/doctor/AppointmentsTab.tsx', 'utf8');
if (!docAppt.includes("import { getDoc")) {
  docAppt = docAppt.replace(/import { collection/g, "import { getDoc, collection");
}
fs.writeFileSync('src/tabs/doctor/AppointmentsTab.tsx', docAppt);

// doctor Messages
let docMsg = fs.readFileSync('src/tabs/doctor/MessagesTab.tsx', 'utf8');
if (!docMsg.includes("MessageSquare")) {
  docMsg = docMsg.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, MessageSquare } from 'lucide-react';");
}
fs.writeFileSync('src/tabs/doctor/MessagesTab.tsx', docMsg);

