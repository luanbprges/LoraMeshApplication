const { WebSocketServer } = require("ws");

PORT = 8090;

const wss = new WebSocketServer({ port: PORT });
console.log(`Servidor escutando na porta: ${PORT}`)

wss.on('connection', (ws) => {
    console.log("Novo cliente conectado!");

    ws.on("message", (message) => {
        console.log("Mensagem recebida:", message.toString());

        
    });
    
});

