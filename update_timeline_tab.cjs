const fs = require('fs');

let content = fs.readFileSync('src/tabs/TimelineTab.tsx', 'utf8');

// Add imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db } from '../../firebase';\nimport { collection, query, where, getDocs } from 'firebase/firestore';"
);

// Delete TIMELINE_EVENTS
const startIdx = content.indexOf('const TIMELINE_EVENTS: TimelineEvent[] = [');
const endIdx = content.indexOf('export default function TimelineTab');
content = content.substring(0, startIdx) + content.substring(endIdx);

// Component body
const componentStart = 'export default function TimelineTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  componentStart,
  `${componentStart}
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) {
      fetchTimeline();
    }
  }, [patientData]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const allEvents: TimelineEvent[] = [];
      const pid = patientData.mhdId;

      // Fetch Appointments
      const apptSnap = await getDocs(query(collection(db, 'appointments'), where('patientId', '==', pid)));
      apptSnap.forEach(doc => {
        const d = doc.data();
        allEvents.push({
          id: doc.id,
          date: d.date,
          time: d.time || '12:00 PM',
          type: 'appointment',
          title: d.type || 'Appointment',
          provider: d.doctorName || d.provider || 'Unknown',
          department: d.department || d.specialty || 'General',
          description: \`Status: \${d.status}\`,
          icon: CalendarClock,
          iconBg: 'bg-[#FFFFFF]',
          iconColor: 'text-[#52606D]',
          borderColor: 'border-[#CBD5E1]',
          hasDetails: false,
          timestamp: new Date(d.date + ' ' + (d.time || '12:00 PM')).getTime()
        });
      });

      // Fetch Medicines
      const medSnap = await getDocs(query(collection(db, 'medicines'), where('patientId', '==', pid)));
      medSnap.forEach(doc => {
        const d = doc.data();
        allEvents.push({
          id: doc.id,
          date: d.startDate || new Date().toISOString().split('T')[0],
          time: '08:00 AM',
          type: 'medicine',
          title: \`Prescription: \${d.name} \${d.dosage}\`,
          provider: d.doctorName || d.prescribingDoctor || 'Unknown',
          department: 'Pharmacy',
          description: d.frequency || 'Take as directed',
          icon: Pill,
          iconBg: 'bg-[#F0F5FA]',
          iconColor: 'text-[#1F5F8B]',
          borderColor: 'border-[#1F5F8B]',
          hasDetails: true,
          timestamp: new Date(d.startDate || new Date()).getTime()
        });
      });

      // Fetch Cases
      const caseSnap = await getDocs(query(collection(db, 'cases'), where('patientId', '==', pid)));
      caseSnap.forEach(doc => {
        const d = doc.data();
        allEvents.push({
          id: doc.id,
          date: d.date || new Date().toISOString().split('T')[0],
          time: '12:00 PM',
          type: 'case',
          title: \`Diagnosis: \${d.diagnosis}\`,
          provider: d.doctorName || 'Unknown',
          department: d.department || 'Clinical',
          description: \`Case Status: \${d.status}\`,
          icon: Activity,
          iconBg: 'bg-[#FEF6E7]',
          iconColor: 'text-[#975A16]',
          borderColor: 'border-[#F6E0B5]',
          hasDetails: true,
          timestamp: new Date(d.date || new Date()).getTime()
        });
      });

      // Sort descending
      allEvents.sort((a, b) => (b as any).timestamp - (a as any).timestamp);
      
      setEvents(allEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
`
);

content = content.replace(
  "const filteredEvents = TIMELINE_EVENTS.filter(event => {",
  "const filteredEvents = events.filter(event => {"
);

fs.writeFileSync('src/tabs/TimelineTab.tsx', content);
