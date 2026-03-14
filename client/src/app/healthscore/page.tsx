'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@/components/ui';
import { Activity, AlertTriangle, HardDrive, PackageX, Loader2 } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '@/lib/api';
import { format, subDays } from 'date-fns';

export default function HealthScorePage() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [deadStock, setDeadStock] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [overCapLocations, setOverCapLocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const [hRes, locRes, invRes, movRes] = await Promise.all([
          api.get('/analytics/health'),
          api.get('/warehouses'),
          api.get('/inventory'),
          api.get('/analytics/movements?limit=1000')
        ]);
        setHealthData(hRes.data);

        // Compute advanced metric arrays mimicking large-scale DB aggs
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);
        
        // 1. Low Stock Products
        // Assume products have reorderLevels, we filter inventory entries by quantity > 0 && <= reorderLevel
        const low = invRes.data.filter((i:any) => i.quantity > 0 && i.productId.reorderLevel >= i.quantity);
        setLowStock(Array.from(new Map(low.map((item:any) => [item.productId._id, item])).values()));

        // 2. Dead Stock
        const skuMoves = movRes.data.reduce((acc:any, cur:any) => {
            if(!acc[cur.productId._id]) acc[cur.productId._id] = { last: new Date('2000-01-01')};
            const d = new Date(cur.createdAt);
            if(d > acc[cur.productId._id].last) acc[cur.productId._id].last = d;
            return acc;
        }, {});
        
        const dead = invRes.data.filter((i:any) => i.quantity > 0 && (!skuMoves[i.productId._id] || skuMoves[i.productId._id].last < thirtyDaysAgo));
        setDeadStock(Array.from(new Map(dead.map((item:any) => [item.productId._id, item])).values()));

        // 3. Overcapacity Racks
        const locMap = new Map();
        locRes.data.forEach((w:any) => w.locations.forEach((l:any) => locMap.set(l._id, l)));
        const rackLoads = invRes.data.reduce((acc:any, cur:any) => {
            if(!acc[cur.locationId._id]) acc[cur.locationId._id] = 0;
            acc[cur.locationId._id] += cur.quantity;
            return acc;
        }, {});
        
        const over = [];
        for (const [lockId, load] of Object.entries(rackLoads)) {
           const lDef = locMap.get(lockId);
           if(lDef && (load as number) >= lDef.capacity * 0.9) { // 90%+ is overcap
               over.push({ rack: lDef.rackCode, load, max: lDef.capacity });
           }
        }
        setOverCapLocations(over);

      } catch (err) {} finally { setLoading(false); }
    };
    fetchHealth();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const score = healthData?.score || 0;
  const color = score >= 85 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col h-full gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-white bg-clip-text text-transparent mb-1">Health Deep Dive</h1>
        <p className="text-slate-500 text-sm">Actionable logistics signals targeting systemic overstock or depletion vulnerabilities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="p-6 md:col-span-1 flex flex-col items-center justify-center min-h-[300px] border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="w-48 h-48 relative">
            <CircularProgressbar
              value={score}
              text={`${score}`}
              strokeWidth={8}
              styles={buildStyles({
                pathColor: color, textColor: '#fff',
                trailColor: 'rgba(255,255,255,0.05)', strokeLinecap: 'round',
                textSize: '24px'
              })}
            />
          </div>
          <h2 className="text-xl font-bold mt-6 text-white text-center">Global Network Health</h2>
          <span className="text-sm text-slate-400 mt-1 max-w-xs text-center">{healthData?.message || 'Stable system state.'}</span>
        </Card>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="p-6 flex flex-col justify-between">
             <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
             <h3 className="text-lg font-bold text-white mb-2">Replenishment Watch</h3>
             <div className="text-4xl font-extrabold text-amber-500">{lowStock.length}</div>
             <p className="text-sm text-slate-400 mt-1">Unique SKUs below configured par levels.</p>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
             <PackageX className="w-8 h-8 text-red-500 mb-4" />
             <h3 className="text-lg font-bold text-white mb-2">Dead Stock Alert</h3>
             <div className="text-4xl font-extrabold text-red-500">{deadStock.length}</div>
             <p className="text-sm text-slate-400 mt-1">Products unmoved in trailing 30-day window.</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <Card className="p-0 border-amber-500/20">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500"/>
            <h3 className="font-bold text-white">Low Stock Breaches</h3>
          </div>
          <Table>
            <Thead><Tr><Th>Product Name</Th><Th>SKU</Th><Th>Current</Th><Th>Reorder @</Th></Tr></Thead>
            <Tbody>
               {lowStock.length === 0 ? <Tr><Td colSpan={4} className="text-center text-slate-500">All systems nominal.</Td></Tr> : lowStock.slice(0, 10).map((l:any) => (
                 <Tr key={l.productId._id}>
                   <Td className="font-medium text-slate-200 truncate max-w-[150px]">{l.productId.name}</Td>
                   <Td className="text-xs text-brand-400">{l.productId.sku}</Td>
                   <Td className="text-amber-500 font-bold">{l.quantity}</Td>
                   <Td className="text-slate-500">{l.productId.reorderLevel}</Td>
                 </Tr>
               ))}
            </Tbody>
          </Table>
        </Card>

        <Card className="p-0 border-red-500/20">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <PackageX className="w-5 h-5 text-red-500"/>
            <h3 className="font-bold text-white">Capital Sink (Dead Stock)</h3>
          </div>
          <Table>
            <Thead><Tr><Th>Product Name</Th><Th>Idle Location</Th><Th>Wasted Qty</Th></Tr></Thead>
            <Tbody>
               {deadStock.length === 0 ? <Tr><Td colSpan={3} className="text-center text-slate-500">Perfect rotation velocity.</Td></Tr> : deadStock.slice(0, 10).map((d:any) => (
                 <Tr key={d.productId._id}>
                   <Td className="font-medium text-slate-200 truncate max-w-[200px]">{d.productId.name}</Td>
                   <Td className="text-xs text-slate-400 bg-slate-900/50 inline-flex px-2 py-1 mt-2 rounded">{d.locationId?.rackCode || 'Unknown'}</Td>
                   <Td className="text-red-500 font-bold">{d.quantity} {d.productId.unit}</Td>
                 </Tr>
               ))}
            </Tbody>
          </Table>
        </Card>
      </div>

    </div>
  );
}
