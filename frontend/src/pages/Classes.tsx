import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Loader2, Search, Calendar, ChevronRight, AlertTriangle, BookOpen, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { createClass, getClasses, getTeacherAssignments } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Classes = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [classList, setClassList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  useEffect(() => { fetchClasses(); }, [isAdmin, isTeacher]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !promotion) { setErrorMSG("ID Classe et Promotion sont requis."); return; }
    setCreating(true); setErrorMSG(null); setSuccessMSG(null);
    try {
      await createClass(classId, promotion);
      setSuccessMSG(`Classe ${classId} créée avec succès !`);
      setClassId(''); setPromotion('');
      await fetchClasses();
      setTimeout(() => { setShowForm(false); setSuccessMSG(null); }, 2000);
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

  const gradients = [
    'from-blue-600 to-indigo-700',
    'from-purple-600 to-fuchsia-700',
    'from-emerald-600 to-teal-700',
    'from-orange-600 to-red-700',
    'from-pink-600 to-rose-700',
    'from-cyan-600 to-sky-700',
  ];

  return (
    <div className="w-full flex flex-col gap-8 pb-20 relative overflow-hidden">

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#161b27] to-black" />
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit text-xs font-black uppercase tracking-widest">
              <GraduationCap className="w-4 h-4" />
              {isAdmin ? 'Administration Académique' : 'Mes Affectations'}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              {isAdmin ? 'Gestion des ' : 'Mes '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Classes</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg font-medium">
              {isAdmin ? 'Créez et organisez vos promotions académiques.' : 'Retrouvez les classes et matières auxquelles vous êtes affecté.'}
            </p>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all shrink-0 border border-white/10"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Classe
            </motion.button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
        <input
          type="text"
          placeholder={isAdmin ? "Rechercher une classe, une promotion..." : "Rechercher une classe, une matière..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none transition-all text-white placeholder:text-white/30 font-medium"
        />
      </div>

      {/* Classes grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="w-14 h-14 animate-spin text-indigo-400" />
          <p className="text-white/40 font-black uppercase tracking-widest text-sm animate-pulse">Chargement...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
          <GraduationCap className="w-20 h-20 text-white/20" />
          <p className="text-xl font-black text-white/50">Aucune classe répertoriée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredClasses.map((c, i) => {
            const grad = gradients[i % gradients.length];
            const label = c.classId || c.className;
            const sub = isAdmin ? `Promotion ${c.promotion}` : c.subjectName;
            return (
              <Link key={c.assignmentId || `${c.classId}-${i}`} to={`/classes/${label}`} className="group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative overflow-hidden p-7 rounded-3xl border border-white/10 hover:border-white/20 premium-shadow transition-all duration-500 group-hover:shadow-2xl h-full min-h-[160px] flex flex-col justify-between"
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                  <div className="absolute inset-0 glass-panel opacity-60" />

                  {/* Watermark icon */}
                  <GraduationCap className="absolute -bottom-4 -right-4 w-28 h-28 text-white/5 group-hover:text-white/10 rotate-12 transition-all" />

                  <div className="relative z-10 flex flex-col gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-lg font-black text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      {label.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-black text-white/90 group-hover:text-white tracking-tight">{label}</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-white/40 group-hover:text-white/60 transition-colors">
                        {isAdmin ? <Calendar className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                        {sub}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">Voir la classe</span>
                    <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all">
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Class Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !creating && setShowForm(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative z-10 w-full max-w-md glass-panel p-8 rounded-[2rem] border border-white/10 premium-shadow"
            >
              <button onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                <X className="w-4 h-4 text-white/60" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Nouvelle Classe</h2>
                  <p className="text-white/40 text-sm font-medium">Renseignez les informations académiques</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">ID Classe *</label>
                  <input
                    type="text" value={classId} onChange={(e) => setClassId(e.target.value)}
                    placeholder="Ex: M2ISI, L3INFO..."
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-white placeholder:text-white/20 font-semibold transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Promotion *</label>
                  <input
                    type="text" value={promotion} onChange={(e) => setPromotion(e.target.value)}
                    placeholder="Ex: 2025, 2026..."
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none text-white placeholder:text-white/20 font-semibold transition-all"
                  />
                </div>

                <AnimatePresence>
                  {errorMSG && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold overflow-hidden">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMSG}
                    </motion.div>
                  )}
                  {successMSG && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold overflow-hidden">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMSG}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={creating}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-2"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  CRÉER LA CLASSE
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Classes;
