'use client';

import React, { useState, useEffect } from 'react';
import { Card, Select } from '@/components/ui';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, LayoutGrid, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { format, subDays } from 'date-fns';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  
  // Data State
  const [catData, setCatData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [capacityData, setCapacityData] = useState<any[]>([]);
  const [deadStock, setDeadStock] = useState<any[]>([]);
  const [topMovers, setTopMovers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [dashRes, movRes, locRes, invRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/movements?limit=500'),
          api.get('/warehouses'),
          api.get('/inventory')
        ]);

        // 1. Stock by Category (Aggr)
        const catMap = invRes.data.reduce((acc: any, cur: any) => {
           if(cur.quantity > 0) {
              const cat = cur.productId?.category || 'Uncategorized';
              acc[cat] = (acc[cat] || 0) + cur.quantity;
           }
           return acc;
        }, {});
        setCatData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

        // 2. Capacity Utilization (Pie)
        let totalCap = 0; let totalUsed = 0;
        locRes.data.forEach((w: any) => {
             w.locations.forEach((l: any) => totalCap += l.capacity);
        });
        invRes.data.forEach((i: any) => totalUsed += i.quantity);
        setCapacityData([
          { name: 'Used Space', value: totalUsed },
          { name: 'Free Space', value: Math.max(0, totalCap - totalUsed) }
        ]);

        // 3. Movement Trends (Area)
        const today = new Date();
        const days = parseInt(dateRange);
        const dateMap: any = {};
        for(let i=days-1; i>=0; i--) {
           dateMap[format(subDays(today, i), 'MM/dd')] = { date: format(subDays(today, i), 'MM/dd'), In: 0, Out: 0 };
        }
        movRes.data.forEach((m: any) => {
           const d = format(new Date(m.createdAt), 'MM/dd');
           if(dateMap[d]) {
               if(m.type === 'RECEIPT') dateMap[d].In += m.quantity;
               if(m.type === 'DELIVERY') dateMap[d].Out += m.quantity;
           }
        });
        setTrendData(Object.values(dateMap));

        // 4. Dead Stock & Top Movers
        const skuMoves = movRes.data.reduce((acc:any, cur:any) => {
            if(!acc[cur.productId._id]) acc[cur.productId._id] = { product: cur.productId, count: 0, last: new Date('2000-01-01')};
            acc[cur.productId._id].count++;
            const d = new Date(cur.createdAt);
            if(d > acc[cur.productId._id].last) acc[cur.productId._id].last = d;
            return acc;
        }, {});

        const sortedMovers = Object.values(skuMoves).sort((a:any, b:any) => b.count - a.count);
        setTopMovers(sortedMovers.slice(0, 5));

        const thirtyDaysAgo = subDays(today, 30);
        const dead = invRes.data.filter((i:any) => i.quantity > 0 && (!skuMoves[i.productId._id] || skuMoves[i.productId._id].last < thirtyDaysAgo));
        // Remove duplicates since same product could be in multiple locations
        const uniqueDead = Array.from(new Map(dead.map((item:any) => [item.productId._id, item])).values());
        setDeadStock(uniqueDead.slice(0, 5));

      } catch (err) { } finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [dateRange]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="flex flex-col h-full gap-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-200 bg-clip-text text-transparent mb-1">System Analytics</h1>
          <p className="text-slate-500 text-sm">Comprehensive breakdown of distribution frequencies and capacity.</p>
        </div>
        <Select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-48">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <Card className="p-6 lg:col-span-2 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-400"/> Stock In/Out Flow</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 12}} dy={10} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} dx={-10} />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px'}} itemStyle={{color: '#e2e8f0'}} />
                <Area type="monotone" dataKey="In" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="Out" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Capacity Pie */}
        <Card className="p-6 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-blue-400"/> Warehouse Capacity</h3>
          <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={capacityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {capacityData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#1e293b'} />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: 'white'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex w-full justify-around mt-4">
              <div className="text-center"><div className="text-2xl font-bold text-blue-400">{(capacityData[0]?.value / (capacityData[0]?.value + capacityData[1]?.value) * 100 || 0).toFixed(1)}%</div><div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Filled</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-slate-300">{(capacityData[1]?.value / (capacityData[0]?.value + capacityData[1]?.value) * 100 || 0).toFixed(1)}%</div><div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Available</div></div>
            </div>
          </div>
        </Card>

        {/* Categories Bar */}
        <Card className="p-6 lg:col-span-2 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-400"/> Stock Distribution by Category</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis dataKey="name" type="category" width={100} stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: 'white'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {catData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dead Stock & Top Movers */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wider">🔥 Top Shipped (30 Days)</h3>
            <div className="space-y-3">
               {topMovers.length === 0 ? <p className="text-sm text-slate-500">No movement data recorded.</p> : topMovers.map((m:any, i:number) => (
                 <div key={i} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                   <div className="truncate pr-4 text-slate-700 dark:text-slate-300">{m.product?.name}</div>
                   <div className="font-mono font-bold text-slate-900 dark:text-white">{m.count} <span className="text-[10px] text-slate-500 font-normal">moves</span></div>
                 </div>
               ))}
            </div>
          </Card>

          <Card className="p-6 border border-red-500/10">
            <h3 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Dead Stock (30+ Days inactive)</h3>
            <div className="space-y-3">
               {deadStock.length === 0 ? <p className="text-sm text-slate-500">No dead stock found. Great job!</p> : deadStock.map((d:any, i:number) => (
                 <div key={i} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                   <div className="truncate pr-4 text-slate-700 dark:text-slate-300">{d.productId?.name}</div>
                   <div className="font-mono font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">{d.quantity} units</div>
                 </div>
               ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
