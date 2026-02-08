import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme, SECTION_LABELS } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heading } from 'lucide-react';

export function SectionHeadingsEditor() {
  const { theme, updateContent } = useTheme();
  const { language } = useLanguage();
  const content = theme.content;

  const updateSectionHeading = (sectionId: string, field: 'titleEn' | 'titleAr', value: string) => {
    updateContent({
      ...content,
      sectionHeadings: {
        ...content.sectionHeadings,
        [sectionId]: {
          ...content.sectionHeadings[sectionId],
          [field]: value,
        },
      },
    });
  };

  const editableSections = ['featured', 'newArrivals', 'bestSellers', 'recentlyViewed', 'categories', 'blog'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Heading className="h-4 w-4" />
          {language === 'ar' ? 'عناوين الأقسام' : 'Section Headings'}
        </CardTitle>
        <CardDescription className="text-xs">
          {language === 'ar'
            ? 'تعديل عناوين أقسام الصفحة الرئيسية'
            : 'Edit the headings for homepage sections'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {editableSections.map((sectionId) => {
          const label = SECTION_LABELS[sectionId];
          const heading = content.sectionHeadings[sectionId];
          if (!heading) return null;

          return (
            <div key={sectionId} className="border border-border rounded-lg p-3 bg-card space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                {language === 'ar' ? label?.ar : label?.en}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">English</Label>
                  <Input
                    value={heading.titleEn}
                    onChange={(e) => updateSectionHeading(sectionId, 'titleEn', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">العربية</Label>
                  <Input
                    value={heading.titleAr}
                    onChange={(e) => updateSectionHeading(sectionId, 'titleAr', e.target.value)}
                    className="h-8 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}