const fs = require('fs');

let content = fs.readFileSync('src/tabs/ResultsTab.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db } from '../../firebase';\nimport { collection, query, where, getDocs } from 'firebase/firestore';"
);

const componentStart = 'export default function ResultsTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  componentStart,
  `${componentStart}
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchResults();
  }, [patientData]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Map cases to "results"
      const mappedResults = data.map(d => ({
        id: d.id,
        date: d.date,
        type: d.diagnosis,
        orderedBy: d.doctorName || 'Clinical Team',
        status: 'Final',
        summary: d.symptoms || 'Case closed or active.',
        flag: d.priority === 'High' ? 'Abnormal' : 'Normal'
      }));
      setResults(mappedResults);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
`
);

content = content.replace(
  "const filteredResults = RESULTS_DATA.filter(res => {",
  "const filteredResults = results.filter(res => {"
);

// Delete RESULTS_DATA
const startIdx = content.indexOf('const RESULTS_DATA: LabResult[] = [');
const endIdx = content.indexOf('export default function ResultsTab');
if (startIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

fs.writeFileSync('src/tabs/ResultsTab.tsx', content);
