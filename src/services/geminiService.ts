import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeTrafficSituation(imageBase64: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          {
            text: "Analyze this traffic situation. Identify the vehicles, traffic lights, and potential hazards. Explain the rules of the road that apply here and what the correct action for the driver should be. Be concise and clear.",
          },
          {
            inlineData: {
              data: imageBase64.split(",")[1], // Remove data:image/png;base64,
              mimeType: mimeType,
            },
          },
        ],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing traffic situation:", error);
    throw error;
  }
}
