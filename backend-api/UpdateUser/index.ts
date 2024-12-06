import { TableClient } from "@azure/data-tables";
import Profanity from "profanity-js";
import { UserWithSecurityAttrs, UserToTableEntity } from "@pwdgame/shared";
import { UserTableName, DefaultOperationOptions } from "../Settings";

const { app } = require('@azure/functions');

const isValidUser = (user: any): user is UserWithSecurityAttrs => {
    return user
        && typeof user.username === "string"
        && typeof user.passwordHash === "string"
        && (!user.avatarId || typeof user.avatarId === "string")
        && (user as {}).hasOwnProperty("securityAnswers");
}

app.http('updateUser', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const requestBody = await request.json();

        if (!isValidUser(requestBody)) {
            return {
                status: 400,
                body: "Invalid user object"
            };
        }

        const profanity = new Profanity('', { language: 'en-us' })
        if (profanity.isProfane(requestBody.username)) {
            return {
                status: 409,
                body: "Username contains banned words"
            };
        }
        
        const entity = UserToTableEntity(requestBody);
        const tableClient = TableClient.fromConnectionString(
            process.env["StorageAccountConnectionString"], UserTableName);
    
        try {
            await tableClient.createTable(DefaultOperationOptions);
        } catch (err) {
            if (err.details?.odataError?.code !== "TableAlreadyExists") {
                throw err;
            }
        }
    
        await tableClient.upsertEntity(entity, "Merge", DefaultOperationOptions);
    
        return {
            status: 204 // no content
        };
    },
});