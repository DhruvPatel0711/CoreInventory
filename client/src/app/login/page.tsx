'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Input, Button, Label } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      // API shape: { success, message, data: { user, token } }
      const token = data?.data?.token;
      const user = data?.data?.user;

      if (!token) {
        throw new Error('Missing token in response');
      }

      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      toast.success(`Control deck unlocked`, {
        autoClose: 2400,
      });
      router.push('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed';
      toast.error(msg, {
        autoClose: 3200,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="glass-card p-8 border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden bg-white/60 dark:bg-surface-dark/90 backdrop-blur-xl rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -z-10 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 -ml-20 -mb-20"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">CoreInventory</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage your warehouse operations</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" type="email" icon={<Mail className="w-4 h-4" />} required
              placeholder="you@company.com"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <Label className="mb-0" htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline">Forgot password?</Link>
            </div>
            <Input 
              id="password" type="password" icon={<Lock className="w-4 h-4" />} required
              placeholder="••••••••"
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sign In {loading ? '' : <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account? <Link href="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Request access</Link>
        </p>
      </div>
    </motion.div>
  );
}
