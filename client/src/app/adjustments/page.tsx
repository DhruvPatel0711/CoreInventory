'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Label, Select } from '@/components/ui';
import { CopyButton } from '@/components/CopyButton';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PRODUCTS = ['Steel Rods', 'Copper Wire', 'PVC Pipes', 'Aluminum Sheets', 'Rubber Seals', 'Glass Panels', 'Nylon Bolts', 'Carbon Fiber', 'Silicon Chips', 'LED Modules'];
const RACKS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1'];
const REASONS = ['Damage', 'Miscount', 'Expired', 'Theft', 'Audit reconciliation', 'Warehouse reorganization', 'Quality rejection', 'Return processing', 'Sample removed', 'Shrinkage'];
function genMock(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    _id: `mock-adj-${i}`,
    productId: { name: PRODUCTS[i % PRODUCTS.length], sku: `SKU-${String(300 + i).padStart(3, '0')}` },
    toLocation: i % 2 === 0 ? { rackCode: RACKS[i % RACKS.length] } : null,
    fromLocation: i % 2 !== 0 ? { rackCode: RACKS[i % RACKS.length] } : null,
    quantity: 1 + (i % 25), notes: REASONS[i % REASONS.length],
    createdAt: new Date(Date.now() - i * 14400000).toISOString(),
  }));
}

export default function AdjustmentsPage() {
  const [adjs, setAdjs] = useState<any[]>(genMock(200));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [inventorySnapshot, setInventorySnapshot] = useState<any[]>([]);
  const [formData, setFormData] = useState({ productId: '', locationId: '', quantity: 0, notes: '' });
  const [realSysQty, setRealSysQty] = useState(0);

  useEffect(() => {
    api.get('/inventory').then(res => {
      const inv = res.data?.data;
      if (Array.isArray(inv)) setInventorySnapshot(inv);
    }).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!search) return adjs;
    const q = search.toLowerCase();
    return adjs.filter(a => a.productId?.name?.toLowerCase().includes(q) || a.notes?.toLowerCase().includes(q));
  }, [adjs, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity === realSysQty) return toast.error('No difference detected.');
    const diff = formData.quantity - realSysQty;
    try {
      await api.post('/adjustments', { productId: formData.productId, locationId: formData.locationId, quantity: diff, notes: formData.notes });
      toast.success('Stock adjusted!');
      setIsModalOpen(false);
      setFormData({ productId: '', locationId: '', quantity: 0, notes: '' });
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold text-white mb-0.5">Adjustments</h1><p className="text-neutral-500 text-sm">Stock corrections and audit reconciliations.</p></div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-neutral-700 hover:bg-neutral-600"><Plus className="w-4 h-4 mr-1.5" /> Log Adjustment</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search adjustments..." className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600" />
      </div>
      <div className="glass-card flex-1 overflow-auto">
        <Table>
          <Thead><Tr><Th>Product</Th><Th>Rack</Th><Th>Change</Th><Th>Reason</Th><Th>Date</Th></Tr></Thead>
          <Tbody>
            {filtered.slice(0, 100).map(adj => {
              const isDecrease = adj.fromLocation && !adj.toLocation;
              return (
                <Tr key={adj._id}>
                  <Td>
                    <span className="text-neutral-200 text-sm">{adj.productId?.name}</span><br/>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-neutral-600">{adj.productId?.sku}</span>
                      <CopyButton text={adj.productId?.sku} className="scale-75 origin-left" />
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      {adj.toLocation?.rackCode || adj.fromLocation?.rackCode || '—'}
                      {(adj.toLocation?.rackCode || adj.fromLocation?.rackCode) && <CopyButton text={adj.toLocation?.rackCode || adj.fromLocation?.rackCode} className="scale-75 origin-left" />}
                    </div>
                  </Td>
                  <Td><span className={`px-2 py-0.5 rounded text-xs font-medium no-select ${isDecrease ? 'bg-red-500/10 text-red-400' : 'bg-brand-500/10 text-brand-500'}`}>{isDecrease ? '-' : '+'}{adj.quantity}</span></Td>
                  <Td className="text-sm text-neutral-400 max-w-xs truncate">{adj.notes || '—'}</Td>
                  <Td className="text-xs text-neutral-500">{format(new Date(adj.createdAt), 'MMM dd, HH:mm')}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        <div className="text-center py-3 text-xs text-neutral-600">Showing {Math.min(100, filtered.length)} of {filtered.length} records</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Stock Adjustment">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><Label>Inventory Node</Label>
            <Select required value={`${formData.productId}|${formData.locationId}`} onChange={e => {
              const [pid, lid] = e.target.value.split('|');
              const found = inventorySnapshot.find(i => i.productId?._id === pid && i.locationId?._id === lid)?.quantity || 0;
              setRealSysQty(found);
              setFormData({...formData, productId: pid, locationId: lid, quantity: found});
            }}>
              <option value="|">Select product @ location</option>
              {inventorySnapshot.map(inv => <option key={inv._id} value={`${inv.productId?._id}|${inv.locationId?._id}`}>{inv.productId?.name} @ {inv.locationId?.rackCode} (Sys: {inv.quantity})</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center">
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">System</span>
              <span className="text-xl font-semibold text-neutral-300">{realSysQty}</span>
            </div>
            <div><Label>Actual Count</Label><Input type="number" required min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} /></div>
          </div>
          <div><Label>Reason</Label><Input required placeholder="Damaged, expired..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-neutral-700 hover:bg-neutral-600">Apply</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
