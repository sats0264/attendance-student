import { motion } from 'framer-motion';
import {
  User, Mail, Shield, BookOpen, Calendar,
  Lock, CheckCircle2, Fingerprint,
  GraduationCap, Layers, Crown, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getTeacherAssignments } from '../services/api';
import { useTranslation } from 'react-i18next';

/* ─────────────────────── Shared helpers ─────────────────────── */

const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group">
    <span className="text-xs font-black uppercase tracking-widest text-white/30">{label}</span>
    <span className="flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
      {Icon && <Icon className="w-3.5 h-3.5 text-white/40" />}
      {value}
    </span>
  </div>
);

/* ─────────────────────── Admin Profile ─────────────────────── */

const AdminProfile = ({ userData, groups }: any) => {
  const { t } = useTranslation();
  const initial = userData?.name?.charAt(0) || 'A';

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-yellow-500/20 shadow-[0_0_60px_rgba(234,179,8,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c1500] via-[#16120a] to-black" />
        <div className="absolute -right-20 -top-20 w-[35rem] h-[35rem] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute -left-20 -bottom-20 w-[25rem] h-[25rem] bg-orange-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse delay-700" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10 p-10 md:p-14">

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.1 }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-[2rem] blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2rem] bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center text-7xl font-black text-black shadow-2xl ring-4 ring-yellow-500/20">
              {initial}
              <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl bg-black border-2 border-yellow-500/40 flex items-center justify-center shadow-xl">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          {/* Name & role tag */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest mb-4">
                <Crown className="w-3.5 h-3.5" /> {t('profile.sys_admin')}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                {userData?.name || t('profile.admin')}
              </h1>
              <p className="text-lg text-white/40 font-medium mt-2 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" /> {userData?.email || 'admin@institution.edu'}
              </p>
            </motion.div>

            {/* Role badges */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 justify-center md:justify-start">
              {groups.map((g: string) => (
                <span key={g} className="px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 text-xs font-black uppercase tracking-widest border border-yellow-500/20">
                  {g}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Detail Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Identity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-panel p-8 rounded-[2rem] border border-white/5 premium-shadow"
        >
          <h3 className="text-base font-black uppercase tracking-widest text-yellow-400/80 mb-6 flex items-center gap-3">
            <Fingerprint className="w-5 h-5" /> {t('profile.identity')}
          </h3>
          <InfoRow label={t('profile.full_name')} value={userData?.name || '—'} icon={User} />
          <InfoRow label={t('profile.email')} value={userData?.email || '—'} icon={Mail} />
          <InfoRow label={t('profile.main_role')} value={t('profile.admin')} icon={Crown} />
          <InfoRow label={t('profile.institution')} value="ESMT" icon={GraduationCap} />
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass-panel p-8 rounded-[2rem] border border-white/5 premium-shadow"
        >
          <h3 className="text-base font-black uppercase tracking-widest text-yellow-400/80 mb-6 flex items-center gap-3">
            <Shield className="w-5 h-5" /> {t('profile.security')}
          </h3>

          <div className="flex flex-col gap-4">
            {/* Password */}
            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-yellow-500/20 transition-all flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-xs font-black uppercase tracking-widest text-white/40">{t('login.password')}</span>
                <span className="text-base font-bold text-white/80 tracking-widest">••••••••••••</span>
              </div>
              <button className="text-xs font-black text-yellow-400 hover:text-yellow-300 px-4 py-2 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/10 transition-all">
                {t('profile.change')}
              </button>
            </div>

            {/* 2FA */}
            <div className="group p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-emerald-500/20 transition-all flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-xs font-black uppercase tracking-widest text-white/40">{t('profile.two_factor_auth')}</span>
                <span className="text-base font-bold text-emerald-400">{t('profile.activated')}</span>
              </div>
              <button className="text-xs font-black text-white/50 hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                {t('profile.configure')}
              </button>
            </div>

            {/* Cognito */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-black uppercase tracking-widest text-white/40">{t('profile.provider')}</span>
                <span className="text-base font-bold text-white/80">AWS Cognito</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────── Teacher Profile ─────────────────────── */

const TeacherProfile = ({ userData, groups, assignments, loading }: any) => {
  const { t } = useTranslation();
  const initial = userData?.name?.charAt(0) || 'P';

  return (
    <div className="w-full flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-purple-500/20 shadow-[0_0_60px_rgba(168,85,247,0.12)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#130d2e] via-[#0e0a22] to-black" />
        <div className="absolute -right-20 -top-20 w-[35rem] h-[35rem] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute -left-20 -bottom-20 w-[25rem] h-[25rem] bg-pink-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse delay-700" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10 p-10 md:p-14">

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.1 }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-[2rem] blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2rem] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 flex items-center justify-center text-7xl font-black text-white shadow-2xl ring-4 ring-purple-500/20">
              {initial}
              <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl bg-black border-2 border-purple-500/40 flex items-center justify-center shadow-xl">
                <GraduationCap className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </motion.div>

          {/* Name & role */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-widest mb-4">
                <GraduationCap className="w-3.5 h-3.5" /> {t('profile.teaching_staff')}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                {userData?.name || t('profile.professor')}
              </h1>
              <p className="text-lg text-white/40 font-medium mt-2 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" /> {userData?.email || 'prof@institution.edu'}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 justify-center md:justify-start">
              {groups.map((g: string) => (
                <span key={g} className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-black uppercase tracking-widest border border-purple-500/20">
                  {g}
                </span>
              ))}
              <span className="px-4 py-2 rounded-xl bg-white/5 text-white/50 text-xs font-black uppercase tracking-widest border border-white/10">
                {assignments.length} {assignments.length !== 1 ? t('profile.classes_plural') : t('profile.class_singular')}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* Left: identity + security */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Identity card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-panel p-8 rounded-[2rem] border border-white/5 premium-shadow"
          >
            <h3 className="text-base font-black uppercase tracking-widest text-purple-400/80 mb-6 flex items-center gap-3">
              <Fingerprint className="w-5 h-5" /> {t('profile.identity')}
            </h3>
            <InfoRow label={t('profile.full_name')} value={userData?.name || '—'} icon={User} />
            <InfoRow label={t('profile.email')} value={userData?.email || '—'} icon={Mail} />
            <InfoRow label={t('profile.role')} value={t('profile.teaching_staff')} icon={GraduationCap} />
            <InfoRow label={t('profile.institution')} value="ESMT" icon={Layers} />
          </motion.div>

          {/* Security card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass-panel p-8 rounded-[2rem] border border-white/5 premium-shadow"
          >
            <h3 className="text-base font-black uppercase tracking-widest text-purple-400/80 mb-6 flex items-center gap-3">
              <Shield className="w-5 h-5" /> {t('profile.security')}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4 hover:border-purple-500/20 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{t('login.password')}</span>
                  <span className="text-sm font-bold text-white/70 tracking-widest">••••••••••••</span>
                </div>
                <button className="text-[10px] font-black text-purple-400 hover:text-purple-300 px-3 py-1.5 rounded-lg border border-purple-500/20 hover:bg-purple-500/10 transition-all">
                  {t('profile.modify')}
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{t('profile.two_factor_auth')}</span>
                  <span className="text-sm font-bold text-emerald-400">{t('profile.activated')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Assignments timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="lg:col-span-3 glass-panel p-8 rounded-[2rem] border border-white/5 premium-shadow"
        >
          <h3 className="text-base font-black uppercase tracking-widest text-purple-400/80 mb-8 flex items-center gap-3">
            <BookOpen className="w-5 h-5" /> {t('profile.my_course_assignments')}
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/40 blur-xl rounded-full animate-pulse" />
                <div className="relative w-14 h-14 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
              </div>
              <span className="text-white/40 font-black uppercase tracking-widest text-xs animate-pulse">{t('profile.loading')}</span>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-60">
              <BookOpen className="w-16 h-16 text-white/10" />
              <p className="text-white/40 font-bold text-center">{t('profile.no_assignments_found')}</p>
            </div>
          ) : (
            <div className="relative flex flex-col">
              {/* Timeline line */}
              <div className="absolute left-[1.75rem] top-4 bottom-4 w-px bg-gradient-to-b from-purple-500/50 via-pink-500/30 to-transparent" />

              {assignments.map((a: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="group relative flex items-start gap-6 pb-8 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center font-black text-lg text-purple-400 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:border-purple-500/60 transition-all duration-300">
                    {(i + 1).toString().padStart(2, '0')}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1 p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/20 transition-all duration-300 -mt-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xl font-black text-white/90 group-hover:text-white transition-colors tracking-tight">
                          {a.className}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20">
                            <BookOpen className="w-3 h-3" />
                            {a.subjectName}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center transition-all duration-300">
                        <Calendar className="w-5 h-5 text-white/30 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────── Main Component ─────────────────────── */

const Profile = () => {
  const { userData, groups, isTeacher, isAdmin } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTeacher) {
      setLoading(true);
      getTeacherAssignments()
        .then(setAssignments)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isTeacher]);

  return (
    <div className="w-full max-w-6xl mx-auto pb-20">
      {isAdmin ? (
        <AdminProfile userData={userData} groups={groups} />
      ) : (
        <TeacherProfile userData={userData} groups={groups} assignments={assignments} loading={loading} />
      )}
    </div>
  );
};

export default Profile;
