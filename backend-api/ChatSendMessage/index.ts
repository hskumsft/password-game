import { app, output } from "@azure/functions";
import { ChatServiceMethod, ChatMessage } from "@pwdgame/shared";
import Profanity from "profanity-js";
import { v4 as uuid } from "uuid";

const isValidChatMessage = (message: any): message is Omit<ChatMessage, "messageId"> => {
    return message && message
        && typeof message.message === "string"
        && typeof message.username === "string";
}

const signalR = output.generic({
    type: 'signalR',
    name: 'signalR',
    hubName: 'chat',
    connectionStringSetting: 'SignalRConnectionString',
});

app.http('chatSendMessage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [signalR],
    handler: async (request, context) => {
        const message = await request.json();
        
        if (!isValidChatMessage(message)) {
            return {
                status: 400,
                body: "Invalid chat message arguments"
            };
        }

        const profanity = new Profanity('', { language: 'en-us' })
        if (profanity.isProfane(message.message)) {
            return {
                status: 409,
                body: "Message contains banned words"
            };
        }

        const arg: ChatMessage = { messageId: uuid(), ...message };

        context.extraOutputs.set(signalR, {
            "target": ChatServiceMethod.SendMessage,
            "arguments": [arg]
        });

        return { status: 201 }
    },
    route: 'chat/sendmessage',
});