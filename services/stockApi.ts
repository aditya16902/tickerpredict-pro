
import { StockDataPoint } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const fetchLiveStockData = async (ticker: string = 'KO', sync: boolean = false): Promise<StockDataPoint[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stock/${ticker}?sync=${sync}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data as StockDataPoint[];
  } catch (error) {
    console.error("Failed to fetch from Python backend:", error);
    throw error;
  }
};
