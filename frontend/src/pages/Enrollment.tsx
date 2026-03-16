import { useRef, useState, useCallback, useEffect, type FormEvent } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { UserPlus, Camera, CameraOff, Loader2, CheckCircle, AlertTriangle, Upload, ArrowLeft } from 'lucide-react';
import { enrollStudent, getClasses, type EnrollResponse, type ClassItem } from '../services/api';

const Enrollment = () => {
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrollResponse | null>(null);
  const [errorMSG, setErrorMSG] = useState<string | null>(null);
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
        
        // Priority: State > First class in list
        const targetClassId = state?.prefilledClassId || (data.length > 0 ? data[0].classId : '');
        if (targetClassId) {
          setClassId(targetClassId);
          const selectedClass = data.find(c => c.classId === targetClassId);
          if (selectedClass) {
            setPromotion(selectedClass.promotion || '2026');
          }
        }
      } catch (err) {
        console.error("Failed to fetch classes", err);
      }
    };
    fetchClassesList();
  }, [state?.prefilledClassId]);

  // Update promotion when class changes
  const handleClassChange = (selectedId: string) => {
    setClassId(selectedId);
    const selectedClass = classes.find(c => c.classId === selectedId);
    if (selectedClass) {
      setPromotion(selectedClass.promotion || '2026');
    }
  };

  const processEnrollmentImage = async (imageSrc: string) => {
    setLoading(true);
    setResult(null);
    setErrorMSG(null);

    try {
      const data = await enrollStudent(imageSrc, studentId, studentName, classId, promotion);
      setResult(data);
      if (data.message) {
        setStudentId('');
        setStudentName('');
        setClassId('');
      } else if (data.error) {
        setErrorMSG(data.error);
      }
    } catch (err: any) {
      setErrorMSG(err.message || "Erreur lors de l'enrôlement");
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!studentId || !studentName || !classId) {
      setErrorMSG("Veuillez remplir les champs obligatoires (ID, Nom, Classe) !");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        processEnrollmentImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  const captureAndEnroll = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!studentId || !studentName || !classId) {
      setErrorMSG("Veuillez remplir les champs obligatoires (ID, Nom, Classe) !");
      return;
    }

    if (!isCameraEnabled) {
      setErrorMSG("Veuillez activer la caméra pour capturer le visage.");
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setErrorMSG("Impossible de capturer l'image de la webcam.");
      return;
    }

    await processEnrollmentImage(imageSrc);
  }, [studentId, studentName, classId, isCameraEnabled, processEnrollmentImage]);

  return (
    <div className="w-full flex flex-col items-center gap-8 md:gap-12 relative overflow-hidden">

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center flex flex-col items-center gap-4 z-10 relative w-full"
      >
        <Link 
          to={state?.prefilledClassId ? `/classes/${state.prefilledClassId}` : "/classes"}
          className="lg:absolute left-0 top-1/2 lg:-translate-y-1/2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[var(--color-text-muted)] hover:text-white flex items-center gap-2 mb-4 lg:mb-0"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-bold">Retour</span>
        </Link>

        <h1 className="text-3xl md:text-5xl font-extrabold text-gradient flex items-center justify-center gap-3">
          <UserPlus className="w-10 h-10 text-[var(--color-primary)]" />
          Enrôlement Étudiant
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
          Ajoutez de nouveaux étudiants dans la collection Rekognition avec une simple photo.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full z-10">

        {/* Webcam Capture Area */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col gap-6 items-center justify-center premium-shadow overflow-hidden relative"
        >
          <div className="w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/10 shadow-md relative bg-black/50 flex items-center justify-center">
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
                <p className="font-medium text-white">Caméra désactivée</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsCameraEnabled(!isCameraEnabled)}
              className="absolute top-4 right-4 p-3 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-all z-20"
              title={isCameraEnabled ? "Désactiver la caméra" : "Activer la caméra"}
            >
              {isCameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            </button>

            {/* Guide rectangle */}
            {isCameraEnabled && (
              <div className="absolute inset-0 border-4 border-dashed border-[var(--color-primary)]/40 rounded-3xl m-8 md:m-16 pointer-events-none pulse"></div>
            )}
          </div>
        </motion.div>

        {/* Form & Results Area */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 rounded-3xl flex flex-col gap-8 premium-shadow backdrop-blur-2xl"
        >
          <h2 className="text-2xl font-bold border-b border-white/10 pb-4 text-[var(--color-text-main)]">
            Informations de l'étudiant
          </h2>

          <form onSubmit={captureAndEnroll} className="flex flex-col gap-6 flex-1">

            <div className="flex flex-col gap-2">
              <label htmlFor="studentId" className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">Matricule (ID) *</label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Ex: ESMT_001"
                className="w-full p-4 text-lg rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-primary)] focus:bg-white/5 outline-none transition-all placeholder:text-gray-500 shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="studentName" className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">Prénom & Nom *</label>
              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ex: John Doe"
                className="w-full p-4 text-lg rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-accent)] focus:bg-white/5 outline-none transition-all placeholder:text-gray-500 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="classId" className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">Classe *</label>
                <select
                  id="classId"
                  value={classId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full p-4 text-md rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-primary)] focus:bg-white/5 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Sélectionnez une classe</option>
                  {classes.map((c) => (
                    <option key={c.classId} value={c.classId} className="bg-gray-900">
                      {c.classId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="promotion" className="text-sm font-semibold text-[var(--color-text-muted)] ml-1">Promotion</label>
                <input
                  id="promotion"
                  type="text"
                  value={promotion}
                  onChange={(e) => setPromotion(e.target.value)}
                  placeholder="Ex: 2026"
                  className="w-full p-4 text-md rounded-xl bg-black/30 border border-white/10 focus:border-[var(--color-primary)] focus:bg-white/5 outline-none transition-all placeholder:text-gray-500 shadow-inner"
                />
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 mt-4 w-full">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] 
                            text-md md:text-lg font-bold text-white hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_20px_rgba(137,87,229,0.3)]
                            flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                Webcam
              </button>

              <label className={`flex-1 py-4 rounded-xl bg-white/10 border border-white/20 
                                 text-md md:text-lg font-bold text-white hover:bg-white/20 hover:scale-[1.02] transition-all duration-300
                                 flex items-center justify-center gap-3 cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                <Upload className="w-5 h-5" />
                Importer
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {/* Feedbacks / Results */}
            {errorMSG && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 p-4 bg-[var(--color-error)]/10 border-2 border-[var(--color-error)]/40 rounded-xl flex items-center gap-4 text-[var(--color-error)]">
                <AlertTriangle className="w-8 h-8 shrink-0" />
                <p className="text-sm font-medium">{errorMSG}</p>
              </motion.div>
            )}

            {result && result.message && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 p-4 bg-gradient-to-r from-[var(--color-success)]/20 to-[var(--color-success)]/5 border-2 border-[var(--color-success)]/50 rounded-xl flex items-center gap-4 text-green-300 shadow-[0_0_15px_rgba(35,134,54,0.2)]">
                <CheckCircle className="w-8 h-8 shrink-0 text-[var(--color-success)]" />
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">{result.message}</p>
                  {result.faceId && <p className="text-xs font-mono text-green-400 font-medium break-all">Face ID : {result.faceId}</p>}
                </div>
              </motion.div>
            )}
          </form>

        </motion.div>
      </div>
    </div>
  );
};

export default Enrollment;
