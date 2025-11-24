import express from "express";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { parse } from "url";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

const SECRET = "minha_chave_secreta_super_segura";
const HTTP_PORT = 3000;
const WS_PORT = 8090;

const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Map();

console.log(`Servidor WebSocket rodando em ws://localhost:${WS_PORT}`);

/* ------------------ Rota para login (gera token JWT) ------------------ */
app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Usuário é obrigatório" });

  const token = jwt.sign({ sub: username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});


/* ----------------- Conexão WebSocket (Web + ESP32) ----------------- */
wss.on("connection", (ws, req) => {
  const { query } = parse(req.url, true);
  const token = query.token;

  let clientId = null;

  // 🧩 Tenta autenticar (caso tenha token)
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET);
      clientId = payload.sub; // Nome de usuário do site
      console.log(`Usuário autenticado: ${clientId}`);
      clients.set(clientId, ws);
    } 
    
    catch {
      console.warn("Token inválido — fechando conexão");
      ws.close(4002, "Token inválido");
      return;
    }

  } 
  
  else {
    // Caso não tenha token (ESP32)
    console.log("Cliente IoT conectado (aguardando identificação)");
  }

  // Quando receber mensagem
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Mensagem recebida:", data);

      // Caso o cliente IoT ainda não tenha um ID, define agora
      if (!clientId && data.src) {
        clientId = data.src;
        clients.set(clientId, ws);
        console.log(`Usuário autenticado: ${clientId}`);
        return;
      }

      // Garante que o cliente esteja registrado
      if (clientId && !clients.has(clientId)) {
        clients.set(clientId, ws);
      }

      // Encaminha a mensagem ao destino
      if (data.dst) {
        sendToClient(data.dst, data);
      } else {
        console.warn("Mensagem sem destino definido:", data.dst);
      }

    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  });

  // Ao fechar conexão
  ws.on("close", () => {
    if (clientId) {
      clients.delete(clientId);
      console.log(`Cliente desconectado: ${clientId}`);
    }
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`Servidor HTTP rodando em http://localhost:${HTTP_PORT}`);
});

/* ---------------------- Função para enviar ---------------------- */
function sendToClient(clientId, messageObj) {
  const clientSocket = clients.get(clientId);
  if (clientSocket && clientSocket.readyState === clientSocket.OPEN) {
    clientSocket.send(JSON.stringify(messageObj));
    console.log(`Mensagem enviada para ${clientId}`);
  } else {
    console.warn(`Cliente ${clientId} não está conectado`);
  }
}

