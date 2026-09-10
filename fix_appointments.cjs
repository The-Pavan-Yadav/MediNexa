const fs = require('fs');
let code = fs.readFileSync('src/tabs/doctor/AppointmentsTab.tsx', 'utf8');

// Replace mock seeding with nothing
// The mock seeding looks like:
//      // Seed mock appointments if empty
//      if (fetched.length === 0) { ... }
const seedRegex = /\/\/ Seed mock appointments if empty[\s\S]*?fetchAppointments\(\);\s+break;\s+\}\s+\}\s+\}/;
if (seedRegex.test(code)) {
    code = code.replace(seedRegex, '}');
    fs.writeFileSync('src/tabs/doctor/AppointmentsTab.tsx', code);
    console.log("Removed mock seeding from AppointmentsTab");
} else {
    console.log("Could not find mock seeding in AppointmentsTab");
}
