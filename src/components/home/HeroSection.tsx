import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { optimizeImageUrl } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const { language, direction } = useLanguage();
  const { theme } = useTheme();
  const hero = theme.content.hero;
  const [current, setCurrent] = useState(0);

  const title = language === 'ar' ? hero.titleAr : hero.titleEn;
  const subtitle = language === 'ar' ? hero.subtitleAr : hero.subtitleEn;
  const cta = language === 'ar' ? hero.ctaAr : hero.ctaEn;

  // Single slide with the hero image — can be extended to multiple banners
  const slides = [
    { image: hero.imageUrl, title, subtitle, cta, link: '/products' },
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goNext = () => setCurrent(c => (c + 1) % slides.length);
  const goPrev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full overflow-hidden rounded-b-2xl">
      {/* Slides */}
      <div className="relative w-full aspect-[21/8] md:aspect-[21/7] min-h-[280px] max-h-[480px]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          >
            <img
              src={optimizeImageUrl(slide.image, 1400)}
              alt={slide.title}
              className="w-full h-full object-cover"
              fetchPriority={i === 0 ? 'high' : undefined}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <div className="max-w-lg space-y-4">
                  <h1 className="text-3xl md:text-5xl font-bold text-background leading-tight drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-lg text-background/90 drop-shadow">
                    {slide.subtitle}
                  </p>
                  <Link to={slide.link}>
                    <Button size="lg" className="mt-2 gap-2 text-base px-8 shadow-lg">
                      {slide.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 text-foreground"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 text-foreground"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'w-3 h-3 rounded-full transition-all',
                i === current ? 'bg-primary w-8' : 'bg-background/60'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
