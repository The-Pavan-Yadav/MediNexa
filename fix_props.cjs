const fs = require('fs');

const tabs = [
  'DoctorHomeTab',
  'HealthInputTab',
  'CasesTab',
  'PatientsTab',
  'AppointmentsTab',
  'MessagesTab',
  'EarningsTab',
  'SettingsTab'
];

for(const t of tabs) {
  const p = `src/tabs/doctor/${t}.tsx`;
  if (!fs.existsSync(p)) continue;
  let code = fs.readFileSync(p, 'utf8');
  
  if (code.includes(`export default function ${t}({ doctorData }: { doctorData: any })`)) {
    code = code.replace(
      `export default function ${t}({ doctorData }: { doctorData: any })`,
      `export default function ${t}({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: any })`
    );
  } else if (code.includes(`export default function ${t}({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: (t: string) => void })`)) {
    code = code.replace(
      `export default function ${t}({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: (t: string) => void })`,
      `export default function ${t}({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: any })`
    );
  }
  
  fs.writeFileSync(p, code);
}

let dash = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');
dash = dash.replace(/<\(HealthInputTab as any\)/g, "<HealthInputTab");
dash = dash.replace(/<\(CasesTab as any\)/g, "<CasesTab");
dash = dash.replace(/<\(AppointmentsTab as any\)/g, "<AppointmentsTab");
dash = dash.replace(/<\(MessagesTab as any\)/g, "<MessagesTab");
dash = dash.replace(/<\(EarningsTab as any\)/g, "<EarningsTab");
dash = dash.replace(/<\(SettingsTab as any\)/g, "<SettingsTab");
fs.writeFileSync('src/DoctorDashboard.tsx', dash);
console.log("Fixed props!");
