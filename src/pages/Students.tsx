import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Loader2, AlertTriangle, Search } from 'lucide-react';
import { getStudents, deleteStudent, type Student } from '../services/api';
import StudentCard from '../components/StudentCard';
import StudentDetailsModal from '../components/StudentDetailsModal';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Details state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Deletion logic
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setErrorMSG(null);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setErrorMSG(err.message || "Impossible de récupérer la liste des étudiants");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deletingId);
      setStudents(prev => prev.filter(s => s.faceId !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      alert("Erreur de suppression : " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.classId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-8 relative overflow-hidden pb-12">

      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-primary)]" />
            <span className="text-gradient">Gestion Étudiants</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
            Liste complète des étudiants enrôlés dans le système Rekognition.
          </p>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-colors" />
          <input
            type="text"
            placeholder="Rechercher (Nom, ID, Classe)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--color-primary)] outline-none transition-all placeholder:text-gray-600"
          />
        </div>
      </motion.div>

      {/* Main List Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full glass-panel rounded-3xl p-6 md:p-8 border-t border-white/10 premium-shadow min-h-[400px]"
      >
        {errorMSG && (
          <div className="mb-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl flex items-center gap-4 text-[var(--color-error)]">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{errorMSG}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4 text-[var(--color-primary)]">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-semibold animate-pulse">Synchronisation Rekognition...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4 text-[var(--color-text-muted)] opacity-30">
            <Users className="w-16 h-16" />
            <p className="font-semibold text-lg">Aucun étudiant trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, i) => (
              <StudentCard
                key={`${student.studentId}-${i}`}
                student={student}
                index={i}
                onClick={() => setSelectedStudent(student)}
                showClass={true}
                onDelete={(faceId) => setDeletingId(faceId)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Portal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
             <motion.div
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => !isDeleting && setDeletingId(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-sm glass-panel p-8 rounded-3xl relative z-10 flex flex-col items-center text-center gap-6"
             >
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                   <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                   <h3 className="text-2xl font-black">Supprimer ?</h3>
                   <p className="text-[var(--color-text-muted)]">Cette action supprimera définitivement le visage de la collection Rekognition.</p>
                </div>
                <div className="flex gap-4 w-full">
                   <button
                     onClick={() => setDeletingId(null)}
                     className="flex-1 py-3 rounded-xl bg-white/5 font-bold hover:bg-white/10 transition-all"
                   >
                     Annuler
                   </button>
                   <button
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                   >
                     {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
                   </button>
                </div>
             </motion.div>
          </div>
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

export default Students;
