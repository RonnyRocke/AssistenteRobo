const robo = document.getElementById("robo");
const nuvem = document.getElementById("nuvem");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modalText");

let chatHistory = [];

async function sendText(text = null) {
  const input = document.getElementById("userInput");
  const message = text || input.value;
  if (!message.trim()) return;

  showListening();
  input.value = "";

  chatHistory.push(`👤 Você: ${message}`);
  const response = await getAIResponse(message);
  chatHistory.push(`🤖 Robô: ${response}`);

  modalText.innerText = chatHistory.join("\\n\\n");
  modal.style.display = "flex";
  speak(response);
}

function showListening() {
  nuvem.style.display = "block";
  robo.src = "assets/spr_robo.gif";
}

function speak(text) {
  nuvem.style.display = "none";
  robo.src = "assets/spr_robo_falaEanda.gif";
  robo.classList.add("fala-animando");

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "pt-BR";
  utter.voice = speechSynthesis.getVoices().find(v => v.name.includes("Google") && v.name.includes("Male")) || null;
  utter.onend = () => {
    robo.src = "assets/spr_robo.gif";
    robo.classList.remove("fala-animando");
  };
  speechSynthesis.speak(utter);
}

async function getAIResponse(userMessage) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: userMessage })
  });
  const data = await res.json();
  return data.text || "Desculpe, não entendi.";
}

function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Seu navegador não suporta reconhecimento de voz.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.onstart = () => showListening();
  recognition.onresult = function (event) {
    const texto = event.results[0][0].transcript;
    sendText(texto);
  };
  recognition.onerror = function (event) {
    nuvem.style.display = "none";
    alert("Erro ao ouvir: " + event.error);
  };
  recognition.start();
}

document.getElementById("closeModal").onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
