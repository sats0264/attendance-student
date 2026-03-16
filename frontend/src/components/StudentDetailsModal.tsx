import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { getAttendanceByStudent, type Student, type AttendanceRecord } from '../services/api';

interface StudentDetailsModalProps {
  student: Student | null;
  onClose: () => void;
}

const StudentDetailsModal = ({ student, onClose }: StudentDetailsModalProps) => {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (student) {
      fetchHistory();
    }
  }, [student]);

  const fetchHistory = async () => {
    if (!student) return;
    setLoadingDetails(true);
    try {
      const history = await getAttendanceByStudent(student.studentId, student.classId);
      setAttendanceHistory(history);
    } catch (err) {
      console.error("Failed to fetch student history", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <AnimatePresence>
      {student && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl glass-panel p-8 rounded-3xl relative z-10 shadow-2xl flex flex-col gap-8 max-h-[90vh] overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-6 border-b border-white/10 pb-8 mt-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-4xl font-black text-white shadow-lg uppercase shrink-0">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  student.fullName.charAt(0)
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl md:text-3xl font-black">{student.fullName}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm px-3 py-1 rounded-full bg-white/10 text-[var(--color-text-muted)] font-mono">ID: {student.studentId}</span>
                  <span className="text-sm px-3 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-black uppercase">Classe: {student.classId}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                Parcours d'Assiduité
              </h3>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-4 opacity-50">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p>Génération de l'historique...</p>
                  </div>
                ) : attendanceHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-4 opacity-30 text-center">
                    <AlertTriangle className="w-12 h-12" />
                    <p>Aucune séance enregistrée pour cet étudiant.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {attendanceHistory.map((item, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className={`p-4 rounded-xl border flex items-center justify-between ${item.Status === 'PRESENT'
                          ? 'bg-green-500/10 border-green-500/10'
                          : 'bg-red-500/10 border-red-500/10'
                          }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg shrink-0 ${item.Status === 'PRESENT' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-red-500/20 text-red-500'
                            }`}>
                            {item.Status === 'PRESENT' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-sm truncate">Séance {new Date(item.Timestamp).toLocaleDateString()}</span>
                            <span className="text-[10px] opacity-50 uppercase tracking-tighter truncate">Session ID: {item.SessionId}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.proofUrl && (
                            <a 
                              href={item.proofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group/img relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-[var(--color-primary)] transition-all shrink-0"
                            >
                              <img src={item.proofUrl} className="w-full h-full object-cover" alt="Preuve" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <Plus className="w-4 h-4 text-white" />
                              </div>
                            </a>
                          )}
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg shrink-0 ${item.Status === 'PRESENT' ? 'bg-[var(--color-success)] text-white' : 'bg-red-500 text-white'
                            }`}>
                            {item.Status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-gradient">{attendanceHistory.length}</span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1 uppercase">Sessions</span>
              </div>
              <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-gradient">
                  {attendanceHistory.length > 0
                    ? Math.round((attendanceHistory.filter(a => a.Status === 'PRESENT').length / attendanceHistory.length) * 100)
                    : 0}%
                </span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1 uppercase">Fidélité</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StudentDetailsModal;
