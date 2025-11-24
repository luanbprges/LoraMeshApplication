import './App.css'
import { useEffect, useState } from "react";
import Dashboard from '../Telas/Dashboards'
import Sidebar from '../Telas/Sidebar'
import Devices from '../Telas/Devices';
import { Routes, Route } from 'react-router-dom';
import { connectWebSocket } from './WebSocket';

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Simulação de login: chama API e obtém token
    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "Luan" }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Token recebido:", data.token);
        setToken(data.token);

        connectWebSocket(data.token);
      });
  }, []);

  return (
    
    <div className="flex h-screen">
      
      {/* Sidebar fixa */}
      <Sidebar />


      {/* Conteúdo principal flexível */}
      <main className="flex-1 bg-[#1e1e1e] text-white p-6 overflow-y-auto">
        {/* conteúdo do dashboard */}
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
        </Routes>
      </main>
      
    </div>
  );
}

export default App
