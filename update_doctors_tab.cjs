const fs = require('fs');

let content = fs.readFileSync('src/tabs/MyDoctorsTab.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db } from '../../firebase';\nimport { collection, query, where, getDocs } from 'firebase/firestore';"
);

const componentStart = 'export default function MyDoctorsTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  componentStart,
  `${componentStart}
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, [patientData]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Just fetch all doctors for now
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
`
);

content = content.replace(
  "const filteredDoctors = DOCTORS_DATA.filter(doc => {",
  "const filteredDoctors = doctors.filter(doc => {"
);

content = content.replace(
  /doc\.department/g,
  "(doc.department || doc.specialization)"
);

content = content.replace(
  /doc\.location/g,
  "(doc.location || 'Main Clinic')"
);


// Delete DOCTORS_DATA
const startIdx = content.indexOf('const DOCTORS_DATA: Doctor[] = [');
const endIdx = content.indexOf('export default function MyDoctorsTab');
if (startIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

fs.writeFileSync('src/tabs/MyDoctorsTab.tsx', content);
