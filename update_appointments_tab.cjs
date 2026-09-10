const fs = require('fs');

let content = fs.readFileSync('src/tabs/AppointmentsTab.tsx', 'utf8');

// Replace mock data with Firebase fetch
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db } from '../../firebase';\nimport { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';"
);

// Delete APPOINTMENTS_DATA and update component to fetch data
const componentStart = 'export default function AppointmentsTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  /const APPOINTMENTS_DATA: Appointment\[\] = \[\s*\{[\s\S]*?\};\n\nexport default function AppointmentsTab\(\{ patientData \}: \{ patientData\?: any \}\) \{/,
  `export default function AppointmentsTab({ patientData }: { patientData?: any }) {\n  const [appointments, setAppointments] = useState<Appointment[]>([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    if (patientData?.mhdId) {\n      fetchAppointments();\n    }\n  }, [patientData]);\n\n  const fetchAppointments = async () => {\n    setLoading(true);\n    try {\n      const q = query(collection(db, 'appointments'), where('patientId', '==', patientData.mhdId));\n      const snap = await getDocs(q);\n      const data = snap.docs.map(doc => ({\n        id: doc.id,\n        ...doc.data()\n      })) as Appointment[];\n      // Simple sort by date\n      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());\n      // determine next appointment\n      const upcoming = data.filter(a => a.status === 'upcoming' || a.status === 'Scheduled');\n      if (upcoming.length > 0) {\n        upcoming[0].isNext = true;\n      }\n      setAppointments(data);\n    } catch (e) {\n      console.error(e);\n    } finally {\n      setLoading(false);\n    };\n  };\n`
);

content = content.replace(
  "const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming');",
  "const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming');"
);

content = content.replace(
  "const filteredAppointments = APPOINTMENTS_DATA.filter(app => {",
  "const filteredAppointments = appointments.filter(app => {"
);

content = content.replace(
  "if (activeFilter === 'upcoming') return app.status === 'upcoming';",
  "if (activeFilter === 'upcoming') return app.status === 'upcoming' || app.status === 'Scheduled';"
);

content = content.replace(
  "return app.status === 'completed' || app.status === 'cancelled';",
  "return app.status === 'completed' || app.status === 'Completed' || app.status === 'cancelled' || app.status === 'Cancelled';"
);

fs.writeFileSync('src/tabs/AppointmentsTab.tsx', content);
