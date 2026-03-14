'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, AlertTriangle, Clock, Box } from 'lucide-react';

// ─── Interfaces ───────────────────────────────────────────────
interface ProductInRack {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface Rack {
  id: string;
  code: string; // e.g. A1
  status: 'healthy' | 'low-stock' | 'empty' | 'recently-updated';
  capacity: number;
  currentQuantity: number;
  products: ProductInRack[];
}

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_RACKS: Rack[] = [
  {
    id: 'l1',
    code: 'A1',
    status: 'healthy',
    capacity: 500,
    currentQuantity: 420,
    products: [
      { id: 'p1', name: 'Wireless Keyboard', sku: 'ELEC-KB-001', quantity: 200 },
      { id: 'p2', name: 'Optical Mouse', sku: 'ELEC-MS-002', quantity: 220 },
    ],
  },
  {
    id: 'l2',
    code: 'A2',
    status: 'recently-updated',
    capacity: 500,
    currentQuantity: 150,
    products: [{ id: 'p3', name: 'USB-C Cable', sku: 'ELEC-CB-100', quantity: 150 }],
  },
  {
    id: 'l3',
    code: 'A3',
    status: 'empty',
    capacity: 500,
    currentQuantity: 0,
    products: [],
  },
  {
    id: 'l4',
    code: 'B1',
    status: 'low-stock',
    capacity: 300,
    currentQuantity: 25,
    products: [{ id: 'p4', name: 'Desk Chair', sku: 'FURN-DC-044', quantity: 25 }],
  },
  {
    id: 'l5',
    code: 'B2',
    status: 'healthy',
    capacity: 300,
    currentQuantity: 280,
    products: [{ id: 'p5', name: 'Standing Desk', sku: 'FURN-SD-012', quantity: 280 }],
  },
  {
    id: 'l6',
    code: 'B3',
    status: 'healthy',
    capacity: 300,
    currentQuantity: 150,
    products: [
      { id: 'p6', name: 'Desk Lamp', sku: 'FURN-LM-01', quantity: 100 },
      { id: 'p7', name: 'Mouse Pad', sku: 'ELEC-MP-02', quantity: 50 },
    ],
  },
  {
    id: 'l7',
    code: 'C1',
    status: 'empty',
    capacity: 1000,
    currentQuantity: 0,
    products: [],
  },
  {
    id: 'l8',
    code: 'C2',
    status: 'low-stock',
    capacity: 1000,
    currentQuantity: 85,
    products: [{ id: 'p8', name: 'Running Shoes (M)', sku: 'CLO-RS-M', quantity: 85 }],
  },
  {
    id: 'l9',
    code: 'C3',
    status: 'recently-updated',
    capacity: 1000,
    currentQuantity: 900,
    products: [
      { id: 'p9', name: 'Winter Jacket (L)', sku: 'CLO-WJ-L', quantity: 450 },
      { id: 'p10', name: 'Winter Jacket (M)', sku: 'CLO-WJ-M', quantity: 450 },
    ],
  },
];

// ─── Color Helper ─────────────────────────────────────────────
const getRackColor = (status: Rack['status']) => {
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

const getStatusLabel = (status: Rack['status']) => {
  switch (status) {
    case 'healthy': return 'Healthy Stock';
    case 'low-stock': return 'Low Stock Warning';
    case 'empty': return 'Completely Empty';
    case 'recently-updated': return 'Recently Moved';
  }
};

const getStatusIcon = (status: Rack['status']) => {
  switch (status) {
    case 'healthy': return <Package className="w-5 h-5 text-emerald-400" />;
    case 'low-stock': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'empty': return <Box className="w-5 h-5 text-red-400" />;
    case 'recently-updated': return <Clock className="w-5 h-5 text-blue-400" />;
  }
};

// ─── Main Component ───────────────────────────────────────────
export default function WarehousePage() {
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-1">
          Warehouse Visualization
        </h1>
        <p className="text-slate-400 text-sm">Interactive 2D map of physical rack locations and their real-time stock status.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center p-4 glass-card text-sm">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="text-slate-300">Healthy</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div><span className="text-slate-300">Low Stock</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div><span className="text-slate-300">Empty</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div><span className="text-slate-300">Recently Updated</span></div>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left: 2D Grid */}
        <div className="flex-1 glass-card p-8 flex items-center justify-center overflow-auto">
          <div className="grid grid-cols-3 gap-6 md:gap-8 lg:gap-12 min-w-max">
            {MOCK_RACKS.map((rack) => {
              const fillPercentage = Math.round((rack.currentQuantity / rack.capacity) * 100);
              const isSelected = selectedRack?.id === rack.id;
              
              return (
                <motion.button
                  key={rack.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRack(rack)}
                  className={`relative w-24 h-32 md:w-32 md:h-40 rounded-xl border-2 flex flex-col items-center justify-between p-3 transition-all ${getRackColor(rack.status)} ${isSelected ? 'ring-4 ring-white/20 scale-105 z-10' : 'hover:z-10'}`}
                >
                  <span className="text-xl md:text-2xl font-black">{rack.code}</span>
                  
                  {/* Visual Fill Level */}
                  <div className="w-full h-1/2 bg-black/20 rounded-md overflow-hidden relative border border-white/5">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${fillPercentage}%` }}
                      transition={{ duration: 1, type: "spring" }}
                      className="absolute bottom-0 w-full left-0 bg-current opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow-md">{fillPercentage}%</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="w-full lg:w-96 shrink-0 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {selectedRack ? (
              <motion.div
                key={selectedRack.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card flex-1 flex flex-col p-6 h-full overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                      <MapPin className="text-brand-400" /> Rack {selectedRack.code}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">{selectedRack.currentQuantity} / {selectedRack.capacity} units filled</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-opacity-20 ${getRackColor(selectedRack.status)}`}>
                    {getStatusIcon(selectedRack.status)}
                  </div>
                </div>

                <div className={`px-4 py-3 rounded-lg border mb-6 flex items-center gap-3 ${getRackColor(selectedRack.status)}`}>
                  {getStatusIcon(selectedRack.status)}
                  <span className="font-semibold">{getStatusLabel(selectedRack.status)}</span>
                </div>

                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 px-1">
                  Stored Products
                </h3>

                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pr-2">
                  {selectedRack.products.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                      <Box className="w-8 h-8 mb-2 opacity-50" />
                      <p>No products in this location</p>
                    </div>
                  ) : (
                    selectedRack.products.map((prod) => (
                      <div key={prod.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 hover:border-brand-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-slate-200">{prod.name}</span>
                          <span className="bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded text-xs font-bold shrink-0 ml-2">
                            x{prod.quantity}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{prod.sku}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 border-dashed border-2 border-white/5"
              >
                <MapPin className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">Select a Rack</h3>
                <p className="text-sm">Click on any physical location in the 2D grid to inspect stored products and utilization.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
