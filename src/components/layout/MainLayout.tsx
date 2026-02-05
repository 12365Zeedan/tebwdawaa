import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MaintenanceBanner } from './MaintenanceBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ComparisonBar } from '@/components/store/ComparisonBar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { direction } = useLanguage();

  return (
    <div className={cn('min-h-screen flex flex-col', direction === 'rtl' && 'font-arabic')}>
      <MaintenanceBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ComparisonBar />
    </div>
  );
}
