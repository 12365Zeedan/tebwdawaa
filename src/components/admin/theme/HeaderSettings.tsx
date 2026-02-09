import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme, ThemeHeader } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { hexToHsl, hslToHex } from '@/lib/colorUtils';
import { cn } from '@/lib/utils';
import {
  PanelTop,
  Palette,
  Type,
  Layout,
  Layers,
  AlignCenter,
  AlignLeft,
  Minus,
} from 'lucide-react';

function HeaderColorPicker({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const hexValue = value ? hslToHex(value) : hslToHex(placeholder);
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={hexValue}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
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
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Reset
        </button>
      )}
    </div>
  );
}

const HEIGHT_OPTIONS: { value: ThemeHeader['height']; label: string; labelAr: string; px: string }[] = [
  { value: 'compact', label: 'Compact', labelAr: 'مضغوط', px: '48px' },
  { value: 'default', label: 'Default', labelAr: 'افتراضي', px: '64px' },
  { value: 'tall', label: 'Tall', labelAr: 'كبير', px: '80px' },
];

const SHADOW_OPTIONS: { value: ThemeHeader['shadow']; label: string; labelAr: string }[] = [
  { value: 'none', label: 'None', labelAr: 'بدون' },
  { value: 'sm', label: 'Small', labelAr: 'صغير' },
  { value: 'md', label: 'Medium', labelAr: 'متوسط' },
];

const LAYOUT_OPTIONS: { value: ThemeHeader['layoutStyle']; label: string; labelAr: string; icon: React.ElementType }[] = [
  { value: 'default', label: 'Standard', labelAr: 'قياسي', icon: AlignLeft },
  { value: 'centered', label: 'Centered', labelAr: 'وسطي', icon: AlignCenter },
  { value: 'minimal', label: 'Minimal', labelAr: 'بسيط', icon: Minus },
];

const FONT_SIZE_OPTIONS: { value: ThemeHeader['fontSize']; label: string; labelAr: string }[] = [
  { value: 'sm', label: 'Small', labelAr: 'صغير' },
  { value: 'base', label: 'Medium', labelAr: 'متوسط' },
  { value: 'lg', label: 'Large', labelAr: 'كبير' },
];

const FONT_WEIGHT_OPTIONS: { value: ThemeHeader['fontWeight']; label: string; labelAr: string }[] = [
  { value: 'normal', label: 'Normal', labelAr: 'عادي' },
  { value: 'medium', label: 'Medium', labelAr: 'متوسط' },
  { value: 'semibold', label: 'Semi Bold', labelAr: 'شبه عريض' },
  { value: 'bold', label: 'Bold', labelAr: 'عريض' },
];

export function HeaderSettings() {
  const { theme, updateHeader, updateColor } = useTheme();
  const { language } = useLanguage();
  const header = theme.header;

  return (
    <div className="space-y-6">
      {/* Colors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {language === 'ar' ? 'ألوان الرأس' : 'Header Colors'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'تخصيص ألوان شريط التنقل العلوي' : 'Customize navigation bar colors'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={hslToHex(theme.colors.headerBackground)}
                  onChange={(e) => updateColor('headerBackground', hexToHsl(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                />
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer"
                  style={{ backgroundColor: hslToHex(theme.colors.headerBackground) }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium">
                  {language === 'ar' ? 'خلفية الرأس' : 'Background'}
                </Label>
                <p className="text-xs text-muted-foreground font-mono">
                  {hslToHex(theme.colors.headerBackground)}
                </p>
              </div>
            </div>

            <HeaderColorPicker
              label={language === 'ar' ? 'لون النص' : 'Text Color'}
              value={header.textColor}
              onChange={(val) => updateHeader('textColor', val)}
              placeholder={theme.colors.link}
            />

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={hslToHex(theme.colors.link)}
                  onChange={(e) => updateColor('link', hexToHsl(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                />
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer"
                  style={{ backgroundColor: hslToHex(theme.colors.link) }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium">
                  {language === 'ar' ? 'لون الرابط' : 'Link Color'}
                </Label>
                <p className="text-xs text-muted-foreground font-mono">
                  {hslToHex(theme.colors.link)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={hslToHex(theme.colors.linkHover)}
                  onChange={(e) => updateColor('linkHover', hexToHsl(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                />
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer"
                  style={{ backgroundColor: hslToHex(theme.colors.linkHover) }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium">
                  {language === 'ar' ? 'لون التمرير' : 'Link Hover'}
                </Label>
                <p className="text-xs text-muted-foreground font-mono">
                  {hslToHex(theme.colors.linkHover)}
                </p>
              </div>
            </div>

            <HeaderColorPicker
              label={language === 'ar' ? 'لون الحد السفلي' : 'Border Color'}
              value={header.borderColor}
              onChange={(val) => updateHeader('borderColor', val)}
              placeholder={theme.colors.border}
            />
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="h-4 w-4" />
            {language === 'ar' ? 'خطوط الرأس' : 'Header Typography'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'حجم ووزن الخط في شريط التنقل' : 'Font size and weight for navigation links'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'حجم الخط' : 'Font Size'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {FONT_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateHeader('fontSize', opt.value)}
                  className={cn(
                    'flex items-center justify-center p-3 rounded-lg border-2 transition-all',
                    header.fontSize === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className={cn(
                    'font-medium',
                    opt.value === 'sm' && 'text-sm',
                    opt.value === 'base' && 'text-base',
                    opt.value === 'lg' && 'text-lg',
                  )}>
                    {language === 'ar' ? opt.labelAr : opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'وزن الخط' : 'Font Weight'}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONT_WEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateHeader('fontWeight', opt.value)}
                  className={cn(
                    'flex items-center justify-center p-3 rounded-lg border-2 transition-all',
                    header.fontWeight === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span style={{ fontWeight: opt.value === 'normal' ? 400 : opt.value === 'medium' ? 500 : opt.value === 'semibold' ? 600 : 700 }}>
                    {language === 'ar' ? opt.labelAr : opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layout className="h-4 w-4" />
            {language === 'ar' ? 'تخطيط الرأس' : 'Header Layout'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'شكل وترتيب عناصر الرأس' : 'Header arrangement and positioning'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Height */}
          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'ارتفاع الرأس' : 'Header Height'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {HEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateHeader('height', opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                    header.height === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-sm font-medium">
                    {language === 'ar' ? opt.labelAr : opt.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{opt.px}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Style */}
          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'نمط التخطيط' : 'Layout Style'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateHeader('layoutStyle', opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                    header.layoutStyle === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <opt.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">
                    {language === 'ar' ? opt.labelAr : opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Width Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'عرض كامل' : 'Full Width'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'تمديد المحتوى لعرض الشاشة الكامل' : 'Stretch content to full screen width'}
              </p>
            </div>
            <Switch
              checked={header.fullWidth}
              onCheckedChange={(val) => updateHeader('fullWidth', val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Styles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {language === 'ar' ? 'أنماط الرأس' : 'Header Styles'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'تأثيرات بصرية وسلوك الرأس' : 'Visual effects and header behavior'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sticky */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'رأس ثابت' : 'Sticky Header'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'يبقى الرأس مرئياً عند التمرير' : 'Header stays visible while scrolling'}
              </p>
            </div>
            <Switch
              checked={header.sticky}
              onCheckedChange={(val) => updateHeader('sticky', val)}
            />
          </div>

          {/* Border Bottom */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'حد سفلي' : 'Border Bottom'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'إظهار خط فاصل أسفل الرأس' : 'Show a divider line below the header'}
              </p>
            </div>
            <Switch
              checked={header.borderBottom}
              onCheckedChange={(val) => updateHeader('borderBottom', val)}
            />
          </div>

          {/* Backdrop Blur */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'ضبابية الخلفية' : 'Backdrop Blur'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'تأثير زجاجي شفاف عند التمرير' : 'Glass effect when scrolling over content'}
              </p>
            </div>
            <Switch
              checked={header.backdropBlur}
              onCheckedChange={(val) => updateHeader('backdropBlur', val)}
            />
          </div>

          {/* Shadow */}
          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'ظل الرأس' : 'Header Shadow'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {SHADOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateHeader('shadow', opt.value)}
                  className={cn(
                    'flex items-center justify-center p-3 rounded-lg border-2 transition-all',
                    header.shadow === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-sm font-medium">
                    {language === 'ar' ? opt.labelAr : opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PanelTop className="h-4 w-4" />
            {language === 'ar' ? 'معاينة الرأس' : 'Header Preview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <div
              className={cn(
                'flex items-center justify-between px-4 transition-all',
                header.borderBottom && 'border-b',
                header.shadow === 'sm' && 'shadow-sm',
                header.shadow === 'md' && 'shadow-md',
                header.backdropBlur && 'backdrop-blur-md',
              )}
              style={{
                backgroundColor: `hsl(${theme.colors.headerBackground})`,
                height: header.height === 'compact' ? '48px' : header.height === 'tall' ? '80px' : '64px',
                borderColor: header.borderColor ? `hsl(${header.borderColor})` : `hsl(${theme.colors.border} / 0.4)`,
              }}
            >
              <div
                className={cn(
                  'flex items-center gap-6 w-full',
                  header.layoutStyle === 'centered' && 'justify-center',
                  header.layoutStyle === 'minimal' && 'justify-between',
                )}
              >
                <span
                  className="font-bold"
                  style={{
                    color: header.textColor ? `hsl(${header.textColor})` : `hsl(${theme.colors.link})`,
                    fontSize: header.fontSize === 'sm' ? '14px' : header.fontSize === 'lg' ? '18px' : '16px',
                    fontWeight: header.fontWeight === 'normal' ? 400 : header.fontWeight === 'medium' ? 500 : header.fontWeight === 'semibold' ? 600 : 700,
                  }}
                >
                  Logo
                </span>
                {header.layoutStyle !== 'minimal' && (
                  <div className="flex items-center gap-4">
                    {['Home', 'Products', 'Blog'].map((item) => (
                      <span
                        key={item}
                        style={{
                          color: `hsl(${theme.colors.link})`,
                          fontSize: header.fontSize === 'sm' ? '13px' : header.fontSize === 'lg' ? '16px' : '14px',
                          fontWeight: header.fontWeight === 'normal' ? 400 : header.fontWeight === 'medium' ? 500 : header.fontWeight === 'semibold' ? 600 : 700,
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.link} / 0.5)` }} />
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.link} / 0.5)` }} />
                </div>
              </div>
            </div>
            <div className="h-16 bg-background flex items-center justify-center text-xs text-muted-foreground">
              {language === 'ar' ? 'محتوى الصفحة' : 'Page Content'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
