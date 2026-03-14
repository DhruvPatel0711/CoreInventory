'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Badge, Select, Label } from '@/components/ui';
import { CopyButton } from '@/components/CopyButton';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// ─── 200 Mock Receipts ──────────────────────────────────────
const SUPPLIERS = ['Acme Corp', 'SteelWorks Inc', 'PackPro Ltd', 'TechParts HQ', 'RawMat Global', 'QuickShip Co', 'MetalForge', 'PlastiCore', 'WoodCraft Supply', 'ChemTrade'];
const PRODUCTS = ['Steel Rods', 'Copper Wire', 'PVC Pipes', 'Aluminum Sheets', 'Rubber Seals', 'Glass Panels', 'Nylon Bolts', 'Carbon Fiber', 'Silicon Chips', 'LED Modules', 'Ceramic Tiles', 'Foam Padding', 'Vinyl Rolls', 'Brass Fittings', 'Zinc Plates'];
const RACKS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3'];
function genMock(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    _id: `mock-rcpt-${i}`, reference: `PO-${10000 + i}`, supplier: SUPPLIERS[i % SUPPLIERS.length],
    productId: { name: PRODUCTS[i % PRODUCTS.length], sku: `SKU-${String(100 + i).padStart(3, '0')}` },
    toLocation: { rackCode: RACKS[i % RACKS.length] }, quantity: 10 + (i % 200),
    status: i % 5 === 0 ? 'PENDING' : 'COMPLETED', createdAt: new Date(Date.now() - i * 7200000).toISOString(),
  }));
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>(genMock(200));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({ productId: '', toLocation: '', quantity: 1, reference: '', supplier: '', status: 'COMPLETED' });

  useEffect(() => {
    Promise.all([
      api.get('/analytics/movements?days=90').catch(() => null),
      api.get('/warehouses').catch(() => null),
      api.get('/products').catch(() => null),
    ]).then(([movRes, locRes, prodRes]) => {
      // movements: { success, data: { trends, ... } } — but we need raw movement docs
      // The movements endpoint returns aggregated trends, not raw docs.
      // We keep mock data as the primary view.

      // warehouses: { success, data: [ { _id, name, locations: [...] } ] }
      if (locRes?.data?.data && Array.isArray(locRes.data.data)) {
        const allLocs: any[] = [];
        for (const w of locRes.data.data) if (w.locations) allLocs.push(...w.locations);
        setLocations(allLocs);
      }
      // products: { success, data: [...], total, page }
      if (prodRes?.data?.data && Array.isArray(prodRes.data.data)) {
        setProducts(prodRes.data.data);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return receipts;
    const q = search.toLowerCase();
    return receipts.filter(r => r.reference?.toLowerCase().includes(q) || r.supplier?.toLowerCase().includes(q) || r.productId?.name?.toLowerCase().includes(q));
  }, [receipts, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/receipts', formData);
      toast.success('Stock received!');
      setIsModalOpen(false);
      setFormData({ productId: '', toLocation: '', quantity: 1, reference: '', supplier: '', status: 'COMPLETED' });
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold text-white mb-0.5">Receipts</h1><p className="text-neutral-500 text-sm">Incoming goods and vendor deliveries.</p></div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-500"><Plus className="w-4 h-4 mr-1.5" /> Receive Stock</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search receipts..." className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600" />
      </div>
      <div className="glass-card flex-1 overflow-auto">
        <Table>
          <Thead><Tr><Th>Reference</Th><Th>Supplier</Th><Th>Product</Th><Th>Qty</Th><Th>Rack</Th><Th>Status</Th><Th>Date</Th></Tr></Thead>
          <Tbody>
            {filtered.slice(0, 100).map(rec => (
              <Tr key={rec._id}>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-brand-500 font-medium">{rec.reference}</span>
                    <CopyButton text={rec.reference} />
                  </div>
                </Td>
                <Td className="text-neutral-300 text-sm">{rec.supplier || '—'}</Td>
                <Td>
                  <span className="text-neutral-200 text-sm">{rec.productId?.name}</span><br/>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-neutral-600">{rec.productId?.sku}</span>
                    <CopyButton text={rec.productId?.sku} className="scale-75 origin-left" />
                  </div>
                </Td>
                <Td className="font-semibold text-brand-500">+{rec.quantity}</Td>
                <Td>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    {rec.toLocation?.rackCode || '—'}
                    {rec.toLocation?.rackCode && <CopyButton text={rec.toLocation.rackCode} className="scale-75 origin-left" />}
                  </div>
                </Td>
                <Td><Badge variant={rec.status === 'COMPLETED' ? 'success' : 'default'} className="text-[10px] no-select">{rec.status}</Badge></Td>
                <Td className="text-xs text-neutral-500">{format(new Date(rec.createdAt), 'MMM dd, HH:mm')}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div className="text-center py-3 text-xs text-neutral-600">Showing {Math.min(100, filtered.length)} of {filtered.length} records</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Receive Stock">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Supplier</Label><Input required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="Acme Corp" /></div>
            <div><Label>Reference</Label><Input required value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="PO-8849" /></div>
          </div>
          <div><Label>Product</Label><Select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}><option value="">Select product</option>{products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}</Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quantity</Label><Input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} /></div>
            <div><Label>Target Rack</Label><Select required value={formData.toLocation} onChange={e => setFormData({...formData, toLocation: e.target.value})}><option value="">Select rack</option>{locations.map((l: any) => <option key={l._id} value={l._id}>{l.rackCode}</option>)}</Select></div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-500">Confirm Receipt</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
