'use client';

import React, { useState, useEffect } from 'react';
import { Card, Select } from '@/components/ui';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, LayoutGrid, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { format, subDays } from 'date-fns';

const COLORS = ['#10b981', '#f97316', '#6366f1', '#ef4444', '#8b5cf6'];

// Fallback mock data so page is never empty
const MOCK_CAT = [{ name: 'Electronics', value: 1200 }, { name: 'Raw Materials', value: 950 }, { name: 'Office', value: 800 }, { name: 'Packaging', value: 630 }, { name: 'Clothing', value: 250 }];
const MOCK_TREND = Array.from({ length: 14 }, (_, i) => ({ date: format(subDays(new Date(), 13 - i), 'MM/dd'), In: 30 + Math.floor(Math.sin(i) * 20 + 20), Out: 20 + Math.floor(Math.cos(i) * 15 + 15) }));
const MOCK_CAP = [{ name: 'Used Space', value: 6800 }, { name: 'Free Space', value: 3200 }];
const MOCK_MOVERS = [{ product: { name: 'Steel Rods' }, count: 45 }, { product: { name: 'Copper Wire' }, count: 38 }, { product: { name: 'PVC Pipes' }, count: 32 }, { product: { name: 'Nylon Bolts' }, count: 28 }, { product: { name: 'LED Modules' }, count: 21 }];
const MOCK_DEAD = [{ productId: { name: 'Vinyl Rolls', unit: 'pcs' }, quantity: 120, locationId: { rackCode: 'C2' } }, { productId: { name: 'Zinc Plates', unit: 'pcs' }, quantity: 85, locationId: { rackCode: 'D1' } }];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [catData, setCatData] = useState<any[]>(MOCK_CAT);
  const [trendData, setTrendData] = useState<any[]>(MOCK_TREND);
  const [capacityData, setCapacityData] = useState<any[]>(MOCK_CAP);
  const [deadStock, setDeadStock] = useState<any[]>(MOCK_DEAD);
  const [topMovers, setTopMovers] = useState<any[]>(MOCK_MOVERS);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [dashRes, movRes, locRes, invRes] = await Promise.all([
          api.get('/analytics/dashboard').catch(() => null),
          api.get(`/analytics/movements?days=${dateRange}`).catch(() => null),
          api.get('/warehouses').catch(() => null),
          api.get('/inventory').catch(() => null),
        ]);

        const dashboard = dashRes?.data?.data;
        const movData = movRes?.data?.data; // { trends, categoryBreakdown }
        const warehouses = locRes?.data?.data; // array of warehouse objects
        const inventory = invRes?.data?.data; // array of inventory entries

        // 1. Category breakdown from API
        if (movData?.categoryBreakdown?.length) {
          setCatData(movData.categoryBreakdown.map((c: any) => ({ name: c.category || c._id, value: c.totalQuantity })));
        }

        // 2. Movement trends from API
        if (movData?.trends?.length) {
          const tMap: any = {};
          const days = parseInt(dateRange);
          for (let i = days - 1; i >= 0; i--) {
            const key = format(subDays(new Date(), i), 'MM/dd');
            tMap[key] = { date: key, In: 0, Out: 0 };
          }
          for (const t of movData.trends) {
            const key = format(new Date(t._id), 'MM/dd');
            if (tMap[key]) {
              for (const m of t.movements) {
                if (m.type === 'RECEIPT') tMap[key].In += m.totalQuantity;
                if (m.type === 'DELIVERY') tMap[key].Out += m.totalQuantity;
              }
            }
          }
          setTrendData(Object.values(tMap));
        }

        // 3. Capacity from warehouses + inventory
        if (Array.isArray(warehouses) && Array.isArray(inventory)) {
          let totalCap = 0, totalUsed = 0;
          for (const w of warehouses) if (w.locations) for (const l of w.locations) totalCap += l.capacity || 0;
          for (const i of inventory) totalUsed += i.quantity || 0;
          if (totalCap > 0) setCapacityData([{ name: 'Used', value: totalUsed }, { name: 'Free', value: Math.max(0, totalCap - totalUsed) }]);
        }

        // 4. Low stock / top movers from dashboard data
        if (dashboard?.lowStockProducts?.length) {
          setDeadStock(dashboard.lowStockProducts.slice(0, 5).map((p: any) => ({
            productId: { name: p.name, unit: 'units' }, quantity: p.totalQuantity, locationId: { rackCode: '—' }
          })));
        }
        if (dashboard?.recentMovements?.length) {
          const skuMap: any = {};
          for (const m of dashboard.recentMovements) {
            const id = m.productId?._id || m.productId;
            if (!skuMap[id]) skuMap[id] = { product: m.productId, count: 0 };
            skuMap[id].count++;
          }
          const sorted = Object.values(skuMap).sort((a: any, b: any) => b.count - a.count);
          if (sorted.length) setTopMovers(sorted.slice(0, 5) as any[]);
        }

      } catch (err) {} finally { setLoading(false); }
    };
    fetchAnalytics();
  }, [dateRange]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const filled = capacityData[0]?.value || 0;
  const free = capacityData[1]?.value || 0;
  const total = filled + free;

  return (
    <div className="flex flex-col h-full gap-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold text-white mb-0.5">Analytics</h1><p className="text-neutral-500 text-sm">Insights into stock movement, capacity, and distribution.</p></div>
        <Select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-40">
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 flex flex-col min-h-[380px]">
          <h3 className="font-medium text-white mb-4 text-sm flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-brand-500" /> Stock In/Out Flow</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="cIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="cOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="In" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#cIn)" />
                <Area type="monotone" dataKey="Out" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#cOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 flex flex-col min-h-[380px]">
          <h3 className="font-medium text-white mb-4 text-sm flex items-center gap-1.5"><LayoutGrid className="w-4 h-4 text-indigo-400" /> Warehouse Capacity</h3>
          <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={capacityData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                  <Cell fill="#6366f1" /><Cell fill="#262626" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex w-full justify-around mt-2">
              <div className="text-center"><div className="text-xl font-semibold text-indigo-400">{total > 0 ? (filled / total * 100).toFixed(1) : 0}%</div><div className="text-[10px] text-neutral-500 uppercase">Filled</div></div>
              <div className="text-center"><div className="text-xl font-semibold text-neutral-400">{total > 0 ? (free / total * 100).toFixed(1) : 0}%</div><div className="text-[10px] text-neutral-500 uppercase">Available</div></div>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2 flex flex-col min-h-[350px]">
          <h3 className="font-medium text-white mb-4 text-sm flex items-center gap-1.5"><Package className="w-4 h-4 text-brand-500" /> Stock by Category</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis type="number" stroke="#525252" fontSize={11} />
                <YAxis dataKey="name" type="category" width={100} stroke="#525252" fontSize={11} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="text-xs font-semibold text-brand-500 mb-3 uppercase tracking-wider">Top Movers (30 Days)</h3>
            <div className="space-y-2.5">
              {topMovers.map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-neutral-300 truncate pr-3">{m.product?.name}</span>
                  <span className="font-mono text-white font-medium">{m.count} <span className="text-[10px] text-neutral-600">moves</span></span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Low Stock Watch</h3>
            <div className="space-y-2.5">
              {deadStock.length === 0 ? <p className="text-sm text-neutral-500">All stock levels healthy.</p> : deadStock.map((d: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-neutral-300 truncate pr-3">{d.productId?.name || d.name}</span>
                  <span className="font-mono text-orange-400 font-medium">{d.quantity || d.totalQuantity}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
