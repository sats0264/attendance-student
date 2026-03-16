import { DynamoDBClient, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const dynamodb = new DynamoDBClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

export const handler = async (event) => {
    const studentId = event.queryStringParameters?.studentId;
    const classId = event.queryStringParameters?.classId;

    try {
        // 1. Récupérer toutes les sessions de cette classe
        const sessionsData = await dynamodb.send(new ScanCommand({
            TableName: "Sessions",
            FilterExpression: "ClassId = :c",
            ExpressionAttributeValues: { ":c": { S: classId } }
        }));

        // 2. Récupérer les présences de l'étudiant
        const attendanceData = await dynamodb.send(new QueryCommand({
            TableName: "Attendance",
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
                        Bucket: "esmt-presence-storage",
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