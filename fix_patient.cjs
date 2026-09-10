const fs = require('fs');
let code = fs.readFileSync('src/tabs/doctor/PatientsTab.tsx', 'utf8');
code = code.replace("setGlobalSearchQuery(patient.mhdId)", "setGlobalSearchQuery(p.mhdId)");
fs.writeFileSync('src/tabs/doctor/PatientsTab.tsx', code);
