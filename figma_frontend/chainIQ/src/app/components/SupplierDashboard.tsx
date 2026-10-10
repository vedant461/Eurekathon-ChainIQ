import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    AlertCircle, Activity, TrendingUp, Clock, CheckCircle,
    Search, Play, RotateCcw, Box, Terminal
} from 'lucide-react';
import api from '../../api/client';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

export function SupplierDashboard() {
    const [kpis, setKpis] = useState<any>({
        "total_orders": 128,
        "avg_variance": 1.2,
        "otif": 96.5,
        "bottlenecks": [
            { "process": "Raw Material Sourcing", "variance": 18 },
            { "process": "Quality Control", "variance": 14 },
            { "process": "Packaging", "variance": 8 },
            { "process": "Shipping", "variance": 4 }
        ]
    });
    const [insight, setInsight] = useState<string | null>("Our AI has analyzed 128 completed orders. The primary constraint is 'Raw Material Sourcing', contributing to 18 hours of total variance. Implementing a secondary source for Arabica beans could improve your OTIF rate to 98.2%.");
    const [loading, setLoading] = useState(false);
    const [generatingInsight, setGeneratingInsight] = useState(false);

    // Mock Supplier ID - in real app would come from auth
    const supplierId = "sup-001 (Verdant Valley Growers)";

    const fetchData = async () => {
        // API Call Commented out for Marketing Video
        /*
        setLoading(true);
        // Use localProfile supplierId if available
        const saved = localStorage.getItem('userProfile');
        const localId = saved ? JSON.parse(saved).supplierId : supplierId;

        try {
            const res = await axios.get(`http://localhost:8000/api/v2/supplier/${localId}/performance`);
            setKpis(res.data);
        } catch (e) {
            console.error("Failed to load dashboard", e);
        } finally {
            setLoading(false);
        }
        */
    };

    useEffect(() => {
        fetchData();
    }, []);

    const generateReport = async () => {
        // Disabled for Marketing Video
        /*
        setGeneratingInsight(true);
        try {
            const res = await api.generateSupplierInsight(supplierId);
            setInsight(res.data.insight);
        } catch (e) {
            setInsight("AI Advisor is currently offline.");
        } finally {
            setGeneratingInsight(false);
        }
        */
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Loading Analytics...</div>;

    // Zero-State Handling - BYPASSED for Video
    /*
    if (!kpis || kpis.total_orders === 0) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performance & Analytics</h2>
                        <p className="text-slate-500">Real-time metrics for {supplierId}</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Refresh Analytics
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <BarChart className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Awaiting Performance Data</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-1">
                            Use the ERP Simulator to process and complete an order. Once an order is fully completed, your analytics will appear here instantly.
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <div className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
                            Status: Listening for 'Completed' orders...
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    */return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performance & Analytics</h2>
                    <p className="text-slate-500">Real-time metrics for {supplierId}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Refresh
                    </button>
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Live Telemetry
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                    title="Total Orders Processed"
                    value={kpis.total_orders}
                    icon={Box}
                    color="blue"
                    trend="Live Count"
                />
                <KpiCard
                    title="On-Time In Full (OTIF)"
                    value={`${kpis.otif}%`}
                    icon={CheckCircle}
                    color="emerald"
                    trend="Target: 95%"
                />
                <KpiCard
                    title="Avg Process Variance"
                    value={`${kpis.avg_variance}h`}
                    icon={Clock}

                    color="amber"
                    trend={kpis?.average_variance_hrs > 2 ? "High Variance detected" : "Within limits"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                        Process Bottleneck Analysis
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={kpis.bottlenecks} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" stroke="#94A3B8" fontSize={12} unit="h" />
                                <YAxis dataKey="process" type="category" width={100} stroke="#64748B" fontSize={12} tick={{ fill: '#475569' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#F1F5F9' }}
                                />
                                <Bar dataKey="variance" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={24}>
                                    {kpis.bottlenecks.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.variance > 2 ? '#EF4444' : '#4F46E5'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insight Panel */}
                <div className="bg-slate-900 text-slate-200 p-6 rounded-xl shadow-xl flex flex-col h-full border border-slate-800 relative overflow-hidden">
                    {/* Decorative grid */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm uppercase tracking-wider">
                                <Terminal className="w-5 h-5" />
                                Lean Six Sigma AI
                            </div>
                        </div>

                        <div className="flex-1 font-mono text-sm space-y-4 text-slate-300 overflow-y-auto min-h-[200px] mb-4">
                            {!insight ? (
                                <div className="opacity-50 italic">
                                    System Ready.<br />
                                    Waiting for analysis request...
                                </div>
                            ) : (
                                <div className="whitespace-pre-line leading-relaxed">
                                    <span className="text-emerald-400">Analysis Complete:</span>
                                    <br /><br />
                                    {insight}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={generateReport}
                            disabled={generatingInsight}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {generatingInsight ? (
                                <Activity className="w-5 h-5 animate-spin" />
                            ) : (
                                <Play className="w-5 h-5 fill-current" />
                            )}
                            {generatingInsight ? 'Analyzing Telemetry...' : 'Generate Process Improvement Plan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, color, trend }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
                </div>
                <div className={clsx("p-3 rounded-lg", colors[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span className={clsx("font-medium", color === 'amber' ? 'text-amber-600' : 'text-emerald-600')}>
                    {trend}
                </span>
            </div>
        </div>
    );
}
