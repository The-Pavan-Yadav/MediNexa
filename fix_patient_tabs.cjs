const fs = require('fs');

const tabs = [
  'UpcomingTab.tsx',
  'TimelineTab.tsx',
  'MyCaseTab.tsx',
  'MedicinesTab.tsx',
  'ResultsTab.tsx',
  'MyDoctorsTab.tsx',
  'HealthOverviewTab.tsx',
  'AppointmentsTab.tsx',
  'BillingTab.tsx'
];

for(const t of tabs) {
  const p = `src/tabs/${t}`;
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');
  
  // They are using patientData.mhdId. But wait, doctor portal saves patientId as UID and patientMhdId as MHD ID.
  // We can just query where('patientId', '==', auth.currentUser.uid) instead of where('patientId', '==', pid)
  // First, add auth to imports if needed
  if (!code.includes('import { auth')) {
      code = code.replace("import { db }", "import { db, auth }");
  } else if (!code.includes('auth.currentUser') && !code.includes('auth')) {
      code = code.replace("import { db }", "import { db, auth }");
  }
  
  code = code.replace(/where\('patientId', '==', pid\)/g, "where('patientId', '==', auth.currentUser?.uid)");
  code = code.replace(/where\('patientId', '==', patientData\.mhdId\)/g, "where('patientId', '==', auth.currentUser?.uid)");
  
  // We also want to support real-time for TimelineTab, MyCaseTab, HealthOverviewTab, ResultsTab, MedicinesTab.
  // But wait, the prompt says "Use real-time Firebase listeners where appropriate so changes appear without requiring manual refresh."
  
  fs.writeFileSync(p, code);
}
console.log("Patched patient tabs where clause");
