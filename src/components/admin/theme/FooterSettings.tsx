import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme, ThemeFooter } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { hexToHsl, hslToHex } from '@/lib/colorUtils';
import { cn } from '@/lib/utils';
import {
  PanelBottom,
  Palette,
  Type,
  Layout,
  Layers,
  AlignCenter,
  AlignLeft,
  Minus,
} from 'lucide-react';

function FooterColorPicker({
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

const PADDING_OPTIONS: { value: ThemeFooter['paddingSize']; label: string; labelAr: string; desc: string }[] = [
  { value: 'compact', label: 'Compact', labelAr: 'مضغوط', desc: 'py-8' },
  { value: 'default', label: 'Default', labelAr: 'افتراضي', desc: 'py-12' },
  { value: 'spacious', label: 'Spacious', labelAr: 'واسع', desc: 'py-20' },
];

const SHADOW_OPTIONS: { value: ThemeFooter['shadow']; label: string; labelAr: string }[] = [
  { value: 'none', label: 'None', labelAr: 'بدون' },
  { value: 'sm', label: 'Small', labelAr: 'صغير' },
  { value: 'md', label: 'Medium', labelAr: 'متوسط' },
];

const LAYOUT_OPTIONS: { value: ThemeFooter['layoutStyle']; label: string; labelAr: string; icon: React.ElementType }[] = [
  { value: 'default', label: 'Standard', labelAr: 'قياسي', icon: AlignLeft },
  { value: 'centered', label: 'Centered', labelAr: 'وسطي', icon: AlignCenter },
  { value: 'minimal', label: 'Minimal', labelAr: 'بسيط', icon: Minus },
];

const FONT_SIZE_OPTIONS: { value: ThemeFooter['fontSize']; label: string; labelAr: string }[] = [
  { value: 'sm', label: 'Small', labelAr: 'صغير' },
  { value: 'base', label: 'Medium', labelAr: 'متوسط' },
  { value: 'lg', label: 'Large', labelAr: 'كبير' },
];

const FONT_WEIGHT_OPTIONS: { value: ThemeFooter['fontWeight']; label: string; labelAr: string }[] = [
  { value: 'normal', label: 'Normal', labelAr: 'عادي' },
  { value: 'medium', label: 'Medium', labelAr: 'متوسط' },
  { value: 'semibold', label: 'Semi Bold', labelAr: 'شبه عريض' },
  { value: 'bold', label: 'Bold', labelAr: 'عريض' },
];

export function FooterSettings() {
  const { theme, updateFooter, updateColor } = useTheme();
  const { language } = useLanguage();
  const footer = theme.footer;

  return (
    <div className="space-y-6">
      {/* Colors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {language === 'ar' ? 'ألوان الفوتر' : 'Footer Colors'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'تخصيص ألوان الفوتر' : 'Customize footer colors'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FooterColorPicker
              label={language === 'ar' ? 'لون الخلفية' : 'Background'}
              value={footer.backgroundColor}
              onChange={(val) => updateFooter('backgroundColor', val)}
              placeholder={theme.colors.headerBackground}
            />
            <FooterColorPicker
              label={language === 'ar' ? 'لون النص' : 'Text Color'}
              value={footer.textColor}
              onChange={(val) => updateFooter('textColor', val)}
              placeholder={theme.colors.link}
            />
            <FooterColorPicker
              label={language === 'ar' ? 'لون الرابط' : 'Link Color'}
              value={footer.linkColor}
              onChange={(val) => updateFooter('linkColor', val)}
              placeholder={theme.colors.link}
            />
            <FooterColorPicker
              label={language === 'ar' ? 'لون التمرير' : 'Link Hover'}
              value={footer.linkHoverColor}
              onChange={(val) => updateFooter('linkHoverColor', val)}
              placeholder={theme.colors.linkHover}
            />
            <FooterColorPicker
              label={language === 'ar' ? 'لون الحد' : 'Border Color'}
              value={footer.borderColor}
              onChange={(val) => updateFooter('borderColor', val)}
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
            {language === 'ar' ? 'خطوط الفوتر' : 'Footer Typography'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'حجم ووزن الخط في الفوتر' : 'Font size and weight for footer text'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'حجم الخط' : 'Font Size'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {FONT_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFooter('fontSize', opt.value)}
                  className={cn(
                    'flex items-center justify-center p-3 rounded-lg border-2 transition-all',
                    footer.fontSize === opt.value
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

          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'وزن الخط' : 'Font Weight'}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONT_WEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFooter('fontWeight', opt.value)}
                  className={cn(
                    'flex items-center justify-center p-3 rounded-lg border-2 transition-all',
                    footer.fontWeight === opt.value
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
            {language === 'ar' ? 'تخطيط الفوتر' : 'Footer Layout'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'شكل وترتيب عناصر الفوتر' : 'Footer arrangement and spacing'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Padding */}
          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'حجم المساحة الداخلية' : 'Padding Size'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {PADDING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFooter('paddingSize', opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                    footer.paddingSize === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-sm font-medium">
                    {language === 'ar' ? opt.labelAr : opt.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
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
                  onClick={() => updateFooter('layoutStyle', opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                    footer.layoutStyle === opt.value
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
              checked={footer.fullWidth}
              onCheckedChange={(val) => updateFooter('fullWidth', val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Styles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {language === 'ar' ? 'أنماط الفوتر' : 'Footer Styles'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar' ? 'تأثيرات بصرية للفوتر' : 'Visual effects for the footer'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show Logo */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'إظهار الشعار' : 'Show Logo'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'عرض شعار الموقع في الفوتر' : 'Display website logo in the footer'}
              </p>
            </div>
            <Switch
              checked={footer.showLogo !== false}
              onCheckedChange={(val) => updateFooter('showLogo', val)}
            />
          </div>

          {/* Show Store Name */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'إظهار اسم المتجر' : 'Show Store Name'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'عرض اسم المتجر في الفوتر' : 'Display store name in the footer'}
              </p>
            </div>
            <Switch
              checked={footer.showStoreName !== false}
              onCheckedChange={(val) => updateFooter('showStoreName', val)}
            />
          </div>

          {/* Border Top */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                {language === 'ar' ? 'حد علوي' : 'Border Top'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'إظهار خط فاصل أعلى الفوتر' : 'Show a divider line above the footer'}
              </p>
            </div>
            <Switch
              checked={footer.borderTop}
              onCheckedChange={(val) => updateFooter('borderTop', val)}
            />
          </div>

          {/* Shadow */}
          <div className="space-y-2">
            <Label className="text-sm">
              {language === 'ar' ? 'ظل الفوتر' : 'Footer Shadow'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {SHADOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFooter('shadow', opt.value)}
                  className={cn(
                    'flex items-center justify-center p-3 rounded-lg border-2 transition-all',
                    footer.shadow === opt.value
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
    </div>
  );
}
