import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_STUDENTS = process.env.DYNAMODB_TABLE_STUDENTS || "Students";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "esmt-presence-storage";

const dynamodb = new DynamoDBClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

export const handler = async (event) => {
    try {
        const classId = event.queryStringParameters?.classId;
        const params = { TableName: TABLE_STUDENTS };

        if (classId) {
            params.FilterExpression = "ClassId = :c";
            params.ExpressionAttributeValues = { ":c": { S: classId.toUpperCase() } };
        }

        const result = await dynamodb.send(new ScanCommand(params));

        // On utilise Promise.all car getSignedUrl est asynchrone
        const students = await Promise.all(result.Items.map(async (item) => {
            const s3Key = item.S3Path?.S || item.S3PhotoPath?.S;
            let signedUrl = null;

            if (s3Key) {
                const command = new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                });
                // Génère une URL valable 1 heure
                signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
            }

            return {
                faceId: item.FaceId.S,
                fullName: item.FullName.S,
                studentId: item.StudentId.S,
                classId: (item.ClassId?.S || 'N/A'),
                photoUrl: signedUrl // Cette URL fonctionnera même si le bucket est privé !
            };
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify(students)
        };
    } catch (error) {
        return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: error.message }) };
    }
};