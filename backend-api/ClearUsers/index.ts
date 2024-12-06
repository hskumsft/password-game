import { app } from "@azure/functions";
import { TableClient } from "@azure/data-tables";
import { UserTableName, DefaultOperationOptions } from "../Settings";
 
app.timer('clearUsers', {
    schedule: '0 0 8 * * *',
    handler: async (myTimer, context) => {
        const tableClient = TableClient.fromConnectionString(
            process.env["StorageAccountConnectionString"], UserTableName);
    
        try {
            await tableClient.deleteTable(DefaultOperationOptions)
        } catch (err) {
            if (err.details?.odataError?.code !== "ResourceNotFound") {
                throw err;
            }
        }
    },
});