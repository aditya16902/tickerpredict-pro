
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime
import json
import os
from transformers import pipeline
from typing import List

app = FastAPI()

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable for model (Lazy loaded)
insight_generator = None

# --- Data Models ---
class StockDataPointModel(BaseModel):
    date: str
    price: float

class InsightRequest(BaseModel):
    ticker: str
    data: List[StockDataPointModel]

# --- Persistence Logic ---

@app.get("/")
def read_root():
    return {"message": "TickerPredict Pro API is running. Access /api/stock/<ticker> for data."}

def get_data_file(ticker):
    # Sanitize ticker for filename (e.g. EZJ.L -> stock_data_EZJ.L.json)
    safe_ticker = ticker.replace("/", "_") 
    return f"stock_data_{safe_ticker}.json"

def load_data(ticker):
    filename = get_data_file(ticker)
    if os.path.exists(filename):
        try:
            with open(filename, "r") as f:
                return json.load(f)
        except:
            return []
    return []

def save_data(ticker, data):
    filename = get_data_file(ticker)
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)

def simple_linear_regression(data_points):
    """
    Calculates linear regression on a list of prices.
    Returns: next_day_prediction, slope, intercept, r_squared
    """
    if len(data_points) < 2:
        return None
    
    X = np.arange(len(data_points)).reshape(-1, 1)
    y = np.array(data_points).reshape(-1, 1)
    
    model = LinearRegression()
    model.fit(X, y)
    
    slope = model.coef_[0][0]
    intercept = model.intercept_[0]
    r_squared = model.score(X, y)
    
    # Predict next day (index = length)
    next_day_pred = model.predict([[len(data_points)]])[0][0]
    
    return {
        "nextDayPrediction": next_day_pred,
        "slope": slope,
        "intercept": intercept,
        "rSquared": r_squared
    }

def calculate_predictions(data):
    """
    Recalculates predictions for the entire dataset logic.
    For each point i, we use points 0..i-1 to predict i.
    """
    prices = []
    enriched_data = []
    
    for i, point in enumerate(data):
        prices.append(point['price'])
        
        # We need at least 2 previous points to predict the current one
        pred = None
        if i > 1:
            prev_prices = prices[:-1] # Exclude current price
            reg = simple_linear_regression(prev_prices)
            if reg:
                pred = reg["nextDayPrediction"]
        
        point['prediction'] = pred
        enriched_data.append(point)
        
    return enriched_data

@app.get("/api/stock/{ticker}")
async def get_stock_data(ticker: str, sync: bool = False):
    try:
        local_data = load_data(ticker)
        
        last_date = None
        if local_data:
            last_date_str = local_data[-1]['date']
            last_date = datetime.strptime(last_date_str, '%Y-%m-%d')
            print(f"[{ticker}] Local data found. Last date: {last_date_str}")
        
        if not sync and local_data:
            print(f"[{ticker}] Sync=False. Returning local data.")
            return local_data
            
        print(f"[{ticker}] Sync={sync}. Checking for updates...")

        stock = yf.Ticker(ticker)
        
        if not last_date:
            hist = stock.history(period="1mo")
        else:
            hist = stock.history(period="5d") 
        
        if hist.empty and not local_data:
             raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found or no data available")

        hist.reset_index(inplace=True)
        new_points = []
        
        for i, row in hist.iterrows():
            date_obj = row['Date'].to_pydatetime()
            date_str = row['Date'].strftime('%Y-%m-%d')
            
            if last_date and date_obj.date() <= last_date.date():
                continue
                
            close_price = float(row['Close'])
            point = {
                "id": str(int(datetime.timestamp(date_obj))), 
                "date": date_str,
                "price": close_price,
                "prediction": None 
            }
            new_points.append(point)
            
        if not new_points:
            print(f"[{ticker}] No new data available from API.")
            return local_data
        
        print(f"[{ticker}] Fetched {len(new_points)} new data points.")
        
        combined_data = local_data + new_points
        final_data = calculate_predictions(combined_data)
        
        save_data(ticker, final_data)
        
        return final_data

    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        local_data = load_data(ticker)
        if local_data:
            print("Returning local data due to API error.")
            return local_data
            
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/insight")
async def get_market_insight(request: InsightRequest):
    global insight_generator
    
    if insight_generator is None:
        print("Lazy loading AI Model (distilgpt2)...")
        try:
            insight_generator = pipeline('text-generation', model='distilgpt2')
            print("AI Model loaded successfully.")
        except Exception as e:
            print(f"Warning: AI Model failed to load. Insights will be disabled. Error: {e}")
            return {
                "analysis": "AI Model not available on server.",
                "sentiment": "Neutral",
                "recommendation": "Check server logs."
            }
    
    # Summarize data
    prices = [d.price for d in request.data]
    if not prices:
        return {"analysis": "No data.", "sentiment": "Neutral", "recommendation": "None"}
        
    current_price = prices[-1]
    start_price = prices[0]
    change = current_price - start_price
    trend = "UP" if change > 0 else "DOWN"
    
    # Prompt for distilgpt2
    prompt = (
        f"Stock Market Report for {request.ticker}.\n"
        f"The stock price is currently ${current_price:.2f}, trending {trend}.\n"
        f"Market analysis indicates that"
    )
    
    try:
        # Generate text
        output = insight_generator(prompt, max_new_tokens=60, num_return_sequences=1)[0]['generated_text']
        
        text_lower = output.lower()
        sentiment = "Neutral"
        if any(w in text_lower for w in ["growth", "increase", "bull", "buy", "record"]):
             sentiment = "Bullish"
        elif any(w in text_lower for w in ["decrease", "drop", "bear", "sell", "loss"]):
             sentiment = "Bearish"
             
        return {
            "analysis": output,
            "sentiment": sentiment,
            "recommendation": "Based on the generated analysis, please trade with caution."
        }
    except Exception as e:
        print(f"Gen Error: {e}")
        return {
            "analysis": "Error generating insight.",
            "sentiment": "Neutral",
            "recommendation": "Error."
        }

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
