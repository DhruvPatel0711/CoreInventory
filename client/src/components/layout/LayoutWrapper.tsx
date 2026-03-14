'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen w-full bg-background-dark text-slate-100 items-center justify-center p-4">
        <ToastContainer theme="colored" position="bottom-right" />
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background-dark text-slate-100 overflow-hidden transition-colors">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <ToastContainer theme="colored" position="bottom-right" />
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
