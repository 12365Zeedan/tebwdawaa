import React, { useState, useMemo } from 'react';
import { PageWidgets } from '@/components/widgets/PageWidgets';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { BlogHeroSlider } from '@/components/blog/BlogHeroSlider';
import { BlogCategoryNav } from '@/components/blog/BlogCategoryNav';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogArticleRow } from '@/components/blog/BlogArticleRow';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useBlogTags, type BlogTag } from '@/hooks/useAdminBlog';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsletterSubscription } from '@/components/blog/NewsletterSubscription';
import { Newspaper } from 'lucide-react';
import { BlogPost } from '@/types';

const Blog = () => {
  const { language, t, direction } = useLanguage();
  const isAr = language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const activeTag = searchParams.get('tag');
  const activeCategory = searchParams.get('category');

  const { data: posts, isLoading } = useBlogPosts();
  const { data: tags = [] } = useBlogTags();

  const { data: postTagMap = {} } = useQuery({
    queryKey: ['all-blog-post-tags'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('blog_post_tags').select('blog_post_id, tag_id');
      if (!data) return {};
      const map: Record<string, string[]> = {};
      (data as any[]).forEach((pt: any) => {
        if (!map[pt.blog_post_id]) map[pt.blog_post_id] = [];
        map[pt.blog_post_id].push(pt.tag_id);
      });
      return map;
    },
  });

  // Map posts to BlogPost type
  const mappedPosts: BlogPost[] = useMemo(() => {
    if (!posts) return [];
    return posts.map(post => ({
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
    }));
  }, [posts]);

  // Categories with counts
  const categoriesWithCounts = useMemo(() => {
    if (!posts) return [];
    const map: Record<string, { nameAr: string; count: number }> = {};
    posts.forEach(p => {
      if (p.category) {
        if (!map[p.category]) map[p.category] = { nameAr: p.category_ar || p.category, count: 0 };
        map[p.category].count++;
      }
    });
    return Object.entries(map).map(([name, v]) => ({ name, nameAr: v.nameAr, count: v.count }));
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return mappedPosts.filter(post => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q) || post.titleAr.toLowerCase().includes(q);
        const matchExcerpt = post.excerpt.toLowerCase().includes(q) || post.excerptAr.toLowerCase().includes(q);
        if (!matchTitle && !matchExcerpt) return false;
      }
      if (activeCategory && post.category !== activeCategory) return false;
      if (activeTag) {
        const matchingTag = tags.find((t: BlogTag) => t.slug === activeTag);
        if (matchingTag) {
          const postTags = postTagMap[post.id] || [];
          if (!postTags.includes(matchingTag.id)) return false;
        }
      }
      return true;
    });
  }, [mappedPosts, search, activeCategory, activeTag, tags, postTagMap]);

  const hasFilters = !!activeTag || !!activeCategory || !!search;

  const handleCategoryChange = (cat: string | null) => {
    const p = new URLSearchParams(searchParams);
    if (cat) p.set('category', cat); else p.delete('category');
    setSearchParams(p);
  };

  const handleTagChange = (slug: string | null) => {
    const p = new URLSearchParams(searchParams);
    if (slug) p.set('tag', slug); else p.delete('tag');
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
  };

  // Featured posts for slider (first 5 with images)
  const featuredPosts = useMemo(() => {
    return mappedPosts.filter(p => p.image !== '/placeholder.svg').slice(0, 5);
  }, [mappedPosts]);

  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        {/* Hero Slider */}
        {!isLoading && featuredPosts.length > 0 && (
          <div className="mb-8">
            <BlogHeroSlider posts={featuredPosts} />
          </div>
        )}
        {isLoading && (
          <Skeleton className="w-full rounded-2xl mb-8" style={{ height: '420px' }} />
        )}

        {/* Two-column layout: Main + Sidebar */}
        <div className={`flex flex-col lg:flex-row gap-8 ${direction === 'rtl' ? 'lg:flex-row-reverse' : ''}`}>
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 order-2 lg:order-1">
            <BlogSidebar
              categories={categoriesWithCounts}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              tags={tags}
              activeTag={activeTag}
              onTagChange={handleTagChange}
              search={search}
              onSearchChange={setSearch}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 order-1 lg:order-2">
            {/* Section header */}
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl mb-6">
              <Newspaper className="h-5 w-5" />
              <h1 className="font-bold text-lg">
                {isAr ? 'الأخبار الطبية' : 'Medical News'}
              </h1>
            </div>

            {/* Article list */}
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-card rounded-xl border border-border/50">
                    <Skeleton className="w-28 h-24 md:w-36 md:h-28 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <BlogArticleRow post={post} />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border/50">
                  {isAr ? 'لا توجد مقالات مطابقة' : 'No matching articles found'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 max-w-2xl mx-auto">
          <NewsletterSubscription />
        </div>
      </div>
      <PageWidgets page="blog" />
    </MainLayout>
  );
};

export default Blog;
