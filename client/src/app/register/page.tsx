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

      toast.success('Access granted. Profile initialized.', {
        autoClose: 2600,
      });
      router.push('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed';
      toast.error(msg, {
        autoClose: 3200,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
      <div className="glass-card p-8 border border-white/10 dark:border-white/5 shadow-2xl relative overflow-hidden bg-white/60 dark:bg-surface-dark/90 backdrop-blur-xl rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -z-10 -mr-20 -mt-20"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Get Started</h1>
          <p className="text-slate-500 mt-2 text-sm">Create an account to track your inventory seamlessly</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" type="text" icon={<User className="w-4 h-4" />} required
              placeholder="John Doe"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" type="email" icon={<Mail className="w-4 h-4" />} required
              placeholder="you@company.com"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" type="password" icon={<Lock className="w-4 h-4" />} required
              placeholder="••••••••"
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Account {loading ? '' : <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Already have an account? <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Sign in instead</Link>
        </p>
      </div>
    </motion.div>
  );
}
