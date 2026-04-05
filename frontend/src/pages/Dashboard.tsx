import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, Loader2, Calendar, BookOpen, UserPlus, GraduationCap, Camera, TrendingUp, ShieldCheck, PlayCircle } from 'lucide-react';
import { getStudents, getSessions, getAttendance, getTeacherAssignments, getClasses, getTeachers, type AttendanceRecord } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon: Icon, color, delay, onClick, gradient }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`relative overflow-hidden p-6 md:p-8 rounded-3xl flex flex-col gap-4 border border-white/10 premium-shadow ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
      <div className="absolute inset-0 glass-panel opacity-40" />
      
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/5 shadow-inner`}>
          <Icon className={`w-8 h-8 md:w-10 md:h-10 ${color}`} />
        </div>
        <div className="flex flex-col items-end">
          <p className={`text-4xl md:text-5xl font-black ${color} tracking-tighter drop-shadow-lg`}>
            {value}
          </p>
        </div>
      </div>
      <div className="relative z-10 mt-2">
        <h3 className="text-sm md:text-base font-bold text-white/90 tracking-wide uppercase">
          {title}
        </h3>
      </div>
    </motion.div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, onClick, delay, colorClass }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 100 }}
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className="group relative overflow-hidden glass-panel p-6 rounded-3xl cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-500 hover:shadow-2xl"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${colorClass} transition-opacity duration-500`} />
    <div className="relative z-10 flex items-start gap-4">
      <div className={`p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors duration-500`}>
        <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">{title}</h3>
        <p className="text-xs text-white/60 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const { isTeacher, isAdmin, userData } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    presentToday: 0,
    totalClasses: 0,
    totalTeachers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);
  const [studentsList, setStudentsList] = useState<import('../services/api').Student[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let students: any[] = [];
        let sessions: any[] = [];
        let classes: any[] = [];
        let teachers: any[] = [];
        let assignments: any[] = [];

        if (isAdmin) {
          [students, sessions, classes, teachers] = await Promise.all([
            getStudents().catch(()=>[]),
            getSessions().catch(()=>[]),
            getClasses().catch(()=>[]),
            getTeachers().catch(()=>[])
          ]);
        } else if (isTeacher) {
          [students, sessions, assignments] = await Promise.all([
            getStudents().catch(()=>[]),
            getSessions().catch(()=>[]),
            getTeacherAssignments().catch(()=>[])
          ]);
          setTeacherClasses(assignments);
          const tClasses = assignments.map(a => a.className);
          students = students.filter(s => tClasses.includes(s.classId));
          sessions = sessions.filter(s => s.teacher === userData?.name);
        }

        const sortedSessions = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestSessions = sortedSessions.slice(0, 5);
        
        const attendancePromises = latestSessions.map(s => getAttendance(s.sessionId).catch(()=>[]));
        const attendanceResults = await Promise.all(attendancePromises);
        
        const flatAttendance = attendanceResults.flat()
          .filter(a => a.Status === 'PRESENT')
          .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
          .slice(0, 5);

        const findRecentAttendance = attendanceResults[0] ? attendanceResults[0].filter(a => a.Status === 'PRESENT').length : 0;

        setStats({
          totalStudents: students.length,
          totalSessions: sessions.length,
          presentToday: findRecentAttendance,
          totalClasses: classes.length,
          totalTeachers: teachers.length,
        });
        setRecentActivity(flatAttendance);
        setStudentsList(students);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchDashboardData();
    }
  }, [isAdmin, isTeacher, userData]);

  const renderAdminDashboard = () => (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Admin Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black z-0" />
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none scale-150 transform -translate-y-10 translate-x-10">
           <ShieldCheck className="w-96 h-96 text-blue-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex flex-col gap-6">
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 w-fit backdrop-blur-md">
               <ShieldCheck className="w-5 h-5" />
               <span className="text-xs font-black tracking-widest uppercase">{t('dashboard.admin_space')}</span>
             </motion.div>
             <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
               {t('dashboard.control_center_1')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">{t('dashboard.control_center_2')}</span>
             </h1>
             <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed font-light">
               {t('dashboard.admin_hero_desc_1')}<strong className="text-white/90">{t('dashboard.admin_hero_desc_2')}</strong>{t('dashboard.admin_hero_desc_3')}
             </p>
           </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('dashboard.enrolled_students')} value={stats.totalStudents} icon={Users} color="text-blue-400" gradient="from-blue-600 to-indigo-900" delay={0.2} onClick={() => navigate('/students')} />
        <StatCard title={t('dashboard.active_classes')} value={stats.totalClasses} icon={BookOpen} color="text-purple-400" gradient="from-purple-600 to-fuchsia-900" delay={0.3} onClick={() => navigate('/classes')} />
        <StatCard title={t('dashboard.teaching_staff')} value={stats.totalTeachers} icon={GraduationCap} color="text-emerald-400" gradient="from-emerald-600 to-teal-900" delay={0.4} onClick={() => navigate('/admin/teachers')} />
        <StatCard title={t('dashboard.recorded_sessions')} value={stats.totalSessions} icon={Calendar} color="text-orange-400" gradient="from-orange-600 to-red-900" delay={0.5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Quick Actions (Admin) */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white/90">
              <span className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 text-purple-400"><UserPlus className="w-6 h-6" /></span>
              {t('dashboard.quick_actions')}
            </h2>
            <div className="flex flex-col gap-4">
              <QuickActionCard title={t('dashboard.biometric_enrollment')} description={t('dashboard.biometric_enrollment_desc')} icon={Camera} onClick={() => navigate('/enrollment')} delay={0.6} colorClass="from-blue-600 to-indigo-600" />
              <QuickActionCard title={t('dashboard.teacher_management')} description={t('dashboard.teacher_management_desc')} icon={ShieldCheck} onClick={() => navigate('/admin/teachers')} delay={0.7} colorClass="from-emerald-600 to-teal-600" />
              <QuickActionCard title={t('dashboard.academic_structure')} description={t('dashboard.academic_structure_desc')} icon={BookOpen} onClick={() => navigate('/classes')} delay={0.8} colorClass="from-orange-600 to-rose-600" />
            </div>
         </div>

         {/* Recent Activity */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white/90">
              <span className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 relative">
                <TrendingUp className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
              </span>
              {t('dashboard.attendance_flow')}
            </h2>
            <div className="glass-panel p-2 md:p-6 rounded-[2rem] border border-white/5 premium-shadow">
               <ActivityList recentActivity={recentActivity} studentsList={studentsList} />
            </div>
         </div>
      </div>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Teacher Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-16 border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.15)] group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e103c] via-[#0f0b29] to-black z-0" />
        
        {/* Animated background elements */}
        <div className="absolute top-0 right-10 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[20rem] h-[20rem] bg-pink-600/10 rounded-full blur-[80px] animate-pulse delay-1000 pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
           <div className="flex flex-col gap-6 max-w-2xl">
             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 w-fit backdrop-blur-md">
               <GraduationCap className="w-5 h-5" />
               <span className="text-xs font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{t('dashboard.teacher_space')}</span>
             </motion.div>
             <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-2xl leading-[1.1]">
               {t('dashboard.hello')} <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">{userData?.name || t('dashboard.professor_default')}</span>
             </h1>
             <p className="text-lg md:text-xl text-white/60 leading-relaxed font-light">
               {t('dashboard.teacher_hero_desc_1')}<strong className="text-white/90">{t('dashboard.teacher_hero_desc_2')}</strong>{t('dashboard.teacher_hero_desc_3')}
             </p>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}
             className="shrink-0 relative w-full xl:w-auto flex justify-center"
           >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[3rem] blur-2xl opacity-40 animate-pulse" />
              <button onClick={() => navigate('/attendance')} className="relative w-full xl:w-auto flex items-center justify-center gap-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white px-12 py-8 rounded-[2.5rem] font-black text-2xl shadow-[0_0_40px_rgba(219,39,119,0.4)] hover:shadow-[0_0_80px_rgba(219,39,119,0.7)] hover:-translate-y-2 transition-all duration-300 border border-white/20 overflow-hidden group/btn">
                 <div className="absolute inset-0 w-[200%] h-full bg-white/20 group-hover/btn:translate-x-[50%] transition-transform duration-1000 -skew-x-12 -translate-x-[150%]" />
                 <PlayCircle className="w-12 h-12 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-transform duration-500" />
                 <span>{t('dashboard.launch_ai_rollcall')}</span>
              </button>
           </motion.div>
        </div>
      </div>

      {/* Teacher Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t('dashboard.my_students')} value={stats.totalStudents} icon={Users} color="text-purple-400" gradient="from-purple-600 to-fuchsia-900" delay={0.2} />
        <StatCard title={t('dashboard.validated_sessions')} value={stats.totalSessions} icon={CheckCircle} color="text-pink-400" gradient="from-pink-600 to-rose-900" delay={0.3} />
        <StatCard title={t('dashboard.assigned_classes')} value={teacherClasses.length} icon={BookOpen} color="text-indigo-400" gradient="from-indigo-600 to-blue-900" delay={0.4} onClick={() => navigate('/classes')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {/* My Classes Summary */}
         <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white/90">
              <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 text-indigo-400"><BookOpen className="w-6 h-6" /></span>
              {t('dashboard.my_classes')}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {teacherClasses.length === 0 ? (
                 <div className="glass-panel p-12 rounded-[2rem] text-center border border-white/5 opacity-80">
                   <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
                   <p className="text-white/50 text-lg">{t('dashboard.no_assigned_classes')}</p>
                 </div>
              ) : (
                teacherClasses.map((cl, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (idx * 0.1) }}
                    className="glass-panel hover:bg-white/10 p-6 rounded-[2rem] flex items-center justify-between cursor-pointer border border-white/5 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all group"
                    onClick={() => navigate(`/classes/${cl.className}`)}
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-2xl group-hover:bg-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all border border-indigo-500/10">
                          {cl.className.substring(0,2)}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-2xl font-black text-white/90 group-hover:text-white transition-colors">{cl.className}</span>
                           <span className="text-sm font-medium text-indigo-400/80 group-hover:text-indigo-400">{cl.subjectName}</span>
                        </div>
                     </div>
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                        <TrendingUp className="w-6 h-6" />
                     </div>
                  </motion.div>
                ))
              )}
            </div>
         </div>

         {/* Recent Activity */}
         <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white/90">
              <span className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-400 relative">
                <Clock className="w-6 h-6" />
              </span>
              Activité Récente
            </h2>
            <div className="glass-panel p-2 md:p-6 rounded-[2rem] border border-white/5 premium-shadow h-full">
               <ActivityList recentActivity={recentActivity} studentsList={studentsList} />
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-8 relative pb-20">
      {loading ? (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-2xl opacity-40 rounded-full animate-pulse" />
            <Loader2 className="w-20 h-20 animate-spin text-white relative z-10" />
          </div>
          <p className="text-2xl font-black animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 tracking-widest uppercase">
            {t('dashboard.initialization')}
          </p>
        </div>
      ) : (
        isAdmin ? renderAdminDashboard() : renderTeacherDashboard()
      )}
    </div>
  );
};

// Extracted ActivityList component to reuse logic and keep code clean
const ActivityList = ({ recentActivity, studentsList }: { recentActivity: AttendanceRecord[], studentsList: any[] }) => {
  const { t } = useTranslation();

  if (recentActivity.length === 0) {
    return (
      <div className="p-16 text-center opacity-70 flex flex-col items-center gap-6 h-full justify-center">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-2">
          <Clock className="w-12 h-12 text-white/30" />
        </div>
        <p className="text-2xl font-black tracking-tight">{t('dashboard.no_recent_data')}</p>
        <p className="text-base text-white/50 max-w-sm mx-auto font-medium">{t('dashboard.no_recent_data_desc')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {recentActivity.map((log, i) => (
        <motion.div 
          initial={{ opacity: 0, x: -20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          key={i} 
          className="group flex flex-col sm:flex-row items-center justify-between p-4 md:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all duration-300 gap-4"
        >
          <div className="flex items-center gap-5 w-full sm:w-auto">
             <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-black text-white shadow-lg shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                {(() => {
                  const student = studentsList.find(s => s.studentId === log.StudentId);
                  return student?.photoUrl ? (
                    <img src={student.photoUrl} alt={log.FullName} className="w-full h-full object-cover" />
                  ) : (
                    log.FullName.charAt(0)
                  );
                })()}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl"></div>
             </div>
             <div className="flex flex-col gap-0.5">
                <span className="text-base md:text-lg font-bold text-white/90 group-hover:text-white transition-colors">{log.FullName}</span>
                <span className="text-xs md:text-sm text-white/40 font-semibold tracking-wide uppercase">ID: {log.StudentId} • <span className="text-white/60">{log.ClassId}</span></span>
             </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 text-right">
             <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.15)] group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                {t('dashboard.present_badge')}
             </span>
             <span className="text-[11px] font-bold tracking-wider uppercase text-white/30 flex items-center gap-1.5">
               <Clock className="w-3.5 h-3.5" />
               {new Date(log.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.Timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
             </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Dashboard;
