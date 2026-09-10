const fs = require('fs');

let content = fs.readFileSync('src/PatientDashboard.tsx', 'utf8');

// Replace tab rendering with patientData prop
const tabs = [
  'Upcoming', 'Timeline', 'My Case', 'Medicines', 'Results', 'My Doctors', 
  'Health Overview', 'Appointments', 'My QR', 'Privacy & Access', 'Billing', 'Emergency'
];

tabs.forEach(tab => {
  const tabName = tab.replace(/ & /g, '').replace(/ /g, '') + 'Tab';
  content = content.replace(
    `{activeTab === '${tab}' && <${tabName} />`,
    `{activeTab === '${tab}' && <${tabName} patientData={patientData} />`
  );
});

fs.writeFileSync('src/PatientDashboard.tsx', content);
