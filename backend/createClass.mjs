import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_CLASSES = process.env.DYNAMODB_TABLE_CLASSES || "Classes";

const dynamodb = new DynamoDBClient({ region: REGION });

export const handler = async (event) => {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;
    const { class_id, promotion, department } = body;

    await dynamodb.send(new PutItemCommand({
        TableName: TABLE_CLASSES,
        Item: {
            "ClassId": { S: class_id.toUpperCase() },
            "Promotion": { S: promotion },
            "Department": { S: department || "Informatique" }
        }
    }));
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ message: "Classe créée" }) };
};