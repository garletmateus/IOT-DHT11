// Importa as bibliotecas necessárias
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const mqtt = require("mqtt");

// Configura a porta serial (ajuste a 'COM4' se necessário)
const port = new SerialPort({
  path: "COM4",
  baudRate: 9600,
});

// Cria o parser para ler as linhas completas da serial
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// Conecta ao broker MQTT (endereço corrigido!)
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Tópico MQTT a ser usado
const topic = "senai/iot/dht11";

// Confirma a conexão com o broker
client.on("connect", () => {
  console.log("✅ Conectado ao broker MQTT!");
});

// Quando dados são recebidos da porta serial
parser.on("data", (line) => {
  try {
    const data = JSON.parse(line.trim());
    console.log("📥 Recebido da serial:", data);

    // Publica os dados no tópico MQTT
    client.publish(topic, JSON.stringify(data));
    console.log("📤 Publicado no MQTT:", data);
  } catch (err) {
    console.error("❌ Erro ao processar linha da serial:", line);
  }
});
