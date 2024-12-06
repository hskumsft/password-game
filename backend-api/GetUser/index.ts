import { app, input } from '@azure/functions';
import { UserAsTableEntity, UserFromTableEntity } from "@pwdgame/shared";
 
const tableInput = input.table({
    connection: 'StorageAccountConnectionString',
    partitionKey: '{username}',
    tableName: 'User',
    rowKey: '{username}',
});
 
app.http('getUser', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'User/{username}',
    extraInputs: [tableInput],
    handler: async (request, context) => {
        const userEntity = context.extraInputs.get(tableInput);

        if(!userEntity) {
            return {
                status: 404,
                body: "User not found"
            };
        }

        return { 
            status: 200,
            jsonbody: UserFromTableEntity(userEntity as UserAsTableEntity),
        };
    },
});