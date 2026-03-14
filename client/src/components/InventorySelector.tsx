'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Input } from './ui';
import { Search, MapPin, Package } from 'lucide-react';

export function InventorySelector({ 
  onSelect, 
  filterZeroStock = true, 
  placeholder = "Search available inventory..." 
}: { 
  onSelect: (item: any) => void;
  filterZeroStock?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let timeout: any;
    const fetchInv = async () => {
      if (!query.trim()) { setInventory([]); return; }
      try {
        const { data } = await api.get('/inventory'); 
        // /inventory returns wide list of populated { productId, locationId, quantity }
        let filtered = data.filter((i: any) => 
          i.productId.name.toLowerCase().includes(query.toLowerCase()) || 
          i.productId.sku.toLowerCase().includes(query.toLowerCase())
        );
        if (filterZeroStock) filtered = filtered.filter((i: any) => i.quantity > 0);
        setInventory(filtered.slice(0, 10)); // max 10 results
        setIsOpen(true);
      } catch (err) {}
    };

    timeout = setTimeout(fetchInv, 300); // 300ms debounce
    return () => clearTimeout(timeout);
  }, [query, filterZeroStock]);

  return (
    <div className="relative w-full">
      <Input 
        icon={<Search className="w-4 h-4 text-slate-500" />}
        placeholder={placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => inventory.length > 0 && setIsOpen(true)}
      />

      {isOpen && query.trim() && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {inventory.length === 0 ? (
            <div className="p-4 text-sm text-center text-slate-500">No matching stock found.</div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto custom-scrollbar">
              {inventory.map((inv) => (
                <li 
                  key={inv._id}
                  onClick={() => {
                    onSelect(inv);
                    setQuery(`${inv.productId.sku} - ${inv.productId.name}`);
                    setIsOpen(false);
                  }}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-brand-500" /> {inv.productId.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{inv.productId.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-700 dark:text-white text-sm">{inv.quantity} <span className="text-xs font-normal text-slate-500">{inv.productId.unit}</span></div>
                      <div className="text-[10px] text-brand-600 dark:text-brand-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {inv.locationId?.rackCode || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
    </div>
  );
}
