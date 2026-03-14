'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, AlertTriangle, Clock, Box, Plus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { Button, Input, Label, Card } from '@/components/ui';

// ─── Interfaces ───────────────────────────────────────────────
interface Warehouse {
  _id: string;
  name: string;
  location: string;
}

interface Rack {
  _id: string;
  rackCode: string;
  capacity: number;
  currentQuantity: number;
  fillPercentage: number;
  status?: 'healthy' | 'low-stock' | 'empty' | 'recently-updated';
}

// ─── Color & Icon Helpers ─────────────────────────────────────
const getRackColor = (status?: Rack['status']) => {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
    case 'low-stock':
      return 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
    case 'empty':
      return 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
    case 'recently-updated':
      return 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
    default:
      return 'bg-slate-800 border-slate-700 text-slate-300';
  }
};

const getStatusLabel = (status?: Rack['status']) => {
  switch (status) {
    case 'healthy': return 'Healthy Stock';
    case 'low-stock': return 'Low Stock Warning';
    case 'empty': return 'Completely Empty';
    case 'recently-updated': return 'Recently Moved';
    default: return 'Unknown';
  }
};

const getStatusIcon = (status?: Rack['status']) => {
  switch (status) {
    case 'healthy': return <Package className="w-5 h-5 text-emerald-400" />;
    case 'low-stock': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'empty': return <Box className="w-5 h-5 text-red-400" />;
    case 'recently-updated': return <Clock className="w-5 h-5 text-blue-400" />;
    default: return <Box className="w-5 h-5 text-slate-400" />;
  }
};

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [locations, setLocations] = useState<Rack[]>([]);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateWh, setShowCreateWh] = useState(false);
  const [newWh, setNewWh] = useState({ name: '', location: '' });

  const [showCreateRack, setShowCreateRack] = useState(false);
  const [newRack, setNewRack] = useState({ rows: 1, cols: 2, capacity: 500 });
  const [rackSubmitting, setRackSubmitting] = useState(false);

  // 1. Fetch Warehouses
  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data);
      if (res.data.data.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(res.data.data[0]._id);
      }
    } catch (err: any) {
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Locations when Warehouse changes
  useEffect(() => {
    if (!selectedWarehouseId) return;
    const fetchLocations = async () => {
      try {
        const res = await api.get(`/warehouses/${selectedWarehouseId}/locations`);
        const racks = res.data.data.locations.map((r: Rack) => {
          // Compute status based on logic
          let status: Rack['status'] = 'healthy';
          if (r.fillPercentage === 0) status = 'empty';
          else if (r.fillPercentage < 20) status = 'low-stock';
          else if (r.fillPercentage > 90) status = 'recently-updated'; // Just using blue for high fill visually
          return { ...r, status };
        });
        setLocations(racks);
        setSelectedRack(null);
      } catch (err) {
        toast.error('Failed to load racks');
      }
    };
    fetchLocations();
  }, [selectedWarehouseId]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/warehouses', newWh);
      toast.success('Warehouse created');
      setWarehouses([...warehouses, res.data.data]);
      setSelectedWarehouseId(res.data.data._id);
      setShowCreateWh(false);
      setNewWh({ name: '', location: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create warehouse');
    }
  };

  const handleCreateRackRows = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouseId) return;
    setRackSubmitting(true);
    try {
      // Find the next available row letter
      const existingRows = locations.map(l => l.rackCode[0]);
      let nextRowChar = 'A';
      if (existingRows.length > 0) {
        const highestCode = existingRows.sort().reverse()[0];
        nextRowChar = String.fromCharCode(highestCode.charCodeAt(0) + 1);
      }

      // Create new sequence (e.g. F1, F2...)
      for (let r = 0; r < newRack.rows; r++) {
        const rowLetter = String.fromCharCode(nextRowChar.charCodeAt(0) + r);
        for (let c = 1; c <= newRack.cols; c++) {
          await api.post('/warehouses/racks', {
            warehouseId: selectedWarehouseId,
            rackCode: `${rowLetter}${c}`,
            capacity: newRack.capacity,
          });
        }
      }
      toast.success(`Added ${newRack.rows} rows with ${newRack.cols} racks each.`);
      setShowCreateRack(false);
      
      // Refresh locations
      const res = await api.get(`/warehouses/${selectedWarehouseId}/locations`);
      const racks = res.data.data.locations.map((r: Rack) => ({
        ...r, 
        status: r.fillPercentage === 0 ? 'empty' : r.fillPercentage < 20 ? 'low-stock' : 'healthy'
      }));
      setLocations(racks);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add racks');
    } finally {
      setRackSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading layout...</div>;

  return (
    <div className="flex flex-col h-full gap-6 relative">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-white bg-clip-text text-transparent mb-1">
            Warehouse Layout
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage physical locations and monitor capacity.</p>
        </div>
        
        {/* Warehouse Selector & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-64 p-2.5 pr-8 transition-colors select-custom"
            >
              <option value="" disabled>Select a Warehouse</option>
              {warehouses.map(w => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => setShowCreateWh(true)}>+ New Warehouse</Button>
          <Button variant="outline" onClick={() => setShowCreateRack(true)} disabled={!selectedWarehouseId}>+ Add Racks</Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 text-sm">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="text-slate-600 dark:text-slate-300">Healthy</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div><span className="text-slate-600 dark:text-slate-300">Low Stock</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div><span className="text-slate-600 dark:text-slate-300">Empty</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div><span className="text-slate-600 dark:text-slate-300">High Utilization</span></div>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left: 2D Grid */}
        <div className="flex-1 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-white/5 p-8 flex flex-col overflow-auto">
          {locations.length === 0 ? (
            <div className="m-auto text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No racks configured for this warehouse.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCreateRack(true)}>Create First Racks</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 min-w-max pb-8">
              {locations.map((rack) => {
                const fillPercentage = rack.fillPercentage || 0;
                const isSelected = selectedRack?._id === rack._id;
                
                return (
                  <motion.button
                    key={rack._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRack(rack)}
                    className={`relative w-24 h-32 md:w-28 md:h-36 rounded-xl border-2 flex flex-col items-center justify-between p-3 transition-all ${getRackColor(rack.status)} ${isSelected ? 'ring-4 ring-brand-500/50 scale-105 z-10' : 'hover:z-10 bg-white/50 dark:bg-transparent'}`}
                  >
                    <span className="text-xl font-black">{rack.rackCode}</span>
                    
                    {/* Visual Fill Level */}
                    <div className="w-full h-1/2 bg-slate-200 dark:bg-black/40 rounded-md overflow-hidden relative border border-slate-300 dark:border-white/10">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${fillPercentage}%` }}
                        transition={{ duration: 1, type: "spring" }}
                        className="absolute bottom-0 w-full left-0 bg-current opacity-60"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-bold drop-shadow-md ${fillPercentage > 50 ? 'text-white' : 'text-slate-700 dark:text-white'}`}>{fillPercentage}%</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {selectedRack ? (
              <motion.div
                key={selectedRack._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 flex-1 flex flex-col p-6 h-full overflow-hidden shadow-xl"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                      <MapPin className="text-brand-500" /> Rack {selectedRack.rackCode}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">{selectedRack.currentQuantity || 0} / {selectedRack.capacity} units filled</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-opacity-20 ${getRackColor(selectedRack.status)}`}>
                    {getStatusIcon(selectedRack.status)}
                  </div>
                </div>

                <div className={`px-4 py-3 rounded-lg border mb-6 flex items-center gap-3 ${getRackColor(selectedRack.status)}`}>
                  {getStatusIcon(selectedRack.status)}
                  <span className="font-semibold">{getStatusLabel(selectedRack.status)}</span>
                </div>

                <div className="flex-1 border border-dashed border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-400 p-6 text-center text-sm font-medium">
                  Products list endpoint required to show individual SKUs here. Current aggregation shows total units.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900/30 rounded-xl border-dashed border-2 border-slate-200 dark:border-white/10 flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500"
              >
                <MapPin className="w-12 h-12 mb-4 opacity-50 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Select a Rack</h3>
                <p className="text-sm">Click on any location in the grid to inspect utilization details.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Modals for Creation --- */}
      {showCreateWh && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">New Warehouse</h2>
            <form onSubmit={handleCreateWarehouse} className="space-y-4">
              <div>
                <Label>Warehouse Name</Label>
                <Input required value={newWh.name} onChange={e => setNewWh({...newWh, name: e.target.value})} placeholder="e.g. West Hub" />
              </div>
              <div>
                <Label>Address/Location String</Label>
                <Input required value={newWh.location} onChange={e => setNewWh({...newWh, location: e.target.value})} placeholder="City, State" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowCreateWh(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showCreateRack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add Rack Layout</h2>
            <p className="text-sm text-slate-500 mb-4">This will generate a grid of racks starting from the next available alphabetical row (e.g. A1, A2... B1, B2).</p>
            <form onSubmit={handleCreateRackRows} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Rows</Label>
                  <Input type="number" min="1" max="10" required value={newRack.rows} onChange={e => setNewRack({...newRack, rows: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Racks per Row (Cols)</Label>
                  <Input type="number" min="1" max="20" required value={newRack.cols} onChange={e => setNewRack({...newRack, cols: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <Label>Capacity per Rack (Units)</Label>
                <Input type="number" min="50" required value={newRack.capacity} onChange={e => setNewRack({...newRack, capacity: Number(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowCreateRack(false)} disabled={rackSubmitting}>Cancel</Button>
                <Button type="submit" disabled={rackSubmitting}>{rackSubmitting ? 'Generating...' : 'Generate Racks'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
