
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide loader on initial load and when route changes complete
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleStart = (url: string) => {
      // Don't show loader if the path is the same
      if (url.split('?')[0] !== window.location.pathname) {
        setLoading(true);
      }
    };
    
    // This is a workaround since Next.js App Router doesn't have a native 'routeChangeStart'
    // We listen to all clicks on links
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      // Check if it's a link, not a button, and it's an internal navigation link
      if (anchor && anchor.href && anchor.target !== '_blank' && new URL(anchor.href).origin === window.location.origin) {
        handleStart(anchor.pathname);
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 h-1 z-50 bg-primary/20 overflow-hidden',
        loading ? 'block' : 'hidden'
      )}
    >
      <div className="absolute top-0 left-0 h-full w-full animate-loading-bar bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
    </div>
  );
}
