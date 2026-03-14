'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, KeyRound, Loader2, ArrowRight } from 'lucide-react';
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
    try {
      const { data } = await api.post('/auth/request-otp', { email });

      // In development, backend also returns debugOtp for convenience
      if (data?.debugOtp) {
        // Helpful for QA: visible in browser console as well
        // eslint-disable-next-line no-console
        console.log('[DEBUG OTP]', data.debugOtp);
        toast.info(`OTP generated for ${email}. Check console for test code.`, {
          autoClose: 4000,
        });
      } else {
        toast.info('OTP sent. Check your email / server logs.', {
          autoClose: 3500,
        });
      }
      setStep(2);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to request OTP';
      toast.error(msg, {
        autoClose: 3200,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully. You can now log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -z-10 -ml-20 -mt-20"></div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Recover Access</h1>
        <p className="text-slate-500 mt-2 text-sm">Securely reset your password using an OTP</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-card p-8 bg-white/60 dark:bg-surface-dark/90 backdrop-blur-xl rounded-2xl border-white/10 dark:border-white/5 shadow-2xl">
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <Label htmlFor="email">Account Email</Label>
                <Input 
                  id="email" type="email" icon={<Mail className="w-4 h-4" />} required
                  placeholder="admin@coreinventory.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full mt-6 bg-amber-600 hover:bg-amber-500" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send OTP Code
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Remember your password? <Link href="/login" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">Go back</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-card p-8 bg-white/60 dark:bg-surface-dark/90 backdrop-blur-xl rounded-2xl border-white/10 dark:border-white/5 shadow-2xl">
            <div className="text-xs text-center text-slate-400 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-3 mb-6">
              OTP sent to <span className="font-bold text-slate-700 dark:text-slate-200">{email}</span>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <Label htmlFor="otp">6-Digit OTP</Label>
                <Input 
                  id="otp" type="text" icon={<KeyRound className="w-4 h-4" />} required
                  placeholder="123456" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" type="password" icon={<Lock className="w-4 h-4" />} required
                  placeholder="••••••••"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full mt-6 bg-amber-600 hover:bg-amber-500" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save New Password
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
