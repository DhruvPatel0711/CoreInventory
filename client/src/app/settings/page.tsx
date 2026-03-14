'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Card } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile from localStorage
  const [profile, setProfile] = useState({ name: 'System Admin', email: 'admin@coreinventory.com', role: 'staff' });
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setProfile({ name: u.name || 'User', email: u.email || '', role: u.role || 'staff' });
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
    router.push('/login');
  };

  const handleChangePassword = async () => {
    if (!passForm.current || !passForm.new || !passForm.confirm) {
      return toast.error('All fields are required');
    }
    if (passForm.new !== passForm.confirm) {
      return toast.error('Passwords do not match');
    }
    if (passForm.new.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setPassLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.current,
        newPassword: passForm.new,
      });
      toast.success('Password changed successfully');
      setPassForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', icon: <User className="w-4 h-4" />, label: 'Profile' },
    { id: 'security', icon: <Lock className="w-4 h-4" />, label: 'Security' },
    { id: 'preferences', icon: <Palette className="w-4 h-4" />, label: 'Preferences' }
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-white bg-clip-text text-transparent mb-1">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your profile, security, and app preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-4">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}

          <div className="pt-8 mt-8 border-t border-slate-200 dark:border-white/10">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Personal Information</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} icon={<User className="w-4 h-4"/>}/>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={profile.role.replace('_', ' ').toUpperCase()} disabled className="bg-slate-50 dark:bg-slate-800/50" icon={<ShieldAlert className="w-4 h-4"/>}/>
                    </div>
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input value={profile.email} disabled className="bg-slate-50 dark:bg-slate-800/50 text-slate-500"/>
                    <p className="text-xs text-slate-500 mt-2">Email changes require administrator verification.</p>
                  </div>
                  <Button className="mt-4" onClick={() => toast.success('Profile updated!')}>Save Changes</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
              <Card className="p-6 border-red-500/10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-red-400"/> Change Password</h3>
                <div className="space-y-5">
                  <div>
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})}/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>New Password</Label>
                      <Input type="password" placeholder="••••••••" value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})}/>
                    </div>
                    <div>
                      <Label>Confirm Password</Label>
                      <Input type="password" placeholder="••••••••" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})}/>
                    </div>
                  </div>
                  <Button variant="danger" className="mt-4" onClick={handleChangePassword} disabled={passLoading}>
                    {passLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Palette className="w-5 h-5 text-brand-400"/> Appearance & Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light Mode' },
                    { id: 'dark', label: 'Dark Mode' },
                    { id: 'system', label: 'System Default' }
                  ].map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setTheme(t.id)}
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${theme === t.id ? 'border-brand-500 bg-brand-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700'}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === t.id ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {theme === t.id && <CheckCircle2 className="w-6 h-6" />}
                      </div>
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{t.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-400"/> Notification Toggles</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Low Stock Alerts', desc: 'Email digest when items fall below reorder par.'},
                    { title: 'Delivery Receipts', desc: 'Push notification when inbound stock is scanned.'},
                    { title: 'System Updates', desc: 'Changelogs and platform maintenance windows.'}
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-white/5">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
