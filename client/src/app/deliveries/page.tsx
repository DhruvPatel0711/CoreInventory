'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ArrowUpFromLine, Calendar, PackageCheck } from 'lucide-react';

const MOCK_DELIVERIES = [
  { id: '1', ref: 'SO-2026-904', recipient: 'Amazon FC (DFW)', items: 4, totalQty: 850, date: '2026-03-14', status: 'Shipped' },
  { id: '2', ref: 'SO-2026-905', recipient: 'Local Retailer B', items: 1, totalQty: 10, date: '2026-03-14', status: 'Packing' },
];

export default function DeliveriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent mb-1 flex items-center gap-2">
            <ArrowUpFromLine className="text-blue-400" /> Outgoing Deliveries
          </h1>
          <p className="text-slate-400 text-sm">Pick, pack, and ship outbound sales orders to reduce available stock.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <PackageCheck className="w-5 h-5" />
          Create Delivery
        </button>
      </div>

      {/* Table */}
      <div className="glass-card flex-1 overflow-hidden flex flex-col mt-4 border-blue-500/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Order Ref</th>
                <th className="px-6 py-4 font-medium">Recipient</th>
                <th className="px-6 py-4 font-medium">Outbound Qty</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_DELIVERIES.map((delivery, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  key={delivery.id} className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-200">{delivery.ref}</td>
                  <td className="px-6 py-4 text-slate-300">{delivery.recipient}</td>
                  <td className="px-6 py-4 text-blue-400 font-medium">-{delivery.totalQty} total</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      delivery.status === 'Shipped' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {delivery.status}
                    </span>
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
              className="relative w-full max-w-2xl glass-card p-6 border border-blue-500/20 shadow-2xl shadow-blue-500/10"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><PackageCheck className="text-blue-400"/> New Delivery Order</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Recipient / Customer</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="Customer Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Sales Data Target</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="SO-XXXX" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Pick Items from Stock</h3>
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <select className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 outline-none focus:border-blue-500">
                        <option>Select product bin...</option>
                      </select>
                      <input type="number" placeholder="Qty Out" className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all font-medium">Verify & Ship Out</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
