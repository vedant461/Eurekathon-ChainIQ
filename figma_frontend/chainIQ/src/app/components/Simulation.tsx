import React, { useState } from 'react';
import { KPIOverview } from './KPIOverview';
import { Play, RotateCcw, Activity } from 'lucide-react';
import api from '../../api/client';

export function Simulation() {
    const [loading, setLoading] = useState(false);
    const [impact, setImpact] = useState<any>(null); // To store simulation result

    // Scenario State
    const [supplierQCTime, setSupplierQCTime] = useState(24); // Hours
    const [oceanVariance, setOceanVariance] = useState(5);    // Days
    const [sortingEff, setSortingEff] = useState(85);         // %

    // Base KPIs (Could be fetched from API, hardcoded for baseline comparison)
    const baseKPIs = {
        delivery: 87.4,
        quality: 94.2,
        reliability: 78.9,
    };

    // Current or Simulated KPIs
    const currentKPIs = impact ? {
        delivery: baseKPIs.delivery + (impact.delta_applied * 0.5), // Mock impact logic
        quality: baseKPIs.quality,
        reliability: baseKPIs.reliability - (impact.delta_applied * 0.2),
    } : baseKPIs;

    const handleSimulate = async () => {
        setLoading(true);
        try {
            // Calling V2 Simulate Endpoint
            // We'll send one primary driver for now as the backend accepts single target
            // ID must match seed_data_v2.py (L2-PROC = Processing Speed)
            const payload = {
                target_metric_id: "L2-PROC",
                adjustment_factor: supplierQCTime - 24, // Delta from baseline
            };
            const res = await api.simulate(payload);
            setImpact(res.data);
        } catch (e) {
            console.error("Simulation failed", e);
            alert("Simulation failed. Check console for details."); // Add visible feedback
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSupplierQCTime(24);
        setOceanVariance(5);
        setSortingEff(85);
        setImpact(null);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Supply Chain Simulation</h2>
                    <p className="text-slate-500">Run "What-If" scenarios to predict network performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Scenario Builder */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Scenario Builder</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">Supplier B QC Time</label>
                                <span className="text-sm font-bold text-slate-900">{supplierQCTime} hrs</span>
                            </div>
                            <input
                                type="range" min="12" max="72" step="4"
                                value={supplierQCTime}
                                onChange={(e) => setSupplierQCTime(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>Fast (12h)</span>
                                <span>Slow (72h)</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">Ocean Transit Variance</label>
                                <span className="text-sm font-bold text-slate-900">±{oceanVariance} days</span>
                            </div>
                            <input
                                type="range" min="0" max="14" step="1"
                                value={oceanVariance}
                                onChange={(e) => setOceanVariance(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-700">Sorting Hub Efficiency</label>
                                <span className="text-sm font-bold text-slate-900">{sortingEff}%</span>
                            </div>
                            <input
                                type="range" min="50" max="100" step="5"
                                value={sortingEff}
                                onChange={(e) => setSortingEff(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Running...' : (
                                <>
                                    <Play className="w-4 h-4" fill="currentColor" /> Run Simulation
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right Panel: Impact Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Reusing KPI Overview for consistency */}
                    <div className="bg-slate-50/50 rounded-xl border border-slate-200/50 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Projected Impact</h3>
                        <KPIOverview kpis={currentKPIs} />
                    </div>

                    {impact && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4">
                            <h4 className="font-semibold text-slate-800 mb-3">AI Strategic Analysis</h4>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {impact.ai_analysis}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
