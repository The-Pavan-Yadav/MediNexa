const fs = require('fs');

let content = fs.readFileSync('src/tabs/MyCaseTab.tsx', 'utf8');

const componentStart = "export default function MyCaseTab({ patientData }: { patientData?: any }) {";

content = content.replace(
  componentStart,
  `${componentStart}
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchCase();
  }, [patientData]);

  const fetchCase = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeCases = data.filter(c => c.status !== 'Closed');
      if (activeCases.length > 0) {
        setCaseData(activeCases[0]);
      } else if (data.length > 0) {
        setCaseData(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#52606D]">Loading case...</div>;
  if (!caseData) return <div className="p-8 text-center text-[#52606D]">No active clinical cases found.</div>;
`
);

// Replace hardcoded strings
content = content.replace(
  "Clinical Case: Hypertension Management",
  "Clinical Case: {caseData.diagnosis}"
);

content = content.replace(
  "Case ID: HTN-2026-8891 • Initiated Sep 02, 2026",
  "Case ID: {caseData.id} • Initiated {caseData.date ? new Date(caseData.date).toLocaleDateString() : 'N/A'}"
);

content = content.replace(
  "Dr. Emily Chen, MD",
  "{caseData.doctorName || 'Assigned Doctor'}"
);

content = content.replace(
  "Essential (primary) hypertension",
  "{caseData.diagnosis}"
);

content = content.replace(
  "Patient presents with sustained elevated blood pressure readings over 3 consecutive visits (Avg: 145/92). No acute signs of end-organ damage detected. ECG indicates normal sinus rhythm. Initiating Stage 1 pharmacological intervention combined with lifestyle modifications.",
  "{caseData.symptoms || 'No specific symptoms recorded.'}"
);

fs.writeFileSync('src/tabs/MyCaseTab.tsx', content);
