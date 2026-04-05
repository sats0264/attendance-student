import fs from 'fs';

const frPath = 'c:/Users/mordj/OneDrive/Bureau/ML/attendance-student/frontend/src/locales/fr.json';
const enPath = 'c:/Users/mordj/OneDrive/Bureau/ML/attendance-student/frontend/src/locales/en.json';

const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const newFr = {
  "attendance": {
    "error_loading_students": "Erreur lors du chargement des élèves : ",
    "class_subject_required": "Classe et Matière sont obligatoires.",
    "error_creating_session": "Erreur lors de la création de la session",
    "session_ended": "Séance terminée",
    "attendance_recorded": "Les présences ont été enregistrées.",
    "no_student_recognized": "Aucun étudiant reconnu sur cette image.",
    "recognition_error": "Erreur de reconnaissance",
    "modification_error": "Erreur de modification",
    "active_session": "Séance Active · ",
    "aws_facial_recognition": "Reconnaissance Faciale AWS",
    "rollcall_in_progress": "Appel en cours — ",
    "taking_of": "Prise de ",
    "attendance": "Présences",
    "end_session": "Terminer la Séance",
    "new_session": "Nouvelle Séance",
    "configure_rollcall": "Configurez l'appel pour commencer la reconnaissance",
    "class_required": "Classe *",
    "select_class": "Sélectionnez une classe",
    "subject_required": "Matière *",
    "teacher": "Enseignant",
    "teacher_name": "Nom de l'enseignant",
    "open_session": "OUVRIR LA SÉANCE",
    "camera_disabled": "Caméra désactivée",
    "ai_capture": "Capture IA",
    "import": "Importer",
    "student": "étudiant",
    "students": "étudiants",
    "recognized": "reconnu",
    "recognized_pl": "reconnus",
    "rollcall_list": "Liste d'appel",
    "loading_enrolled": "Chargement des inscrits...",
    "no_student_found_for": "Aucun étudiant trouvé pour ",
    "present_upper": "PRÉSENT",
    "absent_upper": "ABSENT",
    "end_session_q": "Terminer la séance ?",
    "end_session_confirm_msg": "Les présences enregistrées seront conservées. Vous pourrez consulter ce rapport dans l'historique.",
    "finish": "Terminer",
    "continue": "Continuer",
    "error": "Erreur"
  },
  "enrollment": {
    "missing_field": "Champ manquant",
    "fill_student_id": "Veuillez renseigner le Matricule.",
    "fill_full_name": "Veuillez renseigner le Nom complet.",
    "select_a_class": "Veuillez sélectionner une classe.",
    "enrollment_success": "Enrôlement réussi !",
    "added_to_rekognition": "a été ajouté à la collection Rekognition.",
    "enrollment_failed": "Échec de l'enrôlement",
    "error_during_enrollment": "Erreur lors de l'enrôlement",
    "camera_disabled_title": "Caméra désactivée",
    "enable_camera_msg": "Activez la caméra pour capturer le visage.",
    "camera_error": "Erreur caméra",
    "cannot_capture_webcam": "Impossible de capturer l'image de la webcam.",
    "biometric_enrollment": "Enrôlement Biométrique",
    "new": "Nouveau ",
    "profile": "Profil",
    "add_student_rekognition_desc": "Ajoutez un étudiant à la collection AWS Rekognition avec une photo.",
    "face_capture": "Capture Visage",
    "camera_on": "Caméra ON",
    "camera_off": "Caméra OFF",
    "student_info": "Informations de l'étudiant",
    "all_fields_required": "Tous les champs marqués * sont requis",
    "student_id_required": "Matricule *",
    "fullname_required": "Prénom & Nom *",
    "class_ellipsis": "Classe...",
    "webcam": "Webcam",
    "class_label": "Classe *",
    "promotion": "Promotion"
  },
  "sessionDetails": {
    "session_report": "Rapport de Séance",
    "attendance_rate": "Taux de présence",
    "presents": "Présents",
    "students_present_out_of_total": "Étudiants présents sur l'effectif total",
    "export": "Exporter",
    "csv_list": "LISTE CSV",
    "session_rollcall": "Appel de la séance",
    "loading_attendance": "Chargement des présences...",
    "no_attendance_data": "Aucune donnée de présence enregistrée."
  },
  "confirm": {
    "confirm": "Confirmer",
    "cancel": "Annuler"
  },
  "studentDetails": {
    "sessions": "Séances",
    "fidelity": "Fidélité",
    "attendance_history": "Historique d'Assiduité",
    "loading_history": "Chargement de l'historique...",
    "no_session_recorded_for_student": "Aucune séance enregistrée pour cet étudiant.",
    "proof": "Preuve"
  }
};

const newEn = {
  "attendance": {
    "error_loading_students": "Error loading students: ",
    "class_subject_required": "Class and Subject are required.",
    "error_creating_session": "Error creating the session",
    "session_ended": "Session ended",
    "attendance_recorded": "Attendance has been recorded.",
    "no_student_recognized": "No student recognized in this image.",
    "recognition_error": "Recognition error",
    "modification_error": "Modification error",
    "active_session": "Active Session · ",
    "aws_facial_recognition": "AWS Facial Recognition",
    "rollcall_in_progress": "Roll call in progress — ",
    "taking_of": "Taking ",
    "attendance": "Attendance",
    "end_session": "End Session",
    "new_session": "New Session",
    "configure_rollcall": "Configure the roll call to begin recognition",
    "class_required": "Class *",
    "select_class": "Select a class",
    "subject_required": "Subject *",
    "teacher": "Teacher",
    "teacher_name": "Teacher's name",
    "open_session": "OPEN SESSION",
    "camera_disabled": "Camera disabled",
    "ai_capture": "AI Capture",
    "import": "Import",
    "student": "student",
    "students": "students",
    "recognized": "recognized",
    "recognized_pl": "recognized",
    "rollcall_list": "Roll Call List",
    "loading_enrolled": "Loading enrolled students...",
    "no_student_found_for": "No student found for ",
    "present_upper": "PRESENT",
    "absent_upper": "ABSENT",
    "end_session_q": "End the session?",
    "end_session_confirm_msg": "Recorded attendance will be saved. You can consult this report in the history.",
    "finish": "Finish",
    "continue": "Continue",
    "error": "Error"
  },
  "enrollment": {
    "missing_field": "Missing field",
    "fill_student_id": "Please enter the Student ID.",
    "fill_full_name": "Please enter the full name.",
    "select_a_class": "Please select a class.",
    "enrollment_success": "Enrollment successful!",
    "added_to_rekognition": "has been added to the Rekognition collection.",
    "enrollment_failed": "Enrollment failed",
    "error_during_enrollment": "Error during enrollment",
    "camera_disabled_title": "Camera disabled",
    "enable_camera_msg": "Enable the camera to capture the face.",
    "camera_error": "Camera error",
    "cannot_capture_webcam": "Unable to capture webcam image.",
    "biometric_enrollment": "Biometric Enrollment",
    "new": "New ",
    "profile": "Profile",
    "add_student_rekognition_desc": "Add a student to the AWS Rekognition collection with a photo.",
    "face_capture": "Face Capture",
    "camera_on": "Camera ON",
    "camera_off": "Camera OFF",
    "student_info": "Student Information",
    "all_fields_required": "All fields marked with * are required",
    "student_id_required": "Student ID *",
    "fullname_required": "Full Name *",
    "class_ellipsis": "Class...",
    "webcam": "Webcam",
    "class_label": "Class *",
    "promotion": "Promotion"
  },
  "sessionDetails": {
    "session_report": "Session Report",
    "attendance_rate": "Attendance Rate",
    "presents": "Presents",
    "students_present_out_of_total": "Students present out of the total",
    "export": "Export",
    "csv_list": "CSV LIST",
    "session_rollcall": "Session roll call",
    "loading_attendance": "Loading attendance...",
    "no_attendance_data": "No attendance data recorded."
  },
  "confirm": {
    "confirm": "Confirm",
    "cancel": "Cancel"
  },
  "studentDetails": {
    "sessions": "Sessions",
    "fidelity": "Fidelity",
    "attendance_history": "Attendance History",
    "loading_history": "Loading history...",
    "no_session_recorded_for_student": "No session recorded for this student.",
    "proof": "Proof"
  }
};

Object.assign(fr, newFr);
Object.assign(en, newEn);

fs.writeFileSync(frPath, JSON.stringify(fr, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
console.log('Locales Batch 3 updated successfully');
