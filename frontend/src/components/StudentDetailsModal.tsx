import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2, CheckCircle2, XCircle, ExternalLink, TrendingUp } from 'lucide-react';
import { getAttendanceByStudent, type Student, type AttendanceRecord } from '../services/api';

interface StudentDetailsModalProps {
  student: Student | null;
  onClose: () => void;
}

const StudentDetailsModal = ({ student, onClose }: StudentDetailsModalProps) => {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (student) fetchHistory();
  }, [student]);

  const fetchHistory = async () => {
    if (!student) return;
    setLoadingDetails(true);
    try {
      const history = await getAttendanceByStudent(student.studentId, student.classId);
      setAttendanceHistory(history);
    } catch (err) {
      console.error('Failed to fetch student history', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const presentCount = attendanceHistory.filter(a => a.Status === 'PRESENT').length;
  const rate = attendanceHistory.length > 0
    ? Math.round((presentCount / attendanceHistory.length) * 100)
    : 0;

  return (
    <AnimatePresence>
      {student && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-xl"
          />

          {/* Sheet / Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative z-10 w-full max-w-2xl glass-panel rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden premium-shadow"
            style={{ maxHeight: '92vh' }}
          >
            {/* Header */}
            <div className="relative flex items-center gap-5 p-7 pb-6 border-b border-white/5 shrink-0">
              {/* Gradient halo behind avatar */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                  ) : (
                    student.fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <h2 className="text-2xl font-black text-white truncate">{student.fullName}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono">
                    {student.studentId}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black uppercase">
                    {student.classId}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5 shrink-0">
              <div className="flex flex-col items-center py-4 gap-1">
                <span className="text-2xl font-black text-white">{attendanceHistory.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Séances</span>
              </div>
              <div className="flex flex-col items-center py-4 gap-1">
                <span className="text-2xl font-black text-emerald-400">{presentCount}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Présences</span>
              </div>
              <div className="flex flex-col items-center py-4 gap-1">
                <span className={`text-2xl font-black ${rate >= 75 ? 'text-emerald-400' : rate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {rate}%
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Fidélité</span>
              </div>
            </div>

            {/* Scrollable history */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white/40 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Historique d'Assiduité</span>
              </div>

              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-sm font-bold">Chargement de l'historique...</p>
                </div>
              ) : attendanceHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-25 text-center">
                  <TrendingUp className="w-16 h-16" />
                  <p className="font-bold">Aucune séance enregistrée pour cet étudiant.</p>
                </div>
              ) : (
                attendanceHistory.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${
                      item.Status === 'PRESENT'
                        ? 'bg-emerald-500/8 border-emerald-500/20 hover:bg-emerald-500/12'
                        : 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10'
                    }`}
                  >
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.Status === 'PRESENT' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {item.Status === 'PRESENT'
                        ? <CheckCircle2 className="w-5 h-5" />
                        : <XCircle className="w-5 h-5" />}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-black text-sm text-white/90">
                        {new Date(item.Timestamp).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-mono text-white/25 truncate uppercase">
                        {item.SessionId}
                      </span>
                    </div>

                    {/* Proof image + badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.proofUrl && (
                        <a
                          href={item.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all relative group/img"
                        >
                          <img src={item.proofUrl} alt="Preuve" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <ExternalLink className="w-3.5 h-3.5 text-white" />
                          </div>
                        </a>
                      )}
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${
                        item.Status === 'PRESENT'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500/80 text-white'
                      }`}>
                        {item.Status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Rate progress bar footer */}
            {attendanceHistory.length > 0 && (
              <div className="px-5 pb-6 pt-4 border-t border-white/5 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-white/30">Taux de présence</span>
                  <span className={`text-xs font-black ${rate >= 75 ? 'text-emerald-400' : rate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {rate}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className={`h-full rounded-full ${rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StudentDetailsModal;
