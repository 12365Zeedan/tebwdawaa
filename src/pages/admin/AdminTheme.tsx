import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Paintbrush, Palette, Type, Layout, Layers, RotateCcw, FileText } from 'lucide-react';
import { ColorSettings } from '@/components/admin/theme/ColorSettings';
import { TypographySettings } from '@/components/admin/theme/TypographySettings';
import { LayoutSettings } from '@/components/admin/theme/LayoutSettings';
import { ComponentSettings } from '@/components/admin/theme/ComponentSettings';
import { ContentSettings } from '@/components/admin/theme/ContentSettings';
import { ThemePreview } from '@/components/admin/theme/ThemePreview';
import { useToast } from '@/hooks/use-toast';

export default function AdminTheme() {
  const { language } = useLanguage();
  const { resetToDefaults, hasChanges } = useTheme();
  const { toast } = useToast();

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: language === 'ar' ? 'تم إعادة الضبط' : 'Theme Reset',
      description: language === 'ar' ? 'تم إعادة ضبط المظهر للإعدادات الافتراضية' : 'Theme has been reset to default settings',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Paintbrush className="h-6 w-6" />
              {language === 'ar' ? 'تخصيص المظهر' : 'Theme Customization'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar'
                ? 'تحكم في ألوان الموقع والخطوط والتخطيط وأنماط العناصر'
                : 'Control your site colors, fonts, layout, and component styles'}
            </p>
          </div>
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
            </Button>
          )}
        </div>

        {/* Main layout: Settings + Preview */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Settings tabs */}
          <div>
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-4">
                <TabsTrigger value="colors" className="gap-1.5 text-xs sm:text-sm">
                  <Palette className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'الألوان' : 'Colors'}
                </TabsTrigger>
                <TabsTrigger value="typography" className="gap-1.5 text-xs sm:text-sm">
                  <Type className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'الخطوط' : 'Fonts'}
                </TabsTrigger>
                <TabsTrigger value="layout" className="gap-1.5 text-xs sm:text-sm">
                  <Layout className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'التخطيط' : 'Layout'}
                </TabsTrigger>
                <TabsTrigger value="components" className="gap-1.5 text-xs sm:text-sm">
                  <Layers className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'العناصر' : 'Styles'}
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-1.5 text-xs sm:text-sm">
                  <FileText className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'المحتوى' : 'Content'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="colors">
                <ColorSettings />
              </TabsContent>
              <TabsContent value="typography">
                <TypographySettings />
              </TabsContent>
              <TabsContent value="layout">
                <LayoutSettings />
              </TabsContent>
              <TabsContent value="components">
                <ComponentSettings />
              </TabsContent>
              <TabsContent value="content">
                <ContentSettings />
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview - sticky sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <ThemePreview />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
