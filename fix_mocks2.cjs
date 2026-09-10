const fs = require('fs');

function removeMocks(file, regex) {
  let code = fs.readFileSync(file, 'utf8');
  if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync(file, code);
    console.log("Removed mock seeding from " + file);
  } else {
    console.log("Could not find mock seeding in " + file);
  }
}

// Cases
removeMocks(
  'src/tabs/doctor/CasesTab.tsx',
  /\/\/ If empty, let's seed a couple of mock cases[\s\S]*?fetchedCases\.push\(\{ id: docRef\.id, \.\.\.mc \} as CaseType\);\s+\}\s+\}/
);

// Messages
removeMocks(
  'src/tabs/doctor/MessagesTab.tsx',
  /\/\/ If no conversations exist, seed some mock ones[\s\S]*?fetchedConv\.push\(\{ id: docRef\.id, \.\.\.mc \} as ConversationType\);\s+\}\s+\}/
);

