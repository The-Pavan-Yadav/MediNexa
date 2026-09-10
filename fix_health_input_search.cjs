const fs = require('fs');

let hi = fs.readFileSync('src/tabs/doctor/HealthInputTab.tsx', 'utf8');

const oldProps = `export default function HealthInputTab({ doctorData }: HealthInputTabProps) {
  const [searchId, setSearchId] = useState('');`;

const newProps = `interface HealthInputTabProps {
  doctorData: any;
  setActiveTab?: (t: string) => void;
  globalSearchQuery?: string;
  setGlobalSearchQuery?: (s: string) => void;
}
export default function HealthInputTab({ doctorData, globalSearchQuery, setGlobalSearchQuery }: HealthInputTabProps) {
  const [localSearchId, setLocalSearchId] = useState('');
  const searchId = globalSearchQuery !== undefined ? globalSearchQuery : localSearchId;
  const setSearchId = (val: string) => {
     if (setGlobalSearchQuery) setGlobalSearchQuery(val);
     else setLocalSearchId(val);
  };`;

hi = hi.replace(/interface HealthInputTabProps {[\s\S]*?}/, '');
hi = hi.replace(/export default function HealthInputTab[\s\S]*?useState\(''\);/, newProps);

fs.writeFileSync('src/tabs/doctor/HealthInputTab.tsx', hi);
console.log("HealthInputTab search linked");

let dash = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');
dash = dash.replace(
  `{activeTab === 'Health Input' && <HealthInputTab doctorData={doctorData} setActiveTab={setActiveTab} />}`,
  `{activeTab === 'Health Input' && <HealthInputTab doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />}`
);
dash = dash.replace(
  `{activeTab === 'Cases' && <CasesTab doctorData={doctorData} setActiveTab={setActiveTab} />}`,
  `{activeTab === 'Cases' && <CasesTab doctorData={doctorData} setActiveTab={setActiveTab} globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />}`
);
fs.writeFileSync('src/DoctorDashboard.tsx', dash);
console.log("DoctorDashboard tabs linked");

let pat = fs.readFileSync('src/tabs/doctor/PatientsTab.tsx', 'utf8');
const oldOpenChart = `<button 
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] hover:bg-[#F4F6F8] transition-colors"
                      >
                        Open Chart <ChevronRight className="w-3.5 h-3.5" />
                      </button>`;
const newOpenChart = `<button 
                        onClick={() => {
                          if (setGlobalSearchQuery) setGlobalSearchQuery(patient.mhdId);
                          if (setActiveTab) setActiveTab('Health Input');
                        }}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] hover:bg-[#F4F6F8] transition-colors"
                      >
                        Open Chart <ChevronRight className="w-3.5 h-3.5" />
                      </button>`;

if(pat.includes(oldOpenChart)) {
    pat = pat.replace(oldOpenChart, newOpenChart);
} else {
    // Just find "Open Chart"
    pat = pat.replace(/<button[^>]*>\s*Open Chart <ChevronRight[^>]*>\s*<\/button>/g, newOpenChart);
}

fs.writeFileSync('src/tabs/doctor/PatientsTab.tsx', pat);
console.log("PatientsTab open chart linked");
