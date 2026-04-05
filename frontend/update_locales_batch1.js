import fs from 'fs';

const frPath = 'c:/Users/mordj/OneDrive/Bureau/ML/attendance-student/frontend/src/locales/fr.json';
const enPath = 'c:/Users/mordj/OneDrive/Bureau/ML/attendance-student/frontend/src/locales/en.json';

const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const newFr = {
  "login": {
    "invalid_credentials": "Identifiants incorrects.",
    "invalid_password": "Le mot de passe ne respecte pas les critères de sécurité. Il doit généralement contenir majuscules, minuscules, chiffres et caractères spéciaux.",
    "generic_error": "Une erreur est survenue lors de la connexion.",
    "new_password": "Nouveau mot de passe",
    "login_title": "Connexion",
    "password_change_required": "Votre compte nécessite un changement de mot de passe",
    "portal_subtitle": "Portail administrateur & enseignant",
    "username_or_email": "Identifiant ou Email",
    "password": "Mot de passe",
    "fullname_required": "Nom complet (Requis par AWS)",
    "password_criteria": "Doit respecter les critères de sécurité de votre configuration Cognito.",
    "change_password": "Changer le mot de passe",
    "sign_in": "Se connecter"
  },
  "profile": {
    "sys_admin": "Administrateur Système",
    "admin": "Administrateur",
    "teaching_staff": "Corps Enseignant",
    "professor": "Professeur",
    "class_singular": "Classe",
    "classes_plural": "Classes",
    "identity": "Identité",
    "full_name": "Nom complet",
    "email": "Email",
    "main_role": "Rôle principal",
    "role": "Rôle",
    "institution": "Institution",
    "security": "Sécurité",
    "two_factor_auth": "Double Auth (2FA)",
    "activated": "Activée",
    "change": "Changer",
    "modify": "Modifier",
    "configure": "Configurer",
    "provider": "Fournisseur",
    "my_course_assignments": "Mes Affectations de Cours",
    "loading": "Chargement...",
    "no_assignments_found": "Aucune affectation trouvée pour votre compte."
  },
  "footer": {
    "biometric_system": "Système Biométrique",
    "powered_by": "Propulsé par",
    "all_rights_reserved": "Tous droits réservés.",
    "system_operational": "Système opérationnel"
  }
};

const newEn = {
  "login": {
    "invalid_credentials": "Invalid credentials.",
    "invalid_password": "Password does not meet the security criteria. It must generally contain uppercase, lowercase, numbers, and special characters.",
    "generic_error": "An error occurred during login.",
    "new_password": "New password",
    "login_title": "Login",
    "password_change_required": "Your account requires a password change",
    "portal_subtitle": "Administrator & Teacher Portal",
    "username_or_email": "Username or Email",
    "password": "Password",
    "fullname_required": "Full name (Required by AWS)",
    "password_criteria": "Must meet the security criteria of your Cognito configuration.",
    "change_password": "Change password",
    "sign_in": "Sign in"
  },
  "profile": {
    "sys_admin": "System Administrator",
    "admin": "Administrator",
    "teaching_staff": "Teaching Staff",
    "professor": "Professor",
    "class_singular": "Class",
    "classes_plural": "Classes",
    "identity": "Identity",
    "full_name": "Full name",
    "email": "Email",
    "main_role": "Main role",
    "role": "Role",
    "institution": "Institution",
    "security": "Security",
    "two_factor_auth": "Two-Factor Auth (2FA)",
    "activated": "Activated",
    "change": "Change",
    "modify": "Modify",
    "configure": "Configure",
    "provider": "Provider",
    "my_course_assignments": "My Course Assignments",
    "loading": "Loading...",
    "no_assignments_found": "No assignments found for your account."
  },
  "footer": {
    "biometric_system": "Biometric System",
    "powered_by": "Powered by",
    "all_rights_reserved": "All rights reserved.",
    "system_operational": "System operational"
  }
};

Object.assign(fr, newFr);
Object.assign(en, newEn);

fs.writeFileSync(frPath, JSON.stringify(fr, null, 2));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
console.log('Locales updated successfully');
