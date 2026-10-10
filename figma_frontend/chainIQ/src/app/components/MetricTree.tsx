import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, AlertCircle, CheckCircle2, Factory, Clock, Activity } from 'lucide-react';
import { clsx } from 'clsx';

// Extended Tree Data Structure
interface TreeNodeData {
  id: string;
  label: string;
  value: string;
  secondaryValue?: string; // e.g. Time
  accuracy?: string;       // e.g. Accuracy %
  status: 'good' | 'warning' | 'critical';
  type: 'metric' | 'supplier';
  impact?: number; // % contribution to problem
  children?: TreeNodeData[];
}

const initialTreeData: TreeNodeData = {
  id: 'root',
  label: 'Supply Chain Performance',
  value: '82%',
  status: 'warning',
  type: 'metric',
  children: [
    {
      id: 'delivery',
      label: 'Delivery Performance',
      value: '76%',
      status: 'critical',
      type: 'metric',
      children: [
        {
          id: 'on-time',
          label: 'On-Time Delivery',
          value: '72%',
          status: 'critical',
          impact: 54, // Primary contributor
          type: 'metric',
          children: [
            {
              id: 'sp1',
              label: 'Global Logistics Inc.',
              value: '98%',
              secondaryValue: '12h 30m',
              accuracy: '99.9%',
              status: 'good',
              type: 'supplier',
            },
            {
              id: 'sp3',
              label: 'Oceanic Transport',
              value: '65%',
              secondaryValue: '48h 15m',
              accuracy: '82.4%',
              status: 'critical',
              impact: 42,
              type: 'supplier',
            },
            {
              id: 'sp4',
              label: 'Rapid Cargo Ltd.',
              value: '78%',
              secondaryValue: '24h 05m',
              accuracy: '91.2%',
              status: 'warning',
              type: 'supplier',
            },
          ]
        },
        {
          id: 'in-full',
          label: 'In-Full Delivery',
          value: '91%',
          status: 'good',
          type: 'metric',
        },
      ],
    },
    {
      id: 'cost',
      label: 'Logistics Cost',
      value: '$1.2M',
      status: 'good',
      type: 'metric',
      children: [
        { id: 'freight', label: 'Freight', value: '$800k', status: 'warning', type: 'metric' },
        { id: 'warehouse', label: 'Warehousing', value: '$400k', status: 'good', type: 'metric' },
      ],
    },
    {
      id: 'quality',
      label: 'Quality Index',
      value: '98%',
      status: 'good',
      type: 'metric',
    },
  ],
};

const TreeNode = ({ node, level = 0 }: { node: TreeNodeData; level?: number }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSupplier = node.type === 'supplier';

  return (
    <div className="relative">
      <div 
        className={clsx(
          "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md mb-2 relative z-10",
          // Styles based on Status
          node.status === 'good' && "bg-emerald-50 border-emerald-100 text-emerald-900",
          node.status === 'warning' && "bg-amber-50 border-amber-100 text-amber-900",
          node.status === 'critical' && "bg-rose-50 border-rose-100 text-rose-900 ring-1 ring-rose-200",
          // Specific style for Supplier nodes
          isSupplier && "ml-4 border-l-4" 
        )}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {/* Connector Line for Children */}
        {level > 0 && (
          <div className="absolute -left-6 top-1/2 w-6 h-px bg-slate-300 -z-10" />
        )}
        
        {/* Expand/Collapse Icon or Type Icon */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {hasChildren ? (
            isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : isSupplier ? (
            <Factory className="w-4 h-4 opacity-70" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
          )}
        </div>

        {/* Status Icon */}
        <div className="shrink-0">
            {node.status === 'critical' ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : node.status === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-amber-600" />
            ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className={clsx("font-medium text-sm", isSupplier && "font-semibold")}>
                {node.label}
            </span>
            {isSupplier && (
                <div className="flex items-center gap-3 text-xs opacity-80 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time: {node.secondaryValue}</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Acc: {node.accuracy}</span>
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             {isSupplier && node.status === 'critical' && (
                <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                    Live Issue
                </span>
             )}
             <span className="font-bold text-sm bg-white/50 px-2 py-0.5 rounded min-w-[3rem] text-center">
                {node.value}
             </span>
          </div>
        </div>

        {/* Root Cause Indicator */}
        {node.impact && (
          <div className="absolute -right-2 -top-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20">
            Root Cause ({node.impact}%)
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
             {/* Vertical Line for Hierarchy */}
            <div 
              className="absolute left-[11px] top-0 bottom-4 w-px bg-slate-300 -z-10" 
              style={{ left: `${level * 24 + 11}px` }} 
            />
            
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function MetricTree() {
  const [data, setData] = useState(initialTreeData);

  // Simulate Live Data Updates
  useEffect(() => {
    const interval = setInterval(() => {
        // Create a deep copy to modify
        const newData = JSON.parse(JSON.stringify(initialTreeData));
        
        // Target the suppliers under Delivery -> On-Time
        // Structure: Root -> Delivery (0) -> On-Time (0) -> Children (Suppliers)
        const suppliers = newData.children?.[0]?.children?.[0]?.children;
        
        if (suppliers && suppliers.length > 0) {
            // Pick a random supplier to update time
            const randomIdx = Math.floor(Math.random() * suppliers.length);
            const minutes = Math.floor(Math.random() * 60);
            const hours = 12 + Math.floor(Math.random() * 36); // Random time between 12h and 48h
            
            suppliers[randomIdx].secondaryValue = `${hours}h ${minutes}m`;
            
            // Add a visual indicator that this node updated? 
            // The React re-render will handle it, but maybe we can add a transient state later.
            // For now, the value change is enough.
        }
        
        setData(newData);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full overflow-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Network Status</span>
      </div>
      <TreeNode node={data} />
    </div>
  );
}
