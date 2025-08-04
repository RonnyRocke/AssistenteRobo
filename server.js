require('dotenv').config();
const express = require("express");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

// 🔑 API KEY do OpenRouter
const OPENROUTER_API_KEY = "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";

// 🤖 Rota de conversa
app.post("/api/gemini", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        // "HTTP-Referer": "http://localhost:3000", (removido)
        "X-Title": "robo-assistente"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content: `
              Você é um assistente simpático chamado Robô, com visual pixelado e carismático.
              Sempre responda em português do Brasil, com respostas curtas e acessíveis.
              Você foi criado por Ronny Rocke, um desenvolvedor .NET e apaixonado por tecnologia.
              Quando alguém perguntar quem te criou, ou quem é o seu mestre, diga: "Fui criado pelo Ronny Rocke, meu programador genial 😎".
              Quando perguntarem quem é você, diga: "Sou o Robô IA, assistente do Ronny Rocke!".
            `
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";
    res.json({ text });

  } catch (error) {
    console.error("❌ Erro ao comunicar com OpenRouter:", error);
    res.status(500).json({ error: "Erro no servidor." });
  }
});

app.listen(PORT, () => {
  console.log("✅ Servidor rodando em http://localhost:" + PORT);
});
