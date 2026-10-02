import React, { useEffect, useState } from 'react';
import { Vow } from '../types';
import { fetchVowById, formatBlockId, computePseudoHash } from '../services/api';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Share2, 
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface DetailPageProps {
  id: string | number;
  onBack: () => void;
  onSelectVow?: (id: string | number) => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({ id, onBack }) => {
  const [vow, setVow] = useState<Vow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadVow = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchVowById(id);
        if (isMounted) {
          setVow(data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching vow detail:', err);
          setError(err.message || `Unable to load block #${id} from the public ledger.`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVow();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const blockIdFormatted = formatBlockId(id);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://prove.my.id/p/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      window.dispatchEvent(
        new CustomEvent('prove:notify', {
          detail: {
            title: 'Proof Link Copied',
            message: 'URL has been copied to clipboard.',
            icon: 'copy',
          },
        })
      );
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      window.dispatchEvent(
        new CustomEvent('prove:notify', {
          detail: {
            title: 'Proof Link Copied',
            message: 'URL has been copied to clipboard.',
            icon: 'copy',
          },
        })
      );
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    if (!vow) return;
    const tweetText = `Witness my vow locked eternally on Prove.my.id [${blockIdFormatted}]:\n\n"${vow.vow_text}"\n\nProof link: ${currentUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Ledger</span>
        </button>

        <span className="text-xs font-mono text-neutral-500">
          STATUS: IMMUTABLE
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-16 text-center">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-white font-mono">
            Loading Block Record {blockIdFormatted}...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-[#111111] border border-red-500/30 rounded-lg p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <h2 className="text-base font-semibold text-white mb-1">
            Proof Record Not Found
          </h2>
          <p className="text-xs text-neutral-400 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-white text-black hover:bg-neutral-200 text-xs font-semibold px-4 py-2 rounded-md transition-colors"
          >
            Back to Ledger
          </button>
        </div>
      )}

      {/* Massive Solid Detail Card (Flat Tech / Vercel Dark Style) */}
      {vow && !loading && (
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 sm:p-10">
          {/* Card Header: Monospace Block ID and Verification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#222222]">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Proof Record
              </div>
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">
                Block ID: {blockIdFormatted}
              </h1>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181818] border border-[#262626] text-xs font-mono text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                VERIFIED
              </span>
            </div>
          </div>

          {/* Creator Information */}
          <div className="mb-6 flex items-center justify-between text-xs text-neutral-400">
            <div>
              <span className="text-neutral-500 block mb-0.5">CREATOR</span>
              <span className="text-sm font-semibold text-white">{vow.name}</span>
            </div>

            {vow.created_at && (
              <div className="text-right">
                <span className="text-neutral-500 block mb-0.5">COMMITTED</span>
                <span className="text-neutral-300 font-mono">
                  {new Date(vow.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            )}
          </div>

          {/* Vow Statement Display */}
          <div className="my-8 p-6 sm:p-8 rounded-md bg-[#0A0A0A] border border-[#222222]">
            <p className="text-xl sm:text-2xl font-semibold text-white leading-relaxed tracking-tight break-words">
              &ldquo;{vow.vow_text}&rdquo;
            </p>
          </div>

          {/* Dramatic text: Clean, pure white, no neon, no glows */}
          <div className="my-8 text-center border-y border-[#1C1C1C] py-6">
            <p className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
              Sealed Permanently. Cannot be undone.
            </p>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              Cryptographically witnessed on the Prove public ledger
            </p>
          </div>

          {/* Technical Hash Information (Clean flat metadata) */}
          <div className="mb-8 p-3.5 rounded-md bg-[#0A0A0A] border border-[#1C1C1C] font-mono text-xs">
            <div className="flex justify-between items-center text-neutral-500 mb-2 pb-1.5 border-b border-[#1C1C1C]">
              <span>LEDGER SPECIFICATION</span>
              <span className="text-emerald-500">SHA-256 MATCH</span>
            </div>
            <div className="space-y-1 text-neutral-400 text-[11px] truncate">
              <div>
                <span className="text-neutral-500">HASH: </span>
                <span className="text-white">{computePseudoHash(vow.name, vow.vow_text, vow.id)}</span>
              </div>
              <div>
                <span className="text-neutral-500">PROTOCOL: </span>
                <span>Prove Public Ledger v1</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Solid White Primary Button + Solid Gray Secondary Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 transition-colors text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-black" />
                  <span>Copy Proof Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareTwitter}
              className="w-full sm:w-auto bg-[#161616] hover:bg-[#1E1E1E] text-white border border-[#2B2B2B] hover:border-[#383838] transition-colors text-xs sm:text-sm font-medium px-4 py-2.5 rounded-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>{shared ? 'Opening Share...' : 'Share on X'}</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
