import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { BlogSection } from '@/components/home/BlogSection';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { useTheme } from '@/contexts/ThemeContext';

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: HeroSection,
  featured: FeaturedProducts,
  newArrivals: NewArrivalsSection,
  bestSellers: BestSellersSection,
  recentlyViewed: RecentlyViewedSection,
  categories: CategoriesSection,
  blog: BlogSection,
};

const Index = () => {
  const { theme } = useTheme();

  return (
    <MainLayout>
      {theme.layout.sections
        .filter((s) => s.visible && SECTION_COMPONENTS[s.id])
        .map((section) => {
          const Component = SECTION_COMPONENTS[section.id];
          return <Component key={section.id} />;
        })}
    </MainLayout>
  );
};

export default Index;
