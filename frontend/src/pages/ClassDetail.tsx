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

const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const [activeTab, setActiveTab] = useState<'students' | 'history'>('students');
  const [classInfo, setClassInfo] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Lists state
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Selection state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const allClasses = await getClasses();
        const info = allClasses.find(c => c.classId === classId);
        setClassInfo(info || { classId, promotion: 'N/A' });
      } catch (err) {
        console.error("Failed to fetch class info", err);
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchClassSessions = async () => {
    if (!classId) return;
    setLoadingSessions(true);
    try {
      const data = await getSessions();
      const filtered = data.filter(s => s.classId === classId);
      setSessions(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleDeleteStudent = async (faceId: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) return;
    
    try {
      await deleteStudent(faceId);
      // Refresh list
      setStudents(prev => prev.filter(s => s.faceId !== faceId));
    } catch (err: any) {
      alert("Erreur lors de la suppression : " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
        <p className="font-bold opacity-50">Chargement de la classe...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link
            to="/classes"
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[var(--color-text-muted)] hover:text-white shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-extrabold flex items-center gap-4">
              <GraduationCap className="w-10 h-10 text-[var(--color-primary)]" />
              <span className="text-gradient uppercase">{classId}</span>
            </h1>
            <p className="text-lg text-[var(--color-text-muted)] mt-1 font-semibold">Promotion {classInfo?.promotion}</p>
          </div>
        </div>

        <Link
          to="/enrollment"
          state={{ prefilledClassId: classId }}
          className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-lg"
        >
          <UserPlus className="w-6 h-6" />
          INSCRIRE UN ÉTUDIANT
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
        <button
          onClick={() => { setActiveTab('students'); setSelectedSession(null); }}
          className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'students'
            ? 'bg-[var(--color-primary)] text-white shadow-md'
            : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-5 h-5" />
          Étudiants ({students.length})
        </button>
        <button
          onClick={() => { setActiveTab('history'); setSelectedSession(null); }}
          className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
            ? 'bg-[var(--color-primary)] text-white shadow-md'
            : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
          }`}
        >
          <HistoryIcon className="w-5 h-5" />
          Historique Appels
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'students' ? (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loadingStudents ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p>Récupération des étudiants...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="col-span-full py-20 glass-panel rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 opacity-30 text-center">
                <Users className="w-16 h-16" />
                <p className="text-xl">Aucun étudiant inscrit dans cette classe.</p>
              </div>
            ) : (
              students.map((student, i) => (
                <StudentCard
                   key={student.faceId}
                   student={student}
                   index={i}
                   onClick={() => setSelectedStudent(student)}
                   onDelete={handleDeleteStudent}
                />
              ))
            )}
          </motion.div>
        ) : !selectedSession ? (
          <motion.div
            key="history-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel rounded-3xl border border-white/10 overflow-hidden premium-shadow"
          >
            {loadingSessions ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                 <Loader2 className="w-10 h-10 animate-spin" />
                 <p>Récupération des séances...</p>
               </div>
            ) : sessions.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30 text-center">
                 <Calendar className="w-16 h-16" />
                 <p className="text-xl">Aucune séance enregistrée pour cette classe.</p>
               </div>
            ) : (
               <SessionTable
                 sessions={sessions}
                 onViewDetails={setSelectedSession}
                 hideClass={true}
               />
            )}
          </motion.div>
        ) : (
          <SessionDetailsView
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </AnimatePresence>

      {/* Shared Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

    </div>
  );
};

export default ClassDetail;
