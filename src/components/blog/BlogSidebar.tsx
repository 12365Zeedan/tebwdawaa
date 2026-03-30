import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, X, FolderTree, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BlogTag } from '@/hooks/useAdminBlog';

interface CategoryItem {
  name: string;
  nameAr: string;
  count: number;
}

interface BlogSidebarProps {
  categories: CategoryItem[];
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  tags: BlogTag[];
  activeTag: string | null;
  onTagChange: (slug: string | null) => void;
  search: string;
  onSearchChange: (val: string) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function BlogSidebar({
  categories,
  activeCategory,
  onCategoryChange,
  tags,
  activeTag,
  onTagChange,
  search,
  onSearchChange,
  hasFilters,
  onClearFilters,
}: BlogSidebarProps) {
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';

  return (
    <aside className="space-y-6">
      {/* Search */}
      <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
        <div className="relative">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
            direction === 'rtl' ? 'right-3' : 'left-3'
          )} />
          <Input
            placeholder={isAr ? 'البحث في المقالات...' : 'Search articles...'}
            className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
            <FolderTree className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-foreground">
              {isAr ? 'تصنيفات' : 'Categories'}
            </h3>
          </div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => onCategoryChange(null)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                  !activeCategory
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <span>{isAr ? 'الكل' : 'All'}</span>
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.name}>
                <button
                  onClick={() => onCategoryChange(cat.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                    activeCategory === cat.name
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <span>{isAr ? cat.nameAr : cat.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {cat.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
            <Tag className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-foreground">
              {isAr ? 'الوسوم' : 'Tags'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: BlogTag) => (
              <Badge
                key={tag.id}
                variant={activeTag === tag.slug ? 'default' : 'secondary'}
                className="cursor-pointer text-xs"
                onClick={() => onTagChange(activeTag === tag.slug ? null : tag.slug)}
              >
                # {isAr ? tag.name_ar : tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-primary hover:underline flex items-center gap-1 px-1"
        >
          <X className="h-3 w-3" /> {isAr ? 'مسح الفلاتر' : 'Clear filters'}
        </button>
      )}
    </aside>
  );
}
