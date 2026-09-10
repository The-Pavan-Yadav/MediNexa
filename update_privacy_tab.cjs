const fs = require('fs');

let content = fs.readFileSync('src/tabs/PrivacyAccessTab.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db, auth } from '../../firebase';\nimport { doc, updateDoc } from 'firebase/firestore';"
);

const componentStart = 'export default function PrivacyAccessTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  componentStart,
  `${componentStart}
  
  const handleSave = async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        emailAlerts,
        smsAlerts,
        dataSharing
      });
      alert('Preferences saved successfully!');
    }
  };
`
);

content = content.replace(
  /<button className="bg-\[#1F5F8B\] text-white text-\[13px\] font-medium px-6 py-2 rounded-\[4px\] hover:bg-\[#102A43\] transition-colors">/g,
  '<button onClick={handleSave} className="bg-[#1F5F8B] text-white text-[13px] font-medium px-6 py-2 rounded-[4px] hover:bg-[#102A43] transition-colors">'
);

fs.writeFileSync('src/tabs/PrivacyAccessTab.tsx', content);
