const fs = require('fs');
let code = fs.readFileSync('src/tabs/doctor/PatientsTab.tsx', 'utf8');

const oldUseEffect = `  useEffect(() => {
    fetchMyPatients();
  }, []);`;

const newUseEffect = `  useEffect(() => {
    fetchMyPatients();
    
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener('global-search', handleGlobalSearch);
    return () => window.removeEventListener('global-search', handleGlobalSearch);
  }, []);`;

code = code.replace(oldUseEffect, newUseEffect);
fs.writeFileSync('src/tabs/doctor/PatientsTab.tsx', code);
console.log("Patched PatientsTab.tsx properly");
