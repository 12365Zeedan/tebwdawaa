import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useTheme, HeroContent } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Image, Type } from 'lucide-react';

export function HeroContentEditor() {
  const { theme, updateContent } = useTheme();
  const { language } = useLanguage();
  const content = theme.content;
  const hero = content.hero;

  const updateHero = (field: keyof HeroContent, value: string | boolean) => {
    updateContent({
      ...content,
      hero: { ...hero, [field]: value },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Type className="h-4 w-4" />
          {language === 'ar' ? 'محتوى البانر الرئيسي' : 'Hero Banner Content'}
        </CardTitle>
        <CardDescription className="text-xs">
          {language === 'ar'
            ? 'تعديل النصوص والصورة في القسم الرئيسي'
            : 'Edit the text and image in the hero section'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            {language === 'ar' ? 'العنوان الرئيسي' : 'Main Title'}
          </Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">English</Label>
              <Input
                value={hero.titleEn}
                onChange={(e) => updateHero('titleEn', e.target.value)}
                className="h-8 text-sm"
                placeholder="Your Health, Our Priority"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">العربية</Label>
              <Input
                value={hero.titleAr}
                onChange={(e) => updateHero('titleAr', e.target.value)}
                className="h-8 text-sm"
                dir="rtl"
                placeholder="صحتك، أولويتنا"
              />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            {language === 'ar' ? 'النص الفرعي' : 'Subtitle'}
          </Label>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">English</Label>
              <Textarea
                value={hero.subtitleEn}
                onChange={(e) => updateHero('subtitleEn', e.target.value)}
                className="text-sm min-h-[60px]"
                placeholder="Discover our wide range..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">العربية</Label>
              <Textarea
                value={hero.subtitleAr}
                onChange={(e) => updateHero('subtitleAr', e.target.value)}
                className="text-sm min-h-[60px]"
                dir="rtl"
                placeholder="اكتشف مجموعتنا الواسعة..."
              />
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              {language === 'ar' ? 'زر الإجراء الرئيسي' : 'Primary CTA'}
            </Label>
            <Input
              value={hero.ctaEn}
              onChange={(e) => updateHero('ctaEn', e.target.value)}
              className="h-8 text-sm"
              placeholder="Shop Now"
            />
            <Input
              value={hero.ctaAr}
              onChange={(e) => updateHero('ctaAr', e.target.value)}
              className="h-8 text-sm"
              dir="rtl"
              placeholder="تسوق الآن"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              {language === 'ar' ? 'زر الإجراء الثانوي' : 'Secondary CTA'}
            </Label>
            <Input
              value={hero.secondaryCtaEn}
              onChange={(e) => updateHero('secondaryCtaEn', e.target.value)}
              className="h-8 text-sm"
              placeholder="Learn More"
            />
            <Input
              value={hero.secondaryCtaAr}
              onChange={(e) => updateHero('secondaryCtaAr', e.target.value)}
              className="h-8 text-sm"
              dir="rtl"
              placeholder="اعرف المزيد"
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Image className="h-3.5 w-3.5" />
            {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
          </Label>
          <Input
            value={hero.imageUrl}
            onChange={(e) => updateHero('imageUrl', e.target.value)}
            className="h-8 text-sm"
            placeholder="https://..."
          />
        </div>

        {/* Show Floating Cards */}
        <div className="flex items-center justify-between">
          <Label className="text-xs">
            {language === 'ar' ? 'إظهار البطاقات العائمة' : 'Show Floating Cards'}
          </Label>
          <Switch
            checked={hero.showFloatingCards}
            onCheckedChange={(v) => updateHero('showFloatingCards', v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}