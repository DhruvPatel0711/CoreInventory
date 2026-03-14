import React from 'react';
import { twMerge } from 'tailwind-merge';

// ─── Shared Types ────────────────────────────────────────────

// ─── Button ──────────────────────────────────────────────────
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline', size?: 'sm' | 'md' | 'lg' }>(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20 focus:ring-brand-500",
    secondary: "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white focus:ring-slate-500",
    outline: "bg-transparent text-slate-200 border border-slate-600 hover:bg-slate-800 hover:text-white focus:ring-slate-500",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 focus:ring-red-500",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5 focus:ring-slate-500"
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 py-2 text-sm", lg: "h-12 px-6 text-base" };
  
  return (
    <button ref={ref} className={twMerge(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
});
Button.displayName = 'Button';

// ─── Card ────────────────────────────────────────────────────
export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge("glass-card overflow-hidden", className)} {...props}>
    {children}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────
export const Badge = ({ className, variant = 'default', children }: { className?: string, variant?: 'default'|'success'|'warning'|'danger'|'info', children: React.ReactNode }) => {
  const variants = {
    default: "bg-slate-800 border-slate-700 text-slate-300",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    danger: "bg-red-500/10 border-red-500/20 text-red-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400"
  };
  return (
    <span className={twMerge("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
};

// ─── Input ───────────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }>(({ className, icon, ...props }, ref) => (
  <div className="relative w-full">
    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">{icon}</div>}
    <input 
      ref={ref}
      className={twMerge(
        "flex w-full rounded-lg bg-slate-900 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
        icon && "pl-10",
        className
      )}
      {...props}
    />
  </div>
));
Input.displayName = 'Input';

// ─── Select ──────────────────────────────────────────────────
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={twMerge("flex w-full rounded-lg bg-slate-900 border border-slate-700/50 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

// ─── Label ───────────────────────────────────────────────────
export const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={twMerge("text-sm font-medium leading-none text-slate-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1.5 block", className)} {...props}>
    {children}
  </label>
);

// ─── Modal ───────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title?: React.ReactNode, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={onClose}
        />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-surface-dark/95 border border-white/10 rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] custom-scrollbar"
        >
          {title && <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">{title}</h2>}
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ─── Table Tools ─────────────────────────────────────────────
export const Table = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto custom-scrollbar">
    <table className={twMerge("w-full text-left text-sm whitespace-nowrap", className)} {...props}>
      {children}
    </table>
  </div>
);
export const Thead = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={twMerge("text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-white/5", className)} {...props}>{children}</thead>
);
export const Tbody = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={twMerge("divide-y divide-white/5", className)} {...props}>{children}</tbody>
);
export const Tr = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={twMerge("hover:bg-white/[0.02] transition-colors", className)} {...props}>{children}</tr>
);
export const Th = ({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={twMerge("px-6 py-4 font-medium no-select", className)} {...props}>{children}</th>
);
export const Td = ({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={twMerge("px-6 py-4", className)} {...props}>{children}</td>
);
