import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { BannerConfig } from '@/hooks/useCustomWidgets';

interface Props {
  config: BannerConfig;
}

export function WidgetBanner({ config }: Props) {
  const { language } = useLanguage();

  const title = language === 'ar' ? config.titleAr : config.title;
  const description = language === 'ar' ? config.descriptionAr : config.description;
  const ctaText = language === 'ar' ? config.ctaTextAr : config.ctaText;

  if (!title && !description && !config.imageUrl) return null;

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        config.style === 'contained' ? 'container py-8' : 'w-full'
      )}
    >
      <div
        className={cn(
          'relative',
          config.style === 'contained' && 'rounded-2xl overflow-hidden',
          config.style === 'split' ? 'grid md:grid-cols-2 items-center' : ''
        )}
        style={{
          backgroundColor: config.backgroundColor ? `hsl(${config.backgroundColor})` : undefined,
        }}
      >
        {/* Image */}
        {config.imageUrl && config.style !== 'split' && (
          <img
            src={config.imageUrl}
            alt={title || 'Banner'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Overlay for full-width/contained */}
        {config.imageUrl && config.style !== 'split' && (
          <div className="absolute inset-0 bg-black/40" />
        )}

        {/* Content */}
        <div
          className={cn(
            'relative z-10',
            config.style === 'split' ? 'p-8 md:p-12' : 'py-16 md:py-24',
            config.style !== 'split' && 'text-center'
          )}
        >
          <div className={cn(config.style !== 'split' && 'container max-w-3xl mx-auto')}>
            {title && (
              <h2
                className="text-2xl md:text-4xl font-bold mb-3"
                style={{ color: config.textColor ? `hsl(${config.textColor})` : undefined }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className="text-base md:text-lg mb-6 opacity-90"
                style={{ color: config.textColor ? `hsl(${config.textColor})` : undefined }}
              >
                {description}
              </p>
            )}
            {ctaText && config.ctaLink && (
              <Link to={config.ctaLink}>
                <Button size="lg">{ctaText}</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Split image */}
        {config.imageUrl && config.style === 'split' && (
          <div className="h-64 md:h-full min-h-[300px]">
            <img
              src={config.imageUrl}
              alt={title || 'Banner'}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
