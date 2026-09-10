const fs = require('fs');

const tabs = ['AppointmentsTab.tsx', 'UpcomingTab.tsx'];
for(const t of tabs) {
  let file = `src/tabs/${t}`;
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/const data = snap.docs.map\(doc => \(\{ id: doc.id, \.\.\.doc.data\(\) \}\)\);/g, "const data: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));");
  fs.writeFileSync(file, code);
}

// And `DoctorDashboard.tsx` line 191
let dash = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');
dash = dash.replace(/<PatientsTab doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} \/>/g, "<PatientsTab doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />");
// Oh, the error is `Property 'globalSearchQuery' does not exist on type '{ doctorData: any; setActiveTab?: any; }'`.
// Which component is on line 191?
