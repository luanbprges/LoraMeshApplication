const { WebSocketServer } = require("ws");
const express = require("express");
const path = require("path");

const app = express();
PORT = 8090;

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log("Novo cliente conectado!");

    ws.on("message", (message) => {
        console.log("Mensagem recebida:", message.toString());
    });
});
