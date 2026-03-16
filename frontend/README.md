# 🎓 Application de Présence Étudiante (Student Attendance App)

Une application web moderne et réactive permettant de gérer la présence des étudiants de manière automatisée grâce à la reconnaissance faciale. Cette interface frontend est construite avec **React**, **TypeScript** et s'intègre avec **AWS Rekognition**.

## ✨ Fonctionnalités Principales

- **Reconnaissance Faciale :** Prise de présence automatisée et sécurisée via la webcam de l'appareil (`react-webcam`) couplée à l'intelligence artificielle d'AWS Rekognition.
- **Interface Utilisateur Moderne :** Design élégant, animations fluides (glassmorphism) et interface adaptative développés avec **Tailwind CSS** et **Framer Motion**.
- **Intégration Cloud :** Communication robuste avec les services backend AWS (Rekognition, API Gateway, DynamoDB) pour un traitement rapide et fiable des données.
- **Tableau de Bord & Gestion :** Suivi des présences, consultation du profil complet de l'étudiant avec portraits et preuves visuelles des sessions.

## 🛠️ Technologies Utilisées

- **Cœur & Langage :** React 19, TypeScript
- **Styling & Animations :** Tailwind CSS, Framer Motion, clsx, tailwind-merge
- **Icônes :** Lucide React
- **Caméra & Capture :** React Webcam
- **Services Cloud :** AWS SDK (`client-rekognition`, `client-api-gateway`)
- **Build Tool :** Vite

## 🚀 Démarrage Rapide

### Prérequis

Assurez-vous d'avoir installé [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée).

### Installation

1. Ouvrez un terminal à la racine du projet (`attendance-student`).
2. Installez les dépendances du projet :

```bash
npm install
```

### Lancement en mode développement

Pour démarrer le serveur de développement local avec Fast Refresh (HMR) :

```bash
npm run dev
```

L'application sera accessible sur le port fourni par Vite (généralement `http://localhost:5173/`).

### Compilation pour la production

Pour générer une version optimisée et prête à être déployée en production :

```bash
npm run build
```

Le code compilé sera disponible dans le dossier `dist/`.

## ⚙️ Configuration AWS et Environnement

Pour que les fonctionnalités cloud (comme la reconnaissance faciale via AWS Rekognition et la communication avec le backend via API Gateway) soient opérationnelles, assurez-vous de renseigner les bonnes variables d'environnement.

Créez (si ce n'est pas déjà fait) un fichier `.env` à la racine de votre projet sur le modèle suivant :

```env
# URL de votre API Gateway (backend Node.js/Express)
VITE_API_URL=votre_api_url_ici

# Configurations AWS associées si requises côté client (à sécuriser)
VITE_AWS_REGION=votre_region_aws
```
*(Adaptez les noms des variables selon l'implémentation de vos services frontend)*

## 📂 Architecture Principale

- **`src/pages/`** : Vues principales de l'application (ex: `Dashboard`, `Attendance`, `ClassDetail`, etc.).
- **`src/components/`** : Composants React réutilisables (ex: Modal, Cartes de statistiques, Barre de navigation).
- **`src/services/` ou `src/api/`** (le cas échéant) : Logique d'appel au backend ou aux SDK AWS.
- **`src/assets/`** : Fichiers statiques et images.

---
*Projet propulsé au démarrage par [Vite](https://vitejs.dev/) pour une expérience de développement ultra-rapide.*
