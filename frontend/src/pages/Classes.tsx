import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Loader2, Search, Calendar, ChevronRight, AlertTriangle, Fingerprint, BookOpen } from 'lucide-react';
import { createClass, getClasses, getTeacherAssignments } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Classes = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [classList, setClassList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [classId, setClassId] = useState('');
  const [promotion, setPromotion] = useState('');
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [successMSG, setSuccessMSG] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const data = await getClasses();
        setClassList(data);
      } else if (isTeacher) {
        const data = await getTeacherAssignments();
        setClassList(data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [isAdmin, isTeacher]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !promotion) {
      setErrorMSG("ID Classe et Promotion sont requis.");
      return;
    }

    setCreating(true);
    setErrorMSG(null);
    setSuccessMSG(null);

    try {
      await createClass(classId, promotion);
      setSuccessMSG(`Classe ${classId} créée avec succès !`);
      setClassId('');
      setPromotion('');
      await fetchClasses();
    } catch (err: any) {
      setErrorMSG(err.message || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const filteredClasses = classList.filter(c => {
    const search = searchTerm.toLowerCase();
    const cId = (c.classId || c.className || "").toLowerCase();
    const prom = (c.promotion || c.subjectName || "").toLowerCase();
    return cId.includes(search) || prom.includes(search);
  });

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 relative overflow-hidden pb-12">
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-extrabold flex items-center gap-4">
            <GraduationCap className="w-10 h-10 md:w-14 md:h-14 text-[var(--color-primary)]" />
            <span className="text-gradient">
              {isAdmin ? "Gestion des Classes" : "Mes Classes & Affectations"}
            </span>
          </h1>
          <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-xl">
             {isAdmin 
               ? "Créez et gérez vos promotions d'étudiants." 
               : "Retrouvez ici les classes et matières auxquelles vous êtes affecté."}
          </p>
        </div>
      </motion.div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-8 lg:items-start`}>
        
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="glass-panel p-8 rounded-3xl border border-white/10 premium-shadow">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Plus className="w-5 h-5 text-[var(--color-primary)]" />
                 Nouvelle Classe
              </h2>

              <form onSubmit={handleCreate} className="flex flex-col gap-6">
                 <div className="flex flex-col gap-2">
                   <label className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">ID Classe *</label>
                   <input 
                     type="text" value={classId} onChange={(e) => setClassId(e.target.value)}
                     placeholder="Ex: M2ISI"
                     className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                   />
                 </div>
                 <div className="flex flex-col gap-2">
                   <label className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">Promotion *</label>
                   <input 
                     type="text" value={promotion} onChange={(e) => setPromotion(e.target.value)}
                     placeholder="Ex: 2026"
                     className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none"
                   />
                 </div>

                 <button 
                   type="submit"
                   disabled={creating}
                   className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-lg font-bold text-white hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                   CRÉER LA CLASSE
                 </button>
              </form>

              <AnimatePresence>
                {errorMSG && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-center gap-3 overflow-hidden"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {errorMSG}
                  </motion.div>
                )}
                {successMSG && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-sm flex items-center gap-3 overflow-hidden"
                  >
                    <div className="p-1 bg-green-500 rounded-full text-black">
                       <Plus className="w-3 h-3" />
                    </div>
                    {successMSG}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`${isAdmin ? 'lg:col-span-8' : 'lg:col-span-1'} flex flex-col gap-6`}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-colors" />
                <input 
                  type="text"
                  placeholder="Rechercher une classe ou une matière..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--color-primary)] outline-none transition-all"
                />
             </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden premium-shadow min-h-[400px]">
             {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-50">
                   <Loader2 className="w-10 h-10 animate-spin" />
                   <p>Chargement des classes...</p>
                </div>
             ) : filteredClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-30 text-center">
                   <GraduationCap className="w-16 h-16" />
                   <p className="text-lg">Aucune classe répertoriée.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {filteredClasses.map((c, i) => (
                      <Link 
                        key={c.assignmentId || `${c.classId}-${i}`}
                        to={`/classes/${c.classId || c.className}`}
                        className="group"
                      >
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--color-primary)] transition-all flex items-center justify-between relative overflow-hidden"
                        >
                           <Fingerprint className="absolute -bottom-4 -right-4 w-20 h-20 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
                           
                           <div className="flex flex-col gap-1 z-10">
                              <span className="text-2xl font-black text-gradient uppercase">
                                {c.classId || c.className}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                 {isAdmin ? (
                                   <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] font-semibold">
                                      <Calendar className="w-4 h-4" />
                                      Promotion {c.promotion}
                                   </div>
                                 ) : (
                                   <div className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-bold">
                                      <BookOpen className="w-4 h-4" />
                                      {c.subjectName}
                                   </div>
                                 )}
                              </div>
                           </div>

                           <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-sm z-10">
                              <ChevronRight className="w-6 h-6" />
                           </div>
                        </motion.div>
                      </Link>
                   ))}
                </div>
             )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Classes;
