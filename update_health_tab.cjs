const fs = require('fs');

let content = fs.readFileSync('src/tabs/HealthOverviewTab.tsx', 'utf8');

content = content.replace(
  "import React from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db } from '../../firebase';\nimport { collection, query, where, getDocs } from 'firebase/firestore';"
);

const componentStart = 'export default function HealthOverviewTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  componentStart,
  `${componentStart}
  const [healthData, setHealthData] = useState<any>(null);
  
  // You could fetch from a health_profiles collection here
  // For now, we will just use patientData where possible
`
);

content = content.replace(
  "Oct 12, 1985",
  "{patientData?.dob ? new Date(patientData.dob).toLocaleDateString() : 'N/A'}"
);
content = content.replace(
  "39 Years",
  "{patientData?.dob ? new Date().getFullYear() - new Date(patientData.dob).getFullYear() + ' Years' : 'N/A'}"
);
content = content.replace(
  "Male",
  "{patientData?.gender || 'N/A'}"
);
content = content.replace(
  "982-441-00",
  "{patientData?.mhdId || 'N/A'}"
);
content = content.replace(
  "165 lbs",
  "{patientData?.weight || '165 lbs'}"
);
content = content.replace(
  "5'10\"",
  "{patientData?.height || '5\\'10\"'}"
);
content = content.replace(
  "A+ Positive",
  "{patientData?.bloodType || 'A+ Positive'}"
);

fs.writeFileSync('src/tabs/HealthOverviewTab.tsx', content);
