const fs = require('fs');
let code = fs.readFileSync('src/tabs/doctor/DoctorHomeTab.tsx', 'utf8');

const oldProps = `export default function DoctorHomeTab({ doctorData }: { doctorData: any }) {`;
const newProps = `export default function DoctorHomeTab({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: (t: string) => void }) {`;

const oldCal = `<button className="text-[12px] font-medium text-[#1F5F8B] hover:underline">View Calendar</button>`;
const newCal = `<button onClick={() => setActiveTab && setActiveTab('Appointments')} className="text-[12px] font-medium text-[#1F5F8B] hover:underline">View Calendar</button>`;

code = code.replace(oldProps, newProps);
code = code.replace(oldCal, newCal);

fs.writeFileSync('src/tabs/doctor/DoctorHomeTab.tsx', code);
console.log("Patched DoctorHomeTab props and View Calendar");
