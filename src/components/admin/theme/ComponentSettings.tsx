import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useTheme, ThemeComponents } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layers, Square, RectangleHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const SHADOW_OPTIONS: { value: ThemeComponents['cardShadow']; label: string; labelAr: string }[] = [
  { value: 'none', label: 'None', labelAr: 'بدون' },
  { value: 'sm', label: 'Small', labelAr: 'صغير' },
  { value: 'md', label: 'Medium', labelAr: 'متوسط' },
  { value: 'lg', label: 'Large', labelAr: 'كبير' },
  { value: 'xl', label: 'Extra Large', labelAr: 'كبير جداً' },
];

const BUTTON_STYLE_OPTIONS: { value: ThemeComponents['buttonStyle']; label: string; labelAr: string; radius: string }[] = [
  { value: 'sharp', label: 'Sharp', labelAr: 'حاد', radius: '0' },
  { value: 'default', label: 'Default', labelAr: 'افتراضي', radius: '0.375rem' },
  { value: 'rounded', label: 'Rounded', labelAr: 'مدور', radius: '0.75rem' },
  { value: 'pill', label: 'Pill', labelAr: 'بيضاوي', radius: '9999px' },
];

export function ComponentSettings() {
  const { theme, updateComponent } = useTheme();
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Border Radius */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Square className="h-4 w-4" />
            {language === 'ar' ? 'انحناء الحواف' : 'Border Radius'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'تحكم في درجة استدارة الزوايا' : 'Control how rounded corners appear globally'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[theme.components.borderRadius]}
              min={0}
              max={1.5}
              step={0.125}
              onValueChange={([val]) => updateComponent('borderRadius', val)}
              className="flex-1"
            />
            <span className="text-sm font-mono text-muted-foreground w-16 text-end">
              {theme.components.borderRadius}rem
            </span>
          </div>

          {/* Preview */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: language === 'ar' ? 'زر' : 'Button', type: 'button' },
              { label: language === 'ar' ? 'بطاقة' : 'Card', type: 'card' },
              { label: language === 'ar' ? 'حقل إدخال' : 'Input', type: 'input' },
            ].map((item) => (
              <div key={item.type} className="text-center space-y-1">
                <div
                  className={cn(
                    'w-24 h-16 border-2 border-primary flex items-center justify-center text-xs font-medium',
                    item.type === 'button' && 'bg-primary text-primary-foreground',
                    item.type === 'card' && 'bg-card',
                    item.type === 'input' && 'bg-background border-border'
                  )}
                  style={{ borderRadius: `${theme.components.borderRadius}rem` }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card Shadow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {language === 'ar' ? 'ظل البطاقات' : 'Card Shadow'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'مستوى الظل على عناصر البطاقات' : 'Shadow depth on card elements'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {SHADOW_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateComponent('cardShadow', option.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                  theme.components.cardShadow === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-10 rounded bg-card border border-border',
                    option.value !== 'none' && `shadow-${option.value}`
                  )}
                />
                <span className="text-xs font-medium">
                  {language === 'ar' ? option.labelAr : option.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Button Style */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RectangleHorizontal className="h-4 w-4" />
            {language === 'ar' ? 'شكل الأزرار' : 'Button Style'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'شكل الأزرار في جميع أنحاء الموقع' : 'Button shape used throughout the site'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BUTTON_STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateComponent('buttonStyle', option.value)}
                className={cn(
                  'flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all',
                  theme.components.buttonStyle === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className="px-6 py-2 bg-button text-button-foreground text-xs font-medium"
                  style={{ borderRadius: option.radius }}
                >
                  {language === 'ar' ? 'زر' : 'Button'}
                </div>
                <span className="text-xs font-medium">
                  {language === 'ar' ? option.labelAr : option.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
