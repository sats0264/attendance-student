import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, TrendingDown, Loader2, Download, AlertTriangle } from 'lucide-react';
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

  useEffect(() => {
    fetchData();
  }, [session.sessionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attData, classStudents] = await Promise.all([
        getAttendance(session.sessionId),
        getStudents(session.classId)
      ]);

      setAttendance(attData);
      setStudentsData(classStudents);
      setTotalStudents(classStudents.length);

      const presentCount = attData.filter(a => a.Status === 'PRESENT').length;
      if (classStudents.length > 0) {
        const rate = ((classStudents.length - presentCount) / classStudents.length) * 100;
        setAbsenceRate(Math.max(0, rate)); 
      }
    } catch (err) {
      console.error("Failed to fetch session details", err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (attendance.length === 0) return;

    const headers = ["Matricule", "Nom Complet", "Classe", "Date/Heure", "Statut"];
    const rows = attendance.map(a => [
      a.StudentId,
      a.FullName,
      a.ClassId || "N/A",
      new Date(a.Timestamp).toLocaleString(),
      a.Status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Presence_${session.classId}_${session.sessionId}.csv`);
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-8"
    >
      <div className="flex items-center gap-6">
        <button
          onClick={onClose}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black text-gradient uppercase">{session.subject}</h1>
          <p className="text-[var(--color-text-muted)] flex items-center gap-2">
            <Users className="w-4 h-4" /> {session.classId} • <Calendar className="w-4 h-4" /> {new Date(session.date).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-2 relative overflow-hidden group">
          <TrendingDown className="absolute -bottom-4 -right-4 w-24 h-24 text-red-500/10 rotate-12 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-[var(--color-text-muted)]">Taux d'absence</span>
          {absenceRate !== null ? (
            <span className={`text-4xl font-black ${absenceRate > 20 ? 'text-red-400' : 'text-green-400'}`}>
              {absenceRate.toFixed(1)}%
            </span>
          ) : (
            <Loader2 className="w-6 h-6 animate-spin" />
          )}
          <p className="text-xs text-[var(--color-text-muted)]">Écart par rapport à l'enrôlement total.</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-2">
          <span className="text-sm font-semibold text-[var(--color-text-muted)]">Présents</span>
          <span className="text-4xl font-black text-white">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${attendance.filter(a => a.Status === 'PRESENT').length} / ${totalStudents}`}
          </span>
          <p className="text-xs text-[var(--color-text-muted)]">Élèves présents sur le total de la classe.</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-center gap-4">
          <button
            onClick={exportCSV}
            disabled={attendance.length === 0}
            className="w-full py-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-6 h-6" />
            EXPORTER LISTE (CSV)
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 premium-shadow min-h-[400px]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--color-primary)]" />
            Appel de la séance
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] opacity-50" />
            <p>Chargement des présences...</p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-30">
            <AlertTriangle className="w-12 h-12" />
            <p>Aucune donnée de présence enregistrée.</p>
          </div>
        ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {attendance.sort((a) => (a.Status === 'PRESENT' ? -1 : 1)).map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                      a.Status === 'PRESENT' 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/5 border-red-500/10 opacity-70'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center font-bold shrink-0 ${
                      a.Status === 'PRESENT' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {/* Search for the student's portrait in the classStudents list we fetched */}
                      {(() => {
                        const studentInfo = studentsData.find(s => s.studentId === a.StudentId);
                        return studentInfo?.photoUrl ? (
                          <img src={studentInfo.photoUrl} alt={a.FullName} className="w-full h-full object-cover" />
                        ) : (
                          a.FullName.charAt(0)
                        );
                      })()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className={`font-bold truncate text-sm ${a.Status === 'PRESENT' ? 'text-white' : 'text-gray-400'}`} title={a.FullName}>
                        {a.FullName}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">{a.Status}</span>
                    </div>
                  </motion.div>
                ))}
            </div>
        )}
      </div>
    </motion.div>
  );
};

export default SessionDetailsView;
