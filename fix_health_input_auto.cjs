const fs = require('fs');

let hi = fs.readFileSync('src/tabs/doctor/HealthInputTab.tsx', 'utf8');

const oldHandle = `  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;`;

const newHandle = `  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;`;

const oldMount = `  const [formData, setFormData] = useState({`;
const newMount = `  useEffect(() => {
    if (searchId.trim() && !selectedPatient) {
      handleSearch();
    }
  }, []);

  const [formData, setFormData] = useState({`;

hi = hi.replace(oldHandle, newHandle);
if (hi.includes(oldMount) && !hi.includes("useEffect(() => {")) {
  hi = hi.replace(oldMount, newMount);
  // Add useEffect to imports if missing
  if (!hi.includes("useEffect")) {
    hi = hi.replace("import React, { useState }", "import React, { useState, useEffect }");
  } else if (!hi.includes("useEffect") && hi.includes("import React, { useState }")) {
      hi = hi.replace("import React, { useState }", "import React, { useState, useEffect }");
  }
}
fs.writeFileSync('src/tabs/doctor/HealthInputTab.tsx', hi);
console.log("HealthInput auto search added");
