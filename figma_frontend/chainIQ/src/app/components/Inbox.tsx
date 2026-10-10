import React, { useState, useEffect } from 'react';
import { Inbox as InboxIcon, CheckCircle, Clock, Package, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { motion, AnimatePresence } from 'motion/react';

export function Inbox() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptedOrder, setAcceptedOrder] = useState<any>(null);

    // For demo: act as "sup-001" (Global Foods) by default so we see orders placed in Marketplace
    const supplierId = "sup-001";

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.getSupplierOrders(supplierId);
            setOrders(res.data);
        } catch (e) {
            console.error("Failed to fetch orders", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (order: any) => {
        try {
            const res = await api.acceptOrder(order.order_id);
            setAcceptedOrder({ ...order, batch_id: res.data.batch_id });
            // Refresh list
            fetchOrders();
        } catch (e) {
            alert("Failed to accept order");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Order Inbox</h2>
                    <p className="text-slate-500">Manage incoming purchase orders.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live (Simulated as Global Foods Ltd)
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading Orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <InboxIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No Pending Orders</h3>
                    <p className="text-slate-500">New orders from the marketplace will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {orders.map(order => (
                        <motion.div
                            key={order.order_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                        Pending
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">ID: {order.order_id.slice(0, 8)}...</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    {order.product}
                                    <span className="text-slate-400 font-normal">x {order.quantity} units</span>
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Package className="w-4 h-4" /> Retailer ID: {order.retailer_id}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> Due: {order.required_date}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAccept(order)}
                                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2 whitespace-nowrap"
                            >
                                Accept Order <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Success Modal */}
            <AnimatePresence>
                {acceptedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-emerald-600 p-6 text-white text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold">Order Accepted!</h3>
                                <p className="opacity-90">Production has been scheduled.</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-indigo-900 font-bold mb-2">
                                        <AlertCircle className="w-5 h-5" />
                                        ERP Tracking ID (Batch ID)
                                    </h4>
                                    <p className="text-sm text-indigo-700 mb-3">
                                        Configure your manufacturing equipment to tag all telemetry with this ID:
                                    </p>
                                    <code className="block bg-white p-3 rounded-lg border border-indigo-200 text-indigo-600 font-mono text-center font-bold text-lg select-all">
                                        {acceptedOrder.batch_id}
                                    </code>
                                </div>

                                <div className="text-center text-sm text-slate-500">
                                    This ID links the order to the <b>Pizza Tracker</b> UI for the retailer.
                                </div>

                                <button
                                    onClick={() => setAcceptedOrder(null)}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
