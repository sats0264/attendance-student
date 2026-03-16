# ESMT - Student Attendance System (AWS Rekognition)

Un système moderne de gestion des présences automatisée pour étudiants, s'appuyant sur la reconnaissance faciale avec **AWS Rekognition**. 

Ce projet est composé de deux parties principales :
- **Frontend** : L'interface utilisateur Web (React / TypeScript / Vite), qui permet d'afficher le tableau de bord, de prendre des photos avec la webcam, et d'enregistrer la présence ou d'inscrire de nouveaux étudiants.
- **Backend** : Des fonctions serverless (AWS Lambda) qui gèrent la logique d'interrogation, de détection faciale, de stockage d'images, et de persistance des données dans la base de données.

---

## 🏗️ Architecture Technique

### 🖥️ Frontend (`/frontend`)
- **Framework** : React 19 + TypeScript + Vite
- **Styling** : Tailwind CSS v4, animations fluides avec Framer Motion
- **Composants Prêt-à-porter** : Lucide React (Icônes)
- **Fonctionnalités clés** : Capture de la caméra via `react-webcam`, Routage avec `react-router-dom`.

### ⚙️ Backend (`/backend`)
- **Environnement** : Node.js (AWS Lambda `.mjs`)
- **Base de données (NoSQL)** : Amazon DynamoDB (Tables: `Students`, `Attendance`, `Sessions`, `Classes`)
- **Stockage Objets** : Amazon S3 (Stockage des photos avec URLs signées)
- **Intelligence Artificielle** : Amazon Rekognition (Indexation, Collection, et Recherche/Comparaison de visages)
- **Exposition d'API** : Amazon API Gateway (faisant proxy vers les fonctions Lambda)

---

## 🚀 Mise en Route (Installation Locale)

### 1. Prérequis
- Node.js installé (version recommandée : `20.x` ou `22.x`)
- Un compte Amazon Web Services (AWS) actif
- Configuration de l'environnement AWS sur votre machine locale (si vous testez le backend localement) ou via les rôles IAM (en production).

### 2. Démarrage du Frontend
Allez dans le dossier `frontend`, installez les dépendances et lancez le serveur de développement :

```bash
cd frontend
npm install
npm run dev
```

**Variables d'environnement (Frontend)** :
Créez un fichier `frontend/.env` pour stocker l'URL (Endpoint) de votre backend AWS API Gateway.
```ini
VITE_API_URL=https://votre-api-id.execute-api.us-east-1.amazonaws.com/prod
```

### 3. Déploiement du Backend
Le dossier `/backend` contient les fonctions Lambda. Elles doivent être déployées sur AWS.
Veuillez vous référer au fichier [backend/README.md](./backend/README.md) pour lire les **instructions sur les variables d'environnement à configurer sur AWS Lambda**.

Vous y trouverez les variables de configuration telles que :
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `REKOGNITION_COLLECTION_ID`
- `DYNAMODB_TABLE_STUDENTS`, `DYNAMODB_TABLE_ATTENDANCE`, etc.

---

## ☁️ Infrastructure AWS Requise

Pour que le projet fonctionne sur le cloud, les ressources suivantes doivent exister sur votre compte AWS :

1. **Amazon DynamoDB** (Tables : `Classes`, `Sessions`, `Students`, `Attendance`)
2. **Amazon S3** (Un bucket pour stocker les photos des étudiants et les preuves de présence).
3. **Amazon Rekognition** (Une collection créée pour regrouper l'indexation faciale de tous les étudiants).
4. **AWS Lambda** (Vos fonctions : `indexStudent`, `processAttendance`, `getStudents`, etc.)
5. **Amazon API Gateway** (Pour exposer les Lambdas via HTTP(S) et permettre au frontend de s'y connecter).
6. **Rôles IAM** (Les Lambdas doivent avoir la permission de lire/écrire sur S3, DynamoDB, et Rekognition).

---

## 🔒 Sécurité et Bonnes Pratiques

- **Aucune information sensible (Access Keys, Secret Keys) n'est (ni ne doit être) ajoutée dans le code.**
- Le système s'appuie sur le RBAC (Role-Based Access Control) d'AWS via les Rôles d'exécution Lambda.
- Les données configurables (Noms de buckets, de bases de données, identifiants des collections) sont passées via des **Variables d'Environnement** (`process.env`).
- L'accès S3 aux photos utilise le mécanisme de d'**URLs présignées (Presigned URLs)** assurant qu'elles ne soient rendues temporelles que sur demande et évitant un bucket ouvert au public.

---

## 📄 Licence
Ce projet a été développé dans le cadre éducatif/privé. Tous droits réservés.
