
export interface StockDataPoint {
  id: string;
  date: string;
  price: number;
  prediction?: number;
}

export interface PredictionResult {
  nextDayPrediction: number;
  slope: number;
  intercept: number;
  rSquared: number;
}

export interface AIInsight {
  analysis: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  recommendation: string;
}
