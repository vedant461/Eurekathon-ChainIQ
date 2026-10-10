import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Download, Calendar, Filter, Loader2 } from 'lucide-react';
import api from '../../api/client';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

export function Reports() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.getEvents();
            setEvents(res.data);
        } catch (e) {
            console.error("Failed to fetch events", e);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        setInsightLoading(true);
        try {
            const res = await api.generateInsight({});
            setInsight(res.data);
        } catch (e) {
            setInsight("Unable to generate report at this time.");
        } finally {
            setInsightLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Reports</h2>
                    <p className="text-slate-500">Weekly friction analysis and event logs.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Last 7 Days
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Top Section: AI Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">AI Weekly Summary</h3>
                            <p className="text-sm text-slate-500">Automated analysis of top friction points</p>
                        </div>
                    </div>
                    <button
                        onClick={generateReport}
                        disabled={insightLoading}
                        className="text-sm text-purple-600 font-medium hover:text-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {insightLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate New Report'}
                    </button>
                </div>

                <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 min-h-[100px]">
                    {insight ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-sm max-w-none text-slate-700">
                            <p className="whitespace-pre-wrap leading-relaxed">{insight}</p>
                        </motion.div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                            Click "Generate New Report" to analyze recent bottlenecks.
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Recent Friction Events</h3>
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Node / Supplier</th>
                                <th className="px-6 py-3">Process Metric</th>
                                <th className="px-6 py-3">Variance</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                                        Loading events...
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No events found.</td>
                                </tr>
                            ) : (
                                events.map((event) => (
                                    <tr key={event.event_id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-slate-600">
                                            {new Date(event.recorded_at).toLocaleDateString()} <span className="text-xs text-slate-400">{new Date(event.recorded_at).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-3 font-medium text-slate-800">{event.node_name}</td>
                                        <td className="px-6 py-3 text-slate-600">
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                                                {event.process}
                                            </span>
                                        </td>
                                        <td className={clsx("px-6 py-3 font-medium", event.variance > 0 ? "text-amber-600" : "text-emerald-600")}>
                                            {event.variance > 0 ? '+' : ''}{event.variance} hrs
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-full text-xs font-semibold border",
                                                event.status === 'Critical'
                                                    ? "bg-red-50 text-red-700 border-red-100"
                                                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            )}>
                                                {event.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
