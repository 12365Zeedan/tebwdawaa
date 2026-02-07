import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function NewsBanner() {
  const { language } = useLanguage();

  const newsItems = language === 'ar'
    ? [
        '🔥 خصم 20% على جميع منتجات العناية بالبشرة',
        '🚚 توصيل مجاني للطلبات فوق 200 ريال',
        '💊 منتجات جديدة متوفرة الآن',
        '⭐ انضم لبرنامج الولاء واحصل على نقاط مع كل طلب',
      ]
    : [
        '🔥 20% OFF on all skincare products',
        '🚚 Free delivery on orders over 200 SAR',
        '💊 New products now available',
        '⭐ Join our loyalty program and earn points with every order',
      ];

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
