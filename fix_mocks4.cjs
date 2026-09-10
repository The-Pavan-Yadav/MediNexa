const fs = require('fs');
let code = fs.readFileSync('src/tabs/doctor/MessagesTab.tsx', 'utf8');

const regex = /\/\/ If no conversations exist, seed some mock ones[\s\S]*?console\.error\("Failed to seed conversations", e\);\s+\}\s+\}/;
if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/tabs/doctor/MessagesTab.tsx', code);
    console.log("Removed mock messages");
} else {
    console.log("Not found mock messages");
}
