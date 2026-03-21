import { motion } from 'framer-motion';
import { Fingerprint, Trash2, Eye } from 'lucide-react';
import { type Student } from '../services/api';

interface StudentCardProps {
  student: Student;
  onClick: () => void;
  showClass?: boolean;
  onDelete?: (id: string) => void;
  index?: number;
}

const StudentCard = ({ student, onClick, showClass = false, onDelete, index = 0 }: StudentCardProps) => {
  const initials = student.fullName
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarGradients = [
    'from-blue-600 to-indigo-700',
    'from-purple-600 to-fuchsia-700',
    'from-emerald-600 to-teal-700',
    'from-orange-500 to-rose-600',
    'from-pink-600 to-purple-700',
    'from-cyan-600 to-blue-700',
  ];
  const grad = avatarGradients[index % avatarGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 120 }}
      whileHover={{ y: -4, scale: 1.015 }}
      onClick={onClick}
      className="group relative flex flex-col gap-0 rounded-[1.75rem] overflow-hidden border border-white/10 hover:border-white/20 glass-panel cursor-pointer transition-all duration-300 premium-shadow hover:shadow-2xl"
    >
      {/* Top: gradient banner with avatar */}
      <div className={`h-20 bg-gradient-to-br ${grad} opacity-20 group-hover:opacity-30 transition-opacity duration-300 flex-shrink-0`} />

      {/* Avatar floated over banner seam */}
      <div className="px-5 pb-5 pt-0 flex flex-col gap-3 relative">
        <div className={`-mt-8 w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br ${grad} flex items-center justify-center text-xl font-black text-white shadow-xl border-2 border-[#111]/60 shrink-0 group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300`}>
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={student.fullName}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : initials}
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-base font-black text-white/90 group-hover:text-white transition-colors leading-tight">
            {student.fullName}
          </span>
          <span className="text-[11px] font-mono text-white/30 uppercase tracking-tight">
            {student.studentId}
          </span>
        </div>

        {/* Footer row */}
        {(showClass || onDelete) && (
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-1">
            {showClass ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Fingerprint className="w-3 h-3 text-white/30" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {student.classId}
                </span>
              </div>
            ) : <div />}

            <div className="flex items-center gap-1">
              <div className="p-1.5 rounded-xl bg-white/5 text-white/20 group-hover:text-white/60 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </div>
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(student.faceId); }}
                  className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 bg-red-500/0 hover:bg-red-500/15 text-red-400/50 hover:text-red-400 transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentCard;
