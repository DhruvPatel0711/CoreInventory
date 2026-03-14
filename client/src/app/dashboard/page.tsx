'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PackageSearch, AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, Activity, Calendar, Package, ArrowUpRight, Cpu, Zap, BarChart3
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar,
} from 'recharts';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Link from 'next/link';
import api from '@/lib/api';

const mockTrends = [
  { name: 'Mon', receipts: 120, deliveries: 90 }, { name: 'Tue', receipts: 80, deliveries: 100 },
  { name: 'Wed', receipts: 150, deliveries: 120 }, { name: 'Thu', receipts: 200, deliveries: 180 },
  { name: 'Fri', receipts: 180, deliveries: 200 }, { name: 'Sat', receipts: 50, deliveries: 40 },
  { name: 'Sun', receipts: 30, deliveries: 20 },
];
const mockCategories = [
  { name: 'Electronics', stock: 1200 }, { name: 'Raw Materials', stock: 950 },
  { name: 'Office', stock: 800 }, { name: 'Packaging', stock: 630 }, { name: 'Clothing', stock: 250 },
];
const mockTimeline = [
  { id: 1, time: '10:20 AM', text: 'Receipt: Steel Rod Batch RC-441', qty: '+50', type: 'in' },
  { id: 2, time: '11:15 AM', text: 'Transfer: Rack A1 → Rack C3', qty: '0', type: 'neutral' },
  { id: 3, time: '02:00 PM', text: 'Delivery: SO-88432 Dispatched', qty: '-10', type: 'out' },
  { id: 4, time: '03:45 PM', text: 'Adjustment: Damage Write-off', qty: '-3', type: 'out' },
  { id: 5, time: '04:12 PM', text: 'Receipt: Office Supplies PO-9921', qty: '+120', type: 'in' },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [healthScore, setHealthScore] = useState(84);
  const [kpis, setKpis] = useState([
    { title: 'Total Products', value: '1,248', trend: 'Active SKUs', trendUp: true, icon: Package, href: '/products', color: 'border-t-blue-500' },
    { title: 'Total Inventory', value: '892', trend: 'Units across all locations', trendUp: true, icon: Cpu, href: '/warehouse', color: 'border-t-green-500' },
    { title: 'Low Stock', value: '24', trend: 'Below reorder level', trendUp: false, icon: AlertTriangle, href: '/products', color: 'border-t-orange-500' },
    { title: 'Health Score', value: '84', trend: 'System stable', trendUp: true, icon: Activity, href: '/healthscore', color: 'border-t-purple-500' },
  ]);

  useEffect(() => {
    setMounted(true);
    api.get('/analytics/dashboard').then(res => {
      const d = res.data?.data;
      if (d) setKpis([
        { title: 'Total Products', value: String(d.totalProducts || 1248), trend: 'Active SKUs', trendUp: true, icon: Package, href: '/products', color: 'border-t-blue-500' },
        { title: 'Total Inventory', value: String(d.totalStockQuantity || 0), trend: 'Units across all locations', trendUp: true, icon: Cpu, href: '/warehouse', color: 'border-t-green-500' },
        { title: 'Low Stock', value: String(d.lowStockProducts?.length || 24), trend: 'Below reorder level', trendUp: false, icon: AlertTriangle, href: '/products', color: 'border-t-orange-500' },
        { title: 'Health Score', value: String(healthScore), trend: 'System health', trendUp: true, icon: Activity, href: '/healthscore', color: 'border-t-purple-500' },
      ]);
    }).catch(() => {});
    api.get('/analytics/health').then(res => {
      const s = res.data?.data?.score;
      if (typeof s === 'number' && !isNaN(s)) {
         setHealthScore(Math.round(s));
         setKpis(prev => {
            const copy = [...prev];
            copy[3].value = String(Math.round(s));
            return copy;
         });
      }
    }).catch(() => {});
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full gap-6 pb-8">
      <div className="no-select">
        <h1 className="text-2xl font-semibold text-white mb-0.5">Dashboard</h1>
        <p className="text-neutral-500 text-sm">Overview of your inventory operations and key metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Link href={kpi.href} key={i} className="block group">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`glass-card p-5 hover:bg-surface-hover transition-colors border-t-4 ${kpi.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
                  <kpi.icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-semibold text-white mb-0.5 no-select">{kpi.value}</p>
              <p className="text-xs text-neutral-500 no-select">{kpi.title} · <span className={kpi.trendUp ? 'text-brand-500' : 'text-orange-400'}>{kpi.trend}</span></p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card lg:col-span-2 p-5 flex flex-col h-[360px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-white text-sm">Stock Movement Trends</h3>
            <span className="text-[10px] px-2 py-1 bg-neutral-800 text-neutral-400 rounded-md">Last 7 days</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="receipts" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gR)" name="Inbound" />
                <Area type="monotone" dataKey="deliveries" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#gD)" name="Outbound" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Health */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass-card p-5 flex flex-col items-center justify-center text-center">
          <div className="flex justify-between items-center mb-4 w-full">
            <h3 className="font-medium text-white text-sm flex items-center gap-1.5"><Activity className="w-4 h-4 text-brand-500" /> Health</h3>
            <Link href="/healthscore" className="text-[10px] text-brand-500 hover:text-brand-400 flex items-center gap-1">Details <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="w-36 h-36 relative my-3">
            <CircularProgressbarWithChildren value={healthScore} strokeWidth={6}
              styles={buildStyles({ pathColor: healthScore > 80 ? '#10b981' : healthScore > 50 ? '#f97316' : '#ef4444', trailColor: '#262626', strokeLinecap: 'round' })}>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white">{String(healthScore)}</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Score</span>
              </div>
            </CircularProgressbarWithChildren>
          </div>
          <div className="w-full text-xs space-y-1 mt-auto text-left text-neutral-500">
            <div className="flex justify-between"><span>Low Stock</span><span className="text-orange-400">-8</span></div>
            <div className="flex justify-between"><span>Dead Stock</span><span className="text-red-400">-5</span></div>
            <div className="flex justify-between"><span>Overcapacity</span><span className="text-red-400">-3</span></div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-card lg:col-span-2 p-5 flex flex-col h-[320px]">
          <h3 className="font-medium text-white mb-4 text-sm">Distribution by Category</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategories} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
          className="glass-card p-5 flex flex-col h-[320px]">
          <h3 className="font-medium text-white mb-4 flex items-center gap-1.5 text-sm">
            <Calendar className="w-4 h-4 text-neutral-500" /> Recent Activity
          </h3>
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3">
            {mockTimeline.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className={`w-6 h-6 rounded-md flex shrink-0 items-center justify-center mt-0.5 ${
                  item.type === 'in' ? 'bg-brand-500/10 text-brand-500' : item.type === 'out' ? 'bg-orange-500/10 text-orange-400' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {item.type === 'in' ? <ArrowDownToLine className="w-3 h-3" /> : item.type === 'out' ? <ArrowUpFromLine className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-200 truncate">{item.text}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-neutral-600">{item.time}</span>
                    <span className={`text-[10px] font-medium ${item.type === 'in' ? 'text-brand-500' : item.type === 'out' ? 'text-orange-400' : 'text-neutral-500'}`}>{item.qty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
