import { motion } from 'framer-motion';
import { Eye, GraduationCap, BookOpen, User, Clock } from 'lucide-react';
import { type SessionRecord } from '../services/api';

interface SessionTableProps {
  sessions: SessionRecord[];
  onViewDetails: (session: SessionRecord) => void;
  hideClass?: boolean;
}

const SessionTable = ({ sessions, onViewDetails, hideClass = false }: SessionTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        {/* Header */}
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Date & Heure</div>
            </th>
            {!hideClass && (
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                <div className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" />Classe</div>
              </th>
            )}
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">
              <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" />Matière</div>
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">
              <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" />Enseignant</div>
            </th>
            <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-white/30">
              Détails
            </th>
          </tr>
        </thead>

        <tbody>
          {sessions.map((s, i) => (
            <motion.tr
              key={`${s.sessionId}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
            >
              {/* Date */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-black text-sm text-white/90">
                    {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-white/25 font-mono">
                    {new Date(s.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </td>

              {/* Class badge */}
              {!hideClass && (
                <td className="px-6 py-4">
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-xs uppercase">
                    {s.classId}
                  </span>
                </td>
              )}

              {/* Subject */}
              <td className="px-6 py-4">
                <span className="font-bold text-sm text-white/80 group-hover:text-white transition-colors">
                  {s.subject || '—'}
                </span>
              </td>

              {/* Teacher */}
              <td className="px-6 py-4">
                <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors font-medium">
                  {s.teacher || '—'}
                </span>
              </td>

              {/* Action */}
              <td className="px-6 py-4 text-right">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewDetails(s)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-white/40 hover:text-indigo-300 font-bold text-xs transition-all ml-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Voir
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionTable;
