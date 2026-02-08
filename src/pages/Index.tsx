import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { BlogSection } from '@/components/home/BlogSection';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { SocialMetaTags } from '@/components/seo/SocialMetaTags';
import { useTheme } from '@/contexts/ThemeContext';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';

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
  const { data: company } = useCompanyInfo();

  const storeName = company?.store_name || 'My Store';

  return (
    <MainLayout>
      <SocialMetaTags
        title={storeName}
        description={`Shop the best products at ${storeName}. Quality items, fast delivery, and excellent customer service.`}
        type="website"
      />
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
