const fs = require('fs');
let code = fs.readFileSync('src/tabs/doctor/AppointmentsTab.tsx', 'utf8');

// Replace mock seeding with nothing
code = code.replace(/\/\/ Seed mock appointments if empty[\s\S]*?fetchAppointments\(\);\s+break;\s+\}\s+\}\s+\}/, '}');

// We also need to fix the submit handler to ensure it creates an appointment
fs.writeFileSync('src/tabs/doctor/AppointmentsTab.tsx', code);
