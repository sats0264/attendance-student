import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Mail, User, GraduationCap, BookOpen, 
  CheckCircle2, AlertCircle, Loader2, Users, 
  Calendar, ShieldCheck, Key, Lock, Eye, EyeOff 
} from 'lucide-react';
import { createTeacher, getTeachers, resetTeacherPassword } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const AdminTeachers: React.FC = () => {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [isExistingMode, setIsExistingMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    className: '',
    subjectName: ''
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Password Reset State
  const [resetData, setResetData] = useState<{ email: string; fullName: string; isOpen: boolean }>({ email: '', fullName: '', isOpen: false });
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const fetchTeachersList = async () => {
    try {
      setListLoading(true);
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des enseignants:", error);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachersList();
  }, []);

  const handleTeacherSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacher = teachers.find(t => t.email === e.target.value);
    if (teacher) {
      setFormData(prev => ({
        ...prev,
        fullName: teacher.fullName || '',
        email: teacher.email || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, fullName: '', email: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await createTeacher(
        formData.email,
        formData.fullName,
        formData.className,
        formData.subjectName
      );
      
      const isNew = !response.isExistingUser;
      setStatus({ 
        type: 'success', 
        message: isNew 
          ? 'L\'enseignant a été créé et assigné avec succès !' 
          : 'Nouvelle affectation ajoutée avec succès pour cet enseignant.' 
      });
      
      setFormData({
        fullName: '',
        email: '',
        className: '',
        subjectName: ''
      });
      // Rafraîchir la liste
      fetchTeachersList();
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Une erreur est survenue lors de la création.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toastWarning('Mot de passe trop court', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setResetLoading(true);
    try {
      await resetTeacherPassword(resetData.email, newPassword);
      toastSuccess('Mot de passe réinitialisé', `Le compte de ${resetData.fullName} a été mis à jour.`);
      setResetData({ ...resetData, isOpen: false });
      setNewPassword('');
    } catch (error: any) {
      toastError('Erreur de réinitialisation', error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 text-gradient">Gestion des Enseignants</h1>
          <p className="text-[var(--color-text-muted)]">Créez des comptes pour vos enseignants ou gérez leurs affectations.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="glass-panel premium-shadow p-8 rounded-3xl border border-white/5 space-y-8">
              {/* Mode Toggle */}
              <div className="flex p-1 bg-white/5 rounded-2xl w-fit">
                <button
                  onClick={() => { setIsExistingMode(false); setFormData({ ...formData, fullName: '', email: '' }); }}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!isExistingMode ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  Nouvel Enseignant
                </button>
                <button
                  onClick={() => setIsExistingMode(true)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${isExistingMode ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  Affecter Existant
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isExistingMode ? (
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-sm font-medium text-gray-300 ml-1">Sélectionner l'Enseignant</label>
                       <div className="relative">
                         <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                         <select
                           required
                           onChange={handleTeacherSelect}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all appearance-none cursor-pointer"
                           value={formData.email}
                         >
                           <option value="" className="bg-gray-900">Choisir un enseignant...</option>
                           {teachers.map(t => (
                             <option key={t.sub} value={t.email} className="bg-gray-900">
                               {t.fullName} ({t.email})
                             </option>
                           ))}
                         </select>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Nom Complet</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            required
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Ex: Dr. Martin Durand"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Professionnel</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="martin.durand@ecole.fr"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Classe</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        required
                        name="className"
                        value={formData.className}
                        onChange={handleChange}
                        placeholder="Ex: Master 2 Informatique"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Matière</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        required
                        name="subjectName"
                        value={formData.subjectName}
                        onChange={handleChange}
                        placeholder="Ex: Architecture Cloud"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border ${
                      status.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{status.message}</span>
                  </motion.div>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-[var(--color-primary)]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-6 h-6" />
                      {isExistingMode ? 'Ajouter l\'Affectation' : 'Créer le Compte Enseignant'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 rounded-3xl premium-shadow border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--color-accent)]" />
                Statistiques
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-2xl font-bold text-white">{teachers.length}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Enseignants totaux</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-emerald-400">
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Actifs</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl premium-shadow border border-indigo-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Sécurité
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Les enseignants reçoivent un mot de passe temporaire par email. Ils devront le changer à leur première connexion sur le portail AttendancePro.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Teachers List Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel premium-shadow rounded-3xl overflow-hidden border border-white/5"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between text-white">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Users className="w-6 h-6 text-[var(--color-primary)]" />
              Liste des Enseignants
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Enseignant</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 font-semibold">Date de création</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {listLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-500" />
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Aucun enseignant trouvé.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher, idx) => (
                    <motion.tr 
                      key={teacher.sub || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                            {teacher.fullName?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-white">{teacher.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-[var(--color-text-muted)]">{teacher.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          teacher.status === 'CONFIRMED' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {teacher.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(teacher.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setResetData({ email: teacher.email, fullName: teacher.fullName, isOpen: true })}
                          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                          title="Réinitialiser le mot de passe"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {resetData.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel p-8 rounded-3xl border border-white/10 w-full max-w-md premium-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                  <Key className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Réinitialiser Mot de passe</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{resetData.fullName}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Nouveau Mot de Passe Permanent</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 caractères"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                    />
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] ml-1">
                    Attention : Le mot de passe sera définitif et l'utilisateur n'aura pas l'obligation de le changer immédiatement.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => { setResetData({ ...resetData, isOpen: false }); setNewPassword(''); }}
                    className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={resetLoading || !newPassword}
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTeachers;
