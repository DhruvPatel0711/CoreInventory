import React from 'react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <div className="glass-card p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400">Configuration panel goes here.</p>
      </div>
    </div>
  );
}
