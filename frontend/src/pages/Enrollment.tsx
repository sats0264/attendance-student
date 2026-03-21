import { useRef, useState, useCallback, useEffect, type FormEvent } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CameraOff, Loader2, CheckCircle2,
  Upload, ArrowLeft, Fingerprint, ChevronDown, Sparkles
} from 'lucide-react';
import { enrollStudent, getClasses, type EnrollResponse, type ClassItem } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Enrollment = () => {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrollResponse | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  const location = useLocation();
  const state = location.state as { prefilledClassId?: string } | null;

  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [classId, setClassId] = useState('');
  const [promotion, setPromotion] = useState('2026');
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    const fetchClassesList = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
        const targetClassId = state?.prefilledClassId || (data.length > 0 ? data[0].classId : '');
        if (targetClassId) {
          setClassId(targetClassId);
          const sel = data.find(c => c.classId === targetClassId);
          if (sel) setPromotion(sel.promotion || '2026');
        }
      } catch (err) {
        console.error('Failed to fetch classes', err);
      }
    };
    fetchClassesList();
  }, [state?.prefilledClassId]);

  const handleClassChange = (selectedId: string) => {
    setClassId(selectedId);
    const sel = classes.find(c => c.classId === selectedId);
    if (sel) setPromotion(sel.promotion || '2026');
  };

  const validate = () => {
    if (!studentId) { toastWarning('Champ manquant', 'Veuillez renseigner le Matricule.'); return false; }
    if (!studentName) { toastWarning('Champ manquant', 'Veuillez renseigner le Nom complet.'); return false; }
    if (!classId) { toastWarning('Champ manquant', 'Veuillez sélectionner une classe.'); return false; }
    return true;
  };

  const processEnrollmentImage = async (imageSrc: string) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await enrollStudent(imageSrc, studentId, studentName, classId, promotion);
      setResult(data);
      if (data.message) {
        toastSuccess('Enrôlement réussi !', `${studentName} a été ajouté à la collection Rekognition.`);
        setStudentId('');
        setStudentName('');
      } else if (data.error) {
        toastError('Échec de l\'enrôlement', data.error);
      }
    } catch (err: any) {
      toastError('Erreur', err.message || "Erreur lors de l'enrôlement");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validate()) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') processEnrollmentImage(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const captureAndEnroll = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isCameraEnabled) {
      toastWarning('Caméra désactivée', 'Activez la caméra pour capturer le visage.');
      return;
    }
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toastError('Erreur caméra', 'Impossible de capturer l\'image de la webcam.');
      return;
    }
    await processEnrollmentImage(imageSrc);
  }, [studentId, studentName, classId, isCameraEnabled]);

  return (
    <div className="w-full flex flex-col gap-8 pb-20">

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#17101f] to-black" />
        <div className="absolute -right-20 -top-10 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link
              to={state?.prefilledClassId ? `/classes/${state.prefilledClassId}` : '/classes'}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/40 hover:text-white flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 w-fit text-xs font-black uppercase tracking-widest">
                <Fingerprint className="w-4 h-4" />
                Enrôlement Biométrique
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                Nouveau <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Profil</span>
              </h1>
              <p className="text-white/40 text-sm font-medium">
                Ajoutez un étudiant à la collection AWS Rekognition avec une photo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Camera panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 rounded-[2rem] border border-white/10 flex flex-col gap-5 premium-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/50">
              <Camera className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Capture Visage</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCameraEnabled(!isCameraEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                isCameraEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
              }`}
            >
              {isCameraEnabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
              {isCameraEnabled ? 'Caméra ON' : 'Caméra OFF'}
            </button>
          </div>

          {/* Camera + overlay */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
            {isCameraEnabled ? (
              <Webcam
                audio={false} ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user' }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 opacity-20">
                <CameraOff className="w-20 h-20" />
                <p className="font-bold text-sm">Caméra désactivée</p>
              </div>
            )}

            {/* Scan frame */}
            {isCameraEnabled && (
              <div className="absolute inset-[10%] pointer-events-none">
                <div className="absolute inset-0 border-2 border-violet-400/40 rounded-2xl" />
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-violet-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-violet-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-violet-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-violet-400 rounded-br-xl" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent animate-pulse" />
              </div>
            )}
          </div>

          {/* Success preview */}
          <AnimatePresence>
            {result?.message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-black text-emerald-400">Enrôlement réussi !</p>
                  {result.faceId && (
                    <p className="text-[10px] font-mono text-emerald-400/50 break-all">ID: {result.faceId}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel p-7 rounded-[2rem] border border-white/10 flex flex-col gap-6 premium-shadow"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Informations de l'étudiant</h2>
              <p className="text-white/30 text-xs font-medium">Tous les champs marqués * sont requis</p>
            </div>
          </div>

          <form onSubmit={captureAndEnroll} className="flex flex-col gap-5">

            {/* Matricule */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Matricule *</label>
              <input
                type="text" value={studentId} onChange={e => setStudentId(e.target.value)}
                placeholder="Ex: ESMT_001"
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/50 outline-none text-white placeholder:text-white/20 font-semibold transition-all"
              />
            </div>

            {/* Full name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Prénom &amp; Nom *</label>
              <input
                type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
                placeholder="Ex: John Doe"
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/50 outline-none text-white placeholder:text-white/20 font-semibold transition-all"
              />
            </div>

            {/* Class + Promotion */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Classe *</label>
                <div className="relative">
                  <select
                    value={classId}
                    onChange={e => handleClassChange(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/50 outline-none appearance-none cursor-pointer text-white font-semibold transition-all"
                  >
                    <option value="" disabled className="bg-gray-900">Classe...</option>
                    {classes.map(c => (
                      <option key={c.classId} value={c.classId} className="bg-gray-900">{c.classId}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Promotion</label>
                <input
                  type="text" value={promotion} onChange={e => setPromotion(e.target.value)}
                  placeholder="Ex: 2026"
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-violet-500/50 outline-none text-white placeholder:text-white/20 font-semibold transition-all"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                type="submit" disabled={loading}
                className="py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 border border-white/10"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                Webcam
              </motion.button>

              <label className={`py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-5 h-5" />
                Importer
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Enrollment;
