import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, AlertTriangle, Loader2, Upload, Play, StopCircle, Users, UserCheck, UserX } from 'lucide-react';
import { processAttendance, getStudents, createSession, markAttendanceManual, getClasses, getTeacherAssignments, type Student } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ActiveSession {
  sessionId: string;
  classId: string;
  subject: string;
  teacher: string;
}

const Attendance = () => {
  const { userData, isTeacher, isAdmin } = useAuth();
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  // Session State
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState(userData?.name || '');

  // Students List State
  const [students, setStudents] = useState<(Student & { present: boolean; confidence?: number })[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  // Classes List
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

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
          // Group by classId for the dropdown
          const uniqueClasses = Array.from(new Set(data.map(a => a.className))).map(cName => ({ classId: cName }));
          setClasses(uniqueClasses);
          if (uniqueClasses.length > 0 && !classId) setClassId(uniqueClasses[0].classId);
          setTeacher(userData?.name || '');
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  }, [isAdmin, isTeacher, userData]);

  // Update subject when class changes for teachers
  useEffect(() => {
    if (isTeacher && classId) {
      const classAssignments = assignments.filter(a => a.className === classId);
      if (classAssignments.length > 0) {
        setSubject(classAssignments[0].subjectName);
      }
    }
  }, [classId, isTeacher, assignments]);

  // Fetch students when session starts
  const loadStudents = async (cId: string) => {
    setFetchingStudents(true);
    try {
      const data = await getStudents(cId);
      setStudents(data.map(s => ({ ...s, present: false })));
    } catch (err: any) {
      setErrorMSG("Erreur lors du chargement des élèves : " + err.message);
    } finally {
      setFetchingStudents(false);
    }
  };

  const startSession = async () => {
    if (!classId || !subject) {
      setErrorMSG("Classe et Matière sont obligatoires.");
      return;
    }
    setLoading(true);
    setErrorMSG(null);
    try {
      const resp = await createSession(classId, subject, teacher);
      if (resp.sessionId) {
        setSession({
          sessionId: resp.sessionId,
          classId,
          subject,
          teacher
        });
        await loadStudents(classId);
      }
    } catch (err: any) {
      setErrorMSG(err.message || "Erreur lors de la création de la session");
    } finally {
      setLoading(false);
    }
  };

  const stopSession = () => {
    if (window.confirm("Voulez-vous vraiment terminer cette séance ?")) {
      setSession(null);
      setStudents([]);
      setClassId('');
      setSubject('');
      setTeacher(userData?.name || '');
    }
  };

  const [lastDetection, setLastDetection] = useState<{ count: number; timestamp: Date } | null>(null);

  const processImage = async (imageSrc: string) => {
    if (!session) return;
    setLoading(true);
    setErrorMSG(null);
    setLastDetection(null);

    try {
      const data = await processAttendance(imageSrc, session.sessionId);

      // Update students list based on detected faces
      setStudents(prev => prev.map(s => {
        const found = data.students.find(rs => rs.id === s.studentId);
        if (found) {
          return { ...s, present: true };
        }
        return s;
      }));

      setLastDetection({ count: data.count, timestamp: new Date() });

      if (data.count === 0) {
        setErrorMSG("Aucun étudiant reconnu sur cette image.");
      }
    } catch (err: any) {
      setErrorMSG(err.message || "Erreur de reconnaissance");
    } finally {
      setLoading(false);
    }
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
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        processImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  const togglePresence = async (student: Student, currentStatus: boolean) => {
    if (!session) return;
    const newStatus = !currentStatus;

    // Optimistic UI update
    setStudents(prev => prev.map(s =>
      s.studentId === student.studentId ? { ...s, present: newStatus } : s
    ));

    try {
      await markAttendanceManual(session.sessionId, student, newStatus ? 'PRESENT' : 'ABSENT');
    } catch (err: any) {
      // Revert if API fails
      setStudents(prev => prev.map(s =>
        s.studentId === student.studentId ? { ...s, present: currentStatus } : s
      ));
      alert("Erreur lors de la modification manuelle : " + err.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 relative overflow-hidden pb-12">

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-extrabold flex items-center gap-4">
            <UserCheck className="w-10 h-10 md:w-14 md:h-14 text-[var(--color-primary)]" />
            <span className="text-gradient">Présences</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-xl">
            {session
              ? `Séance en cours : ${session.subject} (${session.classId})`
              : "Créez une séance pour commencer l'appel."}
          </p>
        </div>

        {session && (
          <button
            onClick={stopSession}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold"
          >
            <StopCircle className="w-5 h-5" />
            Terminer la Séance
          </button>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!session ? (
          /* Session Setup Form */
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl mx-auto glass-panel p-8 rounded-3xl premium-shadow border border-white/10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-2xl">
                <Play className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Démarrer une séance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">Classe *</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Sélectionnez une classe</option>
                  {classes.map((c) => (
                    <option key={c.classId} value={c.classId} className="bg-gray-900">
                      {c.classId} {isAdmin && c.promotion ? `- ${c.promotion}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">Matière *</label>
                <input
                  disabled={isTeacher}
                  type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Cloud Computing"
                  className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">Enseignant</label>
                <input
                  disabled={isTeacher}
                  type="text" value={teacher} onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Nom de l'enseignant"
                  className="w-full p-4 rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-primary)] outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <button
              onClick={startSession}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-xl font-bold text-white hover:scale-[1.01] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
              OUVRIR LA SÉANCE
            </button>

            {errorMSG && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                {errorMSG}
              </div>
            )}
          </motion.div>
        ) : (
          /* Active Attendance Area */
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full"
          >
            {/* Left Column: Capture */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden relative">
                <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg relative bg-black/50 flex items-center justify-center">
                  {isCameraEnabled ? (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "user" }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <CameraOff className="w-16 h-16" />
                      <p className="font-medium">Caméra désactivée</p>
                    </div>
                  )}
                  <div className="absolute inset-0 border-[10px] border-white/5 pointer-events-none"></div>

                  <button
                    onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                    className="absolute top-4 right-4 p-3 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-all z-20"
                    title={isCameraEnabled ? "Désactiver la caméra" : "Activer la caméra"}
                  >
                    {isCameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={capture}
                    disabled={loading}
                    className="py-4 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    Capture
                  </button>
                  <label className="py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
                    <Upload className="w-5 h-5" />
                    Importer
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {lastDetection && lastDetection.count > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl text-[var(--color-success)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5" />
                    <div>
                      <p className="font-bold">{lastDetection.count} étudiant(s) reconnu(s)</p>
                      <p className="text-[10px] opacity-70">Dernière analyse à {lastDetection.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-[var(--color-success)] rounded-full animate-pulse" />
                </motion.div>
              )}

              {errorMSG && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500 flex items-center gap-3 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  {errorMSG}
                </div>
              )}
            </div>

            {/* Right Column: Students List */}
            <div className="lg:col-span-7">
              <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col h-[600px] premium-shadow">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-[var(--color-primary)]" />
                    <h3 className="text-xl font-bold">Liste d'appel</h3>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/10">
                    {students.filter(s => s.present).length} / {students.length} Présents
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
                  {fetchingStudents ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                      <Loader2 className="w-10 h-10 animate-spin" />
                      <p>Chargement des inscrits...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30 text-center px-8">
                      <Users className="w-16 h-16" />
                      <p>Aucun étudiant trouvé pour la classe {session.classId}. <br /> Vérifiez l'enrôlement.</p>
                    </div>
                  ) : (
                    students.map((student, i) => (
                      <div
                        key={`${student.studentId}-${i}`}
                        className={`group p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between
                          ${student.present
                            ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30'
                            : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-bold text-lg shadow-sm transition-colors shrink-0
                            ${student.present
                              ? 'bg-[var(--color-success)] text-white'
                              : 'bg-white/10 text-[var(--color-text-muted)] group-hover:bg-white/20'}`}
                          >
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                            ) : (
                              student.fullName.charAt(0)
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg">{student.fullName}</span>
                            <span className="text-xs font-mono opacity-50">{student.studentId}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => togglePresence(student, student.present)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all
                            ${student.present
                              ? 'bg-[var(--color-success)] text-white shadow-lg'
                              : 'bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10'}`}
                        >
                          {student.present ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          {student.present ? 'PRÉSENT' : 'ABSENT'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
