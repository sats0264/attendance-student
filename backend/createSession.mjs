import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamodb = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        let body = event.body ? (typeof event.body === "string" ? JSON.parse(event.body) : event.body) : event;
        
        const { class_id, subject, teacher } = body;

        if (!class_id || !subject) {
            throw new Error("Le code de la classe et la matière sont obligatoires.");
        }

        // Génération d'un SessionId unique (ex: M2ISI_CLOUD_20260312)
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const sessionId = `${class_id}_${subject.toUpperCase().replace(/\s+/g, '_')}_${dateStr}`;

        await dynamodb.send(new PutItemCommand({
            TableName: "Sessions",
            Item: {
                "SessionId": { S: sessionId },
                "ClassId": { S: class_id.toUpperCase() },
                "Subject": { S: subject },
                "Teacher": { S: teacher || "Non spécifié" },
                "CreatedAt": { S: new Date().toISOString() },
                "IsActive": { BOOL: true }
            }
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ 
                message: "Session créée avec succès", 
                sessionId: sessionId 
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};