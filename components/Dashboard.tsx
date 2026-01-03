
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StockDataPoint, AIInsight } from '../types';
import { calculateLinearRegression, enrichWithPastPredictions } from '../services/predictionService';
import { getMarketInsights } from '../services/insightService';
import { fetchLiveStockData } from '../services/stockApi';
import PredictionGraph from './PredictionGraph';
import HistoryTable from './HistoryTable';

const INITIAL_DATA: StockDataPoint[] = [];

interface DashboardProps {
    ticker?: string;
    category?: string;
}

const Dashboard: React.FC<DashboardProps> = () => {
    const navigate = useNavigate();
    const { category, tickerSymbol } = useParams(); // e.g. /beverages/ko

    // Map URL params to actual data if needed, or pass via props
    // For now let's derive display info from the generic ticker param
    // We expect route /:category/:tickerSymbol

    const currentTicker = tickerSymbol?.toUpperCase() === 'EZJ' ? 'EZJ.L' : (tickerSymbol?.toUpperCase() || 'KO');
    const displayTicker = tickerSymbol?.toUpperCase() || 'KO';
    const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Beverages';

    // Theme colors based on category
    const themeColor = category === 'flights' ? 'orange' : 'red';
    const themeText = category === 'flights' ? 'text-orange-600' : 'text-red-600';
    const themeBg = category === 'flights' ? 'bg-orange-50' : 'bg-red-600'; // Header icon bg
    const themeBorder = category === 'flights' ? 'border-orange-200' : 'border-red-200';

    const [data, setData] = useState<StockDataPoint[]>(INITIAL_DATA);
    const [newPrice, setNewPrice] = useState<string>('');
    const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [insights, setInsights] = useState<AIInsight | null>(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline');

    // Derive predictions
    const enrichedData = useMemo(() => enrichWithPastPredictions(data), [data]);
    const regressionResult = useMemo(() => calculateLinearRegression(data), [data]);

    const handleAddData = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(newPrice);
        if (isNaN(price)) return;

        const newData: StockDataPoint = {
            id: Date.now().toString(),
            date: newDate,
            price: price
        };

        setData(prev => [...prev, newData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setNewPrice('');
    };

    const handleSyncLive = async () => {
        setIsSyncing(true);
        try {
            const liveData = await fetchLiveStockData(currentTicker, true);
            setData(liveData);
            setServerStatus('online');
            fetchInsights(liveData);
        } catch (err) {
            setServerStatus('offline');
            console.error("Sync error:", err);
            alert(`Python backend error. Please run 'python server.py'.`);
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchInsights = async (currentData: StockDataPoint[] = data) => {
        setLoadingInsights(true);
        try {
            const aiResponse = await getMarketInsights(currentData, currentTicker);
            setInsights(aiResponse);
        } catch (err) {
            console.error("AI Insights Error:", err);
        } finally {
            setLoadingInsights(false);
        }
    };

    useEffect(() => {
        // Reset data when ticker changes
        setData([]);
        setInsights(null);

        // Initial load (Sync=False)
        fetchLiveStockData(currentTicker, false)
            .then((data) => {
                setServerStatus('online');
                if (data && data.length > 0) {
                    setData(data);
                    fetchInsights(data);
                }
            })
            .catch(() => setServerStatus('offline'));
    }, [currentTicker]);

    return (
        <div className="min-h-screen pb-12 bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/')}
                            className="mr-2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <div className={`${category === 'flights' ? 'bg-orange-600' : 'bg-red-600'} text-white p-2 rounded-lg`}>
                            <i className={`fa-solid ${category === 'flights' ? 'fa-plane' : 'fa-chart-line'} text-xl`}></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900 leading-none">TickerPredict Pro</h1>
                                <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{serverStatus}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{categoryName} • {displayTicker} Tracker</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSyncLive}
                            disabled={isSyncing}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <i className={`fa-solid fa-rotate ${isSyncing ? 'animate-spin' : ''}`}></i>
                            {isSyncing ? 'Syncing...' : 'Sync Live'}
                        </button>
                        <button
                            onClick={() => fetchInsights()}
                            disabled={loadingInsights}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold ${themeText} border ${themeBorder} bg-white hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50`}
                        >
                            <i className={`fa-solid fa-wand-sparkles ${loadingInsights ? 'animate-spin' : ''}`}></i>
                            AI Insights
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider text-[10px]">Current Price</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl font-bold text-slate-900">
                                    {data.length > 0 ? `$${data[data.length - 1].price.toFixed(2)}` : '---'}
                                </h2>
                                {data.length > 1 && (
                                    <span className={`text-sm font-bold px-1.5 py-0.5 rounded ${data[data.length - 1].price >= data[data.length - 2].price ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                        {(data[data.length - 1].price - data[data.length - 2].price > 0 ? '+' : '') + (data[data.length - 1].price - data[data.length - 2].price).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <i className="fa-solid fa-tag text-6xl rotate-12"></i>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider text-[10px]">Next Day (Pred)</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className={`text-3xl font-bold ${themeText}`}>
                                    ${regressionResult ? regressionResult.nextDayPrediction.toFixed(2) : '---'}
                                </h2>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded uppercase">Regression</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <i className="fa-solid fa-crystal-ball text-6xl -rotate-12"></i>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider text-[10px]">Model Fit (R²)</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl font-bold text-slate-900">
                                    {regressionResult ? (regressionResult.rSquared * 100).toFixed(1) : '0'}%
                                </h2>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence</span>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <i className="fa-solid fa-bullseye text-6xl rotate-45"></i>
                        </div>
                    </div>
                </div>

                {/* Main Graph Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Closing Price & Regression Trend</h3>
                            <p className="text-sm text-slate-500">Tracking {displayTicker} Performance Over Time</p>
                        </div>
                        {serverStatus === 'online' && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                LIVE SYNC ACTIVE
                            </span>
                        )}
                    </div>
                    <div className="p-6 h-[450px]">
                        <PredictionGraph data={enrichedData} prediction={regressionResult?.nextDayPrediction} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Data Entry & History */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-keyboard text-slate-400"></i>
                                Manual Entry
                            </h3>
                            <form onSubmit={handleAddData} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Closing Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 64.25"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full bg-slate-900 text-white font-semibold py-2 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        Add Entry
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Historical Log</h3>
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">{data.length} Entries</span>
                            </div>
                            <HistoryTable data={enrichedData} />
                        </div>
                    </div>

                    {/* AI Insights Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 ${category === 'flights' ? 'bg-orange-600' : 'bg-red-600'} rounded-full opacity-10 blur-2xl`}></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <i className={`fa-solid fa-sparkles ${category === 'flights' ? 'text-orange-500' : 'text-red-500'}`}></i>
                                        AI Insights
                                    </h3>
                                    {insights && (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${insights.sentiment === 'Bullish' ? 'bg-green-500' : insights.sentiment === 'Bearish' ? 'bg-red-500' : 'bg-blue-500'
                                            }`}>
                                            {insights.sentiment}
                                        </span>
                                    )}
                                </div>

                                {loadingInsights ? (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-700 rounded w-full"></div>
                                        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                                        <div className="h-24 bg-slate-700 rounded w-full mt-6"></div>
                                    </div>
                                ) : insights ? (
                                    <div className="space-y-4">
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {insights.analysis}
                                        </p>
                                        <div className="pt-4 border-t border-slate-800">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Market Action</p>
                                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 italic">
                                                <p className="text-sm font-medium text-white">
                                                    "{insights.recommendation}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <i className="fa-solid fa-brain text-4xl text-slate-700 mb-4"></i>
                                        <p className="text-slate-400 text-sm">Click 'AI Insights' to generate an analysis.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`${category === 'flights' ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'} border rounded-2xl p-6`}>
                            <h4 className={`${category === 'flights' ? 'text-orange-900' : 'text-red-900'} font-bold text-sm mb-2 flex items-center gap-2`}>
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                Algorithm Disclaimer
                            </h4>
                            <p className={`${category === 'flights' ? 'text-orange-700' : 'text-red-700'} text-[11px] leading-relaxed`}>
                                Linear regression assumes price trends follow a straight line.
                                It does not account for dividends, earnings calls, or volatility.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
