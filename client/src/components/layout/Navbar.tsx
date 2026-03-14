'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, Package, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 glass border-b border-cyan-500/20 sticky top-0 z-10 flex items-center justify-between px-6 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-slate-400 hover:text-cyan-300 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
          <input
            type="text"
            placeholder="Search SKUs, Receipts, Deliveries..."
            className="w-full bg-slate-950/70 border border-cyan-500/30 rounded-full pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400/70 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-slate-300 hover:text-cyan-300 transition-colors rounded-full hover:bg-slate-900/60 border border-cyan-500/30 shadow-[0_0_18px_rgba(6,182,212,0.35)]"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 border-2 border-slate-950"></span>
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-slate-950/95 border border-cyan-500/20 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.45)] overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-cyan-500/20 flex justify-between items-center bg-slate-900/80">
                  <h3 className="font-semibold text-sm text-cyan-200">Control Alerts</h3>
                  <button className="text-xs text-cyan-400 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {[
                    { id: 1, icon: <AlertTriangle className="w-4 h-4 text-amber-400"/>, title: 'Low Stock Alert', desc: 'Steel Rods (SKU-102) dropped below reorder level.', time: '10 mins ago', bg: 'bg-amber-500/15' },
                    { id: 2, icon: <Package className="w-4 h-4 text-emerald-400"/>, title: 'Movement Logged', desc: 'Outbound Shipment DL-778 dispatched from Rack B2.', time: '24 mins ago', bg: 'bg-emerald-500/15' },
                    { id: 3, icon: <AlertTriangle className="w-4 h-4 text-cyan-300"/>, title: 'System Signal', desc: 'Throughput dropped 8% vs rolling average in Zone C.', time: '1 hour ago', bg: 'bg-cyan-500/10' },
                  ].map(n => (
                    <div key={n.id} className="px-4 py-3 hover:bg-slate-900/80 cursor-pointer transition-colors border-b border-slate-800/80 last:border-0 flex gap-3">
                      <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.bg}`}>
                        {n.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-100">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.desc}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-cyan-500/20 text-center bg-slate-900/80 hover:bg-slate-900 transition-colors cursor-pointer">
                  <span className="text-xs font-medium text-cyan-300">View all notifications</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
