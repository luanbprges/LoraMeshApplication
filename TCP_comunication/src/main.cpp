#include <WiFi.h>
#include <lwip/sockets.h>
#include <Ultrasonic.h>
#include <WebSocketsClient.h>

#define trig 2
#define echo 4

const char* ssid = "Fauze";
const char* password = "Lendro1975";

const char* server_ip = "192.168.1.199";     // IP do servidor
const int server_port = 8090;               // Porta do servidor

WebSocketsClient webSocket;
unsigned long lastReconnectAttempt = 0;
static unsigned long lastSend = 0;

Ultrasonic ultrasonic(trig, echo);
int cmValue = 0;

void connectToWiFi();
void connectServer();
void reconnect();
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);
void SendMessage();


void setup() 
{
    Serial.begin(115200);
    connectToWiFi();

    pinMode(trig, OUTPUT);
    pinMode(echo, INPUT);

    webSocket.begin("192.168.1.199", 8090, "/");
    webSocket.onEvent(webSocketEvent);
}

void loop() 
{
    webSocket.loop();
    reconnect();
    SendMessage();
}


void connectToWiFi() 
{
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

void reconnect() 
{
    if (webSocket.isConnected() == false && millis() - lastReconnectAttempt > 5000) 
    {
        Serial.println("Tentando reconectar...");
        webSocket.begin("192.168.1.199", 8090, "/");
        lastReconnectAttempt = millis();
    }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length)
{
    if (type == WStype_TEXT)
    {
        Serial.printf("Recebi: %s\n", payload);
    }
}

void SendMessage()
{
    if (millis() - lastSend > 1000 && webSocket.isConnected())
    {
        cmValue = ultrasonic.read();
        String msg = String(cmValue);

        webSocket.sendTXT(msg);

        Serial.print("Mensagem enviada: ");
        Serial.println(msg);
        
        lastSend = millis();
    }
}

/*void connectServer()
{
    WiFiClient client;

    if(!client.connect(server_ip,server_port))
    {
        Serial.println("Conexão com o servidor falhou");
        delay(2000);
        return;
    }

    Serial.println("Conexão com o servidor foi um sucesso!");
    client.print(ultrasonic.read());

    //Serial.println("Desconectando");
    client.stop();
    delay(1000);
} USANDO TCP puro - socket*/