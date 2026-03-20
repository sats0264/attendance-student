import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Search, Calendar, Loader2, BookOpen, Clock } from 'lucide-react';
import { getSessions, type SessionRecord } from '../services/api';
import SessionTable from '../components/SessionTable';
import SessionDetailsView from '../components/SessionDetailsView';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
  const { isTeacher, isAdmin, userData } = useAuth();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      let filtered = data;
      if (isTeacher && userData?.name) {
        filtered = data.filter(s => s.teacher === userData.name);
      }
      setSessions(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) fetchSessions();
  }, [userData, isTeacher, isAdmin]);

  const filteredSessions = sessions.filter(s =>
    (s.subject ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.classId ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.teacher ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Unique subjects and classes
  const uniqueSubjects = [...new Set(sessions.map(s => s.subject))].length;
  const uniqueClasses = [...new Set(sessions.map(s => s.classId))].length;

  return (
    <div className="w-full flex flex-col gap-8 relative overflow-hidden pb-20">
      <AnimatePresence mode="wait">
        {!selectedSession ? (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-8">

            {/* Hero header */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#141024] to-black" />
              <div className="absolute -right-20 top-0 w-[35rem] h-[35rem] bg-violet-600/8 rounded-full blur-[100px] animate-pulse pointer-events-none" />
              <div className="absolute left-0 -bottom-10 w-[25rem] h-[25rem] bg-cyan-600/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex flex-col gap-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 w-fit text-xs font-black uppercase tracking-widest">
                    <HistoryIcon className="w-4 h-4" />
                    {isAdmin ? 'Historique Global' : 'Mes Séances'}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                    Journal des{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Séances</span>
                  </h1>
                  <p className="text-white/50 text-base font-medium max-w-xl">
                    {isAdmin
                      ? 'Consultez l\'ensemble des séances de présence enregistrées dans le système.'
                      : 'Retrouvez l\'historique complet de vos séances d\'appel et présences.'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4 shrink-0">
                  <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 min-w-[90px]">
                    <span className="text-3xl font-black text-violet-400">{sessions.length}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Séances</span>
                  </div>
                  <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 min-w-[90px]">
                    <span className="text-3xl font-black text-cyan-400">{uniqueClasses}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Classes</span>
                  </div>
                  <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 min-w-[90px]">
                    <span className="text-3xl font-black text-pink-400">{uniqueSubjects}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Matières</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative group max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher par matière, classe, enseignant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/50 outline-none transition-all text-white placeholder:text-white/30 font-medium"
              />
            </div>

            {/* Sessions list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500/30 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="w-14 h-14 animate-spin text-violet-400 relative z-10" />
                </div>
                <p className="text-white/40 font-black uppercase tracking-widest text-sm animate-pulse">Chargement des séances...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
                <Calendar className="w-20 h-20 text-white/20" />
                <p className="text-xl font-black text-white/50">Aucune séance trouvée.</p>
                {searchTerm && <p className="text-sm text-white/30">Essayez de modifier votre recherche.</p>}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 premium-shadow"
              >
                {/* Table header info */}
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/50">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-bold">{filteredSessions.length} séance{filteredSessions.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/30 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Triées par date décroissante
                  </div>
                </div>
                <SessionTable sessions={filteredSessions} onViewDetails={setSelectedSession} />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <SessionDetailsView session={selectedSession} onClose={() => setSelectedSession(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
