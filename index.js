document.addEventListener("DOMContentLoaded", () => {
  // === Conexão MQTT via WebSocket ===
  const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

  const labels = [];
  const tempData = [];
  const humData = [];

  const ctxTemp = document.getElementById("graficoTemperatura").getContext("2d");
  const ctxHum = document.getElementById("graficoUmidade").getContext("2d");

  // === Função para configurar o tema dos gráficos ===
  function getChartOptions(isDark) {
    const textColor = isDark ? "#f8f9fa" : "#212529";
    const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    return {
      responsive: true,
      animation: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
      },
    };
  }

  // === Criação dos gráficos ===
  let chartTemp = new Chart(ctxTemp, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperatura (°C)",
          data: tempData,
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13, 110, 253, 0.2)",
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        },
      ],
    },
    options: getChartOptions(false),
  });

  let chartHum = new Chart(ctxHum, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Umidade (%)",
          data: humData,
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13, 110, 253, 0.2)",
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        },
      ],
    },
    options: getChartOptions(false),
  });

  // === Atualiza tema dos gráficos ===
  function updateChartTheme(isDark) {
    chartTemp.options = getChartOptions(isDark);
    chartHum.options = getChartOptions(isDark);
    chartTemp.update();
    chartHum.update();
  }

  // === Conexão MQTT ===
  client.on("connect", () => {
    console.log("✅ Conectado ao broker MQTT via WebSocket");
    client.subscribe("dev/iot/dht11");
  });

  // === Recebendo mensagens do broker ===
  client.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const time = new Date().toLocaleTimeString();

      labels.push(time);
      tempData.push(data.temperatura);
      humData.push(data.umidade);

      // Atualiza valores na tela
      document.getElementById("valorTemp").innerText = `${data.temperatura.toFixed(1)}°C`;
      document.getElementById("valorHum").innerText = `${data.umidade.toFixed(1)}%`;

      // Mantém no máximo 20 pontos no gráfico
      if (labels.length > 20) {
        labels.shift();
        tempData.shift();
        humData.shift();
      }

      // Verifica temperatura limite
      const LIMITE_TEMPERATURA = 30;
      const alerta = document.getElementById("alertaTemperatura");

      if (data.temperatura >= LIMITE_TEMPERATURA) {
        chartTemp.data.datasets[0].borderColor = "#dc3545";
        chartTemp.data.datasets[0].backgroundColor = "rgba(220, 53, 69, 0.2)";
        alerta.classList.remove("d-none");
      } else {
        chartTemp.data.datasets[0].borderColor = "#0d6efd";
        chartTemp.data.datasets[0].backgroundColor = "rgba(13, 110, 253, 0.2)";
        alerta.classList.add("d-none");
      }

      chartTemp.update();
      chartHum.update();
    } catch (err) {
      console.error("⚠️ Erro ao processar mensagem MQTT:", err.message);
    }
  });

  // === Alternância de modo escuro ===
const toggleBtn = document.getElementById("toggleTema");
let isDarkMode = false;

toggleBtn.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode", isDarkMode);
  toggleBtn.innerText = isDarkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro";

  // Atualiza cores dos gráficos
  updateChartTheme(isDarkMode);
});

});
