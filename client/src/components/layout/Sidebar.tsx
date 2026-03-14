'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PackageSearch,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  Wrench,
  Map,
  Activity,
  HeartPulse,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: PackageSearch },
  { name: 'Receipts', href: '/receipts', icon: ArrowDownToLine },
  { name: 'Deliveries', href: '/deliveries', icon: ArrowUpFromLine },
  { name: 'Transfers', href: '/transfers', icon: ArrowRightLeft },
  { name: 'Adjustments', href: '/adjustments', icon: Wrench },
  { name: 'Warehouse Map', href: '/warehouse', icon: Map },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'Health Score', href: '/healthscore', icon: HeartPulse },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full glass border-r border-cyan-500/20 flex flex-col shrink-0 flex-none z-20">
      <div className="h-16 flex items-center px-6 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.9)]">
            <PackageSearch className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent tracking-wide">
            CoreInventory
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 hide-scrollbar flex flex-col gap-1.5">
        <div className="text-xs font-semibold text-cyan-500 uppercase tracking-[0.2em] mb-2 px-2">
          Control Plane
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link key={item.name} href={item.href} className="relative block">
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative z-10',
                  isActive
                    ? 'text-cyan-100'
                    : 'text-slate-500 hover:text-slate-100'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-cyan-500/15 rounded-xl border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.7)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-colors z-10 relative',
                    isActive ? 'text-cyan-400' : 'text-slate-600'
                  )}
                />
                <span className="font-medium text-sm z-10 relative">
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center border border-white/10 shrink-0">
            <span className="text-sm font-semibold text-white">AD</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-200 truncate">Admin User</span>
            <span className="text-xs text-slate-500 truncate">admin@core.inv</span>
          </div>
        </div>
      </div>
    </div>
  );
}
