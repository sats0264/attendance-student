import { DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_SESSIONS = process.env.DYNAMODB_TABLE_SESSIONS || "Sessions";
const TABLE_ATTENDANCE = process.env.DYNAMODB_TABLE_ATTENDANCE || "Attendance";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "esmt-presence-storage";

const dynamodb = new DynamoDBClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

export const handler = async (event) => {
    const studentId = event.queryStringParameters?.studentId;
    const classId = event.queryStringParameters?.classId;

    try {
        // 1. Récupérer toutes les sessions de cette classe
        const sessionsData = await dynamodb.send(new ScanCommand({
            TableName: TABLE_SESSIONS,
            FilterExpression: "ClassId = :c",
            ExpressionAttributeValues: { ":c": { S: classId } }
        }));

        // 2. Récupérer les présences de l'étudiant
        const attendanceData = await dynamodb.send(new QueryCommand({
            TableName: TABLE_ATTENDANCE,
            IndexName: "StudentId-index",
            KeyConditionExpression: "StudentId = :s",
            ExpressionAttributeValues: { ":s": { S: studentId } }
        }));

        // 3. Fusionner et générer les URLs signées
        const fullHistory = await Promise.all(sessionsData.Items.map(async (session) => {
            const sId = session.SessionId.S;
            const attendanceRecord = attendanceData.Items.find(a => a.SessionId.S === sId);
            const isPresent = !!attendanceRecord;
            
            let signedProofUrl = null;

            // Si l'étudiant est présent et qu'une photo de preuve existe
            if (isPresent && attendanceRecord.ProofS3?.S) {
                try {
                    const command = new GetObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: attendanceRecord.ProofS3.S,
                    });
                    // On génère l'URL sécurisée qui expire dans 1h
                    signedProofUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
                } catch (s3Err) {
                    console.error("Erreur signature S3:", s3Err);
                }
            }

            return {
                SessionId: sId,
                StudentId: studentId,
                Status: isPresent ? 'PRESENT' : 'ABSENT',
                Timestamp: isPresent ? attendanceRecord.Timestamp.S : session.CreatedAt.S,
                proofUrl: signedProofUrl // L'URL signée qui contourne le "Access Denied"
            };
        }));

        // Trier par date décroissante (plus récent en premier)
        fullHistory.sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify(fullHistory)
        };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify({ error: err.message }) };
    }
};