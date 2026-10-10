import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, CheckCircle, ArrowRight, Loader2, Search, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

export function RetailerOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Retailer ID used in Marketplace
    const retailerId = "ret-current-user";

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.getRetailerOrders(retailerId);
            setOrders(res.data);
        } catch (e) {
            console.error("Failed to fetch orders", e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200 icon-amber-500';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200 icon-blue-500';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200 icon-emerald-500';
            case 'DELAYED': return 'bg-red-100 text-red-700 border-red-200 icon-red-500';
            default: return 'bg-slate-100 text-slate-700 border-slate-200 icon-slate-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return Clock;
            case 'IN_PROGRESS': return Truck;
            case 'COMPLETED': return CheckCircle;
            case 'DELAYED': return AlertCircle;
            default: return Package;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Active Orders</h2>
                    <p className="text-slate-500">Track shipment status and order lineage.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search Order ID or Product"
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
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
                        <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No Orders Yet</h3>
                    <p className="text-slate-500 mb-4">Visit the marketplace to place your first order.</p>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
                        Go to Marketplace
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {orders.map((order, idx) => {
                        const StatusIcon = getStatusIcon(order.status);
                        const colorClass = getStatusColor(order.status);

                        return (
                            <motion.div
                                key={order.order_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={clsx("text-xs font-bold px-2 py-1 rounded uppercase tracking-wide border flex items-center gap-1", colorClass)}>
                                                <StatusIcon className="w-3 h-3" />
                                                {order.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">Order #{order.order_id.slice(0, 8)}</span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-500">Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">{order.product}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                            <span>Quantity: {order.quantity}</span>
                                            <span>Supplier: {order.supplier_id}</span>
                                            {order.batch_id && (
                                                <span className="font-mono text-xs bg-slate-100 px-1 rounded text-slate-600">
                                                    Batch: {order.batch_id.slice(0, 8)}...
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {order.status === 'IN_PROGRESS' && (
                                            <Link
                                                to={order.batch_id ? `/tracker/${order.batch_id}` : '#'}
                                                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 hover:border-emerald-300 flex items-center gap-2 group transition-colors"
                                            >
                                                Track Shipment <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
