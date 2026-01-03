
import { StockDataPoint, AIInsight } from "../types";

const API_BASE_URL = 'http://localhost:8000';

export const getMarketInsights = async (data: StockDataPoint[], ticker: string = "KO"): Promise<AIInsight> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/insight`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticker: ticker,
        data: data.slice(-50) // Send last 50 points to save payload size
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch insights");
    }

    return await response.json() as AIInsight;
  } catch (error) {
    console.error("Local AI Insight Error:", error);
    return {
      analysis: "Could not generate local insights. Check if server has 'transformers' installed.",
      sentiment: "Neutral",
      recommendation: "Ensure Python backend is running."
    };
  }
};
