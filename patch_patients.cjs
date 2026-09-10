const fs = require('fs');
let code = fs.readFileSync('src/tabs/doctor/PatientsTab.tsx', 'utf8');

const oldProps = `export default function PatientsTab({ doctorData }: { doctorData: any }) {`;
const newProps = `export default function PatientsTab({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: (t: string) => void }) {`;

const oldUseEffect = `  useEffect(() => {
    fetchMyPatients();
  }, [doctorData]);`;

const newUseEffect = `  useEffect(() => {
    fetchMyPatients();
    
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener('global-search', handleGlobalSearch);
    return () => window.removeEventListener('global-search', handleGlobalSearch);
  }, [doctorData]);`;

code = code.replace(oldProps, newProps);
if(code.includes(oldUseEffect)) {
    code = code.replace(oldUseEffect, newUseEffect);
} else {
    console.log("Could not find useEffect in PatientsTab");
}

fs.writeFileSync('src/tabs/doctor/PatientsTab.tsx', code);
console.log("Patched PatientsTab.tsx");
