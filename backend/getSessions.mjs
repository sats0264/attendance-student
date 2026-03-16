import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_SESSIONS = process.env.DYNAMODB_TABLE_SESSIONS || "Sessions";

const dynamodb = new DynamoDBClient({ region: REGION });

export const handler = async (event) => {
    const result = await dynamodb.send(new ScanCommand({ TableName: TABLE_SESSIONS }));
    const sessions = result.Items.map(i => ({
        sessionId: i.SessionId.S,
        classId: i.ClassId.S,
        subject: i.Subject.S,
        date: i.CreatedAt.S
    }));
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(sessions) };
};