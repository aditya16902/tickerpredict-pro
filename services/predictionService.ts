
import { StockDataPoint, PredictionResult } from '../types';

/**
 * Calculates linear regression for a set of stock data points.
 * x: Time index (0, 1, 2...)
 * y: Closing price
 */
export const calculateLinearRegression = (data: StockDataPoint[]): PredictionResult | null => {
  if (data.length < 2) return null;

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  data.forEach((point, i) => {
    const x = i;
    const y = point.price;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared for confidence
  const rNum = (n * sumXY - sumX * sumY);
  const rDen = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  const rSquared = rDen === 0 ? 0 : Math.pow(rNum / rDen, 2);

  const nextDayPrediction = slope * n + intercept;

  return {
    nextDayPrediction,
    slope,
    intercept,
    rSquared
  };
};

/**
 * Adds prediction values to existing data points based on the historical trend.
 */
export const enrichWithPastPredictions = (data: StockDataPoint[]): StockDataPoint[] => {
  return data.map((point, index) => {
    // If prediction exists (e.g. from server), preserve it
    if (point.prediction !== undefined || point.prediction !== null) {
      return point;
    }

    if (index === 0) return point;
    // Predict point i using data from 0 to i-1
    const slice = data.slice(0, index);
    const reg = calculateLinearRegression(slice);
    return {
      ...point,
      prediction: reg ? reg.nextDayPrediction : undefined
    };
  });
};
