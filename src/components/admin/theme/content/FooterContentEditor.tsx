import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useTheme, FooterContent } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LayoutTemplate, Facebook, Twitter, Instagram } from 'lucide-react';

export function FooterContentEditor() {
  const { theme, updateContent } = useTheme();
  const { language } = useLanguage();
  const content = theme.content;
  const footer = content.footer;

  const updateFooter = (field: keyof FooterContent, value: any) => {
    updateContent({
      ...content,
      footer: { ...footer, [field]: value },
    });
  };

  const updateSocialLink = (platform: 'facebook' | 'twitter' | 'instagram', value: string) => {
    updateContent({
      ...content,
      footer: {
        ...footer,
        socialLinks: { ...footer.socialLinks, [platform]: value },
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          {language === 'ar' ? 'محتوى الفوتر' : 'Footer Content'}
        </CardTitle>
        <CardDescription className="text-xs">
          {language === 'ar'
            ? 'تعديل نصوص وروابط الفوتر'
            : 'Edit footer text and social links'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* About Text */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            {language === 'ar' ? 'نص التعريف' : 'About Text'}
          </Label>
          <Textarea
            value={footer.aboutTextEn}
            onChange={(e) => updateFooter('aboutTextEn', e.target.value)}
            className="text-sm min-h-[50px]"
            placeholder="Your trusted pharmacy..."
          />
          <Textarea
            value={footer.aboutTextAr}
            onChange={(e) => updateFooter('aboutTextAr', e.target.value)}
            className="text-sm min-h-[50px]"
            dir="rtl"
            placeholder="شريكك الموثوق..."
          />
        </div>

        {/* Social Media Links */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            {language === 'ar' ? 'روابط التواصل الاجتماعي' : 'Social Media Links'}
          </Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={footer.socialLinks.facebook}
                onChange={(e) => updateSocialLink('facebook', e.target.value)}
                className="h-8 text-sm"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={footer.socialLinks.twitter}
                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                className="h-8 text-sm"
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={footer.socialLinks.instagram}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                className="h-8 text-sm"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">
              {language === 'ar' ? 'قسم النشرة البريدية' : 'Newsletter Section'}
            </Label>
            <Switch
              checked={footer.showNewsletter}
              onCheckedChange={(v) => updateFooter('showNewsletter', v)}
            />
          </div>
          <div className={!footer.showNewsletter ? 'opacity-50 pointer-events-none' : ''}>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Input
                value={footer.newsletterTitleEn}
                onChange={(e) => updateFooter('newsletterTitleEn', e.target.value)}
                className="h-8 text-sm"
                placeholder="Stay Updated"
              />
              <Input
                value={footer.newsletterTitleAr}
                onChange={(e) => updateFooter('newsletterTitleAr', e.target.value)}
                className="h-8 text-sm"
                dir="rtl"
                placeholder="ابق على اطلاع"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={footer.newsletterDescriptionEn}
                onChange={(e) => updateFooter('newsletterDescriptionEn', e.target.value)}
                className="h-8 text-sm"
                placeholder="Get the latest..."
              />
              <Input
                value={footer.newsletterDescriptionAr}
                onChange={(e) => updateFooter('newsletterDescriptionAr', e.target.value)}
                className="h-8 text-sm"
                dir="rtl"
                placeholder="احصل على أحدث..."
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}