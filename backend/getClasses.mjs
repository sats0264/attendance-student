import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_CLASSES = process.env.DYNAMODB_TABLE_CLASSES || "Classes";

const dynamodb = new DynamoDBClient({ region: REGION });

export const handler = async (event) => {
    try {
        const params = {
            TableName: TABLE_CLASSES
        };

        const result = await dynamodb.send(new ScanCommand(params));

        // On formate pour le frontend
        const classes = result.Items.map(item => ({
            classId: item.ClassId.S,
            promotion: item.Promotion?.S || "N/A",
            department: item.Department?.S || "N/A"
        }));

        return {
            statusCode: 200,
            headers: { 
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(classes)
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};