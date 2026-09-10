const fs = require('fs');

let code = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');
code = code.replace(/<\(PatientsTab as any\) /g, "<PatientsTab ");
fs.writeFileSync('src/DoctorDashboard.tsx', code);

let p = fs.readFileSync('src/tabs/doctor/PatientsTab.tsx', 'utf8');
p = p.replace(
  "export default function PatientsTab({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: any }) {",
  "export default function PatientsTab({ doctorData, setActiveTab, globalSearchQuery, setGlobalSearchQuery }: { doctorData: any, setActiveTab?: any, globalSearchQuery?: any, setGlobalSearchQuery?: any }) {"
);
fs.writeFileSync('src/tabs/doctor/PatientsTab.tsx', p);

// Now UpcomingTab
let u = fs.readFileSync('src/tabs/UpcomingTab.tsx', 'utf8');
u = u.replace(/\/\/ useEffect\(\(\) => {/g, "");
u = u.replace(/\/\/ if \(patientData\?\.mhdId\) /g, "");
u = u.replace(/\/\/ }, \[patientData\]\);/g, "");
fs.writeFileSync('src/tabs/UpcomingTab.tsx', u);

console.log("Fixed!");
