import { RekognitionClient, IndexFacesCommand, SearchFacesCommand, DeleteFacesCommand } from "@aws-sdk/client-rekognition";
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const rekognition = new RekognitionClient({ region: "us-east-1" });
const dynamodb = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        const data = typeof event.body === 'string' ? JSON.parse(event.body) : event;
        const { image, session_id } = data;
        const bucketName = "esmt-presence-storage";
        const collectionId = "esmt-students-collection";

        const base64Data = image.includes(",") ? image.split(",")[1] : image;
        const imageBytes = Buffer.from(base64Data, 'base64');

        // 1. Sauvegarde de la photo de groupe sur S3
        const sessionS3Key = `archives_seances/${session_id}_${Date.now()}.jpg`;
        await s3.send(new PutObjectCommand({
            Bucket: bucketName, Key: sessionS3Key, Body: imageBytes, ContentType: "image/jpeg"
        }));

        // 2. INDEXATION TEMPORAIRE : On détecte TOUS les visages de la photo
        const indexResponse = await rekognition.send(new IndexFacesCommand({
            CollectionId: collectionId,
            Image: { Bytes: imageBytes },
            MaxFaces: 30, // Il va détecter jusqu'à 30 élèves !
            DetectionAttributes: ["ALL"]
        }));

        const tempFaceIds = indexResponse.FaceRecords.map(f => f.Face.FaceId);
        const recognizedStudents = [];

        // 3. BOUCLE DE RECONNAISSANCE : Pour chaque visage détecté
        for (const tempId of tempFaceIds) {
            const searchResponse = await rekognition.send(new SearchFacesCommand({
                CollectionId: collectionId,
                FaceId: tempId, // On compare ce visage précis à la collection
                FaceMatchThreshold: 85,
                MaxFaces: 1
            }));

            if (searchResponse.FaceMatches && searchResponse.FaceMatches.length > 0) {
                // On a trouvé un match !
                const matchedFaceId = searchResponse.FaceMatches[0].Face.FaceId;
                
                // Récupération des infos dans DynamoDB
                const studentData = await dynamodb.send(new GetItemCommand({
                    TableName: "Students",
                    Key: { "FaceId": { S: matchedFaceId } }
                }));

                if (studentData.Item) {
                    const s = studentData.Item;
                    // Enregistrement de la présence
                    await dynamodb.send(new PutItemCommand({
                        TableName: "Attendance",
                        Item: {
                            "SessionId": { S: session_id },
                            "StudentId": { S: s.StudentId.S },
                            "FullName": { S: s.FullName.S },
                            "Timestamp": { S: new Date().toISOString() },
                            "Status": { S: "PRESENT" },
                            "ProofS3": { S: sessionS3Key }
                        }
                    }));
                    recognizedStudents.push({ id: s.StudentId.S, name: s.FullName.S });
                }
            }
        }

        // 4. NETTOYAGE : On supprime les IDs de la photo de groupe de la collection
        // pour ne pas polluer ta base d'étudiants avec des photos de groupe
        if (tempFaceIds.length > 0) {
            await rekognition.send(new DeleteFacesCommand({
                CollectionId: collectionId,
                FaceIds: tempFaceIds
            }));
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ count: recognizedStudents.length, students: recognizedStudents })
        };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};