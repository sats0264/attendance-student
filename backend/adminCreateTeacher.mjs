import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminAddUserToGroupCommand,
    AdminGetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const cognito = new CognitoIdentityProviderClient({ region: "us-east-1" });
const dynamodb = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        const { email, fullName, className, subjectName, tempPassword } = JSON.parse(event.body);
        let teacherSub;
        let isExistingUser = false;

        // 1. Tentative de création du compte dans Cognito
        try {
            const createParams = {
                UserPoolId: process.env.USER_POOL_ID,
            Username: email.split('@')[0].replace('.', '_'),
                UserAttributes: [
                    { Name: "email", Value: email },
                    { Name: "name", Value: fullName },
                    { Name: "email_verified", Value: "true" }
                ],
                TemporaryPassword: tempPassword || "Esm@t2026!",
                MessageAction: "SUPPRESS",
                DesiredDeliveryMediums: ["EMAIL"]
            };

            const userResponse = await cognito.send(new AdminCreateUserCommand(createParams));
            teacherSub = userResponse.User.Attributes.find(a => a.Name === "sub").Value;

            // 2. Ajout au groupe "Teacher" (seulement pour les nouveaux)
            await cognito.send(new AdminAddUserToGroupCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Username: email,
                GroupName: "Teacher"
            }));
        } catch (err) {
            if (err.name === "UsernameExistsException") {
                isExistingUser = true;
                // Récupération du sub pour un utilisateur existant
                const getUserResponse = await cognito.send(new AdminGetUserCommand({
                    UserPoolId: process.env.USER_POOL_ID,
                    Username: email
                }));
                teacherSub = getUserResponse.UserAttributes.find(a => a.Name === "sub").Value;
            } else {
                throw err;
            }
        }

        // 3. Liaison dans la table Assignments (DynamoDB crée ou écrase la ligne)
        await dynamodb.send(new PutItemCommand({
            TableName: "Assignments",
            Item: {
                "TeacherId": { S: teacherSub },
                "AssignmentId": { S: `${className}#${subjectName}` },
                "ClassName": { S: className },
                "SubjectName": { S: subjectName },
                "TeacherName": { S: fullName }
            }
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: isExistingUser ? "Nouvelle affectation ajoutée avec succès" : "Enseignant créé et affecté avec succès",
                sub: teacherSub,
                isExistingUser
            })
        };
    } catch (error) {
        console.error("Erreur AdminCreate/Assign:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};