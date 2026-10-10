import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowUpRight, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { clsx } from 'clsx';

interface Supplier {
  id: string;
  name: string;
  rank: number;
  delivery: number;
  quality: number;
  reliability: number;
  trend: 'up' | 'down' | 'stable';
}

const suppliers: Supplier[] = [
  { id: 'sp1', name: 'Global Logistics Inc.', rank: 1, delivery: 96.5, quality: 99.1, reliability: 94.2, trend: 'up' },
  { id: 'sp2', name: 'FastTrack Shipping', rank: 2, delivery: 92.1, quality: 95.4, reliability: 89.8, trend: 'stable' },
  { id: 'sp3', name: 'Oceanic Transport', rank: 3, delivery: 84.3, quality: 88.7, reliability: 76.5, trend: 'down' },
  { id: 'sp4', name: 'Rapid Cargo Ltd.', rank: 4, delivery: 78.9, quality: 82.1, reliability: 71.4, trend: 'down' },
  { id: 'sp5', name: 'Prime Haulers', rank: 5, delivery: 72.5, quality: 78.3, reliability: 65.2, trend: 'down' },
];

export function SupplierComparison() {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const getHeatmapColor = (val: number) => {
    if (val >= 95) return 'bg-emerald-100 text-emerald-800';
    if (val >= 90) return 'bg-emerald-50 text-emerald-700';
    if (val >= 85) return 'bg-sky-50 text-sky-700';
    if (val >= 80) return 'bg-amber-50 text-amber-700';
    if (val >= 70) return 'bg-orange-50 text-orange-700';
    return 'bg-rose-50 text-rose-700';
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="p-4 w-16 text-center">Rank</th>
            <th className="p-4">Supplier Name</th>
            <th className="p-4 text-center">Delivery (OTIF)</th>
            <th className="p-4 text-center">Quality Rate</th>
            <th className="p-4 text-center">Reliability</th>
            <th className="p-4 text-right">Trend</th>
            <th className="p-4 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <React.Fragment key={supplier.id}>
              <motion.tr 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelectedSupplier(selectedSupplier === supplier.id ? null : supplier.id)}
                className={clsx(
                  "border-b border-slate-100 transition-colors cursor-pointer group",
                  selectedSupplier === supplier.id ? "bg-emerald-50/30" : "hover:bg-slate-50"
                )}
              >
                <td className="p-4 text-center">
                  <span className={clsx(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    supplier.rank <= 3 ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600"
                  )}>
                    {supplier.rank}
                  </span>
                </td>
                <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                  {supplier.name}
                  {supplier.rank === 1 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">Top Performer</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded font-medium text-sm ${getHeatmapColor(supplier.delivery)}`}>
                    {supplier.delivery}%
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded font-medium text-sm ${getHeatmapColor(supplier.quality)}`}>
                    {supplier.quality}%
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded font-medium text-sm ${getHeatmapColor(supplier.reliability)}`}>
                    {supplier.reliability}%
                  </span>
                </td>
                <td className="p-4 text-right">
                  {supplier.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500 ml-auto" />}
                  {supplier.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500 ml-auto" />}
                  {supplier.trend === 'stable' && <div className="w-4 h-0.5 bg-slate-300 ml-auto my-2" />}
                </td>
                <td className="p-4 text-right">
                  <ChevronRight className={clsx(
                    "w-5 h-5 text-slate-400 transition-transform",
                    selectedSupplier === supplier.id && "rotate-90"
                  )} />
                </td>
              </motion.tr>
              
              <AnimatePresence>
                {selectedSupplier === supplier.id && (
                  <motion.tr
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-50/50"
                  >
                    <td colSpan={7} className="p-0 border-b border-slate-100">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-4">
                           <div className="flex justify-between items-center">
                             <h4 className="font-semibold text-slate-800">Performance Breakdown</h4>
                             <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                               View Full Profile <ArrowUpRight className="w-4 h-4" />
                             </button>
                           </div>
                           <div className="grid grid-cols-3 gap-4">
                              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Avg. Lead Time</span>
                                <p className="text-xl font-bold text-slate-900 mt-1">12.4 Days</p>
                                <span className="text-xs text-emerald-600 font-medium">-2.1 days vs avg</span>
                              </div>
                              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Fill Rate</span>
                                <p className="text-xl font-bold text-slate-900 mt-1">98.2%</p>
                                <span className="text-xs text-emerald-600 font-medium">+1.4% vs avg</span>
                              </div>
                              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Cost / Unit</span>
                                <p className="text-xl font-bold text-slate-900 mt-1">$42.50</p>
                                <span className="text-xs text-rose-600 font-medium">+$1.20 vs avg</span>
                              </div>
                           </div>
                           
                           <div className="bg-white p-4 rounded-lg border border-slate-200">
                             <h5 className="text-sm font-medium text-slate-700 mb-2">Recent Incidents</h5>
                             <ul className="space-y-2">
                               <li className="flex items-start gap-2 text-sm text-slate-600">
                                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                 Customs clearance delay at Port of LA (2 days impact) - Feb 14, 2026
                               </li>
                               <li className="flex items-start gap-2 text-sm text-slate-600">
                                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                 Packaging compliance warning - Jan 28, 2026
                               </li>
                             </ul>
                           </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <span className="text-3xl font-bold text-slate-900">{supplier.rank}</span>
                          </div>
                          <h4 className="font-semibold text-slate-800">Overall Rank</h4>
                          <p className="text-sm text-slate-500 mt-1">Top {Math.round((supplier.rank / 50) * 100)}% of suppliers</p>
                          <div className="mt-6 w-full space-y-2">
                            <button className="w-full py-2 px-4 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                              Contact Supplier
                            </button>
                            <button className="w-full py-2 px-4 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                              Download Scorecard
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
