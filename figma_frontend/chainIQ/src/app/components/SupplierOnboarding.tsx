import React, { useState } from 'react';
import { Package, ArrowRight, CheckSquare, Square, Loader2, Sparkles, MapPin, Building, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function SupplierOnboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Step 1: Info State
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [role, setRole] = useState('Goods Supplier');
    const [suppliedGood, setSuppliedGood] = useState('');

    // Step 2: AI Process Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [processes, setProcesses] = useState<string[]>([]);
    const [selectedProcesses, setSelectedProcesses] = useState<Set<string>>(new Set());
    const [customProcess, setCustomProcess] = useState('');

    // Step 3: Metrics State
    const [metrics, setMetrics] = useState<Record<string, number>>({});

    // Handlers
    const handleGenerate = async () => {
        setIsAnalyzing(true);
        setProcesses([]);
        try {
            const res = await api.generateRoleProcesses({ role, supplied_good: suppliedGood });
            if (Array.isArray(res.data)) {
                setProcesses(res.data);
                // Auto-select all initially? Or none? Let's auto-select first 3.
                setSelectedProcesses(new Set(res.data.slice(0, 3)));
            }
        } catch (err) {
            console.error("AI Generation failed", err);
            setProcesses(["Intake", "Quality Check", "Storage"]);
        } finally {
            setIsAnalyzing(false);
            setStep(2);
        }
    };

    const toggleProcess = (proc: string) => {
        const newSet = new Set(selectedProcesses);
        if (newSet.has(proc)) {
            newSet.delete(proc);
            // remove from metrics if exists
            const newMetrics = { ...metrics };
            delete newMetrics[proc];
            setMetrics(newMetrics);
        } else {
            newSet.add(proc);
        }
        setSelectedProcesses(newSet);
    };

    const addCustomProcess = () => {
        if (!customProcess.trim()) return;
        if (!processes.includes(customProcess)) {
            setProcesses([...processes, customProcess]);
            toggleProcess(customProcess); // Select it
        }
        setCustomProcess('');
    };

    const handleMetricChange = (proc: string, val: string) => {
        setMetrics(prev => ({ ...prev, [proc]: parseFloat(val) || 0 }));
    };

    const handleSubmit = async () => {
        // Prepare payload for PostgreSQL
        const payload = {
            company_name: companyName,
            location: location,
            role: role,
            supplied_good: suppliedGood,
            processes: Array.from(selectedProcesses)
        };

        try {
            // Call Backend
            const res = await axios.post('http://localhost:8000/api/v2/suppliers', payload);

            if (res.data.status === 'created' || res.data.status === 'existing') {
                const profile = {
                    supplierId: res.data.supplier_id, // Save the ID!
                    companyName,
                    location,
                    role,
                    suppliedGood,
                    processes: payload.processes
                };
                localStorage.setItem('userProfile', JSON.stringify(profile));
                navigate('/profile');
            }
        } catch (e) {
            console.error(e);
            alert("Failed to create supplier profile. Backend may be down.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                    <span>Step {step} of 3</span>
                    <span className="font-semibold text-emerald-600">{step === 1 ? 'Basic Info' : step === 2 ? 'Process Definition' : 'Baseline Metrics'}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                    />
                </div>
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm"
            >
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Let's set up your profile</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={companyName} onChange={e => setCompanyName(e.target.value)}
                                        className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Acme Logistics Inc."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                <select
                                    value={role} onChange={e => setRole(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option>Goods Supplier</option>
                                    <option>Food Processor</option>
                                    <option>Quality Checker</option>
                                    <option>Logistics Provider</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Location (Hub ID)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={location} onChange={e => setLocation(e.target.value)}
                                        className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        placeholder="e.g. NYC-HUB-01"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Main Supplied Good</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={suppliedGood} onChange={e => setSuppliedGood(e.target.value)}
                                        className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        placeholder="e.g. Raw Coffee Beans"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={!companyName || !suppliedGood || isAnalyzing}
                                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isAnalyzing ? <><Loader2 className="animate-spin w-4 h-4" /> Analyzing...</> : <>Next Step <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Select Your Processes</h2>
                        <p className="text-slate-500">AI suggested these steps based on your role. Select all that apply.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                            {processes.map((proc, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => toggleProcess(proc)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${selectedProcesses.has(proc)
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                        : 'bg-white border-slate-200 hover:border-emerald-300'
                                        }`}
                                >
                                    {selectedProcesses.has(proc) ? (
                                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                        <Square className="w-5 h-5 text-slate-300" />
                                    )}
                                    <span className="font-medium">{proc}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={customProcess}
                                onChange={e => setCustomProcess(e.target.value)}
                                placeholder="Add custom process tag..."
                                className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                                onKeyDown={e => e.key === 'Enter' && addCustomProcess()}
                            />
                            <button
                                onClick={addCustomProcess}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-slate-100">
                            <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 font-medium">Back</button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={selectedProcesses.size === 0}
                                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                Define Metrics <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Baseline Metrics</h2>
                        <p className="text-slate-500">Estimate the minimum time required for each process step.</p>

                        <div className="space-y-4">
                            {Array.from(selectedProcesses).map(proc => (
                                <div key={proc} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="font-medium text-slate-800">{proc}</span>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-24 p-2 border border-slate-200 rounded-lg text-right"
                                            onChange={e => handleMetricChange(proc, e.target.value)}
                                        />
                                        <span className="text-sm text-slate-500 w-12">Hours</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between pt-4 border-t border-slate-100">
                            <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-800 font-medium">Back</button>
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-200 font-medium flex items-center gap-2"
                            >
                                <CheckSquare className="w-4 h-4" /> Finalize Profile
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
