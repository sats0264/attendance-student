import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Users, History as HistoryIcon, UserPlus,
  ArrowLeft, Loader2, Calendar
} from 'lucide-react';
import {
  getStudents, getSessions, deleteStudent,
  type Student, type SessionRecord,
  getClasses, type ClassItem
} from '../services/api';
import StudentCard from '../components/StudentCard';
import SessionTable from '../components/SessionTable';
import StudentDetailsModal from '../components/StudentDetailsModal';
import SessionDetailsView from '../components/SessionDetailsView';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const { isAdmin, isTeacher, userData } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<'students' | 'history'>('students');
  const [classInfo, setClassInfo] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const allClasses = await getClasses();
        const info = allClasses.find(c => c.classId === classId);
        setClassInfo(info || { classId, promotion: 'N/A' });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [classId]);

  useEffect(() => {
    if (activeTab === 'students') fetchClassStudents();
    else fetchClassSessions();
  }, [activeTab, classId]);

  const fetchClassStudents = async () => {
    if (!classId) return;
    setLoadingStudents(true);
    try {
      const data = await getStudents(classId);
      setStudents(data);
    } catch (err) { console.error(err); }
    finally { setLoadingStudents(false); }
  };

  const fetchClassSessions = async () => {
    if (!classId) return;
    setLoadingSessions(true);
    try {
      const data = await getSessions();
      let filtered = data.filter(s => s.classId === classId);
      if (isTeacher && userData?.name) filtered = filtered.filter(s => s.teacher === userData.name);
      setSessions(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) { console.error(err); }
    finally { setLoadingSessions(false); }
  };

  const handleDeleteStudent = async (faceId: string) => {
    setStudentToDelete(faceId);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteStudent(studentToDelete);
      setStudents(prev => prev.filter(s => s.faceId !== studentToDelete));
      setStudentToDelete(null);
      toastSuccess('Étudiant supprimé', 'Le profil biométrique a été retiré de Rekognition.');
    } catch (err: any) {
      toastError('Erreur de suppression', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-14 h-14 animate-spin text-indigo-400 relative z-10" />
        </div>
        <p className="font-black uppercase tracking-widest text-white/30 text-sm animate-pulse">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-20">

      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#10172e] to-black" />
        <div className="absolute -right-20 -top-10 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link
              to="/classes"
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/50 hover:text-white flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Promotion {classInfo?.promotion ?? 'N/A'}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase">
                {classId}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-2xl font-black text-indigo-400">{students.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Étudiants</span>
              </div>
              <div className="flex flex-col items-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-2xl font-black text-purple-400">{sessions.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Séances</span>
              </div>
            </div>

            {isAdmin && (
              <Link
                to="/enrollment"
                state={{ prefilledClassId: classId }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all border border-white/10 hover:scale-[1.02]"
              >
                <UserPlus className="w-5 h-5" />
                Inscrire
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1.5 bg-white/5 rounded-2xl w-fit border border-white/10">
        {[
          { key: 'students', label: `Étudiants (${students.length})`, icon: Users },
          { key: 'history', label: 'Historique Appels', icon: HistoryIcon },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key as any); setSelectedSession(null); }}
            className={`flex items-center gap-2.5 px-7 py-3 rounded-xl font-black text-sm transition-all ${
              activeTab === key
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'students' ? (
          <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
                <p className="text-white/30 font-black text-sm uppercase tracking-widest animate-pulse">Chargement...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-32 glass-panel rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 opacity-30 text-center">
                <Users className="w-20 h-20 text-white/20" />
                <p className="text-xl font-black">Aucun étudiant dans cette classe.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {students.map((student, i) => (
                  <StudentCard
                    key={student.faceId}
                    student={student}
                    index={i}
                    onClick={() => setSelectedStudent(student)}
                    onDelete={isAdmin ? handleDeleteStudent : undefined}
                  />
                ))}
              </div>
            )}
          </motion.div>

        ) : !selectedSession ? (
          <motion.div key="history-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loadingSessions ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                <p className="text-white/30 font-black text-sm uppercase tracking-widest animate-pulse">Chargement...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-32 glass-panel rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 opacity-30 text-center">
                <Calendar className="w-20 h-20 text-white/20" />
                <p className="text-xl font-black">Aucune séance pour cette classe.</p>
              </div>
            ) : (
              <div className="glass-panel rounded-[2rem] border border-white/5 overflow-hidden premium-shadow">
                <SessionTable sessions={sessions} onViewDetails={setSelectedSession} hideClass={true} />
              </div>
            )}
          </motion.div>

        ) : (
          <SessionDetailsView session={selectedSession} onClose={() => setSelectedSession(null)} />
        )}
      </AnimatePresence>

      <StudentDetailsModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />

      <ConfirmModal
        open={!!studentToDelete}
        title="Supprimer l'étudiant ?"
        message="Ce profil biométrique sera définitivement supprimé de la collection AWS Rekognition."
        confirmLabel="Supprimer"
        variant="danger"
        loading={isDeleting}
        onConfirm={confirmDeleteStudent}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};

export default ClassDetail;
