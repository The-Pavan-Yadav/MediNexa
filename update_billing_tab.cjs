const fs = require('fs');

let content = fs.readFileSync('src/tabs/BillingTab.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { db } from '../../firebase';\nimport { collection, query, where, getDocs } from 'firebase/firestore';"
);

const componentStart = 'export default function BillingTab({ patientData }: { patientData?: any }) {';

content = content.replace(
  componentStart,
  `${componentStart}
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchBilling();
  }, [patientData]);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'billing'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
`
);

content = content.replace(
  "const filteredInvoices = INVOICE_DATA.filter(inv => {",
  "const filteredInvoices = invoices.filter(inv => {"
);

// Delete INVOICE_DATA
const startIdx = content.indexOf('const INVOICE_DATA: Invoice[] = [');
const endIdx = content.indexOf('export default function BillingTab');
content = content.substring(0, startIdx) + content.substring(endIdx);

fs.writeFileSync('src/tabs/BillingTab.tsx', content);
