import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog/BlogCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Skeleton } from '@/components/ui/skeleton';

export function BlogSection() {
  const { t, direction } = useLanguage();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const { data: posts, isLoading } = useBlogPosts({ limit: 3 });

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('blog.title')}
          </h2>
          <Link to="/blog">
            <Button variant="ghost" className="gap-2 text-primary hover:text-primary">
              {t('blog.latestPosts')}
              <Arrow className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BlogCard post={{
                  id: post.id,
                  slug: post.slug,
                  title: post.title,
                  titleAr: post.title_ar,
                  excerpt: post.excerpt || '',
                  excerptAr: post.excerpt_ar || '',
                  content: post.content || '',
                  contentAr: post.content_ar || '',
                  image: post.image_url || '/placeholder.svg',
                  author: post.author_name || '',
                  authorAr: post.author_name_ar || '',
                  date: post.published_at || post.created_at,
                  category: post.category || '',
                  categoryAr: post.category_ar || '',
                  readTime: post.read_time || 5,
                  viewCount: (post as any).view_count || 0,
                }} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {direction === 'rtl' ? 'لا توجد مقالات بعد' : 'No blog posts yet'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
