import React from 'react';
import { Lock, ArrowDown } from 'lucide-react';
import { InteractiveGlobe } from './InteractiveGlobe';

interface HeroProps {
  onStartClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <section className="pt-16 pb-20 sm:pt-20 sm:pb-24 border-b border-[#222222] overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Headline: Clean, high-contrast, pure white, no gradients */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08] text-balance">
          Talk is cheap. Prove it here.
        </h1>

        {/* Subtitle: High-contrast readable gray */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
          Lock your promises permanently on a public ledger. Immutable, timestamped, and un-editable.
        </p>

        {/* CTAs: Solid White Button & Flat Secondary Border Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={onStartClick}
            className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 transition-colors font-medium text-sm px-5 py-2.5 rounded-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Lock className="w-4 h-4 text-black" />
            <span>Lock a Promise</span>
          </button>

          <a
            href="#ledger"
            className="w-full sm:w-auto bg-[#111111] hover:bg-[#171717] text-white border border-[#222222] hover:border-[#333333] transition-colors font-medium text-sm px-5 py-2.5 rounded-md flex items-center justify-center gap-2"
          >
            <span>Explore Ledger</span>
            <ArrowDown className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>

        {/* Responsive 3D Dotted White Globe without squishing */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] flex items-center justify-center">
            <InteractiveGlobe />
          </div>
        </div>

        {/* Linear/Stripe style horizontal spec metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-[#222222] text-left">
          <div>
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Immutability</div>
            <div className="text-sm font-semibold text-white mt-1">100% Guaranteed</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Storage</div>
            <div className="text-sm font-semibold text-white mt-1">Permanent State</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Verification</div>
            <div className="text-sm font-semibold text-white mt-1">Public Key SHA-256</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Auditing</div>
            <div className="text-sm font-semibold text-white mt-1">Open to Anyone</div>
          </div>
        </div>
      </div>
    </section>
  );
};
