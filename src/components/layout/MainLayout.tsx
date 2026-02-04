import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { direction } = useLanguage();

  return (
    <div className={cn('min-h-screen flex flex-col', direction === 'rtl' && 'font-arabic')}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
