import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Chat Assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing." });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Formulate system prompt based on context
      const systemPrompt = `You are the MHD Healthcare Assistant, a professional AI healthcare assistant for My Health Defense Hospital.
      You are speaking to a user on the ${context.role} portal.
      
      Rules:
      - You must provide helpful, accurate, and professional information.
      - You can help with hospital records, navigation, summaries, and general clinical information.
      - DO NOT expose patient data to the AI unless the authenticated user has permission. (Context will indicate current permissions).
      - Clearly state that you are an assistant and NOT a replacement for professional medical judgment.
      - Keep responses concise and formatted nicely (bullet points, short paragraphs).
      
      Context Information:
      Role: ${context.role}
      ${context.patientId ? `Patient ID: ${context.patientId}` : ''}
      `;

      const contents = history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
