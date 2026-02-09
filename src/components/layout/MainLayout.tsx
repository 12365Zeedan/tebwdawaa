import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { CategoryNavBar } from './CategoryNavBar';
import { Footer } from './Footer';
import { MaintenanceBanner } from './MaintenanceBanner';
import { NewsBanner } from './NewsBanner';
import { WeatherDateBar } from './WeatherDateBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ComparisonBar } from '@/components/store/ComparisonBar';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CanonicalUrl } from '@/components/seo/CanonicalUrl';
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { useAutoSeoTracker } from '@/hooks/useAutoSeoTracker';

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
      <WeatherDateBar />
      <NewsBanner />
      <MaintenanceBanner />
      <Navbar />
      <CategoryNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ComparisonBar />
      <ChatWidget />
    </div>
  );
}
