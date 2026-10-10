import React from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

interface WhatIfSimulationProps {
  impact: number;
  onChange: (value: number) => void;
}

export function WhatIfSimulation({ impact, onChange }: WhatIfSimulationProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800">What-If Simulation</h3>
        <button 
          onClick={() => onChange(0)}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-600 mb-2">Scenario: Improve Sorting Efficiency</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={impact}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="font-bold text-emerald-600 w-12">+{impact}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 block mb-1">Current OTIF</span>
          <span className="text-lg font-bold text-slate-700">87.4%</span>
        </div>
        <div className={clsx(
          "p-3 rounded-lg border transition-colors",
          impact > 0 ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
        )}>
          <span className="text-xs text-slate-500 block mb-1">Simulated OTIF</span>
          <div className="flex items-center gap-2">
            <span className={clsx(
              "text-lg font-bold",
              impact > 0 ? "text-emerald-700" : "text-slate-700"
            )}>
              {(87.4 + (impact * 0.4)).toFixed(1)}%
            </span>
            {impact > 0 && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-semibold text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-sm"
              >
                +{ (impact * 0.4).toFixed(1) }%
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <button className="w-full mt-6 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 flex justify-center items-center gap-2 transition-colors">
        <Play className="w-4 h-4" /> Run Full Simulation
      </button>
    </div>
  );
}
