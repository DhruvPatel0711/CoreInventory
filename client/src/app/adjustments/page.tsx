'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, SlidersHorizontal, AlertOctagon } from 'lucide-react';

const MOCK_ADJS = [
  { id: '1', product: 'Ceramic Plates', oldQty: 100, newQty: 97, diff: -3, reason: 'Damaged in transit', date: '2026-03-14', location: 'Rack B1' },
  { id: '2', product: 'USB Cables', oldQty: 450, newQty: 455, diff: 5, reason: 'Found miscounted stock', date: '2026-03-12', location: 'Rack A1' },
];

export default function AdjustmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-white bg-clip-text text-transparent mb-1 flex items-center gap-2">
            <SlidersHorizontal className="text-orange-400" /> Stock Adjustments
          </h1>
          <p className="text-slate-400 text-sm">Force correct the system when physical counts differ from recorded stock.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Adjustment
        </button>
      </div>

      <div className="glass-card flex-1 overflow-hidden flex flex-col mt-4 border-orange-500/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Product / Location</th>
                <th className="px-6 py-4 font-medium text-center">System Qty</th>
                <th className="px-6 py-4 font-medium text-center">Actual Qty</th>
                <th className="px-6 py-4 font-medium text-center">Variance</th>
                <th className="px-6 py-4 font-medium">Reason Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_ADJS.map((adj, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  key={adj.id} className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{adj.product}</div>
                    <div className="text-xs text-slate-500 mt-1">{adj.location}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300 font-mono">{adj.oldQty}</td>
                  <td className="px-6 py-4 text-center text-white font-mono">{adj.newQty}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      adj.diff > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {adj.diff > 0 ? `+${adj.diff}` : adj.diff}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 truncate max-w-[200px]">
                    {adj.reason}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-6 border border-orange-500/20 shadow-2xl shadow-orange-500/10"
            >
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <AlertOctagon className="text-orange-400"/> Reconcile Stock
              </h2>
              <p className="text-sm text-slate-400 mb-6">This operation permanently overrides the system stock count to match physical reality.</p>
              
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Product & Location</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-300 outline-none focus:border-orange-500">
                    <option>Select specific product bin...</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
                    <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">System Reads</span>
                    <span className="text-2xl font-bold text-slate-300">100</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">New Actual Count</label>
                    <input type="number" placeholder="Enter physical count" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500 text-lg text-center" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason for Adjustment</label>
                  <input type="text" placeholder="e.g. Broken in transit, auditor manual count" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500" />
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                  <button className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg shadow-lg shadow-orange-500/20 transition-all font-medium">Force Sync Stock</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
