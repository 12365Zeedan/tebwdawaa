import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { CarouselConfig } from '@/hooks/useCustomWidgets';

interface Props {
  config: CarouselConfig;
}

export function WidgetCarousel({ config }: Props) {
  const { language, direction } = useLanguage();
  const [current, setCurrent] = useState(0);
  const slides = config.slides || [];

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!config.autoplay || slides.length <= 1) return;
    const timer = setInterval(next, config.interval || 5000);
    return () => clearInterval(timer);
  }, [config.autoplay, config.interval, slides.length, next]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden w-full group"
      style={{ height: config.height || '400px' }}
      onMouseEnter={() => config.pauseOnHover}
    >
      {/* Slides */}
      <div className="relative h-full w-full">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-in-out',
              config.transition === 'fade'
                ? i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                : i === current
                  ? 'translate-x-0 z-10'
                  : i < current
                    ? '-translate-x-full z-0'
                    : 'translate-x-full z-0'
            )}
          >
            {slide.imageUrl && (
              <img
                src={slide.imageUrl}
                alt={language === 'ar' ? slide.titleAr : slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: slide.overlayColor || 'rgba(0,0,0,0.3)' }}
            />
            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container">
                <div className="max-w-2xl space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">
                    {language === 'ar' ? slide.titleAr : slide.title}
                  </h2>
                  {(slide.description || slide.descriptionAr) && (
                    <p className="text-lg text-white/90">
                      {language === 'ar' ? slide.descriptionAr : slide.description}
                    </p>
                  )}
                  {(slide.ctaText || slide.ctaTextAr) && slide.ctaLink && (
                    <Link to={slide.ctaLink}>
                      <Button size="lg" className="mt-2">
                        {language === 'ar' ? slide.ctaTextAr : slide.ctaText}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {config.showArrows && slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-3 -translate-y-1/2 z-20 bg-background/60 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-10 w-10"
            onClick={direction === 'rtl' ? next : prev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-3 -translate-y-1/2 z-20 bg-background/60 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-10 w-10"
            onClick={direction === 'rtl' ? prev : next}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots */}
      {config.showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                i === current
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
