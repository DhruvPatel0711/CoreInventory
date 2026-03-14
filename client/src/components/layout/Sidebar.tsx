'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, PackageSearch, ArrowDownToLine, ArrowUpFromLine,
  ArrowRightLeft, Wrench, Map, Activity, HeartPulse, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: PackageSearch },
  { name: 'Receipts', href: '/receipts', icon: ArrowDownToLine },
  { name: 'Deliveries', href: '/deliveries', icon: ArrowUpFromLine },
  { name: 'Transfers', href: '/transfers', icon: ArrowRightLeft },
  { name: 'Adjustments', href: '/adjustments', icon: Wrench },
  { name: 'Warehouse', href: '/warehouse', icon: Map },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'Health Score', href: '/healthscore', icon: HeartPulse },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-60 h-full bg-surface-dark border-r border-neutral-800 flex flex-col shrink-0 flex-none z-20">
      <div className="h-14 flex items-center px-5 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <PackageSearch className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-white tracking-tight">CoreInventory</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 hide-scrollbar flex flex-col gap-0.5 no-select">
        <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest mb-2 px-2.5">
          Navigation
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className="relative block">
              <div className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 relative z-10 text-sm',
                isActive ? 'text-white bg-neutral-800' : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50'
              )}>
                <item.icon className={cn('w-4 h-4', isActive ? 'text-brand-500' : 'text-neutral-600')} />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-neutral-800">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 shrink-0">
            <span className="text-xs font-semibold text-white">AD</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-neutral-200 truncate">Admin</span>
            <span className="text-[10px] text-neutral-500 truncate">admin@core.inv</span>
          </div>
        </div>
      </div>
    </div>
  );
}
