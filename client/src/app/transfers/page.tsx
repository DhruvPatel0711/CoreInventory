'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, ArrowRightLeft } from 'lucide-react';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Select, Label } from '@/components/ui';
import { CopyButton } from '@/components/CopyButton';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PRODUCTS = ['Steel Rods', 'Copper Wire', 'PVC Pipes', 'Aluminum Sheets', 'Rubber Seals', 'Glass Panels', 'Nylon Bolts', 'Carbon Fiber', 'Silicon Chips', 'LED Modules', 'Ceramic Tiles', 'Foam Padding'];
const RACKS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3'];
function genMock(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    _id: `mock-tr-${i}`,
    productId: { name: PRODUCTS[i % PRODUCTS.length], sku: `SKU-${String(400 + i).padStart(3, '0')}` },
    fromLocation: { rackCode: RACKS[i % RACKS.length] }, toLocation: { rackCode: RACKS[(i + 3) % RACKS.length] },
    quantity: 5 + (i % 50), createdAt: new Date(Date.now() - i * 18000000).toISOString(),
  }));
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>(genMock(200));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [inventorySnapshot, setInventorySnapshot] = useState<any[]>([]);
  const [formData, setFormData] = useState({ productId: '', fromLocation: '', toLocation: '', quantity: 1 });

  useEffect(() => {
    Promise.all([
      api.get('/warehouses').catch(() => null),
      api.get('/inventory').catch(() => null),
    ]).then(([locRes, invRes]) => {
      if (locRes?.data?.data && Array.isArray(locRes.data.data)) {
        const a: any[] = [];
        for (const w of locRes.data.data) if (w.locations) a.push(...w.locations);
        setLocations(a);
      }
      if (invRes?.data?.data && Array.isArray(invRes.data.data)) setInventorySnapshot(invRes.data.data);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return transfers;
    const q = search.toLowerCase();
    return transfers.filter(t => t.productId?.name?.toLowerCase().includes(q) || t.fromLocation?.rackCode?.toLowerCase().includes(q) || t.toLocation?.rackCode?.toLowerCase().includes(q));
  }, [transfers, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transfers', formData);
      toast.success('Transfer executed!');
      setIsModalOpen(false);
      setFormData({ productId: '', fromLocation: '', toLocation: '', quantity: 1 });
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold text-white mb-0.5">Transfers</h1><p className="text-neutral-500 text-sm">Move inventory between warehouse locations.</p></div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-500"><Plus className="w-4 h-4 mr-1.5" /> New Transfer</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search transfers..." className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600" />
      </div>
      <div className="glass-card flex-1 overflow-auto">
        <Table>
          <Thead><Tr><Th>Product</Th><Th>From</Th><Th>To</Th><Th>Qty</Th><Th>Date</Th></Tr></Thead>
          <Tbody>
            {filtered.slice(0, 100).map(tr => (
              <Tr key={tr._id}>
                <Td>
                  <span className="text-neutral-200 text-sm">{tr.productId?.name}</span><br/>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-neutral-600">{tr.productId?.sku}</span>
                    <CopyButton text={tr.productId?.sku} className="scale-75 origin-left" />
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    {tr.fromLocation?.rackCode || '—'}
                    {tr.fromLocation?.rackCode && <CopyButton text={tr.fromLocation.rackCode} className="scale-75 origin-left" />}
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    {tr.toLocation?.rackCode || '—'}
                    {tr.toLocation?.rackCode && <CopyButton text={tr.toLocation.rackCode} className="scale-75 origin-left" />}
                  </div>
                </Td>
                <Td className="font-semibold text-indigo-400">{tr.quantity}</Td>
                <Td className="text-xs text-neutral-500">{format(new Date(tr.createdAt), 'MMM dd, HH:mm')}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div className="text-center py-3 text-xs text-neutral-600">Showing {Math.min(100, filtered.length)} of {filtered.length} records</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Transfer Stock">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><Label>Product</Label>
            <Select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value, fromLocation: ''})}>
              <option value="">Select product</option>
              {[...new Map(inventorySnapshot.filter(i => i.quantity > 0).map(i => [i.productId?._id, i])).values()].map(inv => (
                <option key={inv.productId?._id} value={inv.productId?._id}>{inv.productId?.name} ({inv.productId?.sku})</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>From</Label>
              <Select required value={formData.fromLocation} onChange={e => setFormData({...formData, fromLocation: e.target.value})} disabled={!formData.productId}>
                <option value="">Source</option>
                {inventorySnapshot.filter(i => i.productId?._id === formData.productId && i.quantity > 0).map(inv => <option key={inv.locationId?._id} value={inv.locationId?._id}>{inv.locationId?.rackCode} ({inv.quantity})</option>)}
              </Select>
            </div>
            <div><Label>To</Label>
              <Select required value={formData.toLocation} onChange={e => setFormData({...formData, toLocation: e.target.value})}>
                <option value="">Destination</option>
                {locations.filter(l => l._id !== formData.fromLocation).map(l => <option key={l._id} value={l._id}>{l.rackCode}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>Quantity</Label><Input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} /></div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">Execute</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
