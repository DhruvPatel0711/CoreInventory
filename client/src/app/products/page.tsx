'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, PackageSearch, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Modal, Table, Thead, Tbody, Tr, Th, Td, Badge, Select, Label } from '@/components/ui';
import { CategoryManager } from '@/components/CategoryManager';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Smart Filters
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState(''); // 'low', 'out', 'all'
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', sku: '', category: 'Electronics', unit: 'pcs', description: '', reorderLevel: 10 });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, formData);
        toast.success('Product updated');
      } else {
        await api.post('/products', formData);
        toast.success('Product created');
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setFormData({ name: p.name, sku: p.sku, category: p.category, unit: p.unit, description: p.description || '', reorderLevel: p.reorderLevel });
    setIsModalOpen(true);
  };

  // Smart Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter ? p.category === catFilter : true;
    
    // Temporary fallback for UI, replacing non-deterministic random with a stable value to prevent hydration mismatch
    const stock = p.totalStock || 0; 
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = stock <= p.reorderLevel && stock > 0;
    if (stockFilter === 'out') matchesStock = stock === 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-white bg-clip-text text-transparent mb-1">Products Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage inventory catalog and track SKUs in real-time.</p>
        </div>
        
        <Button onClick={() => { setEditProduct(null); setFormData({ name: '', sku: '', category: 'Electronics', unit: 'pcs', description: '', reorderLevel: 10 }); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </Button>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center border border-white/5">
        <div className="w-full sm:max-w-md">
          <Input icon={<Search className="w-4 h-4"/>} placeholder="Search products by SKU or Name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
          <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-32 sm:w-auto">
            <option value="">All Categories</option>
            {[...new Set(products.map(p => p.category))].map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="w-32 sm:w-auto">
            <option value="">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </Select>
        </div>
      </div>

      <div className="glass-card flex-1 overflow-hidden flex flex-col border border-white/5">
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Product / SKU</Th>
                <Th>Category</Th>
                <Th>Reorder Lvl</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProducts.map((prod, idx) => (
                <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.05, 0.5) }} key={prod._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <Td>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{prod.name}</span>
                      <span className="text-xs text-brand-500 dark:text-brand-400">{prod.sku}</span>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="default">{prod.category}</Badge>
                  </Td>
                  <Td className="text-slate-600 dark:text-slate-400 font-mono text-sm">{prod.reorderLevel} {prod.unit}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(prod)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-brand-500 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(prod._id)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </Td>
                </motion.tr>
              ))}
              {filteredProducts.length === 0 && (
                <Tr><Td colSpan={5} className="text-center py-8 text-slate-500">No products found matching filters.</Td></Tr>
              )}
            </Tbody>
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editProduct ? 'Edit Product' : 'Create New Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Wireless Keyboard" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SKU</Label>
              <Input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="ELEC-001" disabled={!!editProduct} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="mb-0">Category</Label>
                <CategoryManager onSelect={cat => setFormData({...formData, category: cat})} />
              </div>
              <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unit of Measure</Label>
              <Select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                <option value="pcs">Pieces (pcs)</option>
                <option value="boxes">Boxes</option>
                <option value="kg">Kilograms (kg)</option>
              </Select>
            </div>
            <div>
              <Label>Reorder Level</Label>
              <Input type="number" required min="0" value={formData.reorderLevel} onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value)})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-white/10">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
