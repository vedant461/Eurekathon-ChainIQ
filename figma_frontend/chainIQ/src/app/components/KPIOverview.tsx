import React from 'react';
import { motion } from 'motion/react';
import { ArrowUp, ArrowDown, Activity, Truck, ShieldCheck, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface KPIOverviewProps {
  kpis: {
    delivery: number;
    quality: number;
    reliability: number;
  };
}

export function KPIOverview({ kpis }: KPIOverviewProps) {
  // Mock trend data
  const trends = {
    delivery: { val: 2.4, up: true },
    quality: { val: 0.8, up: true },
    reliability: { val: 1.2, up: false }, // Down trend is bad usually, unless it's cost/time
  };

  const cards = [
    {
      id: 'delivery',
      title: 'Delivery Performance Index',
      value: kpis.delivery,
      trend: trends.delivery,
      icon: Truck,
      color: 'emerald', // Green
      subtitle: 'On-Time In-Full (OTIF)',
    },
    {
      id: 'quality',
      title: 'Fulfillment Quality Index',
      value: kpis.quality,
      trend: trends.quality,
      icon: ShieldCheck,
      color: 'sky', // Blue
      subtitle: 'Defect Rate < 0.5%',
    },
    {
      id: 'reliability',
      title: 'Supplier Reliability Index',
      value: kpis.reliability,
      trend: trends.reliability,
      icon: Clock,
      color: 'amber', // Orange/Warning if low
      subtitle: 'Lead Time Variability',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={clsx(
            "relative p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow",
            "bg-white"
          )}
        >
          {/* Background Gradient & Pattern */}
          <div className={clsx(
            "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2",
            card.color === 'emerald' && "from-emerald-400 to-teal-300",
            card.color === 'sky' && "from-sky-400 to-indigo-300",
            card.color === 'amber' && "from-amber-400 to-orange-300"
          )} />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={clsx(
              "p-3 rounded-xl",
              card.color === 'emerald' && "bg-emerald-50 text-emerald-600",
              card.color === 'sky' && "bg-sky-50 text-sky-600",
              card.color === 'amber' && "bg-amber-50 text-amber-600"
            )}>
              <card.icon className="w-6 h-6" />
            </div>
            
            <div className={clsx(
              "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
              card.trend.up ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            )}>
              {card.trend.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {card.trend.val}%
            </div>
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{card.title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                {card.value.toFixed(1)}%
              </h3>
            </div>
            <p className="text-xs text-slate-400 pt-2">{card.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
