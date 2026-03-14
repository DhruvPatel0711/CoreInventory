'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PackageSearch,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingDown,
  TrendingUp,
  Activity,
  Calendar,
  Package,
  ArrowUpRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Link from 'next/link';
import api from '@/lib/api';

const mockTrends = [
  { name: 'Mon', receipts: 120, deliveries: 90 },
  { name: 'Tue', receipts: 80, deliveries: 100 },
  { name: 'Wed', receipts: 150, deliveries: 120 },
  { name: 'Thu', receipts: 200, deliveries: 180 },
  { name: 'Fri', receipts: 180, deliveries: 200 },
  { name: 'Sat', receipts: 50, deliveries: 40 },
  { name: 'Sun', receipts: 30, deliveries: 20 },
];
const mockCategories = [
  { name: 'Electronics', stock: 1200 },
  { name: 'Furniture', stock: 450 },
  { name: 'Office', stock: 800 },
  { name: 'Clothing', stock: 250 },
];
const mockTimeline = [
  { id: 1, time: '10:20 AM', text: 'Received Steel', qty: '+50', type: 'in' },
  { id: 2, time: '11:15 AM', text: 'Transfer Rack A → Rack B', qty: '0', type: 'neutral' },
  { id: 3, time: '02:00 PM', text: 'Delivery Order Shipped', qty: '-10', type: 'out' },
  { id: 4, time: '03:45 PM', text: 'Stock Adjustment (Damage)', qty: '-3', type: 'out' },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [healthScore, setHealthScore] = useState(84);
  const [kpis, setKpis] = useState([
    {
      title: 'Inventory Value',
      value: '...',
      trend: 'Syncing',
      trendUp: true,
      icon: Package,
      color: 'from-cyan-500 to-sky-500',
      hoverShadow: 'hover:shadow-cyan-500/30',
      href: '/products',
    },
    {
      title: 'Low Stock Alerts',
      value: '...',
      trend: 'Syncing',
      trendUp: false,
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
      hoverShadow: 'hover:shadow-amber-500/30',
      href: '/products?view=low-stock',
    },
    {
      title: 'Warehouse Racks',
      value: '...',
      trend: 'Syncing',
      trendUp: true,
      icon: PackageSearch,
      color: 'from-emerald-500 to-teal-500',
      hoverShadow: 'hover:shadow-emerald-500/30',
      href: '/warehouse',
    },
    {
      title: 'Recent Movements',
      value: '...',
      trend: 'Syncing',
      trendUp: true,
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      hoverShadow: 'hover:shadow-purple-500/30',
      href: '/analytics?view=recent-movements',
    },
  ]);

  useEffect(() => {
    setMounted(true);
    api
      .get('/analytics/dashboard')
      .then((res) => {
        const dash = res.data;
        setKpis([
          {
            title: 'Inventory Value',
            value: dash.totalValue.toLocaleString(),
            trend: 'Estimated Total Value',
            trendUp: true,
            icon: Package,
            color: 'from-cyan-500 to-sky-500',
            hoverShadow: 'hover:shadow-cyan-500/30',
            href: '/products',
          },
          {
            title: 'Low Stock Alerts',
            value: dash.lowStockCount.toString(),
            trend: 'Requires attention',
            trendUp: false,
            icon: AlertTriangle,
            color: 'from-amber-500 to-orange-500',
            hoverShadow: 'hover:shadow-amber-500/30',
            href: '/products?view=low-stock',
          },
          {
            title: 'Warehouse Racks',
            value: dash.totalWarehouses.toString(),
            trend: 'Physical Infrastructure Nodes',
            trendUp: true,
            icon: PackageSearch,
            color: 'from-emerald-500 to-teal-500',
            hoverShadow: 'hover:shadow-emerald-500/30',
            href: '/warehouse',
          },
          {
            title: 'Recent Movements',
            value: dash.totalMovements?.toString?.() || '—',
            trend: 'Last 24h events',
            trendUp: true,
            icon: Activity,
            color: 'from-purple-500 to-pink-500',
            hoverShadow: 'hover:shadow-purple-500/30',
            href: '/analytics?view=recent-movements',
          },
        ]);
      })
      .catch((e) => console.error(e));

    api.get('/analytics/health').then(res => setHealthScore(Math.round(res.data.score))).catch(e => console.error(e));
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full gap-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-300 to-sky-500 bg-clip-text text-transparent mb-1">
          Logistics Control Deck
        </h1>
        <p className="text-slate-400 text-sm">
          Live signal panel for capacity, stock integrity, and movement velocity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Link href={kpi.href || '#'} key={index} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 22 }}
              className={`glass-card p-6 h-full transition-all duration-300 border border-cyan-500/20 hover:border-cyan-400/60 ${kpi.hoverShadow}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <h3 className="text-slate-400 font-medium text-sm mb-1 group-hover:text-white transition-colors">{kpi.title}</h3>
              <p className="text-3xl font-bold text-white mb-2">{kpi.value}</p>
              <div className="flex justify-between items-center text-xs">
                <span className={`font-medium ${kpi.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.trend}
                </span>
                <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Open <ArrowUpRight className="w-3 h-3"/></span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card lg:col-span-2 p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6 text-slate-200">
            <h3 className="font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-400" /> Stock Movement Trends</h3>
            <span className="text-xs px-3 py-1 bg-white/5 rounded-full border border-white/10">Last 7 Days</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceipts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="receipts" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceipts)" name="Receipts (In)" />
                <Area type="monotone" dataKey="deliveries" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDeliveries)" name="Deliveries (Out)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 w-full">
            <h3 className="font-bold flex items-center gap-2 text-slate-200">
              <Activity className="w-5 h-5 text-emerald-400" /> Inventory Health
            </h3>
            <Link href="/healthscore" className="text-sm font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1 group">
               Deep Dive <ArrowUpRight className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="w-48 h-48 relative mb-6">
            <CircularProgressbarWithChildren
              value={healthScore}
              strokeWidth={8}
              styles={buildStyles({ pathColor: healthScore > 80 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444', trailColor: '#334155', strokeLinecap: 'round' })}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{healthScore}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">out of 100</span>
              </div>
            </CircularProgressbarWithChildren>
          </div>
          <div className="w-full text-sm space-y-2 mt-auto text-slate-400 text-left">
             A real-time cumulative status representing overall logistical stability and capital distribution efficiency.
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card lg:col-span-2 p-6 flex flex-col h-[350px]">
          <h3 className="font-bold text-slate-200 mb-6">Stock Distribution by Category</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategories} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="stock" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Recent Activity
          </h3>
          <div className="flex-1 overflow-y-auto hide-scrollbar pr-2 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-700/50" />
            <div className="space-y-6 relative z-10">
              {mockTimeline.map((item, i) => (
                <div key={item.id} className="flex gap-4 items-start group">
                  <div className={`w-6 h-6 rounded-full flex shrink-0 items-center justify-center mt-0.5 shadow-lg border-2 border-surface-dark ${
                    item.type === 'in' ? 'bg-emerald-500 text-white' : item.type === 'out' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
                  }`}>
                    {item.type === 'in' ? <ArrowDownToLine className="w-3 h-3" /> : item.type === 'out' ? <ArrowUpFromLine className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0 bg-slate-800/50 rounded-lg p-3 border border-white/5 group-hover:bg-slate-800 transition-colors">
                    <p className="text-sm font-medium text-slate-200 truncate">{item.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{item.time}</span>
                      <span className={`text-xs font-bold ${item.type === 'in' ? 'text-emerald-400' : item.type === 'out' ? 'text-amber-400' : 'text-slate-400'}`}>{item.qty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
