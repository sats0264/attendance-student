# Attendance Student - Backend Lambdas

Ce répertoire contient les fonctions AWS Lambda (fichiers `.mjs`) qui gèrent la logique d'arrière-plan du système de présence.

## Sécurité et Configuration des Variables d'Environnement

Pour des raisons de sécurité et de flexibilité (par exemple, pour séparer la production du développement), les noms des ressources AWS (Buckets, Collections, Tables) ne sont plus obligatoirement "codés en dur" (hardcoded). Le code utilise désormais les variables d'environnement via `process.env`. 

Si une variable d'environnement n'est pas définie, le code utilise l'ancienne valeur en dur comme position de sécurité (fallback).

### 🛠️ Variables d'environnement disponibles

Voici la liste des variables d'environnement que le code peut lire. Il est **fortement recommandé** de les configurer dans vos environnements AWS.

| Variable | Description | Valeur par défaut / Fallback |
| :--- | :--- | :--- |
| `AWS_REGION` | Région AWS où se situent vos ressources | `us-east-1` |
| `S3_BUCKET_NAME` | Nom du bucket S3 (photos & preuves de présence) | `esmt-presence-storage` |
| `REKOGNITION_COLLECTION_ID`| Identifiant de la collection Rekognition | `esmt-students-collection` |
| `DYNAMODB_TABLE_STUDENTS` | Nom de la table DynamoDB "Élèves" | `Students` |
| `DYNAMODB_TABLE_ATTENDANCE`| Nom de la table DynamoDB "Présences" | `Attendance` |
| `DYNAMODB_TABLE_SESSIONS` | Nom de la table DynamoDB "Sessions/Cours" | `Sessions` |
| `DYNAMODB_TABLE_CLASSES` | Nom de la table DynamoDB "Classes" | `Classes` |

---

### 🚀 Où et comment ajouter ces variables ?

Puisque ces scripts de backend sont vraisemblablement hébergés sous forme de fonctions **AWS Lambda**, c'est dans la configuration de vos Lambdas respectives que vous devez déclarer ces constantes.

**Étapes depuis la Console AWS :**
1. Connectez-vous à la [Console de gestion AWS (AWS Management Console)](https://console.aws.amazon.com/).
2. Ouvrez le service **Lambda**.
3. Sélectionnez l'une de vos fonctions (ex: `processAttendanceLambda`).
4. Allez dans l'onglet **Configuration**, puis dans la sous-section **Variables d'environnement** (à gauche).
5. Cliquez sur **Modifier** > **Ajouter une variable d'environnement**.
6. Saisissez la `Clé` (Exemple: `S3_BUCKET_NAME`) et sa `Valeur` (Exemple: `esmt-presence-storage`).
7. **Enregistrez**.

*(Répétez cette opération pour toutes vos fonctions Lambda)*.

---

### 💻 Utilisation Locale

Si vous testez en local un jour, et que votre script de lancement utilise `dotenv`, vous pouvez créer un fichier `.env` au niveau de ce répertoire `/backend` avec vos valeurs :

```ini
AWS_REGION=us-east-1
S3_BUCKET_NAME=esmt-presence-storage
REKOGNITION_COLLECTION_ID=esmt-students-collection
DYNAMODB_TABLE_STUDENTS=Students
DYNAMODB_TABLE_ATTENDANCE=Attendance
DYNAMODB_TABLE_SESSIONS=Sessions
DYNAMODB_TABLE_CLASSES=Classes
```
