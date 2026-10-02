import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onNavigateHome: () => void;
  onScrollToForm: () => void;
  currentPath: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, onScrollToForm, currentPath }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A] border-b border-[#222222]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Zone */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-md py-1"
        >
          <div className="w-6 h-6 bg-[#161616] border border-[#2B2B2B] rounded-md flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-200" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            prove<span className="text-neutral-500">.my.id</span>
          </span>
        </button>

        {/* Navigation & Action Links */}
        <div className="flex items-center gap-4">
          <a
            href="#ledger"
            onClick={(e) => {
              if (currentPath !== '/') {
                e.preventDefault();
                onNavigateHome();
                setTimeout(() => {
                  document.getElementById('ledger')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Ledger
          </a>

          {currentPath !== '/' && (
            <button
              onClick={onNavigateHome}
              className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Overview
            </button>
          )}

          {/* Solid White Primary Button (Vercel/Linear style) */}
          <button
            onClick={onScrollToForm}
            className="bg-white text-black hover:bg-neutral-200 transition-colors text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-md cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            Lock a Vow
          </button>
        </div>
      </div>
    </header>
  );
};
