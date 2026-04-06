import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Camera, LayoutDashboard, Fingerprint, GraduationCap,
  LogOut, UserPlus, User, Menu, X, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { isAdmin, isTeacher, userData, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: t('navbar.dashboard'), path: '/dashboard', icon: LayoutDashboard },
  ];

  if (isAdmin) {
    links.push({ name: t('navbar.classes'), path: '/classes', icon: GraduationCap });
    links.push({ name: t('navbar.teachers'), path: '/admin/teachers', icon: UserPlus });
  } else if (isTeacher) {
    links.push({ name: t('navbar.attendance'), path: '/attendance', icon: Camera });
    links.push({ name: t('navbar.my_classes'), path: '/classes', icon: GraduationCap });
  }

  links.push({ name: t('navbar.profile'), path: '/profile', icon: User });

  const handleLogout = async () => {
    try {
      await signOut();
      await checkAuth();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const roleLabel = isAdmin ? t('navbar.role_admin') : isTeacher ? t('navbar.role_teacher') : t('navbar.role_user');
  const roleColor = isAdmin
    ? 'from-amber-600 to-orange-600'
    : 'from-indigo-600 to-purple-600';

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4"
      >
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl border border-white/[0.08] premium-shadow flex items-center justify-between px-5 py-3 gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center shadow-lg shrink-0`}>
              {isAdmin ? <Fingerprint className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-black text-white tracking-tight">AttendancePro</span>
              <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest">{roleLabel}</span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group
                  ${isActive
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${roleColor} opacity-20`}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <link.icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`} />
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-dot"
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r ${roleColor}`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Desktop right: user + logout */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <LanguageSwitcher />

            {/* User chip */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${roleColor} flex items-center justify-center text-xs font-black text-white shrink-0`}>
                {(userData?.name || roleLabel).charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-black text-white/90 max-w-[120px] truncate">
                  {userData?.name || roleLabel}
                </span>
                <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{roleLabel}</span>
              </div>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:border-red-500 text-red-400 hover:text-white transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 glass-panel border-l border-white/10 flex flex-col gap-2 p-6 md:hidden"
            >
              {/* Mobile brand */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center`}>
                    <Fingerprint className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-black text-white">AttendancePro</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User info */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-sm font-black text-white shrink-0`}>
                  {(userData?.name || roleLabel).charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white">{userData?.name || roleLabel}</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{roleLabel}</span>
                </div>
              </div>

              {/* Mobile links */}
              {links.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all
                    ${isActive
                      ? `bg-gradient-to-r ${roleColor} text-white shadow-lg`
                      : 'text-white/50 hover:text-white hover:bg-white/5'}`
                  }
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </NavLink>
              ))}

              <div className="mt-auto flex flex-col gap-3">
                <div className="px-1">
                  <LanguageSwitcher />
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t('navbar.logout')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
