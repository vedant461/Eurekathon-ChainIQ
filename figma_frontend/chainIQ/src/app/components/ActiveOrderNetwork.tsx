import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface Order {
    order_id: string;
    batch_id: string;
    product: string;
    supplier: string;
    status: string; // 'Delayed', 'On Track', etc.
    variance_hrs: number;
    date: string;
}

interface ActiveOrderNetworkProps {
    orders: Order[];
}

export function ActiveOrderNetwork({ orders }: ActiveOrderNetworkProps) {
    if (!orders || orders.length === 0) {
        return <div className="p-4 text-center text-slate-400 text-sm">No active orders found.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="px-4 py-3 font-medium">Batch ID</th>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Supplier</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium text-center">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Variance</th>
                        <th className="px-4 py-3 font-medium"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => {
                        const isDelayed = order.status === 'Delayed';
                        return (
                            <tr
                                key={order.batch_id}
                                className={clsx(
                                    "group transition-colors hover:bg-slate-50",
                                    isDelayed ? "bg-red-50/30 hover:bg-red-50/50" : ""
                                )}
                            >
                                <td className="px-4 py-3 font-medium text-slate-900">
                                    <Link to={`/tracker/${order.batch_id}`} className="hover:underline text-indigo-600">
                                        {order.batch_id}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{order.product}</td>
                                <td className="px-4 py-3 text-slate-500">{order.supplier}</td>
                                <td className="px-4 py-3 text-slate-400 text-xs">{order.date}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={clsx(
                                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        isDelayed
                                            ? "bg-red-50 text-red-700 border-red-100"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    )}>
                                        {isDelayed ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-slate-600">
                                    {order.variance_hrs > 0 ? `+${order.variance_hrs}h` : '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        to={`/tracker/${order.batch_id}`}
                                        className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
