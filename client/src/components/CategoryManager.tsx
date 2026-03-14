'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Button, Input, Modal } from './ui';
import { motion } from 'framer-motion';

const DEFAULT_CATS = ['Electronics', 'Furniture', 'Office', 'Clothing', 'Raw Materials'];

export function CategoryManager({ onSelect }: { onSelect?: (cat: string) => void }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('custom_categories');
    if (saved) setCategories(JSON.parse(saved));
    else setCategories(DEFAULT_CATS);
  }, []);

  const saveCats = (cats: string[]) => {
    setCategories(cats);
    localStorage.setItem('custom_categories', JSON.stringify(cats));
  };

  const handleAdd = () => {
    if (!newCat.trim()) return;
    if (editIdx !== null) {
      const updated = [...categories];
      updated[editIdx] = newCat.trim();
      saveCats(updated);
      setEditIdx(null);
    } else {
      if (!categories.includes(newCat.trim())) {
        saveCats([...categories, newCat.trim()]);
      }
    }
    setNewCat('');
  };

  const handleDelete = (idx: number) => {
    saveCats(categories.filter((_, i) => i !== idx));
  };

  return (
    <>
      <Button variant="secondary" size="sm" type="button" onClick={() => setIsOpen(true)}>Manage Categories</Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Category Manager">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="New category name..." 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            />
            <Button onClick={handleAdd} type="button">
              {editIdx !== null ? 'Update' : <Plus className="w-4 h-4" />}
            </Button>
            {editIdx !== null && (
              <Button variant="ghost" onClick={() => { setEditIdx(null); setNewCat(''); }}><X className="w-4 h-4" /></Button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 mt-4 custom-scrollbar pr-2">
            {categories.map((cat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-medium text-slate-800 dark:text-slate-200 cursor-pointer hover:text-brand-500" onClick={() => onSelect && (onSelect(cat), setIsOpen(false))}>
                  {cat}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditIdx(idx); setNewCat(cat); }} className="p-1.5 text-slate-400 hover:text-brand-500 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(idx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
