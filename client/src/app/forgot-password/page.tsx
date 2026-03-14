'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, KeyRound, Loader2 } from 'lucide-react';
import { Input, Button, Label } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/auth/request-otp', { email }); toast.info('OTP sent (check server console).'); setStep(2); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/auth/reset-password', { email, otp, newPassword }); toast.success('Password reset. Redirecting...'); router.push('/login'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center mx-auto mb-4"><KeyRound className="w-5 h-5 text-neutral-400" /></div>
        <h1 className="text-xl font-semibold text-white">Reset password</h1>
        <p className="text-neutral-500 mt-1 text-sm">We'll send a one-time code to your email</p>
      </div>
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="glass-card p-8">
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div><Label>Email</Label><Input type="email" icon={<Mail className="w-4 h-4" />} required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <Button type="submit" className="w-full mt-4 bg-brand-600 hover:bg-brand-500" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Send OTP</Button>
            </form>
            <p className="text-center text-xs text-neutral-500 mt-6"><Link href="/login" className="text-brand-500 hover:text-brand-400 font-medium">Back to sign in</Link></p>
          </motion.div>
        ) : (
          <motion.div key="s2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="glass-card p-8">
            <div className="text-xs text-center text-neutral-400 bg-neutral-900 rounded-lg p-2 mb-5">OTP sent to <span className="text-white font-medium">{email}</span></div>
            <form onSubmit={handleReset} className="space-y-4">
              <div><Label>OTP Code</Label><Input type="text" icon={<KeyRound className="w-4 h-4" />} required placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} /></div>
              <div><Label>New Password</Label><Input type="password" icon={<Lock className="w-4 h-4" />} required placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
              <Button type="submit" className="w-full mt-4 bg-brand-600 hover:bg-brand-500" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Reset Password</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
