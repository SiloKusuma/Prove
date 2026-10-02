import React, { useState, forwardRef } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { createVow } from '../services/api';

interface VowFormProps {
  onVowCreated: (id: string | number) => void;
}

export const VowForm = forwardRef<HTMLDivElement, VowFormProps>(({ onVowCreated }, ref) => {
  const [name, setName] = useState('');
  const [vowText, setVowText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedText = vowText.trim();

    if (!trimmedName) {
      window.dispatchEvent(
        new CustomEvent('prove:notify', {
          detail: {
            title: 'Required Field',
            message: 'Please declare your creator name or handle.',
            icon: 'shield',
          },
        })
      );
      return;
    }

    if (!trimmedText) {
      window.dispatchEvent(
        new CustomEvent('prove:notify', {
          detail: {
            title: 'Empty Promise',
            message: 'A vow requires content. Write your statement.',
            icon: 'shield',
          },
        })
      );
      return;
    }

    if (trimmedText.length < 5) {
      window.dispatchEvent(
        new CustomEvent('prove:notify', {
          detail: {
            title: 'Statement Too Short',
            message: 'Vow must be at least 5 characters long.',
            icon: 'shield',
          },
        })
      );
      return;
    }

    try {
      setLoading(true);
      const result = await createVow(trimmedName, trimmedText);

      window.dispatchEvent(
        new CustomEvent('prove:notify', {
          detail: {
            title: 'Vow Locked',
            message: 'Cryptographically sealed on the ledger.',
            icon: 'check',
          },
        })
      );

      setTimeout(() => {
        onVowCreated(result.id);
      }, 500);
    } catch (err: any) {
      console.error('Failed to create vow:', err);
      window.dispatchEvent(
        new CustomEvent('prove:notify', {
          detail: {
            title: 'Transaction Error',
            message: err.message || 'Ledger connection failure. Please retry.',
            icon: 'shield',
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} id="vow-form-section" className="max-w-xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
      {/* Solid Surface Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 sm:p-8">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#222222]">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Lock a New Vow
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Enter your statement to publish it permanently to the ledger.
            </p>
          </div>
          <div className="w-8 h-8 rounded-md bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-neutral-300" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Creator Name Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="creator-name" className="text-xs font-medium text-neutral-300">
                Creator Name
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">Required</span>
            </div>
            <input
              id="creator-name"
              name="name"
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Satoshi Nakamoto or @alex"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#0A0A0A] border border-[#262626] text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors"
              disabled={loading}
            />
          </div>

          {/* Vow Text Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="vow-text" className="text-xs font-medium text-neutral-300">
                Your Promise
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">
                {vowText.length} characters
              </span>
            </div>
            <textarea
              id="vow-text"
              name="vow_text"
              required
              rows={4}
              maxLength={2000}
              value={vowText}
              onChange={(e) => setVowText(e.target.value)}
              placeholder="State your vow clearly. Once published, it cannot be modified or deleted."
              className="w-full px-3.5 py-2.5 rounded-md bg-[#0A0A0A] border border-[#262626] text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors resize-y min-h-[110px]"
              disabled={loading}
            />
          </div>

          {/* Notice */}
          <p className="text-xs text-neutral-500 leading-normal">
            By publishing, you acknowledge that this record will be sealed permanently on the public ledger.
          </p>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading || !name.trim() || !vowText.trim()}
            className="w-full bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors text-sm font-semibold py-2.5 px-4 rounded-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Sealing Vow...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-black" />
                <span>Lock Vow</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
});

VowForm.displayName = 'VowForm';
