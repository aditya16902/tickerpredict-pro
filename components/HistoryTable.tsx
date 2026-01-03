
import React from 'react';
import { StockDataPoint } from '../types';

interface HistoryTableProps {
  data: StockDataPoint[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ data }) => {
  const reversedData = [...data].reverse();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Closing Price</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Previous Prediction</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Accuracy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reversedData.map((item) => {
            const error = item.prediction ? Math.abs(item.price - item.prediction) : null;
            const accuracy = error !== null ? (1 - error / item.price) * 100 : null;

            return (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {item.prediction ? `$${item.prediction.toFixed(2)}` : '---'}
                </td>
                <td className="px-6 py-4">
                  {accuracy !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${accuracy > 99 ? 'bg-green-500' : accuracy > 95 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(accuracy, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">{accuracy.toFixed(1)}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No historical data</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          <i className="fa-solid fa-database text-3xl mb-2"></i>
          <p>No ticker data found. Start by adding a closing price.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
