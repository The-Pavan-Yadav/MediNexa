const fs = require('fs');

let adminBill = fs.readFileSync('src/tabs/admin/AdminBillingTab.tsx', 'utf8');
if (!adminBill.includes("CheckCircle2,")) {
  adminBill = adminBill.replace(/import {/, "import { CheckCircle2,");
  fs.writeFileSync('src/tabs/admin/AdminBillingTab.tsx', adminBill);
}

let docMsg = fs.readFileSync('src/tabs/doctor/MessagesTab.tsx', 'utf8');
if (!docMsg.includes("MessageSquare,")) {
  docMsg = docMsg.replace(/import {/, "import { MessageSquare,");
  fs.writeFileSync('src/tabs/doctor/MessagesTab.tsx', docMsg);
}

console.log("Fixed!");
