#include <Servo.h>
#include <Wire.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>

Servo servoMotor;

const int trigPin = 5;
const int echoPin = 4;
const int led1 = 13;
const int servoPin = 14;

long duracao;
int distancia;
unsigned long tempo_requisicao = 0;
int distancia_estipulada = 20;
int ultimo_estado_led = LOW;
bool abertura_registrada = false;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(led1, OUTPUT);
  servoMotor.attach(servoPin);
  servoMotor.write(0);

  WiFi.begin("S24 FE de Henrique", "barbaraa"); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  while (WiFi.status() != WL_CONNECTED) {
    delay(2000);
    Serial.println("Waiting for connection");
  }
  Serial.println("CONECTADO");
}

void loop() {
  if (millis() - tempo_requisicao > 10000) {
    Serial.println("Sensor pausado para fazer a requisição!");
    distancia_estipulada = send_http_get();
    tempo_requisicao = millis();
    Serial.println("Sensor Voltando!");
  }

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duracao = pulseIn(echoPin, HIGH, 30000);

  if(duracao == 0){
    Serial.println("Sem pulso ECHO");
    distancia = -1;
  } else {
    distancia = duracao * 0.034 / 2;
  }

  Serial.print("Distancia: ");
  Serial.print(distancia);
  Serial.print(" cm. ");
  Serial.print("Distancia estipulada: ");
  Serial.print(distancia_estipulada);
  Serial.println(" cm");

  int novo_estado_led;
  if (distancia > 0 && distancia <= distancia_estipulada) {
    novo_estado_led = HIGH;
    digitalWrite(led1, HIGH);
    servoMotor.write(180);
    
    if (!abertura_registrada) {
      send_abertura();
      abertura_registrada = true;
    }
  } else {
    novo_estado_led = LOW;
    digitalWrite(led1, LOW);
    servoMotor.write(0);
    abertura_registrada = false; 

  if (novo_estado_led != ultimo_estado_led) {
    send_light_update(novo_estado_led);
    ultimo_estado_led = novo_estado_led;
  }

  send_log(distancia, distancia_estipulada);
  
  delay(500);
}

int send_http_get(){
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    http.begin(client, "http://10.158.215.41:8000/Configuracao"); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.GET();

    String payload = http.getString();
    Serial.print("Código da requisição:");
    Serial.println(httpCode);
    Serial.print("Resposta completa: ");
    Serial.println(payload);
    http.end();

    if (httpCode == 200) {
      int distIndex = payload.indexOf("\"distancia\":");
      if (distIndex != -1) {
        int startValue = distIndex + 12;
        int endValue = payload.indexOf(",", startValue);
        String distValue = payload.substring(startValue, endValue);
        return distValue.toInt();
      }
    }
    return 20;
  } else {
    Serial.println("Error in WiFi connection");
    return 20;
  }
}

void send_log(int dist, int dist_estip) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    http.begin(client, "http://10.158.215.41:8000/Log"); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"distancia\":" + String(dist) + ",\"distancia_estipulada\":" + String(dist_estip) + "}";
    http.POST(payload);
    http.end();
  }
}

void send_light_update(int light_state) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    http.begin(client, "http://10.158.215.41:8000/Light"); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    http.addHeader("Content-Type", "application/json");
    
    String lightPayload = "{\"light\":" + String(light_state) + "}";
    http.PATCH(lightPayload);
    
    Serial.print("LED atualizado no backend: ");
    Serial.println(light_state == HIGH ? "LIGADO" : "DESLIGADO");
    
    http.end();
  }
}

void send_abertura() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    http.begin(client, "http://10.158.215.41:8000/Abertura"); //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    http.addHeader("Content-Type", "application/json");
    
    http.POST("{}");
    Serial.println("Abertura da cancela registrada!");
    
    http.end();
  }
}
