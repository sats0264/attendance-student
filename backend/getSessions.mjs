import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
const dynamodb = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
    const result = await dynamodb.send(new ScanCommand({ TableName: "Sessions" }));
    const sessions = result.Items.map(i => ({
        sessionId: i.SessionId.S,
        classId: i.ClassId.S,
        subject: i.Subject.S,
        date: i.CreatedAt.S
    }));
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(sessions) };
};