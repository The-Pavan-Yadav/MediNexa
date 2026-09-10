const fs = require('fs');

let content = fs.readFileSync('src/tabs/MedicinesTab.tsx', 'utf8');

// Add imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db } from '../../firebase';\nimport { collection, query, where, getDocs } from 'firebase/firestore';"
);

// Delete mock data
const startIdx = content.indexOf('const TODAY_SCHEDULE: ScheduleItem[] = [');
const endIdx = content.indexOf('export default function MedicinesTab');
content = content.substring(0, startIdx) + content.substring(endIdx);

// Modify component
const componentStart = 'export default function MedicinesTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  componentStart,
  `${componentStart}
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchMedicines();
  }, [patientData]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'medicines'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };`
);

content = content.replace(
  "const [activeTab, setActiveTab] = useState<'schedule' | 'prescriptions'>('schedule');",
  "const [activeTab, setActiveTab] = useState<'schedule' | 'prescriptions'>('prescriptions');"
);

// We should replace PRESCRIPTIONS_DATA with prescriptions
content = content.replace(
  /PRESCRIPTIONS_DATA\.filter/g,
  "prescriptions.filter"
);

content = content.replace(
  /PRESCRIPTIONS_DATA\.map/g,
  "prescriptions.map"
);

content = content.replace(
  /prescription\.provider/g,
  "(prescription.doctorName || prescription.provider)"
);

content = content.replace(
  /prescription\.medicine/g,
  "prescription.name"
);

fs.writeFileSync('src/tabs/MedicinesTab.tsx', content);
