import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Builds a BreadcrumbList from the current route path segments
 * and injects it as JSON-LD into the document head.
 */

const ROUTE_LABELS: Record<string, { en: string; ar: string }> = {
  products: { en: 'Products', ar: 'المنتجات' },
  categories: { en: 'Categories', ar: 'الفئات' },
  blog: { en: 'Blog', ar: 'المدونة' },
  cart: { en: 'Cart', ar: 'السلة' },
  checkout: { en: 'Checkout', ar: 'الدفع' },
  orders: { en: 'Order History', ar: 'سجل الطلبات' },
  profile: { en: 'Profile', ar: 'الملف الشخصي' },
  wishlist: { en: 'Wishlist', ar: 'المفضلة' },
  compare: { en: 'Compare', ar: 'مقارنة' },
  about: { en: 'About', ar: 'عن المتجر' },
  auth: { en: 'Sign In', ar: 'تسجيل الدخول' },
  admin: { en: 'Admin', ar: 'لوحة التحكم' },
};

function formatSegment(segment: string, lang: string): string {
  const label = ROUTE_LABELS[segment];
  if (label) return lang === 'ar' ? label.ar : label.en;
  // Format slug-like segments: "my-product" → "My Product"
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function BreadcrumbJsonLd() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const origin = window.location.origin;
    const segments = pathname.split('/').filter(Boolean);

    // Always start with Home
    const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
      {
        '@type': 'ListItem',
        position: 1,
        name: language === 'ar' ? 'الرئيسية' : 'Home',
        item: origin,
      },
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      items.push({
        '@type': 'ListItem',
        position: index + 2,
        name: formatSegment(segment, language),
        item: `${origin}${currentPath}`,
      });
    });

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    };

    const scriptId = 'breadcrumb-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, [pathname, language]);

  return null;
}
