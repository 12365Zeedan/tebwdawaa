import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { hexToHsl, hslToHex } from '@/lib/colorUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  colorKey: keyof ThemeColors;
}

function ColorPicker({ label, colorKey }: ColorPickerProps) {
  const { theme, updateColor } = useTheme();
  const hslValue = theme.colors[colorKey];
  const hexValue = hslToHex(hslValue);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => updateColor(colorKey, hexToHsl(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
        />
        <div
          className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer"
          style={{ backgroundColor: hexValue }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground font-mono">{hexValue}</p>
      </div>
    </div>
  );
}

export function ColorSettings() {
  const { language } = useLanguage();

  const colorGroups = [
    {
      title: language === 'ar' ? 'الألوان الأساسية' : 'Brand Colors',
      description: language === 'ar' ? 'الألوان الرئيسية للعلامة التجارية' : 'Primary brand identity colors',
      items: [
        { key: 'primary' as const, label: language === 'ar' ? 'اللون الأساسي' : 'Primary' },
        { key: 'primaryForeground' as const, label: language === 'ar' ? 'نص اللون الأساسي' : 'Primary Text' },
        { key: 'accent' as const, label: language === 'ar' ? 'لون التمييز' : 'Accent' },
        { key: 'accentForeground' as const, label: language === 'ar' ? 'نص التمييز' : 'Accent Text' },
        { key: 'button' as const, label: language === 'ar' ? 'لون الزر' : 'Button' },
        { key: 'buttonForeground' as const, label: language === 'ar' ? 'نص الزر' : 'Button Text' },
      ],
    },
    {
      title: language === 'ar' ? 'الخلفية والنصوص' : 'Background & Text',
      description: language === 'ar' ? 'ألوان الخلفية والمحتوى' : 'Page background and content colors',
      items: [
        { key: 'background' as const, label: language === 'ar' ? 'خلفية الصفحة' : 'Page Background' },
        { key: 'foreground' as const, label: language === 'ar' ? 'لون النص الرئيسي' : 'Main Text' },
        { key: 'card' as const, label: language === 'ar' ? 'خلفية البطاقة' : 'Card Background' },
        { key: 'cardForeground' as const, label: language === 'ar' ? 'نص البطاقة' : 'Card Text' },
        { key: 'muted' as const, label: language === 'ar' ? 'لون خافت' : 'Muted' },
        { key: 'mutedForeground' as const, label: language === 'ar' ? 'نص خافت' : 'Muted Text' },
        { key: 'secondary' as const, label: language === 'ar' ? 'ثانوي' : 'Secondary' },
        { key: 'border' as const, label: language === 'ar' ? 'الحدود' : 'Border' },
      ],
    },
    {
      title: language === 'ar' ? 'الرأس والتذييل' : 'Header & Footer',
      description: language === 'ar' ? 'ألوان شريط التنقل والتذييل' : 'Navigation bar and footer colors',
      items: [
        { key: 'headerBackground' as const, label: language === 'ar' ? 'خلفية الرأس' : 'Header Background' },
        { key: 'link' as const, label: language === 'ar' ? 'لون الرابط' : 'Link Color' },
        { key: 'linkHover' as const, label: language === 'ar' ? 'لون التمرير' : 'Link Hover' },
      ],
    },
    {
      title: language === 'ar' ? 'ألوان الحالة' : 'Status Colors',
      description: language === 'ar' ? 'ألوان النجاح والتحذير والخطأ' : 'Success, warning, and error colors',
      items: [
        { key: 'success' as const, label: language === 'ar' ? 'نجاح' : 'Success' },
        { key: 'warning' as const, label: language === 'ar' ? 'تحذير' : 'Warning' },
        { key: 'destructive' as const, label: language === 'ar' ? 'خطر' : 'Destructive' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {colorGroups.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {group.title}
            </CardTitle>
            <CardDescription className="text-xs">{group.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.items.map((item) => (
                <ColorPicker key={item.key} colorKey={item.key} label={item.label} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
