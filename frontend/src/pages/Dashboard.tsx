import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, Loader2, Calendar } from 'lucide-react';
import { getStudents, getSessions, getAttendance, type AttendanceRecord } from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="glass-panel glass-panel-hover p-6 md:p-8 rounded-2xl flex items-center justify-between"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-sm md:text-base font-semibold text-[var(--color-text-muted)]">
          {title}
        </h3>
        <p className={`text-2xl md:text-4xl font-bold ${color}`}>
          {value}
        </p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/5`}>
        <Icon className={`w-8 h-8 md:w-10 md:h-10 ${color}`} />
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    presentToday: 0
  });
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);
  const [studentsList, setStudentsList] = useState<import('../services/api').Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [students, sessions] = await Promise.all([
          getStudents(),
          getSessions()
        ]);

        // Get latest session to show recent attendance
        const sortedSessions = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestSessions = sortedSessions.slice(0, 3);
        
        // Fetch attendance for the latest few sessions to populate "Activity"
        const attendancePromises = latestSessions.map(s => getAttendance(s.sessionId));
        const attendanceResults = await Promise.all(attendancePromises);
        
        // Flatten and sort by timestamp
        const flatAttendance = attendanceResults.flat()
          .filter(a => a.Status === 'PRESENT')
          .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
          .slice(0, 5);

        // Count "Present Today" (rough estimate based on last session if recent)
        const findRecentAttendance = attendanceResults[0] ? attendanceResults[0].filter(a => a.Status === 'PRESENT').length : 0;

        setStats({
          totalStudents: students.length,
          totalSessions: sessions.length,
          presentToday: findRecentAttendance
        });
        setRecentActivity(flatAttendance);
        setStudentsList(students);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 relative">
      
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Bienvenue sur <span className="text-gradient">le Dashboard</span>
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
          Vue d'ensemble en temps réel des présences de l'infrastructure ESMT via AWS Rekognition.
        </p>
      </motion.div>

      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-4 opacity-50">
          <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
          <p className="text-xl font-bold animate-pulse">Chargement des données réelles...</p>
        </div>
      ) : (
        <>
          {/* Grid Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <StatCard title="Total Étudiants" value={stats.totalStudents} icon={Users} color="text-[var(--color-primary)]" delay={0.1} />
            <StatCard title="Séances Totales" value={stats.totalSessions} icon={Calendar} color="text-[var(--color-success)]" delay={0.2} />
            <StatCard title="Présents (Dernière séance)" value={stats.presentToday} icon={CheckCircle} color="text-[var(--color-accent)]" delay={0.3} />
          </div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4, duration: 0.5 }}
             className="w-full glass-panel rounded-3xl p-6 md:p-10 
                        border-t border-white/10 premium-shadow"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-4">
              <div className="w-4 h-4 bg-[var(--color-primary)] rounded-full animate-pulse shadow-[0_0_10px_var(--color-primary)]"></div>
              Dernières Présences Détectées
            </h2>

            <div className="flex flex-col gap-4">
              {recentActivity.length === 0 ? (
                <div className="p-12 text-center opacity-30 flex flex-col items-center gap-4">
                  <Clock className="w-12 h-12" />
                  <p className="text-xl italic">Aucune activité récente enregistrée.</p>
                </div>
              ) : (
                recentActivity.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-md shrink-0">
                          {(() => {
                            const student = studentsList.find(s => s.studentId === log.StudentId);
                            return student?.photoUrl ? (
                              <img src={student.photoUrl} alt={log.FullName} className="w-full h-full object-cover" />
                            ) : (
                              log.FullName.charAt(0)
                            );
                          })()}
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-base md:text-lg font-semibold">{log.FullName}</span>
                          <span className="text-xs md:text-sm text-[var(--color-text-muted)] font-mono">ID: {log.StudentId} • {log.ClassId}</span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                       <span className="text-xs md:text-sm font-bold text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-1 rounded-full border border-[var(--color-success)]/20">
                          {log.Status}
                       </span>
                       <span className="text-xs text-[var(--color-text-muted)]">
                         {new Date(log.Timestamp).toLocaleTimeString()} le {new Date(log.Timestamp).toLocaleDateString()}
                       </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
