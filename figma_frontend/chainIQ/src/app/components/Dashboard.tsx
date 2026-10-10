import React, { useState, useEffect } from 'react';
import { KPIOverview } from './KPIOverview';
import { ActiveOrderNetwork } from './ActiveOrderNetwork';
import { RootCauseInsight } from './RootCauseInsight';
import { SupplierComparison } from './SupplierComparison';
import { motion } from 'motion/react';
import api from '../../api/client';
import { AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const [kpiData, setKpiData] = useState({
    active_orders: "1,402",
    orders_at_risk: 14,
    otif_rate: "94.8%",
  });
  const [activeOrdersList, setActiveOrdersList] = useState<any[]>([
    { "batch_id": "BATCH-404", "product": "Premium Arabica Beans", "supplier": "Verdant Valley Growers", "status": "Delayed", "variance_hrs": 4 },
    { "batch_id": "BATCH-892", "product": "Organic Cacao Butter", "supplier": "Equatorial Farms", "status": "On Track", "variance_hrs": 0 },
    { "batch_id": "BATCH-901", "product": "Himalayan Sea Salt", "supplier": "OceanMin Inc.", "status": "On Track", "variance_hrs": 0 },
    { "batch_id": "BATCH-112", "product": "Robusta Coffee Beans", "supplier": "Highland Roasters", "status": "Delayed", "variance_hrs": 12 }
  ]);
  const [aiAlerts, setAiAlerts] = useState<any[]>([
    { "severity": "high", "message": "BATCH-404: Quality Control delay of 4 hours at Verdant Valley Growers. Mitigation protocol active." },
    { "severity": "medium", "message": "Port Congestion Warning: 3 shipments of Raw Cocoa delayed at Port of Santos." },
    { "severity": "low", "message": "Supplier 'OceanMin' weather alert: 12-hour harvest delay expected next week." }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // API Call Commented out for Marketing Video
    /*
    const fetchData = async () => {
      try {
        const res = await api.get('/api/v2/dashboard/control-tower');
        const { kpis, ai_alerts, active_orders } = res.data;

        setKpiData({
          active_orders: kpis.active_orders,
          orders_at_risk: kpis.orders_at_risk,
          otif_rate: kpis.otif_rate
        });
        setActiveOrdersList(active_orders);
        setAiAlerts(ai_alerts);
      } catch (e) {
        console.error("Dashboard Fetch Error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    */
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Retailer Control Tower</h2>
          <p className="text-slate-500">Real-time network oversight for MegaMart (HQ).</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Data: {loading ? 'Syncing...' : 'Connected'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Orders</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{kpiData.active_orders}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+2 this week</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Orders at Risk</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${kpiData.orders_at_risk > 0 ? "text-red-600" : "text-slate-900"}`}>
              {kpiData.orders_at_risk}
            </span>
            {kpiData.orders_at_risk > 0 && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Action Required</span>
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">OTIF Rate</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{kpiData.otif_rate}</span>
            <span className="text-xs font-semibold text-slate-500">Target: 95%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Active Order Network</h3>
            <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700">
              View All
            </button>
          </div>
          <div className="flex-1 bg-white relative overflow-hidden">
            <ActiveOrderNetwork orders={activeOrdersList} />
          </div>
        </div>

        <div className="h-full flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                AI Exception Alerts
              </h3>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {aiAlerts.map((alert, idx) => (
                <div key={idx} className={`p-3 rounded-lg border text-sm ${alert.severity === 'high'
                  ? 'bg-red-50 border-red-100 text-red-800'
                  : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}>
                  <div className="flex gap-2">
                    {alert.severity === 'high' && (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className={alert.severity === 'high' ? 'font-bold' : 'font-medium'}>
                        {alert.message.split(':')[0]}:
                      </span>
                      <span>{alert.message.substring(alert.message.indexOf(':') + 1)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {aiAlerts.length === 0 && (
                <p className="text-slate-400 text-center text-sm py-4">No active alerts.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Comparison Section - Keep for context */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Supplier Performance Matrix</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
              Export CSV
            </button>
          </div>
        </div>
        <SupplierComparison />
      </div>
    </div>
  );
}
