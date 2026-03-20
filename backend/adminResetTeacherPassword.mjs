import { 
    CognitoIdentityProviderClient, 
    AdminSetUserPasswordCommand 
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        const { username, newPassword } = JSON.parse(event.body);
        
        if (!username || !newPassword) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Username and newPassword are required" })
            };
        }

        const command = new AdminSetUserPasswordCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: username,
            Password: newPassword,
            Permanent: true 
        });

        await cognito.send(command);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: "Le mot de passe a été réinitialisé avec succès" })
        };
    } catch (error) {
        console.error("Erreur AdminResetPassword:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
