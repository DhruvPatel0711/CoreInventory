'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ArrowRightLeft, MapPin } from 'lucide-react';

const MOCK_TRANSFERS = [
  { id: '1', ref: 'TR-1044', product: 'Wireless Keyboard', qty: 50, from: 'Rack A1', to: 'Rack B2', date: '2026-03-14', user: 'Inventory Manager' },
  { id: '2', ref: 'TR-1045', product: 'Office Chair', qty: 12, from: 'Main Store', to: 'Showroom', date: '2026-03-13', user: 'Warehouse Staff' },
];

export default function TransfersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent mb-1 flex items-center gap-2">
            <ArrowRightLeft className="text-purple-400" /> Internal Transfers
          </h1>
          <p className="text-slate-400 text-sm">Move stock between internal racks and warehouses without affecting total quantity.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Transfer
        </button>
      </div>

      <div className="glass-card flex-1 overflow-hidden flex flex-col mt-4 border-purple-500/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Transfer Ref</th>
                <th className="px-6 py-4 font-medium">Product Moved</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Path (From → To)</th>
                <th className="px-6 py-4 font-medium">Date & User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_TRANSFERS.map((transfer, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  key={transfer.id} className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-200">{transfer.ref}</td>
                  <td className="px-6 py-4 text-slate-300">{transfer.product}</td>
                  <td className="px-6 py-4 text-purple-400 font-bold">{transfer.qty} Units</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-md border border-white/5 inline-flex">
                      <MapPin className="w-3.5 h-3.5 text-slate-500"/>
                      <span>{transfer.from}</span>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400 mx-1"/>
                      <MapPin className="w-3.5 h-3.5 text-slate-500"/>
                      <span className="text-purple-300">{transfer.to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div>{transfer.date}</div>
                    <div className="text-xs opacity-60">{transfer.user}</div>
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
              className="relative w-full max-w-2xl glass-card p-6 border border-purple-500/20 shadow-2xl shadow-purple-500/10"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ArrowRightLeft className="text-purple-400"/> New Internal Transfer</h2>
              
              <div className="space-y-6">
                
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Product to Move</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-300 outline-none focus:border-purple-500">
                    <option>Search SKU or Product Name...</option>
                  </select>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">From Location</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 outline-none focus:border-red-500">
                      <option>Select source rack...</option>
                    </select>
                  </div>
                  <ArrowRightLeft className="w-5 h-5 text-slate-500 mt-6" />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">To Location</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 outline-none focus:border-emerald-500">
                      <option>Select destination rack...</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Transfer Quantity</label>
                  <input type="number" placeholder="0" className="w-full md:w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 text-lg" />
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-lg shadow-purple-500/20 transition-all font-medium">Execute Transfer</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
