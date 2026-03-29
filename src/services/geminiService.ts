import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getCountryInfo(country: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tell me 3 interesting and fun facts about ${country}. Keep it brief and friendly.`,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not fetch country info right now.";
  }
}
