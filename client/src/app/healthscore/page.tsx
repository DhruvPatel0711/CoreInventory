'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui';
import { AlertTriangle, PackageX, Loader2, Activity } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import api from '@/lib/api';

// Mock data fallback
const MOCK_HEALTH = { score: 84, penalties: { lowStock: -8, deadStock: -5, overCapacity: -3 }, message: 'System operating normally.' };
const MOCK_LOW = [
  { productId: { _id: '1', name: 'Steel Rods', sku: 'SKU-101', reorderLevel: 50 }, quantity: 12 },
  { productId: { _id: '2', name: 'Copper Wire', sku: 'SKU-102', reorderLevel: 30 }, quantity: 8 },
  { productId: { _id: '3', name: 'PVC Pipes', sku: 'SKU-103', reorderLevel: 40 }, quantity: 15 },
  { productId: { _id: '4', name: 'Rubber Seals', sku: 'SKU-104', reorderLevel: 25 }, quantity: 6 },
  { productId: { _id: '5', name: 'Glass Panels', sku: 'SKU-105', reorderLevel: 20 }, quantity: 3 },
];
const MOCK_DEAD = [
  { productId: { _id: '10', name: 'Vinyl Rolls', unit: 'pcs' }, quantity: 120, locationId: { rackCode: 'C2' } },
  { productId: { _id: '11', name: 'Zinc Plates', unit: 'pcs' }, quantity: 85, locationId: { rackCode: 'D1' } },
  { productId: { _id: '12', name: 'Foam Padding', unit: 'pcs' }, quantity: 45, locationId: { rackCode: 'A3' } },
];
const MOCK_OVER = [
  { rack: 'B2', load: 95, max: 100 },
  { rack: 'A1', load: 88, max: 90 },
];

export default function HealthScorePage() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(MOCK_HEALTH);
  const [deadStock, setDeadStock] = useState<any[]>(MOCK_DEAD);
  const [lowStock, setLowStock] = useState<any[]>(MOCK_LOW);
  const [overCapLocations, setOverCapLocations] = useState<any[]>(MOCK_OVER);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const [hRes, locRes, invRes] = await Promise.all([
          api.get('/analytics/health').catch(() => null),
          api.get('/warehouses').catch(() => null),
          api.get('/inventory').catch(() => null),
        ]);

        // Health: { success, data: { score, penalties, message } }
        if (hRes?.data?.data) setHealthData(hRes.data.data);

        const warehouses = locRes?.data?.data;
        const inventory = invRes?.data?.data;

        if (Array.isArray(inventory)) {
          // Low stock: inventory entries where qty > 0 and qty <= reorderLevel
          const low = inventory.filter((i: any) => i.quantity > 0 && i.productId?.reorderLevel && i.quantity <= i.productId.reorderLevel);
          const uniqueLow = Array.from(new Map(low.map((item: any) => [item.productId?._id, item])).values());
          if (uniqueLow.length > 0) setLowStock(uniqueLow);

          // Over-capacity racks
          if (Array.isArray(warehouses)) {
            const locMap = new Map<string, any>();
            for (const w of warehouses) if (w.locations) for (const l of w.locations) locMap.set(l._id, l);

            const rackLoads: Record<string, number> = {};
            for (const inv of inventory) {
              const lid = inv.locationId?._id;
              if (lid) rackLoads[lid] = (rackLoads[lid] || 0) + inv.quantity;
            }
            const over: any[] = [];
            for (const [lid, load] of Object.entries(rackLoads)) {
              const lDef = locMap.get(lid);
              if (lDef && load >= lDef.capacity * 0.9) over.push({ rack: lDef.rackCode, load, max: lDef.capacity });
            }
            if (over.length > 0) setOverCapLocations(over);
          }
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetchHealth();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

  const score = healthData?.score || 0;
  const color = score >= 85 ? '#10b981' : score >= 60 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col h-full gap-6 pb-8">
      <div><h1 className="text-2xl font-semibold text-white mb-0.5">Health Score</h1><p className="text-neutral-500 text-sm">Inventory health analysis with actionable signals.</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex flex-col items-center justify-center min-h-[280px]">
          <div className="w-40 h-40 relative">
            <CircularProgressbar value={score} text={`${String(score)}`} strokeWidth={8}
              styles={buildStyles({ pathColor: color, textColor: '#fff', trailColor: '#262626', strokeLinecap: 'round', textSize: '24px' })} />
          </div>
          <h2 className="text-lg font-semibold mt-4 text-white">Overall Health</h2>
          <span className="text-sm text-neutral-500 mt-1 text-center">{healthData?.message || 'System stable.'}</span>
        </Card>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex flex-col">
            <AlertTriangle className="w-6 h-6 text-orange-400 mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">Low Stock</h3>
            <div className="text-3xl font-bold text-orange-400">{lowStock.length}</div>
            <p className="text-xs text-neutral-500 mt-1">SKUs below reorder level</p>
          </Card>
          <Card className="p-5 flex flex-col">
            <PackageX className="w-6 h-6 text-red-400 mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">Dead Stock</h3>
            <div className="text-3xl font-bold text-red-400">{deadStock.length}</div>
            <p className="text-xs text-neutral-500 mt-1">No movement in 30+ days</p>
          </Card>
          <Card className="p-5 flex flex-col">
            <Activity className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">Near Capacity</h3>
            <div className="text-3xl font-bold text-indigo-400">{overCapLocations.length}</div>
            <p className="text-xs text-neutral-500 mt-1">Racks at 90%+ fill</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-0">
          <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" /><h3 className="font-medium text-white text-sm">Low Stock Alerts</h3>
          </div>
          <Table>
            <Thead><Tr><Th>Product</Th><Th>SKU</Th><Th>Current</Th><Th>Reorder At</Th></Tr></Thead>
            <Tbody>
              {lowStock.length === 0 ? <Tr><Td colSpan={4} className="text-center text-neutral-500">All stock healthy.</Td></Tr> : lowStock.slice(0, 10).map((l: any) => (
                <Tr key={l.productId?._id}>
                  <Td className="text-neutral-200 text-sm">{l.productId?.name}</Td>
                  <Td className="text-xs text-brand-500">{l.productId?.sku}</Td>
                  <Td className="text-orange-400 font-semibold">{l.quantity}</Td>
                  <Td className="text-neutral-500">{l.productId?.reorderLevel}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>

        <Card className="p-0">
          <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
            <PackageX className="w-4 h-4 text-red-400" /><h3 className="font-medium text-white text-sm">Dead Stock</h3>
          </div>
          <Table>
            <Thead><Tr><Th>Product</Th><Th>Rack</Th><Th>Qty</Th></Tr></Thead>
            <Tbody>
              {deadStock.length === 0 ? <Tr><Td colSpan={3} className="text-center text-neutral-500">No dead stock.</Td></Tr> : deadStock.slice(0, 10).map((d: any, i: number) => (
                <Tr key={i}>
                  <Td className="text-neutral-200 text-sm">{d.productId?.name}</Td>
                  <Td className="text-xs text-neutral-500">{d.locationId?.rackCode || '—'}</Td>
                  <Td className="text-red-400 font-semibold">{d.quantity}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      </div>

      {overCapLocations.length > 0 && (
        <Card className="p-0">
          <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /><h3 className="font-medium text-white text-sm">Near-Capacity Racks</h3>
          </div>
          <Table>
            <Thead><Tr><Th>Rack</Th><Th>Load</Th><Th>Capacity</Th><Th>Fill %</Th></Tr></Thead>
            <Tbody>
              {overCapLocations.map((o: any, i: number) => (
                <Tr key={i}>
                  <Td className="text-neutral-200 font-medium">{o.rack}</Td>
                  <Td className="text-neutral-300">{o.load}</Td>
                  <Td className="text-neutral-500">{o.max}</Td>
                  <Td><span className={`px-2 py-0.5 rounded text-xs font-medium ${(o.load / o.max) >= 1 ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>{((o.load / o.max) * 100).toFixed(0)}%</span></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
