'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, AlertOctagon, Plus } from 'lucide-react';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Label, Select } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function AdjustmentsPage() {
  const [adjs, setAdjs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [inventorySnapshot, setInventorySnapshot] = useState<any[]>([]);

  const [formData, setFormData] = useState({ 
    productId: '', 
    locationId: '', 
    quantity: 0, 
    notes: ''
  });
  
  const [realSysQty, setRealSysQty] = useState(0);

  const fetchData = async () => {
    try {
      const [movRes, invRes] = await Promise.all([
        api.get('/analytics/movements?limit=100'),
        api.get('/inventory')
      ]);
      setAdjs(movRes.data.filter((m: any) => m.type === 'ADJUSTMENT'));
      setInventorySnapshot(invRes.data);
    } catch (e) { toast.error("Failed fetching"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity === realSysQty) return toast.error('No difference between actual and system count.');
    
    // The backend wants the absolute diff, and sets fromLocation vs toLocation to dictate deduction vs addition
    // Actually per movement.service.ts API expectation for adjustment: `POST /adjustments` expects `productId, locationId, quantity`
    // And quantity < 0 means deduct, > 0 means add.
    const diff = formData.quantity - realSysQty;
    
    try {
      await api.post('/adjustments', { 
        productId: formData.productId, 
        locationId: formData.locationId, 
        quantity: diff, 
        notes: formData.notes 
      });
      toast.success('Stock force reconciled');
      setIsModalOpen(false);
      setFormData({ productId: '', locationId: '', quantity: 0, notes: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failure');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-white bg-clip-text text-transparent mb-1"><SlidersHorizontal className="inline w-6 h-6 mr-2 text-orange-400"/> Adjustments</h1>
          <p className="text-slate-400 text-sm">Force correct data integrity resolving physical count disparities.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 shadow-orange-500/20">
          <Plus className="w-5 h-5 mr-2" /> Log Discrepancy
        </Button>
      </div>

      <div className="glass-card flex-1 overflow-hidden flex flex-col mt-4">
        {loading ? <div className="p-8 text-center text-slate-500">Loading audit trail...</div> : (
          <Table>
            <Thead>
              <Tr>
                <Th>Target Node</Th>
                <Th>Variance / Qty Shift</Th>
                <Th>Reason Context</Th>
                <Th>Date Logged</Th>
              </Tr>
            </Thead>
            <Tbody>
              {adjs.map((adj) => (
                <Tr key={adj._id}>
                  <Td>
                    <div className="font-bold text-slate-200">{adj.productId?.name}</div>
                    <div className="text-xs text-slate-500">Rack: {adj.toLocation?.rackCode || adj.fromLocation?.rackCode}</div>
                  </Td>
                  <Td>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${adj.fromLocation && !adj.toLocation ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      {adj.fromLocation && !adj.toLocation ? '-' : '+'}{adj.quantity}
                    </span>
                  </Td>
                  <Td className="text-slate-400 text-sm max-w-xs truncate">{adj.notes || 'No Reason Provided'}</Td>
                  <Td className="text-slate-500 text-xs">{format(new Date(adj.createdAt), 'MM/dd HH:mm')}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Audit Count Reconcile">
        <form onSubmit={handleCreate} className="space-y-4">
          <Label>Target Node for Audit</Label>
          <Select required value={`${formData.productId}|${formData.locationId}`} onChange={e => {
            const [pid, fid] = e.target.value.split('|');
            const foundCount = inventorySnapshot.find(i => i.productId._id === pid && i.locationId._id === fid)?.quantity || 0;
            setRealSysQty(foundCount);
            setFormData({...formData, productId: pid, locationId: fid, quantity: foundCount}); // Default to current
          }}>
            <option value="|">-- Select specific product node --</option>
            {inventorySnapshot.map(inv => (
               <option key={inv._id} value={`${inv.productId._id}|${inv.locationId._id}`}>
                 {inv.productId.sku} - {inv.productId.name} @ {inv.locationId?.rackCode} (Sys Read: {inv.quantity})
               </option>
            ))}
          </Select>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 text-center">
              <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">System Reads</span>
              <span className="text-2xl font-bold text-slate-300">{realSysQty}</span>
            </div>
            <div>
              <Label>Actual Staff Count</Label>
              <Input type="number" required min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} className="text-center font-bold text-2xl" />
            </div>
          </div>
          
          <div>
            <Label>Justification Notes</Label>
            <Input required placeholder="Broken, damaged, miscounted..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4">
             <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit" className="bg-orange-600 hover:bg-orange-500">Force Override Count</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
