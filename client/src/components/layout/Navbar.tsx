'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Search, Menu, Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Activity, PackageSearch } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_NOTIFS = [
  { id: 1, icon: <AlertTriangle className="w-4 h-4 text-orange-400"/>, title: 'Low Stock Alert', desc: 'Steel Rods (SKU-102) dropped below reorder level.', time: '10m ago', unread: true },
  { id: 2, icon: <ArrowDownToLine className="w-4 h-4 text-brand-500"/>, title: 'Receipt Logged', desc: 'PO-10284 received: 50× Copper Wire to Rack A2.', time: '18m ago', unread: true },
  { id: 3, icon: <ArrowUpFromLine className="w-4 h-4 text-orange-400"/>, title: 'Shipment Dispatched', desc: 'SO-80134 shipped: 25× Nylon Bolts from B3.', time: '32m ago', unread: true },
  { id: 4, icon: <Activity className="w-4 h-4 text-indigo-400"/>, title: 'Transfer Complete', desc: '15× Aluminum Sheets moved from C1 → D2.', time: '1h ago', unread: false },
  { id: 5, icon: <AlertTriangle className="w-4 h-4 text-red-400"/>, title: 'Dead Stock Detected', desc: 'Vinyl Rolls unmoved for 35 days in Rack C2.', time: '2h ago', unread: false },
  { id: 6, icon: <Package className="w-4 h-4 text-neutral-400"/>, title: 'System Backup', desc: 'Nightly inventory snapshot completed successfully.', time: '6h ago', unread: false },
];

export function Navbar() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
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

  const unreadCount = notifs.filter(n => n.unread).length;
  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, unread: false })));

  return (
    <header className="h-14 bg-surface-dark border-b border-neutral-800 sticky top-0 z-10 flex items-center px-6 select-none">
      {/* Left: Mobile menu + Logo + Search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button className="md:hidden text-neutral-400 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo in Navbar (visible on mobile) */}
        <Link href="/dashboard" className="hidden sm:flex md:hidden items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <PackageSearch className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">CoreInventory</span>
        </Link>
        
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>
      </div>

      {/* Right: Theme Toggle + Notifications + Avatar */}
      <div className="flex items-center gap-1.5 ml-4 shrink-0">
        <ThemeToggle />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 mt-2 w-80 bg-surface-dark border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center">
                  <h3 className="font-medium text-sm text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-brand-500 hover:text-brand-400 transition-colors">Mark all read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifs.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-neutral-800/50 cursor-pointer transition-colors border-b border-neutral-800/50 last:border-0 flex gap-3 ${n.unread ? 'bg-neutral-800/20' : ''}`}>
                      <div className="mt-0.5 w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                        {n.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-neutral-200">{n.title}</p>
                          {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></span>}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.desc}</p>
                        <p className="text-[10px] text-neutral-600 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-neutral-800 text-center">
                  <Link href="/dashboard" className="text-xs text-brand-500 hover:text-brand-400 transition-colors">View all activity</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 shrink-0 ml-1 cursor-pointer hover:border-neutral-600 transition-colors">
          <span className="text-xs font-semibold text-white select-none">AD</span>
        </div>
      </div>
    </header>
  );
}
