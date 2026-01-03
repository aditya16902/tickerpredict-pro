
import { GoogleGenAI, Type } from "@google/genai";
import { StockDataPoint, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getMarketInsights = async (data: StockDataPoint[]): Promise<AIInsight> => {
  const priceHistory = data.map(d => `${d.date}: $${d.price}`).join(", ");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following stock price history for Coca-Cola (KO) and provide a professional financial insight.
    History: ${priceHistory}
    
    Provide your response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING, description: "Detailed market trend analysis." },
          sentiment: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"], description: "Overall market sentiment." },
          recommendation: { type: Type.STRING, description: "A cautious recommendation for the user." }
        },
        required: ["analysis", "sentiment", "recommendation"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as AIInsight;
  } catch (e) {
    return {
      analysis: "Unable to parse AI analysis at this time.",
      sentiment: "Neutral",
      recommendation: "Please review data trends manually."
    };
  }
};
