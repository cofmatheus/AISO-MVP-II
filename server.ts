import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Initialize GoogleGenAI
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Mentor chat proxy route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, activity } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Missing required 'message' attribute" });
      }

      // Guidelines for the Analog Mentor to guide the user in mastering their offline focus habits
      const systemInstruction = `
Você é o "Mentor Analógico" (ou "Orientador IA") do AISO – um refúgio e baluarte digital projetado para apoiar a desintoxicação digital do usuário e ajudá-lo a aprender e masterizar atividades analógicas offline, manuais e cognitivas.
Seu foco imediato é guiar e sugerir desafios práticos e metodologias para a atividade que o usuário está praticando atualmente: "${activity || "entalho em madeira"}".

Por favor, siga estas diretrizes essenciais ao responder:
1. Adote um tom calmo, acolhedor, intelectivo, artesanal e polido (evite gírias bobas, respostas robóticas ou linguagens burocráticas). Seja um verdadeiro mestre atencioso.
2. Ofereça desafios sequenciais tangíveis, metas físicas fáceis e técnicas passo a passo reais (como fazer ranhuras adequadas, o manuseio correto de instrumentos, técnicas de leitura focada ativa, rituais sensoriais, etc.).
3. Ensine o usuário a reduzir a exaustão visual provocada por excesso de estímulos eletrônicos. Recomende que ele feche os olhos por momentos, respire e toque com solenidade os materiais.
4. Suas respostas devem ser em português do Brasil e formatadas com Markdown limpo e amigável (tópicos curtos, títulos discretos). Vá de forma direta ao ponto, mantendo as respostas bem focadas e tranquilizadoras.
`.trim();

      // Use gemini-3.5-flash as default as recommended for basic Q&A and tutoring
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          // Map history to include past messages correctly
          ...(history || []).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Erro interno ao processar a requisição com o Mentor IA." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Standard Express route for SPA index fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
