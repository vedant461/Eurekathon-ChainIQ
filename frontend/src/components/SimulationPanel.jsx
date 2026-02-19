import React, { useState } from 'react';
import axios from 'axios';
import { Sliders, Cpu, Activity } from 'lucide-react';

const SimulationPanel = ({ selectedMetric }) => {
    // If no metric selected from tree, show general info or allow searching.
    // Ideally, clicking a node in the tree sets 'selectedMetric'.

    const [adjustment, setAdjustment] = useState(0);
    const [simResult, setSimResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        if (!selectedMetric) return;
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/v2/simulate', {
                target_metric_id: selectedMetric.id,
                adjustment_factor: parseFloat(adjustment)
            });
            setSimResult(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg h-96 flex flex-col shadow-lg">
            {/* Header */}
            <div className="p-3 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Sliders className="w-4 h-4" />
                    WHAT-IF SIMULATION
                </div>
                {selectedMetric && <div className="text-xs text-gray-500">{selectedMetric.data.label}</div>}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {!selectedMetric ? (
                    <div className="text-gray-500 text-center mt-10 text-sm">
                        Select a node in the Metric Tree<br />to run a simulation.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Controls */}
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">
                                Adjust Variance (Today: {selectedMetric.data.variance}h)
                            </label>
                            <input
                                type="range"
                                min="-20"
                                max="20"
                                step="1"
                                value={adjustment}
                                onChange={(e) => setAdjustment(e.target.value)}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>-20h (Improve)</span>
                                <span className="text-white font-bold">{adjustment > 0 ? '+' : ''}{adjustment}h</span>
                                <span>+20h (Worsen)</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded font-bold text-sm transition-colors"
                        >
                            {loading ? 'CALCULATING IMPACT...' : 'RUN SIMULATION'}
                        </button>

                        {/* Results */}
                        {simResult && (
                            <div className="bg-black/50 p-3 rounded border border-gray-700 animate-fade-in">
                                <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                                    <Cpu className="w-3 h-3" /> AI PREDICTION
                                </div>
                                <div className="text-green-400 font-mono text-sm leading-relaxed typing-effect">
                                    {simResult.ai_analysis}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimulationPanel;
