import { app, output } from "@azure/functions";
import { ChatServiceMethod, ChatDeletionCommand } from "@pwdgame/shared";

const signalR = output.generic({
    type: 'signalR',
    name: 'signalR',
    hubName: 'chat',
    connectionStringSetting: 'SignalRConnectionString',
});

app.http('chatDeleteMessage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [signalR],
    handler: (request, context) => {
        const messageId = request.json['messageId'];
        
        if (!messageId) {
            return {
                status: 400,
                body: "Invalid chat message arguments"
            }
        }

        const arg: ChatDeletionCommand = { messageId };

        context.extraOutputs.set(signalR, {
            "target": ChatServiceMethod.DeleteMessage,
            "arguments": [arg]
        });

        return { status: 201 }
    },
    route: 'chat/deletemessage',
});