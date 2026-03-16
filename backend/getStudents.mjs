import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const dynamodb = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        const classId = event.queryStringParameters?.classId;
        const params = { TableName: "Students" };

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
                    Bucket: "esmt-presence-storage",
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