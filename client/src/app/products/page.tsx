'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const MOCK_PRODUCTS = [
  { id: '1', sku: 'ELEC-KB-001', name: 'Wireless Bluetooth Keyboard', category: 'Electronics', stock: 120, status: 'In Stock' },
  { id: '2', sku: 'FURN-DC-044', name: 'Ergonomic Desk Chair', category: 'Furniture', stock: 15, status: 'Low Stock' },
  { id: '3', sku: 'ELEC-MS-002', name: 'Optical Gaming Mouse', category: 'Electronics', stock: 350, status: 'In Stock' },
  { id: '4', sku: 'OFF-PAP-100', name: 'A4 Printer Paper (Ream)', category: 'Office Supplies', stock: 0, status: 'Out of Stock' },
  { id: '5', sku: 'CLO-TS-04M', name: 'Cotton T-Shirt (Medium)', category: 'Clothing', stock: 85, status: 'In Stock' },
];

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-1">
            Products
          </h1>
          <p className="text-slate-400 text-sm">Manage inventory catalog and track SKUs in real-time.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by SKU or Name..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Dynamic Table Wrapper */}
      <div className="glass-card flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Product / SKU</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_PRODUCTS.map((prod, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={prod.id} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">{prod.name}</span>
                      <span className="text-xs text-brand-400">{prod.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    <span className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700/50 text-xs">
                      {prod.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-200 font-medium">
                    {prod.stock}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      prod.status === 'In Stock' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : prod.status === 'Low Stock'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-brand-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-slate-400 mt-auto bg-slate-900/20">
          <span>Showing 1 to 5 of 5 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 hover:bg-slate-800 rounded-md transition-colors" disabled>Prev</button>
            <button className="px-3 py-1 bg-brand-600 text-white rounded-md">1</button>
            <button className="px-3 py-1 hover:bg-slate-800 rounded-md transition-colors" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Add Product Modal (Animated) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-6 border border-white/10 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-6">Create New Product</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Product Name</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="e.g. Wireless Keyboard" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">SKU</label>
                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500" placeholder="ELEC-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500">
                      <option>Electronics</option>
                      <option>Furniture</option>
                      <option>Clothing</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-lg shadow-brand-500/20 transition-all font-medium">
                    Save Product
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
