'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { Input, Button, Label } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      const token = data?.data?.token;
      const user = data?.data?.user;
      if (!token) throw new Error('Missing token');
      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      toast.success('Account created');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">CI</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Create account</h1>
          <p className="text-neutral-500 mt-1 text-sm">Get started with CoreInventory</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div><Label htmlFor="name">Name</Label><Input id="name" type="text" icon={<User className="w-4 h-4" />} required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" icon={<Mail className="w-4 h-4" />} required placeholder="you@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" icon={<Lock className="w-4 h-4" />} required placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
          <Button type="submit" className="w-full mt-4 bg-brand-600 hover:bg-brand-500" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Account {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
        </form>
        <p className="text-center text-xs text-neutral-500 mt-6">
          Have an account? <Link href="/login" className="text-brand-500 hover:text-brand-400 font-medium">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
}
