const fs = require('fs');
let code = fs.readFileSync('src/DoctorDashboard.tsx', 'utf8');

const oldHeader = `            <input 
               type="text" 
               placeholder="Search patients, ID, cases..." 
               className="bg-transparent border-none outline-none text-[13px] text-[#172B3A] w-full placeholder:text-[#52606D]"
            />`;

const newHeader = `            <input 
               type="text"
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    window.dispatchEvent(new CustomEvent('global-search', { detail: e.currentTarget.value.trim() }));
                    setActiveTab('Patients');
                 }
               }}
               placeholder="Search patients, ID, cases... (Press Enter)" 
               className="bg-transparent border-none outline-none text-[13px] text-[#172B3A] w-full placeholder:text-[#52606D]"
            />`;

const oldTabs = `          {activeTab === 'Dashboard' && <DoctorHomeTab doctorData={doctorData} />}
          {activeTab === 'Health Input' && <HealthInputTab doctorData={doctorData} />}
          {activeTab === 'Cases' && <CasesTab doctorData={doctorData} />}
          {activeTab === 'Patients' && <PatientsTab doctorData={doctorData} />}
          {activeTab === 'Appointments' && <AppointmentsTab doctorData={doctorData} />}
          {activeTab === 'Messages' && <MessagesTab doctorData={doctorData} />}
          {activeTab === 'Earnings' && <EarningsTab doctorData={doctorData} />}
          {activeTab === 'Settings' && <SettingsTab doctorData={doctorData} />}`;

const newTabs = `          {activeTab === 'Dashboard' && <DoctorHomeTab doctorData={doctorData} setActiveTab={setActiveTab} />}
          {activeTab === 'Health Input' && <HealthInputTab doctorData={doctorData} setActiveTab={setActiveTab} />}
          {activeTab === 'Cases' && <CasesTab doctorData={doctorData} setActiveTab={setActiveTab} />}
          {activeTab === 'Patients' && <PatientsTab doctorData={doctorData} setActiveTab={setActiveTab} />}
          {activeTab === 'Appointments' && <AppointmentsTab doctorData={doctorData} setActiveTab={setActiveTab} />}
          {activeTab === 'Messages' && <MessagesTab doctorData={doctorData} setActiveTab={setActiveTab} />}
          {activeTab === 'Earnings' && <EarningsTab doctorData={doctorData} setActiveTab={setActiveTab} />}
          {activeTab === 'Settings' && <SettingsTab doctorData={doctorData} setActiveTab={setActiveTab} />}`;

code = code.replace(oldHeader, newHeader);
code = code.replace(oldTabs, newTabs);
fs.writeFileSync('src/DoctorDashboard.tsx', code);
console.log("Patched DoctorDashboard.tsx");
