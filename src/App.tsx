import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VowForm } from './components/VowForm';
import { RecentVows } from './components/RecentVows';
import { DetailPage } from './components/DetailPage';
import { NotificationCenter } from './components/NotificationCenter';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [detailId, setDetailId] = useState<string | number | null>(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const match = path.match(/^\/p\/([^/]+)/);
    if (match) return match[1];

    const hash = window.location.hash;
    const hashMatch = hash.match(/^#\/p\/([^/]+)/);
    if (hashMatch) return hashMatch[1];

    return null;
  });

  const formRef = useRef<HTMLDivElement>(null);

  // Sync route state with browser history
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      const pathMatch = path.match(/^\/p\/([^/]+)/);
      const hashMatch = hash.match(/^#\/p\/([^/]+)/);

      if (pathMatch) {
        setDetailId(pathMatch[1]);
        setCurrentPath(path);
      } else if (hashMatch) {
        setDetailId(hashMatch[1]);
        setCurrentPath(`/p/${hashMatch[1]}`);
      } else {
        setDetailId(null);
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToHome = () => {
    setDetailId(null);
    setCurrentPath('/');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToVowDetail = (id: string | number) => {
    setDetailId(id);
    const targetUrl = `/p/${id}`;
    setCurrentPath(targetUrl);
    window.history.pushState(null, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToForm = () => {
    if (detailId !== null) {
      navigateToHome();
      setTimeout(() => {
        const el = document.getElementById('vow-form-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const el = document.getElementById('vow-form-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col justify-between selection:bg-neutral-800 selection:text-white font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        currentPath={currentPath}
        onNavigateHome={navigateToHome}
        onScrollToForm={scrollToForm}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {detailId !== null ? (
          <DetailPage
            id={detailId}
            onBack={navigateToHome}
            onSelectVow={navigateToVowDetail}
          />
        ) : (
          <>
            <Hero onStartClick={scrollToForm} />
            <VowForm ref={formRef} onVowCreated={navigateToVowDetail} />
            <RecentVows onSelectVow={navigateToVowDetail} />
          </>
        )}
      </main>

      {/* Minimalist Flat Footer */}
      <footer className="border-t border-[#222222] bg-[#0A0A0A] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-[#161616] border border-[#2B2B2B] rounded flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-neutral-300" />
            </div>
            <span className="text-xs font-semibold text-white tracking-tight">
              prove<span className="text-neutral-500">.my.id</span>
            </span>
          </div>

          <div className="text-xs text-neutral-500 font-mono text-center sm:text-right">
            <span>Talk is cheap. Prove it here.</span>
          </div>
        </div>
      </footer>

      {/* iOS Glassmorphism Stacked Notification Center (Highest Viewport Overlay) */}
      <NotificationCenter />
    </div>
  );
}
