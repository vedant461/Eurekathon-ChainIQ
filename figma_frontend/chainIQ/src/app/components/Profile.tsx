import React, { useState, useEffect } from 'react';
import { User, Key, Terminal, Send, Upload, FileText, CheckCircle, Copy, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';

export function Profile() {
    const [profile, setProfile] = useState<any>(null);
    const [apiKey, setApiKey] = useState('sk_live_' + Math.random().toString(36).substr(2, 9));
    const [logStatus, setLogStatus] = useState<'idle' | 'success'>('idle');

    // Manual Log State
    const [selectedProcess, setSelectedProcess] = useState('');
    const [variance, setVariance] = useState(0);
    const [batchId, setBatchId] = useState('');

    // OCR State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/api/v2/ocr/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setUploadResult(response.data.extracted);
            } else {
                console.error("Backend Error:", response.data.message);
                alert(`OCR Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error("OCR Failed", error);
            alert("Failed to process image. Server may be down or model missing.");
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            const saved = localStorage.getItem('userProfile');
            if (saved) {
                const localProfile = JSON.parse(saved);

                // 1. Fetch latest profile from DB (for processes)
                if (localProfile.supplierId) {
                    try {
                        const profRes = await axios.get(`http://localhost:8000/api/v2/suppliers/${localProfile.supplierId}`);
                        const dbProfile = profRes.data;

                        setProfile({
                            ...localProfile,
                            processes: dbProfile.processes // Use DB processes
                        });

                        // 2. Fetch Active Order (for Batch ID)
                        const orderRes = await axios.get(`http://localhost:8000/api/v2/orders/supplier/${localProfile.supplierId}/active`);
                        if (orderRes.data.active) {
                            setBatchId(orderRes.data.batch_id);
                            // Pre-select first process if available
                            if (dbProfile.processes && dbProfile.processes.length > 0) {
                                setSelectedProcess(dbProfile.processes[0]);
                            }
                        }
                    } catch (e) {
                        console.error("Failed to fetch dynamic data", e);
                        setProfile(localProfile); // Fallback
                    }
                } else {
                    setProfile(localProfile);
                }
            }
        };

        fetchProfileData();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        // Could add toast here
    };

    const handleLogEvent = async () => {
        if (!batchId) {
            alert("No active batch ID found. Cannot log event.");
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/v2/webhook/erp', {
                batch_id: batchId,
                step_name: selectedProcess,
                variance_hrs: variance,
                status: "Pending"
            });
            setLogStatus('success');
            setTimeout(() => setLogStatus('idle'), 2000);
        } catch (e) {
            console.error(e);
            alert("Failed to log event.");
        }
    };

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <User className="w-12 h-12 mb-4 text-slate-300" />
                <p>No profile found. Please complete onboarding first.</p>
                <a href="/suppliers" className="text-emerald-600 hover:underline mt-2">Go to Onboarding</a>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Supplier Profile</h2>
                    <p className="text-slate-500">Manage your API credentials and manual event logging.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Credentials */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{profile.companyName}</h3>
                                <p className="text-sm text-slate-500">{profile.role}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your API Key</label>
                                <div className="flex mt-1">
                                    <code className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-l-lg text-sm text-slate-700 font-mono truncate">
                                        {apiKey}
                                    </code>
                                    <button
                                        onClick={handleCopy}
                                        className="bg-slate-100 hover:bg-slate-200 border border-l-0 border-slate-200 px-3 rounded-r-lg text-slate-600"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Integration Snippet</label>
                                <div className="mt-1 bg-slate-900 rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
                                    <p>curl -X POST https://api.metrigo.io/v1/events \</p>
                                    <p className="pl-4">-H "Authorization: Bearer {apiKey}" \</p>
                                    <p className="pl-4">-d '{`{"process": "${profile.processes[0]?.name || 'Sorting'}", "status": "OK"}`}'</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Logging tools */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Manual Logging */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Send className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Manual Event Logging</h3>
                                <p className="text-sm text-slate-500">Log ad-hoc process completions.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Process Step</label>
                                <select
                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                    value={selectedProcess} onChange={e => setSelectedProcess(e.target.value)}
                                >
                                    <option value="">Select Process...</option>
                                    {profile.processes.map((p: any) => (
                                        <option key={p.name || p} value={p.name || p}>{p.name || p}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Variance (Hours)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                    value={variance} onChange={e => setVariance(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleLogEvent}
                                disabled={!selectedProcess}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {logStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                {logStatus === 'success' ? 'Event Logged' : 'Log Event'}
                            </button>
                        </div>
                    </div>

                    {/* OCR Dropzone */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Smart Document Ingestion</h3>
                                <p className="text-sm text-slate-500">Upload PDF reports to auto-extract metrics.</p>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-400 transition-colors cursor-pointer bg-slate-50 relative group">

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                            />

                            {isUploading ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                                    <p className="text-sm font-bold text-emerald-600">Moondream AI Analyzing...</p>
                                    <p className="text-xs text-slate-400 mt-1">Extracting handwriting metrics</p>
                                </div>
                            ) : uploadResult ? (
                                <div className="flex flex-col items-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-3" />
                                    <p className="text-sm font-bold text-slate-900">Document Processed!</p>
                                    <div className="mt-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-100">
                                        Extracted: <b>{uploadResult.step_name}</b> <br />
                                        Variance: <b>{uploadResult.variance_hrs} hrs</b>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG (Max 10MB)</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
