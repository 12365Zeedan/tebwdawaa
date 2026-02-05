import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { BlogSection } from '@/components/home/BlogSection';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedProducts />
      <RecentlyViewedSection />
      <CategoriesSection />
      <BlogSection />
    </MainLayout>
  );
};

export default Index;
