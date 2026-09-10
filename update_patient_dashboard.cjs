const fs = require('fs');

let content = fs.readFileSync('src/PatientDashboard.tsx', 'utf8');

// Add imports
content = content.replace(
  "import {",
  "import { auth, db } from './firebase';\nimport { doc, getDoc } from 'firebase/firestore';\nimport {"
);

// Add useEffect and state
content = content.replace(
  "export default function PatientDashboard({ onLogout }: PatientDashboardProps) {",
  `export default function PatientDashboard({ onLogout }: PatientDashboardProps) {
  const [patientData, setPatientData] = useState<any>(null);
  
  React.useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setPatientData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);`
);

// Fix header to show real name and mhdId
content = content.replace(
  /<p className="text-\[13px\] font-semibold text-\[#172B3A\] leading-tight">Alex Johnson<\/p>/,
  '<p className="text-[13px] font-semibold text-[#172B3A] leading-tight">{patientData?.name || "Patient"}</p>'
);
content = content.replace(
  /<p className="text-\[11px\] text-\[#52606D\]">MRN: 982-441-00<\/p>/,
  '<p className="text-[11px] text-[#52606D]">ID: {patientData?.mhdId || "Loading..."}</p>'
);

// Fix Good morning text
content = content.replace(
  /<h2 className="text-\[22px\] font-semibold text-\[#102A43\] mb-1">Good morning, Alex.<\/h2>/,
  '<h2 className="text-[22px] font-semibold text-[#102A43] mb-1">Good morning, {patientData?.name ? patientData.name.split(" ")[0] : "Patient"}.</h2>'
);

// Fix DOB
content = content.replace(
  /<p className="font-medium text-\[#172B3A\]">Oct 12, 1985<\/p>/,
  '<p className="font-medium text-[#172B3A]">{patientData?.dob ? new Date(patientData.dob).toLocaleDateString() : "Not Set"}</p>'
);

fs.writeFileSync('src/PatientDashboard.tsx', content);
