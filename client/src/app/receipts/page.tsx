'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ArrowDownToLine, Calendar, FileText } from 'lucide-react';

const MOCK_RECEIPTS = [
  { id: '1', ref: 'PO-2026-001', supplier: 'Steel Dynamics Inc.', items: 3, totalQty: 1500, date: '2026-03-14', status: 'Completed' },
  { id: '2', ref: 'PO-2026-002', supplier: 'TechParts Global', items: 12, totalQty: 450, date: '2026-03-13', status: 'Completed' },
  { id: '3', ref: 'DRAFT-992', supplier: 'Office Supplies Co.', items: 5, totalQty: 120, date: '2026-03-14', status: 'Draft' },
];

export default function ReceiptsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-white bg-clip-text text-transparent mb-1 flex items-center gap-2">
            <ArrowDownToLine className="text-emerald-400" /> Incoming Receipts
          </h1>
          <p className="text-slate-400 text-sm">Log incoming goods from suppliers and auto-update stock bins.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Receipt
        </button>
      </div>

      {/* Stats/Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-emerald-500/5">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
          <input
            type="text"
            placeholder="Search Reference or Supplier..."
            className="w-full bg-slate-900/50 border border-emerald-500/20 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Reference</th>
                <th className="px-6 py-4 font-medium">Supplier</th>
                <th className="px-6 py-4 font-medium">Items / Qty</th>
                <th className="px-6 py-4 font-medium">Date received</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_RECEIPTS.map((receipt, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  key={receipt.id} className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-200">{receipt.ref}</td>
                  <td className="px-6 py-4 text-slate-300">{receipt.supplier}</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 font-medium">{receipt.totalQty} total</span>
                    <span className="text-xs text-slate-500 ml-2">({receipt.items} SKUs)</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> {receipt.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      receipt.status === 'Completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {receipt.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-card p-6 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ArrowDownToLine className="text-emerald-400"/> New Receipt</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Supplier Name</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Vendor Inc" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Document Reference</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="PO-XXXX" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Line Items</h3>
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <select className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 outline-none focus:border-emerald-500">
                        <option>Select Product SKU...</option>
                      </select>
                      <input type="number" placeholder="Qty" className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500" />
                    </div>
                    <button className="text-emerald-400 text-sm font-medium self-start flex items-center gap-1 hover:text-emerald-300 transition-colors">
                      <Plus className="w-4 h-4"/> Add another item
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all font-medium border border-slate-700">Save as Draft</button>
                  <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all font-medium">Verify & Receive</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
