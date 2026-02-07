import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export function HeroSection() {
  const { language, t, direction } = useLanguage();
  const { theme } = useTheme();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const heroBadges = theme.content.heroBadges;

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container relative py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-start">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in">
                {t('hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-fade-in stagger-1">
                {t('hero.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in stagger-2">
              <Link to="/products">
                <Button size="lg" className="gap-2 text-base px-8 shadow-glow hover:shadow-xl transition-shadow">
                  {t('hero.cta')}
                  <Arrow className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="text-base px-8">
                  {t('hero.secondary')}
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground animate-fade-in stagger-3">
              {heroBadges.map(badge => (
                <div key={badge.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>{language === 'ar' ? badge.textAr : badge.textEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Floating Cards */}
              <div className="absolute top-10 -left-10 bg-card rounded-2xl p-4 shadow-elevated animate-float z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">💊</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">500+</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'منتج' : 'Products'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 -right-5 bg-card rounded-2xl p-4 shadow-elevated animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">4.9</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'تقييم' : 'Rating'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-primary p-1">
                <img
                  src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=600&fit=crop"
                  alt="Pharmacy products"
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
