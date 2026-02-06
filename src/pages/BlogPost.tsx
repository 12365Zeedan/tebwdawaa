import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, User, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogCard } from '@/components/blog/BlogCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BlogTag } from '@/hooks/useAdminBlog';
import { useRecordView } from '@/hooks/useViewTracking';
import { BlogComments } from '@/components/blog/BlogComments';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, direction, t } = useLanguage();
  const isAr = language === 'ar';
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const { data: post, isLoading } = useBlogPost(slug || '');

  // Record view
  useRecordView(post?.id);

  // Fetch tags for this post
  const { data: postTags = [] } = useQuery({
    queryKey: ['blog-post-display-tags', post?.id],
    queryFn: async () => {
      if (!post?.id) return [];
      const { data: tagLinks } = await (supabase as any)
        .from('blog_post_tags')
        .select('tag_id')
        .eq('blog_post_id', post.id);
      if (!tagLinks || tagLinks.length === 0) return [];

      const tagIds = (tagLinks as any[]).map((t: any) => t.tag_id);
      const { data: tags } = await (supabase as any)
        .from('blog_tags')
        .select('*')
        .in('id', tagIds);
      return (tags || []) as BlogTag[];
    },
    enabled: !!post?.id,
  });

  // Related articles: same category
  const { data: allPosts = [] } = useBlogPosts();
  const relatedPosts = allPosts
    .filter(p => p.id !== post?.id && p.category === post?.category)
    .slice(0, 3);

  const fillerPosts = relatedPosts.length < 3
    ? allPosts.filter(p => p.id !== post?.id && !relatedPosts.find(r => r.id === p.id)).slice(0, 3 - relatedPosts.length)
    : [];
  const displayRelated = [...relatedPosts, ...fillerPosts];

  // Set page title for SEO
  useEffect(() => {
    if (post) {
      const metaTitle = isAr ? ((post as any).meta_title_ar || post.title_ar) : ((post as any).meta_title || post.title);
      document.title = metaTitle;

      const metaDesc = isAr ? ((post as any).meta_description_ar || post.excerpt_ar) : ((post as any).meta_description || post.excerpt);
      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.setAttribute('name', 'description');
        document.head.appendChild(descTag);
      }
      descTag.setAttribute('content', metaDesc || '');
    }
  }, [post, isAr]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {isAr ? 'المقال غير موجود' : 'Post Not Found'}
          </h1>
          <Link to="/blog">
            <Button variant="outline" className="gap-2">
              <BackArrow className="h-4 w-4" />
              {isAr ? 'العودة للمدونة' : 'Back to Blog'}
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const title = isAr ? post.title_ar : post.title;
  const content = isAr ? (post.content_ar || post.content) : post.content;
  const excerpt = isAr ? (post.excerpt_ar || post.excerpt) : post.excerpt;
  const author = isAr ? (post.author_name_ar || post.author_name) : post.author_name;
  const category = isAr ? (post.category_ar || post.category) : post.category;
  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString(
    isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <MainLayout>
      <article className="container py-8 md:py-12">
        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <BackArrow className="h-4 w-4" />
          {isAr ? 'العودة للمدونة' : 'Back to Blog'}
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.image_url && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img src={post.image_url} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {category && <Badge className="mb-4">{category}</Badge>}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {title}
          </h1>

          {excerpt && <p className="text-lg text-muted-foreground mb-6">{excerpt}</p>}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            {author && (
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{author}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            {post.read_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{post.read_time} {isAr ? 'دقائق' : 'min read'}</span>
              </div>
            )}
            {(post as any).view_count > 0 && (
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{(post as any).view_count} {isAr ? 'مشاهدة' : 'views'}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none text-foreground
              prose-headings:text-foreground prose-p:text-foreground/90
              prose-a:text-primary prose-strong:text-foreground
              prose-blockquote:border-primary prose-blockquote:text-muted-foreground
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: content || '' }}
          />

          {/* Tags */}
          {postTags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {postTags.map((tag: BlogTag) => (
                  <Link key={tag.id} to={`/blog?tag=${tag.slug}`}>
                    <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                      {isAr ? tag.name_ar : tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <BlogComments postId={post.id} />
        </div>

        {/* Related Articles */}
        {displayRelated.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              {isAr ? 'مقالات ذات صلة' : 'Related Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayRelated.map((relPost) => (
                <BlogCard
                  key={relPost.id}
                  post={{
                    id: relPost.id,
                    slug: relPost.slug,
                    title: relPost.title,
                    titleAr: relPost.title_ar,
                    excerpt: relPost.excerpt || '',
                    excerptAr: relPost.excerpt_ar || '',
                    content: relPost.content || '',
                    contentAr: relPost.content_ar || '',
                    image: relPost.image_url || '/placeholder.svg',
                    author: relPost.author_name || '',
                    authorAr: relPost.author_name_ar || '',
                    date: relPost.published_at || relPost.created_at,
                    category: relPost.category || '',
                    categoryAr: relPost.category_ar || '',
                    readTime: relPost.read_time || 5,
                    viewCount: (relPost as any).view_count || 0,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </MainLayout>
  );
};

export default BlogPostPage;
