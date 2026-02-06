import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { BlogCard } from '@/components/blog/BlogCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useBlogTags, type BlogTag } from '@/hooks/useAdminBlog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsletterSubscription } from '@/components/blog/NewsletterSubscription';

const Blog = () => {
  const { language, t, direction } = useLanguage();
  const isAr = language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const activeTag = searchParams.get('tag');
  const activeCategory = searchParams.get('category');

  const { data: posts, isLoading } = useBlogPosts();
  const { data: tags = [] } = useBlogTags();

  // Fetch all post-tag relationships
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

  // Get unique categories
  const categories = useMemo(() => {
    if (!posts) return [];
    const cats = new Set<string>();
    posts.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats);
  }, [posts]);

  // Get category AR mapping
  const categoryArMap = useMemo(() => {
    if (!posts) return {};
    const map: Record<string, string> = {};
    posts.forEach(p => { if (p.category && p.category_ar) map[p.category] = p.category_ar; });
    return map;
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q) || post.title_ar.toLowerCase().includes(q);
        const matchExcerpt = (post.excerpt || '').toLowerCase().includes(q) || (post.excerpt_ar || '').toLowerCase().includes(q);
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
  }, [posts, search, activeCategory, activeTag, tags, postTagMap]);

  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
  };

  const hasFilters = !!activeTag || !!activeCategory || !!search;

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t('blog.title')}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isAr ? 'مقالات تثقيفية ونصائح صحية' : 'Educational articles and health tips'}
        </p>

        {/* Search & Filters */}
        <div className="space-y-4 mb-10">
          <div className="relative max-w-md">
            <Search className={cn(
              'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
              direction === 'rtl' ? 'right-3' : 'left-3'
            )} />
            <Input
              placeholder={isAr ? 'البحث في المقالات...' : 'Search articles...'}
              className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!activeCategory ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}
              >
                {isAr ? 'الكل' : 'All'}
              </Badge>
              {categories.map(cat => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => { const p = new URLSearchParams(searchParams); p.set('category', cat); setSearchParams(p); }}
                >
                  {isAr ? (categoryArMap[cat] || cat) : cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: BlogTag) => (
                <Badge
                  key={tag.id}
                  variant={activeTag === tag.slug ? 'default' : 'secondary'}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    if (activeTag === tag.slug) p.delete('tag'); else p.set('tag', tag.slug);
                    setSearchParams(p);
                  }}
                >
                  # {isAr ? tag.name_ar : tag.name}
                </Badge>
              ))}
            </div>
          )}

          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-primary hover:underline flex items-center gap-1">
              <X className="h-3 w-3" /> {isAr ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          )}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
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
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {isAr ? 'لا توجد مقالات مطابقة' : 'No matching articles found'}
            </div>
          )}
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-16 max-w-2xl mx-auto">
          <NewsletterSubscription />
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
