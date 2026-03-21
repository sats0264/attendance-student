import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CameraOff, AlertTriangle, Loader2, Upload,
  Play, StopCircle, Users, UserCheck, UserX, Zap, BookOpen, ChevronDown
} from 'lucide-react';
import {
  processAttendance, getStudents, createSession, markAttendanceManual,
  getClasses, getTeacherAssignments, type Student
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../contexts/ToastContext';

interface ActiveSession { sessionId: string; classId: string; subject: string; teacher: string; }

const Attendance = () => {
  const { userData, isTeacher, isAdmin } = useAuth();
  const { error: toastError, info: toastInfo } = useToast();
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState(userData?.name || '');
  const [students, setStudents] = useState<(Student & { present: boolean; confidence?: number })[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [lastDetection, setLastDetection] = useState<{ count: number; timestamp: Date } | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (isAdmin) {
          const data = await getClasses();
          setClasses(data);
          if (data.length > 0 && !classId) setClassId(data[0].classId);
        } else if (isTeacher) {
          const data = await getTeacherAssignments();
          setAssignments(data);
          const uniqueClasses = Array.from(new Set(data.map((a: any) => a.className))).map(cName => ({ classId: cName }));
          setClasses(uniqueClasses);
          if (uniqueClasses.length > 0 && !classId) setClassId(uniqueClasses[0].classId);
          setTeacher(userData?.name || '');
        }
      } catch (err) { console.error(err); }
    };
    fetchInitialData();
  }, [isAdmin, isTeacher, userData]);

  useEffect(() => {
    if (isTeacher && classId) {
      const ca = assignments.filter((a: any) => a.className === classId);
      if (ca.length > 0) setSubject(ca[0].subjectName);
    }
  }, [classId, isTeacher, assignments]);

  const loadStudents = async (cId: string) => {
    setFetchingStudents(true);
    try {
      const data = await getStudents(cId);
      setStudents(data.map(s => ({ ...s, present: false })));
    } catch (err: any) {
      setErrorMSG("Erreur lors du chargement des élèves : " + err.message);
    } finally { setFetchingStudents(false); }
  };

  const startSession = async () => {
    if (!classId || !subject) { setErrorMSG("Classe et Matière sont obligatoires."); return; }
    setLoading(true); setErrorMSG(null);
    try {
      const resp = await createSession(classId, subject, teacher);
      if (resp.sessionId) {
        setSession({ sessionId: resp.sessionId, classId, subject, teacher });
        await loadStudents(classId);
      }
    } catch (err: any) {
      setErrorMSG(err.message || "Erreur lors de la création de la session");
    } finally { setLoading(false); }
  };

  const stopSession = () => {
    setShowStopConfirm(true);
  };

  const confirmStopSession = () => {
    setSession(null); setStudents([]); setClassId(''); setSubject('');
    setTeacher(userData?.name || ''); setLastDetection(null);
    setShowStopConfirm(false);
    toastInfo('Séance terminée', 'Les présences ont été enregistrées.');
  };

  const processImage = async (imageSrc: string) => {
    if (!session) return;
    setLoading(true); setErrorMSG(null); setLastDetection(null);
    try {
      const data = await processAttendance(imageSrc, session.sessionId);
      setStudents(prev => prev.map(s => {
        const found = data.students.find(rs => rs.id === s.studentId);
        return found ? { ...s, present: true } : s;
      }));
      setLastDetection({ count: data.count, timestamp: new Date() });
      if (data.count === 0) setErrorMSG("Aucun étudiant reconnu sur cette image.");
    } catch (err: any) {
      setErrorMSG(err.message || "Erreur de reconnaissance");
    } finally { setLoading(false); }
  };

  const capture = useCallback(async () => {
    if (!isCameraEnabled) return;
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) await processImage(imageSrc);
  }, [isCameraEnabled, processImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { if (typeof reader.result === 'string') processImage(reader.result); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const togglePresence = async (student: Student, currentStatus: boolean) => {
    if (!session) return;
    const newStatus = !currentStatus;
    setStudents(prev => prev.map(s => s.studentId === student.studentId ? { ...s, present: newStatus } : s));
    try {
      await markAttendanceManual(session.sessionId, student, newStatus ? 'PRESENT' : 'ABSENT');
    } catch (err: any) {
      setStudents(prev => prev.map(s => s.studentId === student.studentId ? { ...s, present: currentStatus } : s));
      toastError('Erreur de modification', err.message);
    }
  };

  const presentCount = students.filter(s => s.present).length;
  const rate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10 relative overflow-hidden pb-20">

      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e1f1a] via-[#0d1117] to-black" />
        <div className="absolute -right-20 -top-10 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit text-xs font-black uppercase tracking-widest">
              <Zap className="w-4 h-4" />
              {session ? `Séance Active · ${session.classId}` : 'Reconnaissance Faciale AWS'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              {session ? (
                <>Appel en cours — <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{session.subject}</span></>
              ) : (
                <>Prise de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Présences</span></>
              )}
            </h1>
          </div>

          {session && (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={stopSession}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all font-black"
            >
              <StopCircle className="w-5 h-5" />
              Terminer la Séance
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!session ? (
          /* ─── Setup Form ─── */
          <motion.div key="setup" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="glass-panel p-8 md:p-12 rounded-[2rem] border border-white/10 premium-shadow flex flex-col gap-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Play className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Nouvelle Séance</h2>
                  <p className="text-white/40 text-sm font-medium mt-0.5">Configurez l'appel pour commencer la reconnaissance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Class selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Classe *</label>
                  <div className="relative">
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500/50 outline-none appearance-none cursor-pointer text-white font-semibold transition-all"
                    >
                      <option value="" disabled className="bg-gray-900">Sélectionnez une classe</option>
                      {classes.map((c) => (
                        <option key={c.classId} value={c.classId} className="bg-gray-900">
                          {c.classId}{isAdmin && c.promotion ? ` · ${c.promotion}` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Matière *</label>
                  <input
                    disabled={isTeacher}
                    type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Cloud Computing"
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500/50 outline-none text-white placeholder:text-white/20 font-semibold disabled:opacity-40 transition-all"
                  />
                </div>

                {/* Teacher */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Enseignant</label>
                  <input
                    disabled={isTeacher}
                    type="text" value={teacher} onChange={(e) => setTeacher(e.target.value)}
                    placeholder="Nom de l'enseignant"
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500/50 outline-none text-white placeholder:text-white/20 font-semibold disabled:opacity-40 transition-all"
                  />
                </div>
              </div>

              <AnimatePresence>
                {errorMSG && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold overflow-hidden">
                    <AlertTriangle className="w-4 h-4 shrink-0" />{errorMSG}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={startSession}
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-white/10"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                OUVRIR LA SÉANCE
              </motion.button>
            </div>
          </motion.div>

        ) : (
          /* ─── Active Session ─── */
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

            {/* Camera Panel */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="glass-panel p-5 rounded-[2rem] border border-white/10 flex flex-col gap-5 premium-shadow">

                {/* Camera */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center">
                  {isCameraEnabled ? (
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "user" }} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <CameraOff className="w-16 h-16" />
                      <p className="text-sm font-bold text-white/60">Caméra désactivée</p>
                    </div>
                  )}

                  {/* Camera toggle */}
                  <button
                    onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                    className={`absolute top-3 right-3 p-3 rounded-xl backdrop-blur-md border transition-all z-20 ${isCameraEnabled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-black/60 border-white/10 text-white/60 hover:text-white'}`}
                  >
                    {isCameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                  </button>

                  {/* Scan overlay when active */}
                  {isCameraEnabled && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-[15%] border-2 border-emerald-400/40 rounded-2xl" />
                      <div className="absolute inset-[15%] border-t-2 border-emerald-400 rounded-t-2xl animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Capture buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={capture}
                    disabled={loading || !isCameraEnabled}
                    className="py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black flex items-center justify-center gap-2 disabled:opacity-40 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    Capture IA
                  </motion.button>
                  <label className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-5 h-5" />
                    Importer
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* Detection result */}
              <AnimatePresence>
                {lastDetection && lastDetection.count > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <UserCheck className="w-6 h-6 text-emerald-400" />
                      <div>
                        <p className="font-black text-emerald-400">{lastDetection.count} étudiant{lastDetection.count > 1 ? 's' : ''} reconnu{lastDetection.count > 1 ? 's' : ''}</p>
                        <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-widest mt-0.5">
                          {lastDetection.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </motion.div>
                )}
                {errorMSG && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-3 text-sm font-bold">
                    <AlertTriangle className="w-5 h-5 shrink-0" />{errorMSG}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Students Panel */}
            <div className="lg:col-span-7 flex flex-col gap-0">
              <div className="glass-panel rounded-[2rem] border border-white/10 overflow-hidden flex flex-col premium-shadow" style={{ height: '640px' }}>

                {/* Header */}
                <div className="p-5 border-b border-white/5 bg-white/[0.03] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-white/60" />
                    <h3 className="text-lg font-black text-white">Liste d'appel</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Progress */}
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                          animate={{ width: `${rate}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm font-black text-emerald-400">{rate}%</span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-black text-white/60">
                      {presentCount} / {students.length}
                    </div>
                  </div>
                </div>

                {/* Students list */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  {fetchingStudents ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                      <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                      <p className="font-bold text-sm">Chargement des inscrits...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30 text-center px-8">
                      <BookOpen className="w-16 h-16" />
                      <p className="font-bold">Aucun étudiant trouvé pour {session.classId}.</p>
                    </div>
                  ) : (
                    students.map((student, i) => (
                      <motion.div
                        key={`${student.studentId}-${i}`}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                          student.present
                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : 'bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-black text-lg shrink-0 transition-all ${
                            student.present ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''
                          }`}>
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${student.present ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60'}`}>
                                {student.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-white/90 group-hover:text-white transition-colors">{student.fullName}</p>
                            <p className="text-xs font-mono text-white/30">{student.studentId}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => togglePresence(student, student.present)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
                            student.present
                              ? 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600'
                              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                          }`}
                        >
                          {student.present ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          {student.present ? 'PRÉSENT' : 'ABSENT'}
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmModal
        open={showStopConfirm}
        title="Terminer la séance ?"
        message="Les présences enregistrées seront conservées. Vous pourrez consulter ce rapport dans l'historique."
        confirmLabel="Terminer"
        cancelLabel="Continuer"
        variant="warning"
        onConfirm={confirmStopSession}
        onCancel={() => setShowStopConfirm(false)}
      />
    </div>
  );
};

export default Attendance;
