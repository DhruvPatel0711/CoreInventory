'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, MapPin, Plus } from 'lucide-react';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Label, Select } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [locations, setLocations] = useState<any[]>([]);
  const [inventorySnapshot, setInventorySnapshot] = useState<any[]>([]);

  const [formData, setFormData] = useState({ 
    productId: '', 
    fromLocation: '', 
    toLocation: '',
    quantity: 1, 
    reference: ''
  });

  const fetchData = async () => {
    try {
      const [movRes, locRes, invRes] = await Promise.all([
        api.get('/analytics/movements?limit=100'),
        api.get('/warehouses'),
        api.get('/inventory')
      ]);
      setTransfers(movRes.data.filter((m: any) => m.type === 'TRANSFER'));
      const allLocs = [];
      for(let w of locRes.data) if(w.locations) allLocs.push(...w.locations);
      setLocations(allLocs);
      setInventorySnapshot(invRes.data);
    } catch (e) { toast.error("Failed fetching"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromLocation === formData.toLocation) return toast.error('Source and Target cannot be the same');
    try {
      await api.post('/transfers', formData);
      toast.success('Transfer complete');
      setIsModalOpen(false);
      setFormData({ productId: '', fromLocation: '', toLocation: '', quantity: 1, reference: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failure');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent mb-1"><ArrowRightLeft className="inline w-6 h-6 mr-2 text-purple-400"/> Transfers</h1>
          <p className="text-slate-400 text-sm">Shift quantities across distribution nodes with zero net-balance loss.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 shadow-purple-500/20">
          <Plus className="w-5 h-5 mr-2" /> New Route
        </Button>
      </div>

      <div className="glass-card flex-1 overflow-hidden flex flex-col mt-4">
        {loading ? <div className="p-8 text-center text-slate-500">Loading routes...</div> : (
          <Table>
            <Thead>
              <Tr>
                <Th>Doc Ref</Th>
                <Th>Payload</Th>
                <Th>Flight Path</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transfers.map((tr) => (
                <Tr key={tr._id}>
                  <Td className="font-mono text-purple-300 font-bold text-xs">{tr.reference || 'SYSTEM'}</Td>
                  <Td className="text-slate-300 font-bold">{tr.quantity}x <span className="text-brand-300">{tr.productId?.name}</span></Td>
                  <Td>
                    <div className="flex items-center gap-2 text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-md border border-white/5 inline-flex text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-500"/> {tr.fromLocation?.rackCode}
                      <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400 mx-1"/>
                      <MapPin className="w-3.5 h-3.5 text-slate-500"/> {tr.toLocation?.rackCode}
                    </div>
                  </Td>
                  <Td className="text-slate-500 text-xs">{format(new Date(tr.createdAt), 'MM/dd HH:mm')}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Execute Internal Transfer">
        <form onSubmit={handleCreate} className="space-y-4">
          <Label>Source Inventory Instance</Label>
          <Select required value={`${formData.productId}|${formData.fromLocation}`} onChange={e => {
            const [pid, fid] = e.target.value.split('|');
            setFormData({...formData, productId: pid, fromLocation: fid});
          }}>
            <option value="|">-- Select Product holding in rack --</option>
            {inventorySnapshot.filter(inv => inv.quantity > 0).map(inv => (
               <option key={inv._id} value={`${inv.productId._id}|${inv.locationId._id}`}>
                 {inv.productId.sku} - {inv.productId.name} @ {inv.locationId?.rackCode} ({inv.quantity} available)
               </option>
            ))}
          </Select>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity to Relocate</Label>
               <Input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Target Rack</Label>
              <Select required value={formData.toLocation} onChange={e => setFormData({...formData, toLocation: e.target.value})}>
                <option value="">-- Choose Destination --</option>
                {locations.filter((loc:any) => loc._id !== formData.fromLocation).map((loc: any) => <option key={loc._id} value={loc._id}>{loc.rackCode}</option>)}
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4">
             <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit" className="bg-purple-600 hover:bg-purple-500">Sign Off Relocation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
