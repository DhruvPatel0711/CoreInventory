'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Badge, Select, Label } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Real locations for selector
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventorySnapshot, setInventorySnapshot] = useState<any[]>([]);

  const [formData, setFormData] = useState({ 
    productId: '', 
    fromLocation: '', 
    quantity: 1, 
    reference: '' 
  });

  const fetchData = async () => {
    try {
      const [movRes, locRes, prodRes, invRes] = await Promise.all([
        api.get('/analytics/movements?limit=100'),
        api.get('/warehouses'),
        api.get('/products'),
        api.get('/inventory')
      ]);
      
      setDeliveries(movRes.data.filter((m: any) => m.type === 'DELIVERY'));
      
      // Flatten locations from warehouses
      const allLocs = [];
      for(let w of locRes.data) if(w.locations) allLocs.push(...w.locations);
      setLocations(allLocs);
      
      setProducts(prodRes.data);
      setInventorySnapshot(invRes.data);
    } catch (e) { toast.error("Failed fetching data"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deliveries', formData);
      toast.success('Delivery Executed! Stock Deducted.');
      setIsModalOpen(false);
      setFormData({ productId: '', fromLocation: '', quantity: 1, reference: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Execution failed');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent mb-1">Deliveries</h1>
          <p className="text-slate-500 text-sm">Pack and ship outgoing inventory deducting immediate physical stock.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 shadow-blue-500/20">
          <Plus className="w-5 h-5 mr-2" /> Dispatch Order
        </Button>
      </div>

      <div className="glass-card flex-1 overflow-hidden flex flex-col mt-4">
        {loading ? <div className="flex-1 flex items-center justify-center p-8">Loading...</div> : (
          <Table>
            <Thead>
              <Tr>
                <Th>Order Ref</Th>
                <Th>Product Sent</Th>
                <Th>Qty</Th>
                <Th>Source Bin</Th>
                <Th>Status & Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {deliveries.map((del, i) => (
                <Tr key={del._id}>
                  <Td className="font-mono text-xs text-blue-400 font-bold">{del.reference || 'Missing Ref'}</Td>
                  <Td className="text-slate-300">
                    {del.productId?.name || 'Unknown Product'}
                    <div className="text-xs text-slate-500 mt-1">{del.productId?.sku}</div>
                  </Td>
                  <Td className="font-bold text-white text-lg">{del.quantity}</Td>
                  <Td>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/50 inline-flex px-2 py-1 rounded">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> {del.fromLocation?.rackCode || 'Unknown'}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="success" className="text-[10px]"><CheckCircle className="w-3 h-3 mr-1"/> COMPLETED</Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {format(new Date(del.createdAt), 'MMM dd, HH:mm')}</span>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Delivery Dispatch">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label>Select Product</Label>
            <Select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value, fromLocation: ''})}>
              <option value="">-- Choose Product to Ship --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pull From Rack</Label>
              <Select required value={formData.fromLocation} onChange={e => setFormData({...formData, fromLocation: e.target.value})} disabled={!formData.productId}>
                <option value="">-- Choose Bin --</option>
                {/* Find locations holding this product */}
                {inventorySnapshot
                  .filter(inv => inv.productId?._id === formData.productId && inv.quantity > 0)
                  .map(inv => (
                    <option key={inv.locationId?._id} value={inv.locationId?._id}>
                      {inv.locationId?.rackCode} (Has {inv.quantity} in stock)
                    </option>
                  ))
                }
              </Select>
            </div>
            <div>
              <Label>Quantity to Send</Label>
              <Input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
            </div>
          </div>

          <div>
             <Label>Order Reference / Customer #</Label>
             <Input required value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="e.g. SO-99238" />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
             <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Execute Dispatch</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
