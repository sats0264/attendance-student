import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: {
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    bar: 'bg-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  error: {
    border: 'border-red-500/30',
    icon: 'text-red-400',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    bar: 'bg-red-400',
    bg: 'bg-red-500/10',
  },
  warning: {
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]',
    bar: 'bg-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  info: {
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    bar: 'bg-blue-400',
    bg: 'bg-blue-500/10',
  },
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const style = STYLES[toast.type];
  const Icon = ICONS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden w-full max-w-sm rounded-2xl border backdrop-blur-2xl ${style.border} ${style.glow} glass-panel`}
    >
      {/* Progress bar */}
      <motion.div
        className={`absolute top-0 left-0 h-0.5 ${style.bar}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
      />

      <div className="flex items-start gap-4 p-4">
        {/* Icon with glow */}
        <div className={`mt-0.5 p-2 rounded-xl ${style.bg} shrink-0`}>
          <Icon className={`w-5 h-5 ${style.icon}`} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-white/50 font-medium mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onRemove(toast.id)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message),
    warning: (title, message) => addToast('warning', title, message),
    info: (title, message) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container */}
      <div className="fixed top-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '380px', width: 'calc(100vw - 3rem)' }}>
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
