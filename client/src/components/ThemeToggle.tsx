'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const modes = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!mounted) return <div className="w-8 h-8" />;

  const current = modes.find(m => m.value === theme) || modes[0];
  const Icon = current.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors select-none"
        aria-label="Toggle theme"
      >
        <Icon className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-36 bg-surface-dark border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {modes.map(mode => (
              <button
                key={mode.value}
                onClick={() => { setTheme(mode.value); setOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2.5 transition-colors select-none ${
                  theme === mode.value ? 'text-brand-500 bg-neutral-800/60' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                }`}
              >
                <mode.icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
