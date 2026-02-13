import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, FlaskConical, Droplet, Baby, HeartPulse, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category } from '@/types';
import { cn } from '@/lib/utils';
import { optimizeImageUrl, generateSrcSet } from '@/lib/imageUtils';

interface CategoryCardProps {
  category: Category;
}

const iconMap: Record<string, React.ReactNode> = {
  'pill': <Pill className="h-8 w-8" />,
  'flask': <FlaskConical className="h-8 w-8" />,
  'droplet': <Droplet className="h-8 w-8" />,
  'baby': <Baby className="h-8 w-8" />,
  'heart-pulse': <HeartPulse className="h-8 w-8" />,
  'sparkles': <Sparkles className="h-8 w-8" />,
};

export function CategoryCard({ category }: CategoryCardProps) {
  const { language } = useLanguage();
  const name = language === 'ar' ? category.nameAr : category.name;

  return (
    <Link
      to={`/categories/${category.id}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/3] block"
    >
      {/* Background Image */}
      <img
        src={optimizeImageUrl(category.image, 408, 306)}
        srcSet={generateSrcSet(category.image, [300, 408, 500])}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="flex items-center gap-3 text-background mb-2">
          <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
            {iconMap[category.icon] || <Pill className="h-8 w-8" />}
          </div>
          <div>
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="text-sm text-background/80">
              {category.productCount} {language === 'ar' ? 'منتج' : 'products'}
            </p>
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div className={cn(
        'absolute inset-0 border-4 border-transparent rounded-2xl transition-colors duration-300',
        'group-hover:border-primary/50'
      )} />
    </Link>
  );
}
