import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, AlertTriangle, Search, Fingerprint } from 'lucide-react';
import { getStudents, deleteStudent, type Student } from '../services/api';
import StudentCard from '../components/StudentCard';
import StudentDetailsModal from '../components/StudentDetailsModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../contexts/ToastContext';

const Students = () => {
  const { error: toastError } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchStudents = async () => {
    setLoading(true); setErrorMSG(null);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setErrorMSG(err.message || "Impossible de récupérer la liste des étudiants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deletingId);
      setStudents(prev => prev.filter(s => s.faceId !== deletingId));
      setDeletingId(null);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      toastError('Erreur de suppression', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.classId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Unique classes count
  const uniqueClasses = [...new Set(students.map(s => s.classId))].length;

  return (
    <div className="w-full flex flex-col gap-8 relative overflow-hidden pb-20">

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#12121f] to-black" />
        <div className="absolute -right-20 -top-10 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute -left-20 -bottom-10 w-[20rem] h-[20rem] bg-purple-600/8 rounded-full blur-[80px] animate-pulse delay-700 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit text-xs font-black uppercase tracking-widest">
              <Fingerprint className="w-4 h-4" />
              Base Biométrique Rekognition
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              Gestion des{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Étudiants</span>
            </h1>
            <p className="text-white/50 text-base font-medium max-w-xl">
              Liste complète des profils biométriques enrôlés dans le système AWS Rekognition.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 shrink-0">
            <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 min-w-[100px]">
              <span className="text-3xl font-black text-blue-400">{students.length}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Étudiants</span>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 min-w-[100px]">
              <span className="text-3xl font-black text-purple-400">{uniqueClasses}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Classes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Count row */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative group flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher par nom, ID ou classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500/50 outline-none transition-all text-white placeholder:text-white/30 font-medium"
          />
        </div>
        {searchTerm && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-sm font-bold shrink-0">
            <Users className="w-4 h-4" />
            {filteredStudents.length} résultat{filteredStudents.length !== 1 ? 's' : ''}
          </motion.div>
        )}
      </div>

      {errorMSG && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-4 text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="font-bold">{errorMSG}</p>
        </motion.div>
      )}

      {/* Main grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-14 h-14 animate-spin text-blue-400 relative z-10" />
          </div>
          <p className="text-white/40 font-black uppercase tracking-widest text-sm animate-pulse">Synchronisation Rekognition...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
          <Users className="w-20 h-20 text-white/20" />
          <p className="text-xl font-black text-white/50">Aucun étudiant trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student, i) => (
            <StudentCard
              key={`${student.studentId}-${i}`}
              student={student}
              index={i}
              onClick={() => setSelectedStudent(student)}
              showClass={true}
              onDelete={(faceId) => { setDeletingId(faceId); setShowDeleteConfirm(true); }}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={showDeleteConfirm}
        title="Supprimer le profil ?"
        message="Cette action supprimera définitivement le visage de la collection Rekognition. Cette opération est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteConfirm(false); setDeletingId(null); }}
      />

      <StudentDetailsModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </div>
  );
};

export default Students;
