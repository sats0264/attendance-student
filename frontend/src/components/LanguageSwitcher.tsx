import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'en', label: 'EN', name: 'English' }
  ];

  // Fallback to 'fr' if current language code is not in list (e.g. 'en-US' or similar)
  const baseCode = i18n.language?.split('-')[0] || 'fr';
  const currentLang = languages.find(l => l.code === baseCode) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all premium-shadow"
        title="Changer de langue"
      >
        <Globe className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-bold tracking-wider">{currentLang.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-[60] flex flex-col"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center justify-between px-4 py-3 text-xs font-bold w-full text-left transition-colors
                  ${baseCode === lang.code 
                    ? 'bg-indigo-500/20 text-indigo-300' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                {lang.name}
                {baseCode === lang.code && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
