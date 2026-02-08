import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme, AboutFeature, AboutPageContent } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Info, Plus, Trash2 } from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'heart', label: '❤️ Heart' },
  { value: 'shield', label: '🛡️ Shield' },
  { value: 'truck', label: '🚚 Truck' },
  { value: 'clock', label: '⏰ Clock' },
  { value: 'star', label: '⭐ Star' },
  { value: 'check', label: '✅ Check' },
  { value: 'zap', label: '⚡ Zap' },
  { value: 'award', label: '🏆 Award' },
];

export function AboutPageEditor() {
  const { theme, updateContent } = useTheme();
  const { language } = useLanguage();
  const content = theme.content;
  const about = content.aboutPage;

  const updateAbout = (field: keyof AboutPageContent, value: string) => {
    updateContent({
      ...content,
      aboutPage: { ...about, [field]: value },
    });
  };

  const updateFeature = (id: string, field: keyof AboutFeature, value: string) => {
    updateContent({
      ...content,
      aboutPage: {
        ...about,
        features: about.features.map(f =>
          f.id === id ? { ...f, [field]: value } : f
        ),
      },
    });
  };

  const addFeature = () => {
    if (about.features.length >= 6) return;
    const newFeature: AboutFeature = {
      id: Date.now().toString(),
      icon: 'star',
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
    };
    updateContent({
      ...content,
      aboutPage: {
        ...about,
        features: [...about.features, newFeature],
      },
    });
  };

  const removeFeature = (id: string) => {
    if (about.features.length <= 1) return;
    updateContent({
      ...content,
      aboutPage: {
        ...about,
        features: about.features.filter(f => f.id !== id),
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          {language === 'ar' ? 'صفحة من نحن' : 'About Page'}
        </CardTitle>
        <CardDescription className="text-xs">
          {language === 'ar'
            ? 'تعديل محتوى صفحة من نحن'
            : 'Edit the content of the About page'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Page Title */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            {language === 'ar' ? 'عنوان الصفحة' : 'Page Title'}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input value={about.titleEn} onChange={(e) => updateAbout('titleEn', e.target.value)} className="h-8 text-sm" placeholder="About Us" />
            <Input value={about.titleAr} onChange={(e) => updateAbout('titleAr', e.target.value)} className="h-8 text-sm" dir="rtl" placeholder="من نحن" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            {language === 'ar' ? 'الوصف' : 'Description'}
          </Label>
          <Textarea value={about.descriptionEn} onChange={(e) => updateAbout('descriptionEn', e.target.value)} className="text-sm min-h-[50px]" placeholder="A leading pharmacy..." />
          <Textarea value={about.descriptionAr} onChange={(e) => updateAbout('descriptionAr', e.target.value)} className="text-sm min-h-[50px]" dir="rtl" placeholder="صيدلية رائدة..." />
        </div>

        {/* Mission */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            {language === 'ar' ? 'المهمة' : 'Mission'}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input value={about.missionTitleEn} onChange={(e) => updateAbout('missionTitleEn', e.target.value)} className="h-8 text-sm" placeholder="Our Mission" />
            <Input value={about.missionTitleAr} onChange={(e) => updateAbout('missionTitleAr', e.target.value)} className="h-8 text-sm" dir="rtl" placeholder="مهمتنا" />
          </div>
          <Textarea value={about.missionDescriptionEn} onChange={(e) => updateAbout('missionDescriptionEn', e.target.value)} className="text-sm min-h-[50px]" />
          <Textarea value={about.missionDescriptionAr} onChange={(e) => updateAbout('missionDescriptionAr', e.target.value)} className="text-sm min-h-[50px]" dir="rtl" />
        </div>

        {/* Features */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            {language === 'ar' ? 'المميزات' : 'Features'}
          </Label>
          {about.features.map((feature, index) => (
            <div key={feature.id} className="border border-border rounded-lg p-3 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {language === 'ar' ? `ميزة ${index + 1}` : `Feature ${index + 1}`}
                </span>
                <div className="flex items-center gap-2">
                  <Select value={feature.icon} onValueChange={(v) => updateFeature(feature.id, 'icon', v)}>
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFeature(feature.id)} disabled={about.features.length <= 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={feature.titleEn} onChange={(e) => updateFeature(feature.id, 'titleEn', e.target.value)} className="h-7 text-xs" placeholder="Title EN" />
                <Input value={feature.titleAr} onChange={(e) => updateFeature(feature.id, 'titleAr', e.target.value)} className="h-7 text-xs" dir="rtl" placeholder="العنوان" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={feature.descriptionEn} onChange={(e) => updateFeature(feature.id, 'descriptionEn', e.target.value)} className="h-7 text-xs" placeholder="Description EN" />
                <Input value={feature.descriptionAr} onChange={(e) => updateFeature(feature.id, 'descriptionAr', e.target.value)} className="h-7 text-xs" dir="rtl" placeholder="الوصف" />
              </div>
            </div>
          ))}
          {about.features.length < 6 && (
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={addFeature}>
              <Plus className="h-3.5 w-3.5" />
              {language === 'ar' ? 'إضافة ميزة' : 'Add Feature'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}