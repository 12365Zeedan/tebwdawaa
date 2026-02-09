import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { TestimonialsConfig } from '@/hooks/useCustomWidgets';

interface Props {
  config: TestimonialsConfig;
  title?: string | null;
  titleAr?: string | null;
}

export function WidgetTestimonials({ config, title, titleAr }: Props) {
  const { language } = useLanguage();
  const items = config.items || [];

  if (items.length === 0) return null;

  const sectionTitle = language === 'ar' ? (titleAr || title) : (title || titleAr);

  return (
    <section className="py-12">
      <div className="container">
        {sectionTitle && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            {sectionTitle}
          </h2>
        )}
        <div
          className={cn(
            'grid gap-6',
            config.columns === 2 ? 'md:grid-cols-2' :
            config.columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
            'md:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {items.map((item) => (
            <Card key={item.id} className="border-border bg-card">
              <CardContent className="pt-6 space-y-4">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < item.rating
                          ? 'fill-warning text-warning'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{language === 'ar' ? item.contentAr : item.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.avatarUrl} alt={language === 'ar' ? item.nameAr : item.name} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(language === 'ar' ? item.nameAr : item.name).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {language === 'ar' ? item.nameAr : item.name}
                    </p>
                    {(item.role || item.roleAr) && (
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' ? item.roleAr : item.role}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
