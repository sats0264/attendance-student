import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const dynamodb = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event;
    const { class_id, promotion, department } = body;

    await dynamodb.send(new PutItemCommand({
        TableName: "Classes",
        Item: {
            "ClassId": { S: class_id.toUpperCase() },
            "Promotion": { S: promotion },
            "Department": { S: department || "Informatique" }
        }
    }));
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ message: "Classe créée" }) };
};