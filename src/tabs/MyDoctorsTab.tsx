import React from 'react';
import { 
  Stethoscope, 
  MessageSquare, 
  FileText, 
  CalendarClock, 
  UserCircle,
  Star,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  title: string;
  department: string;
  isPrimary: boolean;
  status: 'active' | 'consulting' | 'completed';
  availability: string;
  lastVisit: string;
  nextVisit: string | null;
}

export default function MyDoctorsTab({ patientData }: { patientData?: any }) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, [patientData]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Just fetch all doctors for now
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const primaryDoctor = DOCTORS_DATA.find(d => d.isPrimary);
  const otherDoctors = DOCTORS_DATA.filter(d => !d.isPrimary);

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-[#102A43] mb-1">My Care Team</h2>
        <p className="text-[14px] text-[#52606D]">View and manage your clinical providers, specialists, and primary care physicians.</p>
      </div>

      {/* Primary Care Provider */}
      {primaryDoctor && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />
            <h3 className="text-[15px] font-semibold text-[#172B3A]">Primary Care Provider</h3>
          </div>
          
          <div className="bg-[#FFFFFF] border-l-4 border-[#1F5F8B] border-y border-r border-y-[#CBD5E1] border-r-[#CBD5E1] rounded-[4px] p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Doctor Identity */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#EBF1F6] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                  <UserCircle className="w-7 h-7 text-[#1F5F8B]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-[16px] font-semibold text-[#172B3A]">{primaryDoctor.name}</h4>
                    <span className="bg-[#E8F2EC] text-[#276749] text-[10px] px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-wider border border-[#BCE3C6] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Lead Provider
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-[#172B3A]">{primaryDoctor.title}</p>
                  <p className="text-[13px] text-[#52606D] mt-0.5">{primaryDoctor.department}</p>
                  
                  <div className="mt-3 flex items-center gap-1.5 text-[12px] text-[#52606D] bg-[#F4F6F8] px-2 py-1 rounded-[4px] border border-[#CBD5E1] inline-flex">
                    <Clock className="w-3.5 h-3.5" /> 
                    <span className="font-medium text-[#172B3A]">Hours:</span> {primaryDoctor.availability}
                  </div>
                </div>
              </div>

              {/* Clinical Context & Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start lg:items-center gap-6 md:gap-4 lg:gap-8 shrink-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#52606D] uppercase w-20">Last Visit:</span>
                    <span className="text-[13px] font-medium text-[#172B3A]">{primaryDoctor.lastVisit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#52606D] uppercase w-20">Next Visit:</span>
                    <span className="text-[13px] font-semibold text-[#1F5F8B]">{primaryDoctor.nextVisit || 'None scheduled'}</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col lg:flex-row gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none text-[13px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#EBF1F6] transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                    <FileText className="w-4 h-4" /> View Records
                  </button>
                  <button className="flex-1 sm:flex-none text-[13px] font-medium text-[#FFFFFF] bg-[#1F5F8B] px-4 py-2 rounded-[4px] hover:bg-[#173F5F] transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Specialists & Care Team */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-[#102A43]" strokeWidth={1.5} />
          <h3 className="text-[15px] font-semibold text-[#172B3A]">Specialists & Care Team</h3>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] divide-y divide-[#CBD5E1] overflow-hidden">
          {otherDoctors.map(doctor => (
            <div key={doctor.id} className="p-5 hover:bg-[#F9FAFB] transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Doctor Identity */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#F4F6F8] border border-[#CBD5E1] flex items-center justify-center shrink-0 mt-1">
                    <UserCircle className="w-6 h-6 text-[#52606D]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-[15px] font-semibold text-[#172B3A]">{doctor.name}</h4>
                      {doctor.status === 'active' && (
                        <span className="text-[#1F5F8B] bg-[#EBF1F6] px-2 py-0.5 rounded-[4px] text-[10px] border border-[#1F5F8B] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      {doctor.status === 'consulting' && (
                        <span className="text-[#975A16] bg-[#FEF6E7] px-2 py-0.5 rounded-[4px] text-[10px] border border-[#F6E0B5] font-bold uppercase tracking-wider">
                          Consulting
                        </span>
                      )}
                      {doctor.status === 'completed' && (
                        <span className="text-[#52606D] bg-[#F4F6F8] px-2 py-0.5 rounded-[4px] text-[10px] border border-[#CBD5E1] font-bold uppercase tracking-wider">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-[#172B3A]">{doctor.title}</p>
                    <p className="text-[12px] text-[#52606D] mt-0.5">{doctor.department}</p>
                    <div className="mt-2 text-[12px] text-[#52606D]">
                      <span className="font-semibold text-[#172B3A]">Hours:</span> {doctor.availability}
                    </div>
                  </div>
                </div>

                {/* Clinical Context */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0 md:w-auto">
                  <div className="space-y-1 min-w-[140px]">
                    <div className="text-[12px] text-[#52606D]">
                      <span className="font-bold uppercase mr-1">Last:</span>
                      <span className="text-[#172B3A] font-medium">{doctor.lastVisit}</span>
                    </div>
                    <div className="text-[12px] text-[#52606D]">
                      <span className="font-bold uppercase mr-1">Next:</span>
                      {doctor.nextVisit ? (
                        <span className="text-[#1F5F8B] font-medium">{doctor.nextVisit}</span>
                      ) : (
                        <span className="text-[#52606D] italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none text-[13px] font-medium text-[#52606D] bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-[4px] hover:bg-[#F4F6F8] hover:text-[#172B3A] hover:border-[#52606D] transition-colors whitespace-nowrap">
                      Profile
                    </button>
                    <button className="flex-1 sm:flex-none text-[13px] font-medium text-[#1F5F8B] bg-[#FFFFFF] border border-[#1F5F8B] px-3 py-1.5 rounded-[4px] hover:bg-[#EBF1F6] transition-colors whitespace-nowrap">
                      Message
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
