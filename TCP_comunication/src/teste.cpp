#include <WiFi.h>
#include <lwip/sockets.h>

const char* ssid = "Fauze";
const char* password = "Lendro1975";

const char* server_ip = "192.168.1.199";     // IP do servidor
const int server_port = 8090;               // Porta do servidor

void connectToWiFi();
void connectServer();

void setup() {
    Serial.begin(115200);
    connectToWiFi();
}

void loop() 
{
    connectServer();
}

void connectServer()
{
    WiFiClient client;

    if(!client.connect(server_ip,server_port))
    {
        Serial.println("Conexão com o servidor falhou");
        delay(2000);
        return;
    }

    Serial.println("Conexão com o servidor foi um sucesso!");
    client.print("Oi servidor");
    delay(100);

    Serial.println("Desconectando");
    client.stop();
    delay(1000);
}

void connectToWiFi() {
    WiFi.begin(ssid, password);
    Serial.println("Conectando ao WiFi...");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nConectado ao WiFi!");
    Serial.print("IP local: ");
    Serial.println(WiFi.localIP());
}
