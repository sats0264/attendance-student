import { RekognitionClient, DeleteFacesCommand } from "@aws-sdk/client-rekognition";
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const rekognition = new RekognitionClient({ region: "us-east-1" });
const dynamodb = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;
        const { face_id } = body;

        if (!face_id) throw new Error("FaceId manquant");

        // 1. Supprimer de Rekognition
        await rekognition.send(new DeleteFacesCommand({
            CollectionId: "esmt-students-collection",
            FaceIds: [face_id]
        }));

        // 2. Supprimer de DynamoDB
        await dynamodb.send(new DeleteItemCommand({
            TableName: "Students",
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