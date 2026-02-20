import express from "express";
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { parse } from "url";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

const SECRET = "minha_chave_secreta_super_segura";
const HTTP_PORT = 3000;
const WS_PORT = 8090;

const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Map();              // Lista de Clientes
const pendingRequests = new Map();      // Lista de pedidos
const deviceBusy = new Map();           // Lista de disponibilidade (deviceId , true/false)

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

  // Tenta autenticar (caso tenha token)
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET);
      clientId = payload.sub; // Nome de usuário do site
      console.log(`Usuário autenticado: ${clientId}`);
      clients.set(clientId, ws);
      sendDevices();
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
        deviceBusy.set(clientId, false);

        console.log(`Usuário autenticado: ${clientId}`);
        sendDevices();
        return;
      }

      // Garante que o cliente esteja registrado
      if (clientId && !clients.has(clientId)) {
        clients.set(clientId, ws);
      }


      /* ----------------- RESPOSTA DE REQUEST ----------------- */
      if (data.requestId && pendingRequests.has(data.requestId)) {
        const request = pendingRequests.get(data.requestId);

        clearTimeout(request.timeout);
        pendingRequests.delete(data.requestId);

        deviceBusy.set(request.clientId, false);

        console.log(`Resposta recebida (${request.clientId}) request ${data.requestId}`
        );

        //envia resposta para o usuário WEB
        const webClient = clients.get(data.dst);

        if (webClient && webClient.readyState === webClient.OPEN) {
          webClient.send(JSON.stringify(data));
        }
        

        return;
      }


      /* ----------------- PEDIDO DE LISTA DE DISPOSITIVOS ----------------- */
      if (data.type == "devices-request") {
        sendDevices(data.src);
        return;
      }

      if (data.dst) {
        sendToClient(data.dst, data);
      }

    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
  });

  /* ----------------- DESCONECTOU ----------------- */
  ws.on("close", () => {
    if (clientId) {
      clients.delete(clientId);
      deviceBusy.delete(clientId);

      console.log(`Cliente desconectado: ${clientId}`);
      sendDevices();
    }
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`Servidor HTTP rodando em http://localhost:${HTTP_PORT}`);
});

/* ------------------- Função para enviar dados ------------------- */
function sendToClient(clientId, messageObj) {
  const clientSocket = clients.get(clientId);
  
  if (!clientSocket || clientSocket.readyState !== clientSocket.OPEN) {
    console.warn(`Cliente ${clientId} não está conectado`);
    return;
  }

  // Dispositivo executando uma tarefa
    if (deviceBusy.get(clientId)) {
      console.log("Dispositivo ocupado, ignorando envio");
      return;
    }

  // Cria um identificador de request
  const requestId = crypto.randomUUID();
  messageObj.requestId = requestId;

  deviceBusy.set(clientId, true);

  // envia mensagem
  clientSocket.send(JSON.stringify(messageObj));
  
  // cria timeout
  const timeout = setTimeout(() => {
    console.warn(`Timeout do cliente (${clientId}) request: ${requestId}`);

    pendingRequests.delete(requestId);
    deviceBusy.set(clientId, false);
    // aqui você pode marcar device offline futuramente
  }, 20000);

  // salva controle
  pendingRequests.set(requestId, {
    clientId,
    timeout,
  });
}


/* -------------- Função para enviar lista de devices -------------- */
function sendDevices() {
  const devices = Array.from(clients.keys())
    .filter(id => id.startsWith("0x"));

  const msg = JSON.stringify({
    type: "devices-update",
    devices,
  });

  for (const [id, client] of clients) {
    if (!id.startsWith("0x") && client.readyState === client.OPEN) {
      client.send(msg);
    }
  }
}