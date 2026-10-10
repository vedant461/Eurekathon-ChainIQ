import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Package, ArrowRight, Loader2, CheckCircle, ShoppingCart } from 'lucide-react';
import api from '../../api/client';
import { motion, AnimatePresence } from 'motion/react';

export function Marketplace() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ good: '', location: '' });

    // Modal State
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [orderQuantity, setOrderQuantity] = useState(100);
    const [requiredDate, setRequiredDate] = useState(new Date().toISOString().split('T')[0]);
    const [ordering, setOrdering] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, [filters]);

    // Debounce filter or just fetch on effect
    const fetchSuppliers = async () => {
        try {
            const res = await api.getSuppliers(filters);
            setSuppliers(res.data);
        } catch (e) {
            console.error("Failed to fetch suppliers", e);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, val: string) => {
        setFilters(prev => ({ ...prev, [key]: val }));
    };

    const openOrderModal = (supplier: any) => {
        setSelectedSupplier(supplier);
        setOrderSuccess(false);
        setOrdering(false);
    };

    const handlePlaceOrder = async () => {
        setOrdering(true);
        try {
            const payload = {
                retailer_id: "ret-current-user", // Mock Retailer ID
                supplier_id: selectedSupplier.id,
                product: selectedSupplier.good, // Default to their main good
                quantity: Number(orderQuantity),
                required_date: requiredDate
            };
            await api.placeOrder(payload);
            setOrderSuccess(true);
            setTimeout(() => {
                setSelectedSupplier(null); // Close modal after success
            }, 1500);
        } catch (e) {
            alert("Failed to place order.");
        } finally {
            setOrdering(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Marketplace</h2>
                    <p className="text-slate-500">Discover verified suppliers and source materials.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search Goods (e.g. Coffee)"
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-emerald-500"
                            value={filters.good}
                            onChange={e => handleFilterChange('good', e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Location"
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-40 focus:ring-2 focus:ring-emerald-500"
                            value={filters.location}
                            onChange={e => handleFilterChange('location', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Finding Suppliers...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map(supplier => (
                        <motion.div
                            key={supplier.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{supplier.name}</h3>
                                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                        <MapPin className="w-3 h-3" /> {supplier.location}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-bold">
                                    <Star className="w-3 h-3 fill-amber-600" /> {supplier.rating}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-medium border border-emerald-100">
                                    <Package className="w-4 h-4" />
                                    Supplies: {supplier.good}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {supplier.tags.slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => openOrderModal(supplier)}
                                className="mt-6 w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
                            >
                                Request Order <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Order Modal */}
            <AnimatePresence>
                {selectedSupplier && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-lg text-slate-900">Place Order</h3>
                                <button onClick={() => setSelectedSupplier(null)} className="text-slate-400 hover:text-slate-600">
                                    &times;
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {orderSuccess ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900">Order Placed!</h4>
                                        <p className="text-slate-500 mt-2">The supplier has been notified.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Supplier</p>
                                            <div className="font-medium text-slate-900">{selectedSupplier.name}</div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Product</p>
                                            <div className="font-medium text-slate-900 flex items-center gap-2">
                                                <Package className="w-4 h-4 text-emerald-600" />
                                                {selectedSupplier.good}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={orderQuantity} onChange={e => setOrderQuantity(Number(e.target.value))}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-right"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Required Date</label>
                                                <input
                                                    type="date"
                                                    value={requiredDate} onChange={e => setRequiredDate(e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={ordering}
                                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            {ordering ? <Loader2 className="animate-spin w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                                            {ordering ? 'Placing Order...' : 'Confirm Order'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
