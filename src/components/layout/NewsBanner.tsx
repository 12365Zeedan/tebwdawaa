import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export function NewsBanner() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const { visible, items } = theme.content.newsBanner;

  if (!visible || items.length === 0) return null;

  const newsItems = items
    .map(item => `${item.emoji} ${language === 'ar' ? item.textAr : item.textEn}`)
    .filter(text => text.trim().length > 2); // filter out empty items

  if (newsItems.length === 0) return null;

  const repeatedNews = [...newsItems, ...newsItems, ...newsItems];

  return (
    <div className="bg-accent text-accent-foreground overflow-hidden py-2 relative">
      <div className="animate-marquee whitespace-nowrap flex gap-12">
        {repeatedNews.map((item, index) => (
          <span key={index} className="text-sm font-medium inline-block px-4">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
