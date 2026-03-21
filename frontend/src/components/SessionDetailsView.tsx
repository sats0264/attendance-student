import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Calendar, TrendingDown, TrendingUp,
  Loader2, Download, CheckCircle2, XCircle, BookOpen, User
} from 'lucide-react';
import { getAttendance, getStudents, type SessionRecord, type AttendanceRecord } from '../services/api';

interface SessionDetailsViewProps {
  session: SessionRecord;
  onClose: () => void;
}

const SessionDetailsView = ({ session, onClose }: SessionDetailsViewProps) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [absenceRate, setAbsenceRate] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsData, setStudentsData] = useState<import('../services/api').Student[]>([]);

  useEffect(() => { fetchData(); }, [session.sessionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attData, classStudents] = await Promise.all([
        getAttendance(session.sessionId),
        getStudents(session.classId),
      ]);
      setAttendance(attData);
      setStudentsData(classStudents);
      setTotalStudents(classStudents.length);
      const presentCount = attData.filter(a => a.Status === 'PRESENT').length;
      if (classStudents.length > 0) {
        setAbsenceRate(Math.max(0, ((classStudents.length - presentCount) / classStudents.length) * 100));
      }
    } catch (err) {
      console.error('Failed to fetch session details', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (attendance.length === 0) return;
    const headers = ['Matricule', 'Nom Complet', 'Classe', 'Date/Heure', 'Statut'];
    const rows = attendance.map(a => [
      a.StudentId, a.FullName, a.ClassId || 'N/A',
      new Date(a.Timestamp).toLocaleString(), a.Status,
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Presence_${session.classId}_${session.sessionId}.csv`;
    link.click();
  };

  const presentCount = attendance.filter(a => a.Status === 'PRESENT').length;
  const rateDisplay = absenceRate !== null ? (100 - absenceRate).toFixed(1) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#12172a] to-black" />
        <div className="absolute -right-20 -top-10 w-80 h-80 bg-violet-600/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />

        <div className="relative z-10 flex items-center gap-5">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/40 hover:text-white flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest w-fit">
              <BookOpen className="w-3 h-3" />
              Rapport de Séance
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{session.subject}</h1>
            <div className="flex items-center gap-4 text-white/40 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {session.classId}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {session.teacher && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" /> {session.teacher}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Presence rate */}
        <div className="glass-panel p-6 rounded-[2rem] border border-white/10 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 w-24 h-24 text-emerald-500/10 rotate-12 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-full h-full" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Taux de présence</span>
          <span className={`text-5xl font-black ${(parseFloat(rateDisplay || '0')) >= 80 ? 'text-emerald-400' : (parseFloat(rateDisplay || '0')) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : `${rateDisplay ?? '—'}%`}
          </span>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${rateDisplay ?? 0}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className={`h-full rounded-full ${parseFloat(rateDisplay || '0') >= 80 ? 'bg-emerald-500' : parseFloat(rateDisplay || '0') >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            />
          </div>
        </div>

        {/* Present count */}
        <div className="glass-panel p-6 rounded-[2rem] border border-white/10 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:scale-110 transition-transform">
            <Users className="w-full h-full" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Présents</span>
          <span className="text-5xl font-black text-white">
            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : `${presentCount} / ${totalStudents}`}
          </span>
          <span className="text-xs text-white/30 font-medium">Étudiants présents sur l'effectif total</span>
        </div>

        {/* Export */}
        <div className="glass-panel p-6 rounded-[2rem] border border-white/10 flex flex-col justify-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Exporter</span>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={exportCSV}
            disabled={attendance.length === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-white/10"
          >
            <Download className="w-5 h-5" />
            LISTE CSV
          </motion.button>
        </div>
      </div>

      {/* Attendance grid */}
      <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 premium-shadow">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-black text-white">Appel de la séance</h3>
          </div>
          {!loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-white/30">
              <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />{presentCount}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3.5 h-3.5" />{attendance.length - presentCount}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="w-12 h-12 animate-spin text-violet-400 relative z-10" />
            </div>
            <p className="text-white/30 font-black text-sm uppercase tracking-widest animate-pulse">Chargement des présences...</p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-25 text-center">
            <TrendingDown className="w-16 h-16" />
            <p className="font-bold">Aucune donnée de présence enregistrée.</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {attendance.sort(a => a.Status === 'PRESENT' ? -1 : 1).map((a, i) => {
              const studentInfo = studentsData.find(s => s.studentId === a.StudentId);
              const initials = a.FullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
              const isPresent = a.Status === 'PRESENT';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    isPresent
                      ? 'bg-emerald-500/8 border-emerald-500/20'
                      : 'bg-white/[0.02] border-white/5 opacity-60'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-black shrink-0 text-sm ${
                    isPresent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'
                  }`}>
                    {studentInfo?.photoUrl ? (
                      <img src={studentInfo.photoUrl} alt={a.FullName} className="w-full h-full object-cover" />
                    ) : initials}
                  </div>

                  {/* Name + status */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`font-black text-xs truncate ${isPresent ? 'text-white/90' : 'text-white/40'}`}>
                      {a.FullName}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isPresent
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        : <XCircle className="w-3 h-3 text-red-400/60" />}
                      <span className={`text-[9px] font-black uppercase ${isPresent ? 'text-emerald-400' : 'text-red-400/60'}`}>
                        {a.Status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SessionDetailsView;
