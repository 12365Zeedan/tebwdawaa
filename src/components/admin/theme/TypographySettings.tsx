import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTheme, FONT_OPTIONS, ARABIC_FONT_OPTIONS } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TypographySettings() {
  const { theme, updateTypography } = useTheme();
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Main Font */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="h-4 w-4" />
            {language === 'ar' ? 'الخط الرئيسي (إنجليزي)' : 'Primary Font (English)'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'الخط المستخدم للنصوص الإنجليزية' : 'Font used for English text content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.value}
                onClick={() => updateTypography('fontFamily', font.value)}
                className={cn(
                  'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-start',
                  theme.typography.fontFamily === font.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span
                  className="text-lg font-semibold mb-1"
                  style={{ fontFamily: `'${font.value}', ${font.style}` }}
                >
                  {font.label}
                </span>
                <span
                  className="text-sm text-muted-foreground"
                  style={{ fontFamily: `'${font.value}', ${font.style}` }}
                >
                  The quick brown fox jumps over the lazy dog
                </span>
                <span className="text-xs text-muted-foreground/60 mt-1 capitalize">{font.style}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Arabic Font */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="h-4 w-4" />
            {language === 'ar' ? 'الخط العربي' : 'Arabic Font'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'الخط المستخدم للنصوص العربية' : 'Font used for Arabic text content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ARABIC_FONT_OPTIONS.map((font) => (
              <button
                key={font.value}
                onClick={() => updateTypography('fontFamilyArabic', font.value)}
                className={cn(
                  'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-start',
                  theme.typography.fontFamilyArabic === font.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span
                  className="text-lg font-semibold mb-1"
                  style={{ fontFamily: `'${font.value}', sans-serif` }}
                  dir="rtl"
                >
                  {font.label}
                </span>
                <span
                  className="text-sm text-muted-foreground"
                  style={{ fontFamily: `'${font.value}', sans-serif` }}
                  dir="rtl"
                >
                  الثعلب البني السريع يقفز فوق الكلب الكسول
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {language === 'ar' ? 'معاينة' : 'Preview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 rounded-lg border border-border bg-background">
            <h1 className="text-3xl font-bold" style={{ fontFamily: `'${theme.typography.fontFamily}', sans-serif` }}>
              Heading Text
            </h1>
            <h2 className="text-xl font-semibold" style={{ fontFamily: `'${theme.typography.fontFamily}', sans-serif` }}>
              Subheading Text
            </h2>
            <p className="text-base" style={{ fontFamily: `'${theme.typography.fontFamily}', sans-serif` }}>
              Body text looks like this. The quick brown fox jumps over the lazy dog. This demonstrates how your chosen font renders paragraph content across the website.
            </p>
            <div className="border-t border-border pt-4" dir="rtl">
              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: `'${theme.typography.fontFamilyArabic}', sans-serif` }}>
                نص عربي
              </h2>
              <p className="text-base" style={{ fontFamily: `'${theme.typography.fontFamilyArabic}', sans-serif` }}>
                هذا نص تجريبي لمعاينة الخط العربي المختار وكيف يظهر في الموقع.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
