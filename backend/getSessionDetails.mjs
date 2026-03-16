import { DynamoDBClient, QueryCommand, ScanCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
const dynamodb = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
    const sessionId = event.queryStringParameters?.sessionId;
    
    // 1. Récupérer les infos de la session pour avoir le classId
    const sessionRes = await dynamodb.send(new GetItemCommand({
        TableName: "Sessions",
        Key: { "SessionId": { S: sessionId } }
    }));
    
    if (!sessionRes.Item) return { statusCode: 404, body: "Session non trouvée" };
    const classId = sessionRes.Item.ClassId.S;

    // 2. Récupérer tous les étudiants inscrits dans cette classe
    const studentsRes = await dynamodb.send(new ScanCommand({
        TableName: "Students",
        FilterExpression: "ClassId = :c",
        ExpressionAttributeValues: { ":c": { S: classId } }
    }));

    // 3. Récupérer les présences enregistrées pour cette session
    const attendanceRes = await dynamodb.send(new QueryCommand({
        TableName: "Attendance",
        KeyConditionExpression: "SessionId = :s",
        ExpressionAttributeValues: { ":s": { S: sessionId } }
    }));

    const presentIds = attendanceRes.Items.map(i => i.StudentId.S);

    // 4. Construire le rapport final
    const report = studentsRes.Items.map(s => ({
        SessionId: sessionId,
        StudentId: s.StudentId.S,
        FullName: s.FullName.S,
        ClassId: classId,
        Status: presentIds.includes(s.StudentId.S) ? "PRESENT" : "ABSENT",
        Timestamp: new Date().toISOString() // ou le timestamp réel de la table Attendance
    }));

    return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(report)
    };
};