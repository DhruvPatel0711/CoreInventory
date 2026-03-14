'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background-dark overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
