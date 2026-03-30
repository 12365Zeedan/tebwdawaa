import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogCategories, type BlogCategory } from '@/hooks/useAdminBlogCategories';
import { cn } from '@/lib/utils';
import {
  Heart, Baby, Stethoscope, Pill, Sparkles, Brain,
  Apple, Leaf, Eye, Scissors, Activity, BookOpen,
  ChevronDown, LayoutGrid
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Map category slugs to icons for visual richness
const iconMap: Record<string, React.ElementType> = {
  'health': Stethoscope,
  'beauty': Sparkles,
  'pregnancy': Baby,
  'child-health': Baby,
  'diseases': Activity,
  'medicines': Pill,
  'vitamins': Pill,
  'alternative-medicine': Leaf,
  'mental-health': Brain,
  'nutrition': Apple,
  'skincare': Sparkles,
  'haircare': Scissors,
  'eye-health': Eye,
  'men-health': Heart,
  'women-health': Heart,
  'surgery': Stethoscope,
};

function getCategoryIcon(slug: string): React.ElementType {
  // Try exact match first, then partial
  if (iconMap[slug]) return iconMap[slug];
  for (const [key, icon] of Object.entries(iconMap)) {
    if (slug.includes(key)) return icon;
  }
  return BookOpen;
}

interface BlogCategoryNavProps {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
}

export function BlogCategoryNav({ activeCategory, onCategoryChange }: BlogCategoryNavProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { data: categories = [] } = useBlogCategories();

  const activeCategories = categories.filter(c => c.is_active);

  if (activeCategories.length === 0) return null;

  return (
    <div className="w-full bg-card border-y border-border/60 shadow-sm mb-6">
      <div className="container">
        <ScrollArea className="w-full" dir={isAr ? 'rtl' : 'ltr'}>
          <nav className="flex items-center gap-0 py-0 min-w-max">
            {/* All / Home */}
            <button
              onClick={() => onCategoryChange(null)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors hover:bg-muted/50',
                !activeCategory
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/80 hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>{isAr ? 'الكل' : 'All'}</span>
            </button>

            {activeCategories.map((cat: BlogCategory) => {
              const Icon = getCategoryIcon(cat.slug);
              const isActive = activeCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(isActive ? null : cat.name)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors hover:bg-muted/50',
                    isActive
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-foreground/80 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{isAr ? cat.name_ar : cat.name}</span>
                  <ChevronDown className="h-3 w-3 opacity-40" />
                </button>
              );
            })}
          </nav>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
