import React, { useEffect, useState } from 'react';
import { Vow } from '../types';
import { fetchLatestVows, formatBlockId } from '../services/api';
import { RefreshCw, ArrowUpRight } from 'lucide-react';

interface RecentVowsProps {
  onSelectVow: (id: string | number) => void;
}

export const RecentVows: React.FC<RecentVowsProps> = ({ onSelectVow }) => {
  const [vows, setVows] = useState<Vow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (isManual = false) => {
    try {
      setLoading(true);
      const data = await fetchLatestVows();
      if (Array.isArray(data) && data.length > 0) {
        setVows(data);
      }
      if (isManual) {
        window.dispatchEvent(
          new CustomEvent('prove:notify', {
            detail: {
              title: 'Chain Synced',
              message: 'Public records are up to date.',
              icon: 'check',
            },
          })
        );
      }
    } catch (err: any) {
      console.error('Failed to fetch latest vows:', err);
      // As requested: do not show jarring error module, retain clean lazy-load state
    } finally {
      // Keep loading skeleton if no items yet to keep clean visual placeholder
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section id="ledger" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-[#222222] scroll-mt-14">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Recent Public Records
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Latest cryptographic vows committed to the ledger.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111111] hover:bg-[#181818] border border-[#222222] hover:border-[#333333] text-xs font-medium text-neutral-300 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Loading Skeleton / Lazy Load Animation (Kept cleanly if loading or awaiting data) */}
      {(loading || vows.length === 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#222222] rounded-lg p-5 animate-pulse min-h-[190px] flex flex-col justify-between"
            >
              <div>
                <div className="h-3.5 w-24 bg-[#1F1F1F] rounded mb-4" />
                <div className="h-4 w-3/4 bg-[#1F1F1F] rounded mb-2.5" />
                <div className="h-3.5 w-full bg-[#1F1F1F] rounded mb-1.5" />
                <div className="h-3.5 w-2/3 bg-[#1F1F1F] rounded" />
              </div>
              <div className="h-3 w-20 bg-[#1F1F1F] rounded mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Vow Cards Grid when data exists */}
      {!loading && vows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vows.map((vow) => {
            const displayId = formatBlockId(vow.id);

            return (
              <div
                key={vow.id}
                onClick={() => onSelectVow(vow.id)}
                className="group bg-[#111111] hover:bg-[#141414] border border-[#222222] hover:border-[#383838] rounded-lg p-5 cursor-pointer transition-colors flex flex-col justify-between min-h-[200px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-mono text-neutral-400 group-hover:text-white transition-colors">
                      {displayId}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      SEALED
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-2 truncate">
                    {vow.name}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                    &ldquo;{vow.vow_text}&rdquo;
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#1C1C1C] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Permanent
                  </span>

                  <span className="text-neutral-400 group-hover:text-white font-medium flex items-center gap-0.5 transition-colors">
                    <span>View Proof</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
