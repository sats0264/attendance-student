import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Search, Calendar, Loader2 } from 'lucide-react';
import { getSessions, type SessionRecord } from '../services/api';
import SessionTable from '../components/SessionTable';
import SessionDetailsView from '../components/SessionDetailsView';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
  const { isTeacher, isAdmin, userData } = useAuth();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Details view state
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
    if (userData) {
      fetchSessions();
    }
  }, [userData, isTeacher, isAdmin]);

  const filteredSessions = sessions.filter(s =>
    (s.subject ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.classId ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.teacher ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-8 relative overflow-hidden pb-12">

      <AnimatePresence mode="wait">
        {!selectedSession ? (
          /* List View */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-5xl font-extrabold flex items-center gap-4">
                  <HistoryIcon className="w-10 h-10 text-[var(--color-primary)]" />
                  <span className="text-gradient">Historique</span>
                </h1>
                <p className="text-lg text-[var(--color-text-muted)]">Retrouvez toutes vos séances passées et exportez les présences.</p>
              </div>

              <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[var(--color-primary)] transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher une séance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--color-primary)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 premium-shadow">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
                  <p className="font-bold animate-pulse">Chargement des séances...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-30 text-center">
                  <Calendar className="w-16 h-16" />
                  <p className="text-xl font-medium">Aucune séance trouvée.</p>
                </div>
              ) : (
                <SessionTable sessions={filteredSessions} onViewDetails={setSelectedSession} />
              )}
            </div>
          </motion.div>
        ) : (
          /* Details View */
          <SessionDetailsView 
            session={selectedSession} 
            onClose={() => setSelectedSession(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default History;
