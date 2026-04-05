import { Zap, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full mt-auto relative overflow-hidden">
      <div className="absolute inset-0 glass-panel border-t border-white/[0.06]" />
      <div className="absolute top-0 left-1/4 w-80 h-40 bg-indigo-600/8 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-40 bg-purple-600/6 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-tight">AttendancePro</span>
              <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{t('footer.biometric_system')}</span>
            </div>
          </div>

          {/* Center */}
          <div className="flex items-center gap-2 text-white/30 text-sm font-medium">
            <Shield className="w-4 h-4 text-indigo-400/50" />
            <span>{t('footer.powered_by')} <span className="font-black text-white/50">AWS Rekognition</span> &amp; <span className="font-black text-white/50">React</span></span>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-[11px] text-white/20 font-medium">
              &copy; {new Date().getFullYear()} ESMT Dakar — {t('footer.all_rights_reserved')}
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/[0.08] text-[10px] text-white/20 font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('footer.system_operational')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
