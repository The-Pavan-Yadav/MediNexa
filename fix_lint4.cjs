const fs = require('fs');

for (const f of ['HealthInputTab.tsx', 'CasesTab.tsx']) {
  const p = `src/tabs/doctor/${f}`;
  let code = fs.readFileSync(p, 'utf8');
  if (!code.includes('globalSearchQuery?:')) {
    code = code.replace(
      /export default function (\w+)\({ doctorData, setActiveTab }: { doctorData: any, setActiveTab\?: any }\) {/,
      "export default function $1({ doctorData, setActiveTab, globalSearchQuery, setGlobalSearchQuery }: { doctorData: any, setActiveTab?: any, globalSearchQuery?: any, setGlobalSearchQuery?: any }) {"
    );
    fs.writeFileSync(p, code);
  }
}
console.log("Fixed doctor tabs props");
