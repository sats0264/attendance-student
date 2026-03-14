import { NavLink } from 'react-router-dom';
import { Camera, LayoutDashboard, Fingerprint, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', path: '/attendance', icon: Camera },
    { name: 'Classes', path: '/classes', icon: GraduationCap },
  ];

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto 
                      glass-panel rounded-2xl
                      flex items-center justify-between
                      px-6 py-3 premium-shadow">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg shadow-md shadow-blue-500/20">
             <Fingerprint className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">
            Attendance<span className="text-white">Pro</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-all duration-300 px-4 py-2 rounded-xl
                 ${isActive 
                    ? 'text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] glass-panel text-shadow-sm' 
                    : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'}`
              }
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* User Profile / Action */}
        <div className="hidden md:flex items-center">
           <button className="text-sm font-semibold px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
             Admin Portal
           </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
