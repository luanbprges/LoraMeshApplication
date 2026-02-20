let socket: WebSocket | null = null;
let messageHandlers: ((msg: any) => void)[] = [];

let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let currentToken: string | null = null;

const max_reconnect_timeout = 10000;

export const connectWebSocket = (token: string) => {
  currentToken = token;

  socket = new WebSocket(`ws://localhost:8090?token=${currentToken}`);

  socket.onopen = () => {
    console.log("Conexão WebSocket estabelecida");
    
    reconnectAttempts = 0;

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  }

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      messageHandlers.forEach((cb) => cb(msg));
    } 
    
    catch (err) {
      console.error("Erro ao interpretar mensagem:", err);
    }
  };

  socket.onclose = () => {
    console.log("Conexão WebSocket fechada");
    reconnect();
  }

  socket.onerror = (err) => console.error("Erro no WebSocket:", err);
};

export const sendMessage = (message: unknown) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const data = JSON.stringify(message);
    socket.send(data);
  } else {
    console.warn("WebSocket não está conectado.");
  }
};


export const onMessage = (callback: (msg: any) => void) => {
  messageHandlers.push(callback);

  return () => {
    messageHandlers = messageHandlers.filter((cb) => cb !== callback);
  };
};

export const reconnect = () => {
  if(!currentToken) return;

  reconnectAttempts++;

  const delay = Math.min(
    1000 * Math.pow(2, reconnectAttempts),
    max_reconnect_timeout
  );

  console.log(`Reconectando em ${delay/1000} s...`);

  reconnectTimeout = setTimeout(() => {
    connectWebSocket(currentToken!);
  }, delay);

}