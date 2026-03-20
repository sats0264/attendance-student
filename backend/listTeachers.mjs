import {
    CognitoIdentityProviderClient,
    ListUsersInGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({ region: "us-east-1" });

export const handler = async (event) => {
    try {
        const params = {
            UserPoolId: process.env.USER_POOL_ID,
            GroupName: "Teacher",
            Limit: 50 // Tu peux augmenter si tu as beaucoup de profs
        };

        const response = await cognito.send(new ListUsersInGroupCommand(params));

        // On formate les données pour que le Frontend les lise facilement
        const teachers = response.Users.map(user => {
            return {
                username: user.Username,
                enabled: user.Enabled,
                status: user.UserStatus,
                email: user.Attributes.find(a => a.Name === "email")?.Value,
                fullName: user.Attributes.find(a => a.Name === "name")?.Value,
                sub: user.Attributes.find(a => a.Name === "sub")?.Value,
                createdAt: user.UserCreateDate
            };
        });

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(teachers)
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