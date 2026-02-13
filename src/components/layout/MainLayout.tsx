import React, { ReactNode, lazy, Suspense } from 'react';
import { Navbar } from './Navbar';
import { CategoryNavBar } from './CategoryNavBar';
import { Footer } from './Footer';
import { MaintenanceBanner } from './MaintenanceBanner';
import { NewsBanner } from './NewsBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ComparisonBar } from '@/components/store/ComparisonBar';
import { CanonicalUrl } from '@/components/seo/CanonicalUrl';
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { useAutoSeoTracker } from '@/hooks/useAutoSeoTracker';

const WeatherDateBar = lazy(() => import('./WeatherDateBar').then(m => ({ default: m.WeatherDateBar })));
const ChatWidget = lazy(() => import('@/components/chat/ChatWidget').then(m => ({ default: m.ChatWidget })));
interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { direction } = useLanguage();
  useAutoSeoTracker();

  return (
    <div className={cn('min-h-screen flex flex-col', direction === 'rtl' && 'font-arabic')}>
      <CanonicalUrl />
      <OrganizationJsonLd />
      <BreadcrumbJsonLd />
      <Suspense fallback={<div className="h-9 bg-header/95 border-b border-border/20" />}>
        <WeatherDateBar />
      </Suspense>
      <NewsBanner />
      <MaintenanceBanner />
      <Navbar />
      <CategoryNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ComparisonBar />
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </div>
  );
}
