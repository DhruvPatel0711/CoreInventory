'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-neutral-700 transition-colors ${className}`}
      title={`Copy: ${text}`}
    >
      {copied ? (
        <Check className="w-3 h-3 text-brand-500" />
      ) : (
        <Copy className="w-3 h-3 text-neutral-600 hover:text-neutral-400" />
      )}
    </button>
  );
}
