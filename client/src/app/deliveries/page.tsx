'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, MapPin, Search } from 'lucide-react';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Badge, Select, Label } from '@/components/ui';
import { CopyButton } from '@/components/CopyButton';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CUSTOMERS = ['RetailMax', 'HomePlus', 'BuildRight', 'TechParts', 'OfficeGo', 'GreenLeaf', 'AutoZone', 'MediStore', 'FoodCo', 'StyleHaus'];
const PRODUCTS = ['Steel Rods', 'Copper Wire', 'PVC Pipes', 'Aluminum Sheets', 'Rubber Seals', 'Glass Panels', 'Nylon Bolts', 'Carbon Fiber', 'Silicon Chips', 'LED Modules', 'Ceramic Tiles', 'Foam Padding'];
const RACKS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2'];
function genMock(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    _id: `mock-del-${i}`, reference: `SO-${80000 + i}`,
    productId: { name: PRODUCTS[i % PRODUCTS.length], sku: `SKU-${String(200 + i).padStart(3, '0')}` },
    fromLocation: { rackCode: RACKS[i % RACKS.length] }, quantity: 5 + (i % 80),
    customer: CUSTOMERS[i % CUSTOMERS.length], createdAt: new Date(Date.now() - i * 10800000).toISOString(),
  }));
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>(genMock(200));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventorySnapshot, setInventorySnapshot] = useState<any[]>([]);
  const [formData, setFormData] = useState({ productId: '', fromLocation: '', quantity: 1, reference: '' });

  useEffect(() => {
    Promise.all([
      api.get('/warehouses').catch(() => null),
      api.get('/products').catch(() => null),
      api.get('/inventory').catch(() => null),
    ]).then(([locRes, prodRes, invRes]) => {
      if (locRes?.data?.data && Array.isArray(locRes.data.data)) {
        const a: any[] = [];
        for (const w of locRes.data.data) if (w.locations) a.push(...w.locations);
        setLocations(a);
      }
      if (prodRes?.data?.data && Array.isArray(prodRes.data.data)) setProducts(prodRes.data.data);
      if (invRes?.data?.data && Array.isArray(invRes.data.data)) setInventorySnapshot(invRes.data.data);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return deliveries;
    const q = search.toLowerCase();
    return deliveries.filter(d => d.reference?.toLowerCase().includes(q) || d.productId?.name?.toLowerCase().includes(q) || d.customer?.toLowerCase().includes(q));
  }, [deliveries, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deliveries', formData);
      toast.success('Delivery dispatched!');
      setIsModalOpen(false);
      setFormData({ productId: '', fromLocation: '', quantity: 1, reference: '' });
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold text-white mb-0.5">Deliveries</h1><p className="text-neutral-500 text-sm">Outbound shipments and order dispatches.</p></div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-500"><Plus className="w-4 h-4 mr-1.5" /> Dispatch Order</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search deliveries..." className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600" />
      </div>
      <div className="glass-card flex-1 overflow-auto">
        <Table>
          <Thead><Tr><Th>Order Ref</Th><Th>Product</Th><Th>Qty</Th><Th>Source</Th><Th>Customer</Th><Th>Date</Th></Tr></Thead>
          <Tbody>
            {filtered.slice(0, 100).map(del => (
              <Tr key={del._id}>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-orange-400 font-medium">{del.reference}</span>
                    <CopyButton text={del.reference} />
                  </div>
                </Td>
                <Td>
                  <span className="text-neutral-200 text-sm">{del.productId?.name}</span><br/>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-neutral-600">{del.productId?.sku}</span>
                    <CopyButton text={del.productId?.sku} className="scale-75 origin-left" />
                  </div>
                </Td>
                <Td className="font-semibold text-neutral-200">{del.quantity}</Td>
                <Td>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <MapPin className="w-3 h-3" /> {del.fromLocation?.rackCode || '—'}
                    {del.fromLocation?.rackCode && <CopyButton text={del.fromLocation.rackCode} className="scale-75 origin-left" />}
                  </div>
                </Td>
                <Td className="text-sm text-neutral-400">{del.customer || '—'}</Td>
                <Td className="text-xs text-neutral-500">{format(new Date(del.createdAt), 'MMM dd, HH:mm')}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div className="text-center py-3 text-xs text-neutral-600">Showing {Math.min(100, filtered.length)} of {filtered.length} records</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Dispatch Delivery">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><Label>Product</Label><Select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value, fromLocation: ''})}><option value="">Select product</option>{products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}</Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Source Rack</Label>
              <Select required value={formData.fromLocation} onChange={e => setFormData({...formData, fromLocation: e.target.value})} disabled={!formData.productId}>
                <option value="">Select source</option>
                {inventorySnapshot.filter(inv => inv.productId?._id === formData.productId && inv.quantity > 0).map(inv => <option key={inv.locationId?._id} value={inv.locationId?._id}>{inv.locationId?.rackCode} ({inv.quantity} avail)</option>)}
              </Select>
            </div>
            <div><Label>Quantity</Label><Input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} /></div>
          </div>
          <div><Label>Order Reference</Label><Input required value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="SO-99238" /></div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-500">Dispatch</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
