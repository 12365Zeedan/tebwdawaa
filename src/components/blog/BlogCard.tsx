import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BlogPost } from '@/types';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const { language, t, direction } = useLanguage();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const title = language === 'ar' ? post.titleAr : post.title;
  const excerpt = language === 'ar' ? post.excerptAr : post.excerpt;
  const author = language === 'ar' ? post.authorAr : post.author;
  const category = language === 'ar' ? post.categoryAr : post.category;

  const formattedDate = new Date(post.date).toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <article className="blog-card group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft">
      {/* Image */}
      <Link to={`/blog/${post.id}`} className="block relative aspect-video overflow-hidden">
        <img
          src={post.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
            {category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {post.readTime} {language === 'ar' ? 'دقائق' : 'min read'}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/blog/${post.id}`}>
          <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-muted-foreground line-clamp-3">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <span className="text-sm font-medium text-foreground">{author}</span>
          <Link
            to={`/blog/${post.id}`}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t('blog.readMore')}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
