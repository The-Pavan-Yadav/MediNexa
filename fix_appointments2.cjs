const fs = require('fs');

let content = fs.readFileSync('src/tabs/AppointmentsTab.tsx', 'utf8');

const componentStart = "export default function AppointmentsTab({ patientData }: { patientData?: any }) {";

content = content.replace(
  componentStart,
  `${componentStart}
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData?.mhdId) fetchAppointments();
  }, [patientData]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'appointments'), where('patientId', '==', patientData.mhdId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const upcoming = data.filter(a => a.status === 'upcoming' || a.status === 'Scheduled');
      if (upcoming.length > 0) {
        upcoming[0].isNext = true;
      }
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
`
);

content = content.replace(
  "app.status === 'upcoming'",
  "app.status === 'upcoming' || app.status === 'Scheduled'"
);

content = content.replace(
  "app.status === 'completed'",
  "app.status === 'completed' || app.status === 'Completed'"
);

content = content.replace(
  "app.status === 'cancelled'",
  "app.status === 'cancelled' || app.status === 'Cancelled'"
);

fs.writeFileSync('src/tabs/AppointmentsTab.tsx', content);
