import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Thermometer, Power } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { sendMessage, onMessage } from "../../global/WebSocket";
import type { MessageServer } from "../../Data/messages";

export default function Dashboard() {
  const [selectedDevice, setSelectedDevice] = useState("0x907F");
  const [devices, setDevices] = useState<string[]>([]);
  const [lampOn, setLampOn] = useState(false);
  const [potValue, setPotValue] = useState<number>(0);
  const [data, setData] = useState<{ time: string; pot: number }[]>([]);

  // Mensagem de leitura do potenciômetro
  const messageReadPot: MessageServer = {
    dst: selectedDevice,
    src: "Luan",
    fct: "read",
    param: "1",
    val: "",
  };

  // Mensagem de escrita da lâmpada
  const messageWriteLamp: MessageServer = {
    dst: selectedDevice,
    src: "Luan",
    fct: "write",
    param: "2",
    val: String(!lampOn),
  };

  // Solicita leituras periódicas
  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage(messageReadPot);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Recebe mensagens do WebSocket
  useEffect(() => {
    const unsubscribe = onMessage((msg) => {
    
    if (msg.src && !devices.includes(msg.src)) {
        setDevices((prev) => [...prev, msg.src]); // adiciona novo device detectado
    }

    if (msg.fct === "read" && String(msg.param) === "1") {

      const potNum = Number(msg.val);

      setPotValue(potNum);

      setData((prev) => [
        ...prev.slice(-19),
        {
          time: new Date().toLocaleTimeString().slice(0, 8),
          pot: potNum,
        },
      ]);
    }
  });

  return unsubscribe;
}, [selectedDevice, devices]);

  // Alterna lâmpada
  const handleLampToggle = () => {
    setLampOn((prev) => !prev);
    sendMessage(messageWriteLamp);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-4 text-white">Painel de Monitoramento</h1>

        {/* Dropdown de dispositivos */}
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="w-[200px] bg-[#2b2b2b] border border-[#333] text-white !text-white [&>span]:text-white">
              <SelectValue placeholder="Selecione um dispositivo" className="!text-white"/>
            </SelectTrigger>
            <SelectContent className="bg-[#2b2b2b] text-white border border-[#333]">
              {devices.length > 0 ? (
                devices.map((dev) => (
                  <SelectItem key={dev} value={dev}>
                    {dev}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  Nenhum dispositivo detectado
                </SelectItem>
              )}
            </SelectContent>
          </Select>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Potenciômetro */}
        <Card className="bg-[#2b2b2b] border border-[#333] shadow-lg">
          <CardContent className="flex flex-col items-center p-6">
            <Thermometer className="text-orange-400 mb-2" size={36} />
            <span className="text-white">Potenciômetro</span>
            <span className="text-3xl font-bold text-orange-400">
              {potValue.toFixed(2)}
            </span>
          </CardContent>
        </Card>

        {/* Lâmpada */}
        <Card className="bg-[#2b2b2b] border border-[#333] shadow-lg">
          <CardContent className="flex flex-col items-center p-6 space-y-3">
            <Power className={lampOn ? "text-green-400" : "text-red-400"} size={36} />
            <span className="text-white">Lâmpada</span>
            <motion.div whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 300 }}>
              <Button
                onClick={handleLampToggle}
                className={`px-6 py-2 rounded-lg text-lg font-semibold shadow-md transition-colors ${
                  lampOn ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {lampOn ? "Desligar" : "Ligar"}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de leituras */}
      <Card className="bg-[#2b2b2b] border border-[#333] shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Leituras Recentes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="time" stroke="#aaa" tick={{ fill: "#aaa" }} />
              <YAxis stroke="#aaa" tick={{ fill: "#aaa" }} />
              <Tooltip contentStyle={{ backgroundColor: "#333", border: "none", color: "white" }} />
              <Line type="monotone" dataKey="pot" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
