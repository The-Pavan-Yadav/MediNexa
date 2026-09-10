const fs = require('fs');

let dash = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');

const imports = `import { doc, getDoc } from 'firebase/firestore';`;
const newImports = `import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';`;

const states = `  const [activeTab, setActiveTab] = useState('Dashboard');
  const [doctorData, setDoctorData] = useState<any>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');`;

const newStates = `  const [activeTab, setActiveTab] = useState('Dashboard');
  const [doctorData, setDoctorData] = useState<any>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'notifications'), where('userId', '==', auth.currentUser.uid));
        const snap = await getDocs(q);
        const notifs: any[] = [];
        snap.forEach(d => notifs.push({ id: d.id, ...d.data() }));
        setNotifications(notifs);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifs();
  }, []);`;

const oldBell = `            <button className="relative text-[#52606D] hover:text-[#102A43] transition-colors">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B42318] rounded-full"></span>
            </button>`;

const newBell = `            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-[#52606D] hover:text-[#102A43] transition-colors">
                <Bell className="w-5 h-5" strokeWidth={1.5} />
                {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B42318] rounded-full"></span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#CBD5E1] rounded-[4px] shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-[#CBD5E1] bg-[#F4F6F8]">
                    <h3 className="text-[13px] font-semibold text-[#172B3A]">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-[12px] text-[#52606D] text-center">No new notifications.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 border-b border-[#CBD5E1] hover:bg-[#F9FAFB]">
                          <p className="text-[12px] font-medium text-[#172B3A]">{n.title}</p>
                          <p className="text-[11px] text-[#52606D]">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>`;

dash = dash.replace(imports, newImports);
dash = dash.replace(states, newStates);
dash = dash.replace(oldBell, newBell);

fs.writeFileSync('src/DoctorDashboard.tsx', dash);
console.log("Added functional notifications");
