import { RekognitionClient, DeleteFacesCommand } from "@aws-sdk/client-rekognition";
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";
const COLLECTION_ID = process.env.REKOGNITION_COLLECTION_ID || "esmt-students-collection";
const TABLE_STUDENTS = process.env.DYNAMODB_TABLE_STUDENTS || "Students";

const rekognition = new RekognitionClient({ region: REGION });
const dynamodb = new DynamoDBClient({ region: REGION });

export const handler = async (event) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;
        const { face_id } = body;

        if (!face_id) throw new Error("FaceId manquant");

        // 1. Supprimer de Rekognition
        await rekognition.send(new DeleteFacesCommand({
            CollectionId: COLLECTION_ID,
            FaceIds: [face_id]
        }));

        // 2. Supprimer de DynamoDB
        await dynamodb.send(new DeleteItemCommand({
            TableName: TABLE_STUDENTS,
            Key: { "FaceId": { S: face_id } }
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Étudiant supprimé avec succès" })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};