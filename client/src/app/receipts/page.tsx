'use client';

import React, { useState, useEffect } from 'react';
import { Plus, PackagePlus, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Badge, Select, Label } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({ 
    productId: '', 
    toLocation: '', 
    quantity: 1, 
    reference: '',
    supplier: '',
    status: 'COMPLETED'
  });

  const fetchData = async () => {
    try {
      const [movRes, locRes, prodRes] = await Promise.all([
        api.get('/analytics/movements?limit=100'),
        api.get('/warehouses'),
        api.get('/products')
      ]);
      
      setReceipts(movRes.data.filter((m: any) => m.type === 'RECEIPT'));
      
      const allLocs = [];
      for(let w of locRes.data) if(w.locations) allLocs.push(...w.locations);
      setLocations(allLocs);
      setProducts(prodRes.data);
    } catch (e) { toast.error("Failed fetching data"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/receipts', formData);
      toast.success('Inbound Stock Received!');
      setIsModalOpen(false);
      setFormData({ productId: '', toLocation: '', quantity: 1, reference: '', supplier: '', status: 'COMPLETED' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Execution failed');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-white bg-clip-text text-transparent mb-1">Inbound Receipts</h1>
          <p className="text-slate-500 text-sm">Log vendor deliveries and inject physical stock into specific warehouse racks.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20">
          <Plus className="w-5 h-5 mr-2" /> Receive Stock
        </Button>
      </div>

      <div className="glass-card flex-1 overflow-hidden flex flex-col mt-4">
        {loading ? <div className="flex-1 flex items-center justify-center p-8">Loading...</div> : (
          <Table>
            <Thead>
              <Tr>
                <Th>Doc Ref</Th>
                <Th>Supplier</Th>
                <Th>Product</Th>
                <Th>Qty Recv'd</Th>
                <Th>Status & Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {receipts.map((rec) => (
                <Tr key={rec._id}>
                  <Td className="font-mono text-xs text-emerald-400 font-bold"><FileText className="w-3.5 h-3.5 inline mr-1 text-slate-500"/> {rec.reference || 'Missing Ref'}</Td>
                  <Td className="text-slate-300 font-medium">{rec.supplier || 'Internal Load'}</Td>
                  <Td className="text-slate-400">
                    <span className="text-slate-200">{rec.productId?.name || 'Unknown'}</span><br/>
                    <span className="text-[10px] bg-slate-800 px-1 rounded">{rec.toLocation?.rackCode}</span>
                  </Td>
                  <Td className="font-bold text-emerald-400 text-lg">+{rec.quantity}</Td>
                  <Td>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="success" className="text-[10px]"><CheckCircle className="w-3 h-3 mr-1"/> {rec.status}</Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {format(new Date(rec.createdAt), 'MMM dd, HH:mm')}</span>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Inbound Delivery">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <Label>Supplier / Vendor</Label>
               <Input required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="e.g. Acme Corp" />
             </div>
             <div>
               <Label>Document Reference</Label>
               <Input required value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="e.g. PO-8849" />
             </div>
          </div>

          <div>
            <Label>Select Product Arrived</Label>
            <Select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}>
              <option value="">-- Choose Product --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity Delivered</Label>
              <Input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Target Storage Rack</Label>
              <Select required value={formData.toLocation} onChange={e => setFormData({...formData, toLocation: e.target.value})}>
                <option value="">-- Choose Target Rack --</option>
                {locations.map((loc: any) => <option key={loc._id} value={loc._id}>{loc.rackCode} (Max {loc.capacity})</option>)}
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
             <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500">Log Goods Receipt</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
