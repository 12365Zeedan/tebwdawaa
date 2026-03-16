import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog/BlogCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Skeleton } from '@/components/ui/skeleton';

export function BlogSection() {
  const { t, direction, language } = useLanguage();
  const { theme } = useTheme();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const { data: posts, isLoading } = useBlogPosts({ limit: 6 });
  const heading = theme.content.sectionHeadings.blog;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {language === 'ar' ? heading?.titleAr : heading?.titleEn}
          </h2>
          <div className="flex items-center gap-2">
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary text-sm">
                {t('blog.latestPosts')}
                <Arrow className="h-4 w-4" />
              </Button>
            </Link>
            <div className="hidden md:flex gap-1">
              <Button variant="outline" size="icon" onClick={() => scroll('left')} className="h-8 w-8 rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll('right')} className="h-8 w-8 rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[300px] space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="flex-shrink-0 w-[300px] md:w-[340px]">
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
            <div className="w-full text-center py-8 text-muted-foreground">
              {direction === 'rtl' ? 'لا توجد مقالات بعد' : 'No blog posts yet'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
