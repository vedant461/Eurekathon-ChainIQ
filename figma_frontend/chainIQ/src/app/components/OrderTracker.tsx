import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Box, Activity, AlertTriangle, Terminal, Loader2 } from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { usePersona } from '../../context/PersonaContext';

interface TelemetryStep {
    step_name: string;
    status: 'Completed' | 'Delayed' | 'Pending';
    variance_hrs: number;
    timestamp: string;
    sub_tracks?: TelemetryStep[];
}

interface LineageData {
    order_id: string;
    product_name: string;
    quantity: number;
    supplier_name: string;
    date_promised: string;
    date_actual_projected: string;
    telemetry: TelemetryStep[];
}

export function OrderTracker() {
    const { batchId } = useParams();
    const { persona } = usePersona();
    const [data, setData] = useState<LineageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use batchId as order_id or default to 'ORD-2024-001' if testing without params
                const id = batchId || 'ORD-2024-001';
                const response = await axios.get(`http://localhost:8000/api/orders/${id}/lineage`);
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch lineage", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [batchId]);

    const handleAnalyze = async () => {
        if (!data) return;
        setAnalyzing(true);
        setAiAnalysis(null);
        try {
            const response = await axios.post(`http://localhost:8000/api/v2/orders/${data.order_id}/analyze`, {
                lineage: data
            });
            setAiAnalysis(response.data.analysis);
        } catch (error) {
            setAiAnalysis("Error: Could not connect to AI Neural Core.");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
    );

    if (!data) return <div>Order not found.</div>;

    const isDelayed = new Date(data.date_actual_projected) > new Date(data.date_promised)
        || data.telemetry.some(s => s.status === 'Delayed');

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Navigation */}
            <div className="flex items-center gap-4">
                <Link to="/my-orders" className="p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Order Diagnostics</h1>
            </div>

            {/* Header Card (Top Bar) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    {/* Left: Product & ID */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-900">{data.order_id}</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                Qty: {data.quantity}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium">{data.product_name}</p>
                        <p className="text-sm text-slate-400">Supplier: {data.supplier_name}</p>
                    </div>

                    {/* Right: Dates */}
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Promised Delivery</p>
                            <div className="flex items-center justify-end gap-2 text-slate-700 font-semibold">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {data.date_promised}
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Projected Delivery</p>
                            <div className={clsx(
                                "flex items-center justify-end gap-2 font-bold",
                                isDelayed ? "text-red-600" : "text-emerald-600"
                            )}>
                                <Clock className={clsx("w-4 h-4", isDelayed ? "text-red-500" : "text-emerald-500")} />
                                {data.date_actual_projected}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Shell */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Vertical Tree */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Live Supply Chain Lineage</h3>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-3 top-3 bottom-10 w-0.5 bg-slate-200" />

                            <div className="space-y-10 pl-10 relative">
                                {data.telemetry.filter(step => {
                                    // Persona Visibility Logic
                                    if (persona === 'retailer') return true; // Show everything
                                    if (persona === 'tier1_supplier') {
                                        // Hide Retail Logistics
                                        return step.step_name !== 'Retail Logistics';
                                    }
                                    if (persona === 'tier2_supplier') {
                                        // Show ONLY Raw Material Sourcing
                                        return step.step_name === 'Raw Material Sourcing';
                                    }
                                    return true;
                                }).map((step, idx) => {
                                    const isCompleted = step.status === 'Completed';
                                    const isDelayed = step.status === 'Delayed';
                                    const isPending = step.status === 'Pending';

                                    return (
                                        <div key={idx} className="relative group">
                                            {/* Node Indicator */}
                                            <div className={clsx(
                                                "absolute -left-[2.35rem] top-0.5 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center transition-all duration-300",
                                                isCompleted ? "bg-emerald-500" :
                                                    isDelayed ? "bg-red-500 animate-pulse" :
                                                        "bg-slate-200"
                                            )}>
                                                {isCompleted && <div className="w-2 h-2 rounded-full bg-white" />}
                                                {isDelayed && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <h4 className={clsx(
                                                        "text-lg font-bold transition-colors",
                                                        isCompleted ? "text-slate-900" :
                                                            isDelayed ? "text-red-600" :
                                                                "text-slate-400"
                                                    )}>
                                                        {step.step_name}
                                                    </h4>

                                                    {isDelayed ? (
                                                        <div className="mt-1 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full w-fit">
                                                            <AlertTriangle className="w-4 h-4" />
                                                            <span className="text-sm font-bold">Delayed (+{step.variance_hrs} hrs variance)</span>
                                                        </div>
                                                    ) : isCompleted ? (
                                                        <div className="mt-1 flex items-center gap-2 text-emerald-600">
                                                            <span className="text-sm font-medium">Completed successfully</span>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1 text-slate-400 text-sm italic">
                                                            Scheduled
                                                        </div>
                                                    )}

                                                    {/* Sub-Tracks (Recursive Tier 2) */}
                                                    {step.sub_tracks && step.sub_tracks.length > 0 && (
                                                        <div className="mt-4 ml-2 pl-4 border-l-2 border-slate-100 space-y-4">
                                                            {step.sub_tracks.map((sub: TelemetryStep, sIdx: number) => (
                                                                <div key={sIdx} className="relative">
                                                                    {/* Sub-node dot */}
                                                                    <div className={clsx(
                                                                        "absolute -left-[1.35rem] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                                                        sub.status === 'Completed' ? "bg-emerald-400" :
                                                                            sub.status === 'Delayed' ? "bg-red-400" : "bg-slate-300"
                                                                    )} />

                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-slate-700">{sub.step_name}</p>
                                                                            {sub.status === 'Delayed' && (
                                                                                <span className="text-xs text-red-500 font-medium">Tier 2 Delay ({sub.variance_hrs}h)</span>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-xs text-slate-400 font-mono">{sub.timestamp.split(' ')[1] + ' ' + sub.timestamp.split(' ')[2]}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Timestamp */}
                                                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-xs font-mono font-medium">{step.timestamp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Column: AI Analyst */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 h-full text-white flex flex-col">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Terminal className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Order Diagnostics</h3>
                                <p className="text-xs text-slate-400">AI Recovery Agent</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 font-mono text-sm leading-relaxed overflow-y-auto max-h-[400px]">
                            {!aiAnalysis && !analyzing && (
                                <div className="text-slate-500 italic">
                                    <p>System ready.</p>
                                    <p>Click below to analyze telemetry and generate recovery protocols.</p>
                                </div>
                            )}

                            {analyzing && (
                                <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Analyzing telemetry patterns...</span>
                                </div>
                            )}

                            {aiAnalysis && (
                                <div className="text-emerald-300 whitespace-pre-wrap">
                                    <span className="text-emerald-500 font-bold">{">"} ANALYSIS COMPLETE:</span>
                                    <br /><br />
                                    {aiAnalysis}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
                            >
                                {analyzing ? (
                                    "Processing..."
                                ) : (
                                    <>
                                        <Activity className="w-4 h-4" />
                                        Generate Recovery Strategy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
