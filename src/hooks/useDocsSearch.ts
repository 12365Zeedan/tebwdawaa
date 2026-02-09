import { useMemo } from 'react';
import { themeDocSections, type DocSection } from '@/data/themeDocumentation';

export function useDocsSearch(query: string, language: 'en' | 'ar') {
  const filteredSections = useMemo(() => {
    if (!query.trim()) return themeDocSections;

    const q = query.toLowerCase().trim();

    return themeDocSections
      .map((section): DocSection | null => {
        // Check if section title matches
        const sectionTitleMatch =
          section.titleEn.toLowerCase().includes(q) ||
          section.titleAr.includes(q);

        // Filter items that match
        const matchingItems = section.items.filter((item) => {
          const titleMatch =
            item.titleEn.toLowerCase().includes(q) ||
            item.titleAr.includes(q);
          const descMatch =
            item.descriptionEn.toLowerCase().includes(q) ||
            item.descriptionAr.includes(q);
          const stepsMatch = item.steps.some(
            (s) => s.en.toLowerCase().includes(q) || s.ar.includes(q)
          );
          const tipsMatch = item.tips?.some(
            (t) => t.en.toLowerCase().includes(q) || t.ar.includes(q)
          );
          return titleMatch || descMatch || stepsMatch || tipsMatch;
        });

        if (sectionTitleMatch) return section;
        if (matchingItems.length > 0) {
          return { ...section, items: matchingItems };
        }
        return null;
      })
      .filter(Boolean) as DocSection[];
  }, [query, language]);

  return filteredSections;
}
