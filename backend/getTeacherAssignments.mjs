import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        // Validation de l'authentification
        const authorizer = event.requestContext?.authorizer;
        if (!authorizer) {
            return {
                statusCode: 401,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Non autorisé : Authorizer manquant" })
            };
        }

        // Récupération du sub (ID unique Cognito)
        // Note: Selon la config API Gateway, les claims peuvent être directement dans authorizer ou dans authorizer.claims
        const teacherId = authorizer.claims?.sub || authorizer.sub || authorizer.jwt?.claims?.sub;

        if (!teacherId) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "ID Enseignant (sub) introuvable dans le jeton" })
            };
        }

        const params = {
            TableName: "Assignments",
            KeyConditionExpression: "TeacherId = :tid",
            ExpressionAttributeValues: {
                ":tid": { S: teacherId }
            }
        };

        const data = await client.send(new QueryCommand(params));
        const assignments = data.Items.map(item => ({
            teacherId: item.TeacherId?.S,
            assignmentId: item.AssignmentId?.S,
            className: item.ClassName?.S,
            subjectName: item.SubjectName?.S,
            teacherName: item.TeacherName?.S
        }));

        return {
            statusCode: 200,
            headers: { 
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(assignments)
        };
    } catch (err) {
        console.error("Erreur getTeacherAssignments:", err);
        return { 
            statusCode: 500, 
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: err.message }) 
        };
    }
};