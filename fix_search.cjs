const fs = require('fs');

let dash = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');

const oldState = `  const [activeTab, setActiveTab] = useState('Dashboard');
  const [doctorData, setDoctorData] = useState<any>(null);`;
const newState = `  const [activeTab, setActiveTab] = useState('Dashboard');
  const [doctorData, setDoctorData] = useState<any>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');`;

const oldInput = `            <input 
               type="text"
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    window.dispatchEvent(new CustomEvent('global-search', { detail: e.currentTarget.value.trim() }));
                    setActiveTab('Patients');
                 }
               }}
               placeholder="Search patients, ID, cases... (Press Enter)" 
               className="bg-transparent border-none outline-none text-[13px] text-[#172B3A] w-full placeholder:text-[#52606D]"
            />`;
const newInput = `            <input 
               type="text"
               value={globalSearchQuery}
               onChange={(e) => setGlobalSearchQuery(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                    if (activeTab !== 'Patients') setActiveTab('Patients');
                 }
               }}
               placeholder="Search patients, ID, cases... (Press Enter)" 
               className="bg-transparent border-none outline-none text-[13px] text-[#172B3A] w-full placeholder:text-[#52606D]"
            />`;

const oldPatTab = `<PatientsTab doctorData={doctorData} setActiveTab={setActiveTab} />`;
const newPatTab = `<PatientsTab doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />`;

dash = dash.replace(oldState, newState);
dash = dash.replace(oldInput, newInput);
dash = dash.replace(oldPatTab, newPatTab);

fs.writeFileSync('src/DoctorDashboard.tsx', dash);

let pat = fs.readFileSync('src/tabs/doctor/PatientsTab.tsx', 'utf8');
const oldPatProps = `export default function PatientsTab({ doctorData, setActiveTab }: { doctorData: any, setActiveTab?: (t: string) => void }) {`;
const newPatProps = `export default function PatientsTab({ doctorData, setActiveTab, globalSearchQuery, setGlobalSearchQuery }: { doctorData: any, setActiveTab?: (t: string) => void, globalSearchQuery?: string, setGlobalSearchQuery?: (s: string) => void }) {`;

// Replace internal search query with global if provided
const patOldSearchState = `const [searchQuery, setSearchQuery] = useState('');`;
const patNewSearchState = `// use globalSearchQuery if provided, else local
  const [localSearch, setLocalSearch] = useState('');
  const searchQuery = globalSearchQuery !== undefined ? globalSearchQuery : localSearch;
  const handleSearchChange = (val: string) => {
    if (setGlobalSearchQuery) setGlobalSearchQuery(val);
    else setLocalSearch(val);
  };`;

const patOldInput = `value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}`;
const patNewInput = `value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}`;

// Remove the old global-search event listener we added
const oldUE = `  useEffect(() => {
    fetchMyPatients();
    
    const handleGlobalSearch = (e: any) => {
      setSearchQuery(e.detail);
    };
    window.addEventListener('global-search', handleGlobalSearch);
    return () => window.removeEventListener('global-search', handleGlobalSearch);
  }, []);`;
const newUE = `  useEffect(() => {
    fetchMyPatients();
  }, []);`;

pat = pat.replace(oldPatProps, newPatProps);
pat = pat.replace(patOldSearchState, patNewSearchState);
pat = pat.replace(patOldInput, patNewInput);
pat = pat.replace(oldUE, newUE);

fs.writeFileSync('src/tabs/doctor/PatientsTab.tsx', pat);
console.log("Fixed Search sharing!");
