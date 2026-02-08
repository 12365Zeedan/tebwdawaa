import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Megaphone, Type, Shield, Heading, Info, LayoutTemplate } from 'lucide-react';
import { NewsBannerEditor } from './content/NewsBannerEditor';
import { HeroContentEditor } from './content/HeroContentEditor';
import { HeroBadgesEditor } from './content/HeroBadgesEditor';
import { SectionHeadingsEditor } from './content/SectionHeadingsEditor';
import { AboutPageEditor } from './content/AboutPageEditor';
import { FooterContentEditor } from './content/FooterContentEditor';

export function ContentSettings() {
  const { language } = useLanguage();

  return (
    <Accordion type="multiple" defaultValue={['news-banner', 'hero']} className="space-y-2">
      <AccordionItem value="news-banner" className="border rounded-lg px-1">
        <AccordionTrigger className="text-sm font-medium gap-2 px-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            {language === 'ar' ? 'شريط الأخبار' : 'News Banner'}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-1 pb-2">
          <NewsBannerEditor />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="hero" className="border rounded-lg px-1">
        <AccordionTrigger className="text-sm font-medium gap-2 px-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            {language === 'ar' ? 'البانر الرئيسي' : 'Hero Section'}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-1 pb-2 space-y-3">
          <HeroContentEditor />
          <HeroBadgesEditor />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="section-headings" className="border rounded-lg px-1">
        <AccordionTrigger className="text-sm font-medium gap-2 px-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Heading className="h-4 w-4" />
            {language === 'ar' ? 'عناوين الأقسام' : 'Section Headings'}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-1 pb-2">
          <SectionHeadingsEditor />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="about-page" className="border rounded-lg px-1">
        <AccordionTrigger className="text-sm font-medium gap-2 px-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {language === 'ar' ? 'صفحة من نحن' : 'About Page'}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-1 pb-2">
          <AboutPageEditor />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="footer" className="border rounded-lg px-1">
        <AccordionTrigger className="text-sm font-medium gap-2 px-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            {language === 'ar' ? 'الفوتر' : 'Footer'}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-1 pb-2">
          <FooterContentEditor />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}