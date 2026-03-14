import { motion } from 'framer-motion';
import { Eye, ChevronRight } from 'lucide-react';
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
        <thead className="bg-white/5 text-[var(--color-text-muted)] text-sm uppercase tracking-wider">
          <tr>
            <th className="px-8 py-4">Date & Heure</th>
            {!hideClass && <th className="px-8 py-4">Classe</th>}
            <th className="px-8 py-4">Matière</th>
            <th className="px-8 py-4">Enseignant</th>
            <th className="px-8 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sessions.map((s, i) => (
            <motion.tr
              key={`${s.sessionId}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="hover:bg-white/5 transition-colors group"
            >
              <td className="px-8 py-5">
                <div className="flex flex-col">
                  <span className="font-bold">{new Date(s.date).toLocaleDateString()}</span>
                  <span className="text-xs opacity-50">{new Date(s.date).toLocaleTimeString()}</span>
                </div>
              </td>
              {!hideClass && (
                <td className="px-8 py-5">
                  <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-xs uppercase">
                    {s.classId}
                  </span>
                </td>
              )}
              <td className="px-8 py-5 font-semibold text-white/90">{s.subject}</td>
              <td className="px-8 py-5 text-[var(--color-text-muted)]">{s.teacher || '—'}</td>
              <td className="px-8 py-5 text-right">
                <button
                  onClick={() => onViewDetails(s)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-[var(--color-primary)] text-white transition-all shadow-sm flex items-center justify-center ml-auto"
                >
                  {hideClass ? <ChevronRight className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionTable;
