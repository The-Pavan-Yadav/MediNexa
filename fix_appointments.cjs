const fs = require('fs');

let content = fs.readFileSync('src/tabs/AppointmentsTab.tsx', 'utf8');

const startIdx = content.indexOf('const APPOINTMENTS_DATA: Appointment[] = [');
const endIdx = content.indexOf('export default function AppointmentsTab');

if (startIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

fs.writeFileSync('src/tabs/AppointmentsTab.tsx', content);
