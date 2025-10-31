// Importa as bibliotecas necessárias
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const mqtt = require("mqtt");

// Configura a porta serial (ajuste 'COM4' se necessário)
const port = new SerialPort({
  path: "COM4",
  baudRate: 9600,
});

// Cria o parser para ler linhas completas da serial terminadas em \n
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// Conecta ao broker MQTT
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Tópico MQTT para publicação
const topic = "senai/iot/dht11";

// Evento quando conecta ao broker MQTT
client.on("connect", () => {
  console.log("✅ Conectado ao broker MQTT!");
});

// Evento para cada linha recebida da serial
parser.on("data", (line) => {
  try {
    const data = JSON.parse(line.trim()); // Supondo que os dados venham em JSON
    console.log("📥 Recebido da serial:", data);

    // Publica os dados no tópico MQTT
    client.publish(topic, JSON.stringify(data));
    console.log("📤 Publicado no MQTT:", data);
  } catch (err) {
    console.error("❌ Erro ao processar linha da serial:", line);
  }
});
