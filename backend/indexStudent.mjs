import { RekognitionClient, IndexFacesCommand } from "@aws-sdk/client-rekognition";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_STUDENTS = process.env.DYNAMODB_TABLE_STUDENTS || "Students";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "esmt-presence-storage";
const COLLECTION_ID = process.env.REKOGNITION_COLLECTION_ID || "esmt-students-collection";

const s3 = new S3Client({ region: REGION });
const rekognition = new RekognitionClient({ region: REGION });
const dynamodb = new DynamoDBClient({ region: REGION });

export const handler = async (event) => {
    try {
        let body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : event;
        const { image, student_id, student_name, class_id, promotion } = body;

        if (!image || !student_id) throw new Error("Données manquantes");

        const base64Data = image.split(",")[1] || image;
        const imageBytes = Buffer.from(base64Data, 'base64');
        
        // --- MODIF S3 ---
        const s3Key = `photos_etudiants/${student_id}.jpg`;
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: imageBytes,
            ContentType: "image/jpeg"
        }));

        // --- MODIF REKOGNITION (Utilise S3 au lieu des Bytes) ---
        const indexResponse = await rekognition.send(new IndexFacesCommand({
            CollectionId: COLLECTION_ID,
            Image: { S3Object: { Bucket: BUCKET_NAME, Name: s3Key } },
            ExternalImageId: student_id.toString().replace(/\s+/g, '_')
        }));

        const faceId = indexResponse.FaceRecords[0].Face.FaceId;

        // --- MODIF DYNAMODB (Ajout du chemin S3) ---
        await dynamodb.send(new PutItemCommand({
            TableName: TABLE_STUDENTS,
            Item: {
                "FaceId": { S: faceId },
                "FullName": { S: student_name || "Inconnu" },
                "StudentId": { S: student_id.toString() },
                "ClassId": { S: class_id.toUpperCase() },
                "Promotion": { S: promotion || "2026" },
                "S3Path": { S: s3Key } 
            }
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Inscrit avec succès", faceId })
        };
    } catch (error) {
        return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: error.message }) };
    }
};