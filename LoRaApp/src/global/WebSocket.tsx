let socket: WebSocket | null = null;
let messageHandlers: ((msg: any) => void)[] = [];

export const connectWebSocket = (token: string) => {
  socket = new WebSocket(`ws://localhost:8090?token=${token}`);

  socket.onopen = () => console.log("Conexão WebSocket estabelecida");

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      messageHandlers.forEach((cb) => cb(msg));
    } 
    
    catch (err) {
      console.error("Erro ao interpretar mensagem:", err);
    }
  };

  socket.onclose = () => console.log("Conexão WebSocket fechada");

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
