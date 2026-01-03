
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { StockDataPoint } from '../types';

interface PredictionGraphProps {
  data: StockDataPoint[];
  prediction?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Filter out null/undefined values (like the placeholder price)
    const validPayload = payload.filter((p: any) => p.value !== null && p.value !== undefined);

    if (validPayload.length === 0) return null;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
        <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
        <div className="space-y-1">
          {validPayload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                <span className="text-xs text-slate-600 font-medium">{p.name}:</span>
              </div>
              <span className="text-xs font-bold text-slate-900">${p.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PredictionGraph: React.FC<PredictionGraphProps> = ({ data, prediction }) => {
  // Add an extra point for future prediction
  const chartData = [...data];
  if (prediction !== undefined && data.length > 0) {
    const lastDate = new Date(data[data.length - 1].date);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + 1);

    chartData.push({
      id: 'prediction',
      date: nextDate.toISOString().split('T')[0],
      price: null as any, // Placeholder that won't be plotted
      prediction: prediction
    });
  }

  // Format dates for display
  const formattedData = chartData.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const minPrice = Math.min(...data.map(d => d.price)) * 0.99;
  const maxPrice = Math.max(...data.map(d => d.price), prediction || 0) * 1.01;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={formattedData}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          dy={10}
        />
        <YAxis
          domain={[minPrice, maxPrice]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickFormatter={(val) => `$${val}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          align="right"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="price"
          name="Closing Area"
          stroke="none"
          fillOpacity={1}
          fill="url(#colorPrice)"
        />
        <Line
          type="monotone"
          dataKey="price"
          name="Actual Price"
          stroke="#ef4444"
          strokeWidth={3}
          dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="prediction"
          name="Regression Trend"
          stroke="#475569"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default PredictionGraph;
