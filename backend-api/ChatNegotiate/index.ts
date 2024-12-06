const { app, input } = require('@azure/functions');

const inputSignalR = input.generic({
    type: 'signalRConnectionInfo',
    name: 'connectionInfo',
    hubName: 'chat',
    connectionStringSetting: 'SignalRConnectionString',
});

app.post('chatNegotiate', {
    authLevel: 'anonymous',
    handler: (request, context) => {
        return { body: JSON.stringify(context.extraInputs.get(inputSignalR)) }
    },
    route: 'chat/negotiate',
    extraInputs: [inputSignalR],
});