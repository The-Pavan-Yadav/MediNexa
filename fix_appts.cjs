const fs = require('fs');

let file = 'src/tabs/AppointmentsTab.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('onSnapshot')) {
  code = code.replace("getDocs, addDoc", "onSnapshot, addDoc");
  code = code.replace(/const fetchAppointments = async \(\) => {[\s\S]*?};/, `
  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);
    const q = query(collection(db, 'appointments'), where('patientId', '==', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const upcoming = data.filter(a => a.status === 'upcoming' || a.status === 'Scheduled');
      if (upcoming.length > 0) {
        upcoming[0].isNext = true;
      }
      setAppointments(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  `);
  code = code.replace("useEffect(() => {", "// useEffect(() => {");
  code = code.replace("if (patientData?.mhdId) fetchAppointments();", "// if (patientData?.mhdId) fetchAppointments();");
  code = code.replace("}, [patientData]);", "// }, [patientData]);");
  fs.writeFileSync(file, code);
  console.log("Rewrote AppointmentsTab");
}

let upfile = 'src/tabs/UpcomingTab.tsx';
let upcode = fs.readFileSync(upfile, 'utf8');
if (!upcode.includes('onSnapshot')) {
  upcode = upcode.replace("getDocs,", "onSnapshot,");
  upcode = upcode.replace(/const fetchUpcoming = async \(\) => {[\s\S]*?};/, `
  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);
    const q = query(collection(db, 'appointments'), where('patientId', '==', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const upcomingAppts = data.filter(a => a.status === 'upcoming' || a.status === 'Scheduled');
      setUpcoming(upcomingAppts);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  `);
  upcode = upcode.replace("useEffect(() => {", "// useEffect(() => {");
  upcode = upcode.replace("if (patientData?.mhdId) fetchUpcoming();", "// if (patientData?.mhdId) fetchUpcoming();");
  upcode = upcode.replace("}, [patientData]);", "// }, [patientData]);");
  fs.writeFileSync(upfile, upcode);
  console.log("Rewrote UpcomingTab");
}
