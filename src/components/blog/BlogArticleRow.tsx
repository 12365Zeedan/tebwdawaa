import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BlogPost } from '@/types';

interface BlogArticleRowProps {
  post: BlogPost;
}

export function BlogArticleRow({ post }: BlogArticleRowProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const title = isAr ? post.titleAr : post.title;
  const excerpt = isAr ? post.excerptAr : post.excerpt;
  const slug = post.slug || post.id;

  const formattedDate = new Date(post.date).toLocaleDateString(
    isAr ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' }
  );

  return (
    <article className="group flex gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <Link
        to={`/blog/${slug}`}
        className="flex-shrink-0 w-28 h-24 md:w-36 md:h-28 rounded-lg overflow-hidden"
      >
        <img
          src={post.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link to={`/blog/${slug}`}>
            <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors mb-1">
              {title}
            </h3>
          </Link>
          <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 hidden sm:block">
            {excerpt}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          {post.viewCount && post.viewCount > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{post.viewCount}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
