import React from 'react';
import { PageWidgets } from '@/components/widgets/PageWidgets';
import { Heart, Shield, Truck, Clock, Star, CheckCircle, Zap, Award } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart, shield: Shield, truck: Truck, clock: Clock,
  star: Star, check: CheckCircle, zap: Zap, award: Award,
};

const About = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const about = theme.content.aboutPage;

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'ar' ? about.titleAr : about.titleEn}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ar' ? about.descriptionAr : about.descriptionEn}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {about.features.map((feature, index) => {
            const Icon = ICON_MAP[feature.icon] || Heart;
            return (
              <div key={feature.id} className="text-center p-6 bg-card rounded-2xl border border-border/50 shadow-soft animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {language === 'ar' ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ar' ? feature.descriptionAr : feature.descriptionEn}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-hero rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {language === 'ar' ? about.missionTitleAr : about.missionTitleEn}
            </h2>
            <p className="text-lg text-muted-foreground">
              {language === 'ar' ? about.missionDescriptionAr : about.missionDescriptionEn}
            </p>
          </div>
        </div>
      </div>
      <PageWidgets page="about" />
    </MainLayout>
  );
};

export default About;