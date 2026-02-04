import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BlogCard } from '@/components/blog/BlogCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockBlogPosts } from '@/data/mockData';

const Blog = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          {t('blog.title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockBlogPosts.map((post, index) => (
            <div
              key={post.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
