'use client';

import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

export function Navbar() {
  return (
    <header className="h-16 glass border-b sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-slate-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search SKUs, Receipts, Deliveries..."
            className="w-full bg-background-dark/50 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-surface-dark"></span>
        </button>
      </div>
    </header>
  );
}
