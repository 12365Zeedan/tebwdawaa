import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically injects a <link rel="canonical"> tag into the document head
 * based on the current route. Updates on every navigation.
 */
export function CanonicalUrl() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonicalUrl = `${window.location.origin}${pathname}`;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    return () => {
      // Don't remove on unmount — another instance or the next route will update it
    };
  }, [pathname]);

  return null;
}
