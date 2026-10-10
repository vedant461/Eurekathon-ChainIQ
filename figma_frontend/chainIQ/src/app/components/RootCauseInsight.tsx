import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import api from '../../api/client';

const data = [
  { name: 'Sorting Delay', value: 54, color: '#ef4444' }, // red-500
  { name: 'Customs', value: 23, color: '#f59e0b' },      // amber-500
  { name: 'Transport', value: 12, color: '#cbd5e1' },    // slate-300
  { name: 'Other', value: 11, color: '#cbd5e1' },        // slate-300
];

export function RootCauseInsight() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.generateInsight({}); // Backend V1 endpoint uses DB context internally
      // Res.data is the string content
      setAnalysis(res.data);
    } catch (e) {
      console.error("AI Error", e);
      setAnalysis("Unable to generate insight. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-semibold text-slate-800 mb-1">Root Cause Insight</h3>
      <p className="text-xs text-slate-500 mb-4">Primary contributor to delivery delay</p>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={80}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 600 }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Impact: High</span>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? 'Analyzing...' : 'View Analysis'}
          </button>
        </div>

        {/* AI Output Terminal */}
        {analysis && (
          <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-emerald-400 mt-2 border border-slate-800 shadow-inner">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span className="text-slate-400">AI_ANALYSIS_LOG</span>
            </div>
            <p className="whitespace-pre-wrap">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}
