import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    icon: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]',
    btn: 'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border-red-500/30 hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]',
  },
  warning: {
    icon: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    glow: 'shadow-[0_0_40px_rgba(234,179,8,0.2)]',
    btn: 'bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-white border-yellow-500/30 hover:border-yellow-500',
  },
  info: {
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.2)]',
    btn: 'bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white border-blue-500/30 hover:border-blue-500',
  },
};

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const { t } = useTranslation();
  const style = VARIANT_STYLES[variant];
  
  const finalConfirmLabel = confirmLabel || t('confirm.confirm');
  const finalCancelLabel = cancelLabel || t('confirm.cancel');

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !loading && onCancel()}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className={`relative z-10 w-full max-w-sm glass-panel rounded-[2rem] border ${style.border} ${style.glow} p-8 flex flex-col items-center text-center gap-7`}
          >
            {/* Close */}
            <button
              onClick={onCancel}
              disabled={loading}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-white/40 hover:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="relative">
              <div className={`absolute inset-0 ${style.bg} rounded-full blur-xl animate-pulse`} />
              <div className={`relative w-20 h-20 rounded-[1.5rem] ${style.bg} border ${style.border} flex items-center justify-center`}>
                <AlertTriangle className={`w-10 h-10 ${style.icon}`} />
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-black text-white">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-medium">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all"
              >
                {finalCancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-4 rounded-2xl border font-black transition-all flex items-center justify-center gap-2 ${style.btn}`}
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : finalConfirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
