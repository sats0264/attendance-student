import { motion } from 'framer-motion';
import { Fingerprint, Trash2 } from 'lucide-react';
import { type Student } from '../services/api';

interface StudentCardProps {
  student: Student;
  onClick: () => void;
  showClass?: boolean;
  onDelete?: (id: string) => void;
  index?: number;
}

const StudentCard = ({ student, onClick, showClass = false, onDelete, index = 0 }: StudentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="flex flex-col p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--color-primary)] transition-all duration-300 relative group overflow-hidden cursor-pointer"
    >
      <Fingerprint className="absolute -bottom-4 -right-4 w-20 h-20 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-2xl font-black text-white shadow-md uppercase shrink-0">
          {student.photoUrl ? (
            <img 
              src={student.photoUrl} 
              alt={student.fullName} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = ''; // Fallback to initial if image fails
              }}
            />
          ) : (
            student.fullName.charAt(0)
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold group-hover:text-[var(--color-primary)] transition-colors">{student.fullName}</span>
          <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-tight">{student.studentId}</span>
        </div>
      </div>

      {(showClass || onDelete) && (
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10">
          {showClass ? (
            <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider border border-white/5">
              {student.classId}
            </span>
          ) : <div />}
          
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(student.faceId); }}
              className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
              title="Supprimer l'étudiant"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StudentCard;
