import React from 'react';
import { Heart, Shield, Truck, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: Heart,
      title: language === 'ar' ? 'رعاية صحية موثوقة' : 'Trusted Healthcare',
      description: language === 'ar' 
        ? 'نقدم منتجات صيدلانية عالية الجودة ومعتمدة'
        : 'We provide high-quality certified pharmaceutical products',
    },
    {
      icon: Shield,
      title: language === 'ar' ? 'منتجات أصلية' : 'Genuine Products',
      description: language === 'ar'
        ? 'جميع منتجاتنا أصلية 100% ومعتمدة'
        : 'All our products are 100% genuine and certified',
    },
    {
      icon: Truck,
      title: language === 'ar' ? 'توصيل سريع' : 'Fast Delivery',
      description: language === 'ar'
        ? 'توصيل سريع إلى باب منزلك في جميع أنحاء المملكة'
        : 'Fast delivery to your doorstep across the Kingdom',
    },
    {
      icon: Clock,
      title: language === 'ar' ? 'دعم 24/7' : '24/7 Support',
      description: language === 'ar'
        ? 'فريق دعم متاح على مدار الساعة لمساعدتك'
        : 'Support team available around the clock to help you',
    },
  ];

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'من نحن' : 'About Us'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ar'
              ? 'صيدلية رائدة في تقديم خدمات صحية متميزة ومنتجات صيدلانية عالية الجودة لمجتمعنا.'
              : 'A leading pharmacy providing exceptional health services and high-quality pharmaceutical products for our community.'}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-card rounded-2xl border border-border/50 shadow-soft animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="bg-gradient-hero rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {language === 'ar'
                ? 'نسعى لتوفير رعاية صحية شاملة ومنتجات صيدلانية موثوقة لكل أفراد المجتمع، مع الالتزام بأعلى معايير الجودة والخدمة.'
                : 'We strive to provide comprehensive healthcare and reliable pharmaceutical products for all members of the community, committed to the highest standards of quality and service.'}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
