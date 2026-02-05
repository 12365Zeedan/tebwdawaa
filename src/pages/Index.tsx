import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { BestSellersSection } from '@/components/home/BestSellersSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { BlogSection } from '@/components/home/BlogSection';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedProducts />
      <NewArrivalsSection />
      <BestSellersSection />
      <RecentlyViewedSection />
      <CategoriesSection />
      <BlogSection />
    </MainLayout>
  );
};

export default Index;
