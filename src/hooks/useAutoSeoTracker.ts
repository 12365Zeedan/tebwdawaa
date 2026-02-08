import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Silently tracks SEO signals for the current page and upserts
 * into page_seo_scores. Runs once per route change, debounced.
 * Only runs for authenticated users to respect RLS.
 */
export function useAutoSeoTracker() {
  const { pathname } = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Skip admin pages
    if (pathname.startsWith('/admin') || pathname === '/auth') return;

    // Debounce to let the page fully render
    timerRef.current = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return; // RLS requires auth

        const titleEl = document.querySelector('title');
        const descEl = document.querySelector('meta[name="description"]');
        const canonicalEl = document.querySelector('link[rel="canonical"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        const h1Elements = document.querySelectorAll('h1');
        const images = document.querySelectorAll('img');

        const hasMetaTitle = !!(titleEl?.textContent?.trim());
        const hasMetaDesc = !!(descEl?.getAttribute('content'));
        const hasCanonical = !!(canonicalEl?.getAttribute('href'));
        const hasOgTags = !!(ogTitle && ogDesc);
        const hasStructuredData = jsonLdScripts.length > 0;
        const hasH1 = h1Elements.length >= 1;
        const missingAltCount = Array.from(images).filter(
          (img) => !img.alt || !img.alt.trim()
        ).length;
        const hasAltTexts = missingAltCount === 0;
        const headingHierarchyValid = h1Elements.length === 1;

        const checks = [
          hasMetaTitle, hasMetaDesc, hasCanonical, hasOgTags,
          hasStructuredData, hasH1, hasAltTexts, headingHierarchyValid,
        ];
        const overallScore = Math.round(
          (checks.filter(Boolean).length / checks.length) * 100
        );

        await supabase.from('page_seo_scores' as any).upsert(
          {
            page_path: pathname,
            page_title: titleEl?.textContent || null,
            overall_score: overallScore,
            has_meta_title: hasMetaTitle,
            has_meta_description: hasMetaDesc,
            has_canonical: hasCanonical,
            has_og_tags: hasOgTags,
            has_structured_data: hasStructuredData,
            has_h1: hasH1,
            has_alt_texts: hasAltTexts,
            missing_alt_count: missingAltCount,
            heading_hierarchy_valid: headingHierarchyValid,
            details: {
              title_length: titleEl?.textContent?.length || 0,
              desc_length: descEl?.getAttribute('content')?.length || 0,
              h1_count: h1Elements.length,
              images_total: images.length,
              jsonld_count: jsonLdScripts.length,
            },
            scanned_at: new Date().toISOString(),
          } as any,
          { onConflict: 'page_path' }
        );
      } catch {
        // Silent fail — this is background tracking
      }
    }, 3000); // Wait 3s for page to fully render

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);
}
