const fs = require('fs');
let code = fs.readFileSync('src/tabs/doctor/DoctorHomeTab.tsx', 'utf8');

const oldUseEffect = `  useEffect(() => {
    const fetchMyPatients = async () => {
      if (!auth.currentUser || !doctorData?.patientIds || doctorData.patientIds.length === 0) return;
      // Just a mock display mechanism or fetch full details
      // Since it's a dashboard, we will just use mock for "Patients Awaiting Review" & Schedule
    };
    fetchMyPatients();
  }, [doctorData]);`;

const newUseEffect = `  const [stats, setStats] = useState({ waitingCases: 0, urgent: 0, patientsToday: 0, completedToday: 0, totalPatients: 0 });
  const [todayAppts, setTodayAppts] = useState<any[]>([]);
  const [awaitingReview, setAwaitingReview] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!auth.currentUser) return;
      
      const totalPatients = doctorData?.patientIds?.length || 0;
      
      // Fetch cases
      const casesQ = query(collection(db, 'cases'), where('assignedDoctorId', '==', auth.currentUser.uid));
      const casesSnap = await getDocs(casesQ);
      let waiting = 0;
      let urgent = 0;
      const reviews: any[] = [];
      casesSnap.forEach(d => {
        const c = d.data();
        if (c.status === 'Waiting') {
           waiting++;
           if (c.priority === 'High') urgent++;
           reviews.push({ name: c.patientName, id: c.patientMhdId, reason: c.symptoms || 'Awaiting Review' });
        }
      });
      setAwaitingReview(reviews.slice(0, 5));

      // Fetch appointments
      const today = new Date().toISOString().split('T')[0];
      const apptQ = query(collection(db, 'appointments'), where('doctorId', '==', auth.currentUser.uid), where('date', '==', today));
      const apptSnap = await getDocs(apptQ);
      
      let pToday = 0;
      let cToday = 0;
      const appts: any[] = [];
      apptSnap.forEach(d => {
        pToday++;
        const a = d.data();
        if (a.status === 'Completed') cToday++;
        appts.push(a);
      });
      setTodayAppts(appts);
      
      setStats({
        waitingCases: waiting,
        urgent,
        patientsToday: pToday,
        completedToday: cToday,
        totalPatients
      });
    };
    fetchDashboardData();
  }, [doctorData]);`;

const oldKpis = `        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Waiting Cases</p>
            <Clock className="w-4 h-4 text-[#975A16]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">4</p>
          <p className="text-[11px] text-[#52606D]">2 urgent requests</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Patients Today</p>
            <Users className="w-4 h-4 text-[#1F5F8B]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">12</p>
          <p className="text-[11px] text-[#52606D]">8 completed, 4 upcoming</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Total Patients</p>
            <Activity className="w-4 h-4 text-[#276749]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">184</p>
          <p className="text-[11px] text-[#52606D]">Active on your roster</p>
        </div>`;

const newKpis = `        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Waiting Cases</p>
            <Clock className="w-4 h-4 text-[#975A16]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">{stats.waitingCases}</p>
          <p className="text-[11px] text-[#52606D]">{stats.urgent} urgent requests</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Patients Today</p>
            <Users className="w-4 h-4 text-[#1F5F8B]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">{stats.patientsToday}</p>
          <p className="text-[11px] text-[#52606D]">{stats.completedToday} completed, {stats.patientsToday - stats.completedToday} upcoming</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-[#52606D] uppercase tracking-wider">Total Patients</p>
            <Activity className="w-4 h-4 text-[#276749]" />
          </div>
          <p className="text-[28px] font-bold text-[#172B3A] leading-none mb-1">{stats.totalPatients}</p>
          <p className="text-[11px] text-[#52606D]">Active on your roster</p>
        </div>`;

const oldSchedule = `            {[
              { time: '09:00 AM', name: 'James Wilson', type: 'Consultation', status: 'Completed', id: 'P-012' },
              { time: '10:30 AM', name: 'Sarah Connor', type: 'Follow-up', status: 'In Progress', id: 'P-084' },
              { time: '11:15 AM', name: 'Michael Chang', type: 'Lab Review', status: 'Waiting', id: 'P-091' },
              { time: '01:00 PM', name: 'Emily Rose', type: 'Consultation', status: 'Upcoming', id: 'P-102' }
            ].map((apt, i) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-[#F9FAFB] transition-colors">
                <div className="w-[80px] shrink-0">
                  <p className="text-[13px] font-bold text-[#172B3A]">{apt.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#172B3A]">{apt.name} <span className="text-[12px] font-normal text-[#52606D] ml-1">({apt.id})</span></p>
                  <p className="text-[12px] text-[#52606D]">{apt.type}</p>
                </div>
                <div>
                  <span className={\`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border \${
                    apt.status === 'Completed' ? 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]' :
                    apt.status === 'In Progress' ? 'bg-[#EBF1F6] text-[#1F5F8B] border-[#90CDF4]' :
                    apt.status === 'Waiting' ? 'bg-[#FEF6E7] text-[#975A16] border-[#F6E0B5]' :
                    'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]'
                  }\`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}`;

const newSchedule = `            {todayAppts.length === 0 ? (
               <div className="p-8 text-center text-[13px] text-[#52606D]">No appointments today.</div>
            ) : todayAppts.map((apt, i) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-[#F9FAFB] transition-colors">
                <div className="w-[80px] shrink-0">
                  <p className="text-[13px] font-bold text-[#172B3A]">{apt.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#172B3A]">{apt.patientName} <span className="text-[12px] font-normal text-[#52606D] ml-1">({apt.patientMhdId})</span></p>
                  <p className="text-[12px] text-[#52606D]">{apt.type}</p>
                </div>
                <div>
                  <span className={\`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border \${
                    apt.status === 'Completed' ? 'bg-[#E8F2EC] text-[#276749] border-[#BCE3C6]' :
                    apt.status === 'Confirmed' ? 'bg-[#EBF1F6] text-[#1F5F8B] border-[#90CDF4]' :
                    apt.status === 'Scheduled' ? 'bg-[#FEF6E7] text-[#975A16] border-[#F6E0B5]' :
                    'bg-[#F4F6F8] text-[#52606D] border-[#CBD5E1]'
                  }\`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}`;

const oldReviews = `              {[
                { name: 'Robert Vance', id: 'P-067', reason: 'Post-op Recovery Update' },
                { name: 'Linda Chen', id: 'P-022', reason: 'New MRI Results Uploaded' }
              ].map((patient, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
                  <div>
                    <p className="text-[13px] font-semibold text-[#172B3A]">{patient.name} <span className="text-[#52606D] font-normal">({patient.id})</span></p>
                    <p className="text-[12px] text-[#52606D] mt-0.5">{patient.reason}</p>
                  </div>
                  <button className="w-8 h-8 rounded-[4px] bg-[#FFFFFF] border border-[#CBD5E1] flex items-center justify-center text-[#52606D] hover:text-[#1F5F8B] hover:border-[#1F5F8B] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}`;

const newReviews = `              {awaitingReview.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[#52606D]">No patients awaiting review.</div>
              ) : awaitingReview.map((patient, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
                  <div>
                    <p className="text-[13px] font-semibold text-[#172B3A]">{patient.name} <span className="text-[#52606D] font-normal">({patient.id})</span></p>
                    <p className="text-[12px] text-[#52606D] mt-0.5">{patient.reason}</p>
                  </div>
                  <button onClick={() => setActiveTab && setActiveTab('Cases')} className="w-8 h-8 rounded-[4px] bg-[#FFFFFF] border border-[#CBD5E1] flex items-center justify-center text-[#52606D] hover:text-[#1F5F8B] hover:border-[#1F5F8B] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}`;

if (code.includes(oldUseEffect)) {
  code = code.replace(oldUseEffect, newUseEffect);
  code = code.replace(oldKpis, newKpis);
  code = code.replace(oldSchedule, newSchedule);
  code = code.replace(oldReviews, newReviews);
  fs.writeFileSync('src/tabs/doctor/DoctorHomeTab.tsx', code);
  console.log("Patched DoctorHomeTab to use real data!");
} else {
  console.error("Could not find oldUseEffect");
}

