# TickerPredict Pro 📈

**Predictive Intelligence Platform**

TickerPredict Pro is a predictive intelligence platform designed to help financial institutions anticipate market events and act before competitors. By leveraging advanced linear regression algorithms and autonomous AI agents, it identifies external triggers and delivers actionable insights tailored to specific asset classes.

---

## 🚀 Key Features

### 🧠 Predictive Intelligence
-   **Linear Regression Models**: Automatically calculates trends, R-squared confidence, and next-day price predictions based on historical data.
-   **Local AI Insights**: Utilizes a local Small Language Model (SLM) via Hugging Face Transformers (`distilgpt2`) to generate market outlook reports on-device, ensuring data privacy and zero external API costs.

### 🌍 Multi-Asset Portfolio
-   **Specialized Tracking**: Route between different sector dashboards.
    -   **Beverages**: Track Coca-Cola (KO).
    -   **Flights**: Track EasyJet (EZJ.L).
-   **Scalable Architecture**: Each asset maintains its own independent data store and regression model.

### ⚡ Smart Data Sync
-   **Local Persistence**: Data is cached locally (`stock_data_*.json`) for instant load times.
-   **Live Market Sync**: "Smart Refresh" only fetches new data points from `yfinance` when explicitly requested, merging them seamlessly with your local history.

---

## 🛠️ Technology Stack

**Frontend**
-   **React** & **Vite**: Fast, modern UI.
-   **Recharts**: Interactive financial charting.
-   **TailwindCSS**: Premium, responsive design.
-   **React Router**: Dynamic navigation.

**Backend**
-   **Python (FastAPI)**: High-performance API server.
-   **Scikit-Learn**: Mathematical modeling and regression.
-   **Transformers (Hugging Face) & PyTorch**: Local LLM execution.
-   **yfinance**: Live market data retrieval.

---

## 📦 Installation & Setup

### Prerequisites
-   Node.js & npm
-   Python 3.8+

### 1. Backend Setup

The backend handles data fetching, storage, and AI generation.

```bash
# Navigate to the project root
cd tickerpredict-pro

# Install Python dependencies
pip install -r requirements.txt

# Start the Server
python server.py
```

> **Note on First Run**: The server will download the AI model (~300MB) upon the first request to "Artificial Intelligence". Subsequent runs will be instant.

### 2. Frontend Setup

The frontend provides the interactive dashboard.

```bash
# Install Node dependencies
npm install

# Start the Development Server
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 💡 Usage Guide

1.  **Select a Sector**: Choose between "Beverages" or "Flights" on the homepage.
2.  **View Trends**: Analyze the "Actual Price" vs. "Regression Trend" graph.
3.  **Sync Live**: Click **"Sync Live"** to fetch the latest closing prices from the stock market.
4.  **AI Insights**: Click **"AI Insights"** to have the local AI agent analyze the current price trend and sentiment.
5.  **Manual Entry**: You can also manually add data points to simulate future scenarios.

---

## 🔮 Future Roadmap

-   **Multi-Model Support**: Integration of LSTM and Prophet models for advanced forecasting.
-   **News Sentiment Analysis**: Scraping live news to feed into the AI agent.
-   **User Accounts**: Personalized watchlists and alert thresholds.
