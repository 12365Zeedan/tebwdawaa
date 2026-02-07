import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTheme, SECTION_LABELS, SectionConfig } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout, ArrowUp, ArrowDown, Eye, EyeOff, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LayoutSettings() {
  const { theme, updateSectionVisibility, reorderSections } = useTheme();
  const { language } = useLanguage();

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sections = [...theme.layout.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    reorderSections(sections);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layout className="h-4 w-4" />
            {language === 'ar' ? 'أقسام الصفحة الرئيسية' : 'Homepage Sections'}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === 'ar'
              ? 'اختر الأقسام المرئية ورتبها بالترتيب المفضل'
              : 'Toggle visibility and reorder sections on the homepage'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {theme.layout.sections.map((section, index) => {
              const labels = SECTION_LABELS[section.id];
              if (!labels) return null;

              return (
                <div
                  key={section.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    section.visible
                      ? 'border-border bg-card'
                      : 'border-border/50 bg-muted/30 opacity-60'
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">
                      {language === 'ar' ? labels.ar : labels.en}
                    </Label>
                  </div>

                  {/* Reorder buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === theme.layout.sections.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Visibility toggle */}
                  <div className="flex items-center gap-2">
                    {section.visible ? (
                      <Eye className="h-4 w-4 text-success" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={section.visible}
                      onCheckedChange={(checked) =>
                        updateSectionVisibility(section.id, checked)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Layout className="h-5 w-5 mt-0.5 shrink-0" />
            <p>
              {language === 'ar'
                ? 'استخدم الأسهم لتغيير ترتيب الأقسام ومفتاح التبديل لإظهار أو إخفاء كل قسم. التغييرات تُطبق فوراً على الصفحة الرئيسية.'
                : 'Use the arrows to reorder sections and the toggle to show or hide each section. Changes apply immediately to the homepage.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
