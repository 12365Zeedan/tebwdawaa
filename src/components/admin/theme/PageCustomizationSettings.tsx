import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageCustomizations, PageCustomization, PAGE_ROUTE_MAP } from '@/hooks/usePageCustomizations';
import { hexToHsl, hslToHex } from '@/lib/colorUtils';
import {
  Palette, Type, Layout, Sparkles, RotateCcw, Monitor, Smartphone, Tablet, RefreshCw, Maximize2, FileStack, FileText, Megaphone, Eye, EyeOff, Puzzle,
} from 'lucide-react';
import { WidgetManager } from './widgets/WidgetManager';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTHS: Record<DeviceMode, number> = { desktop: 1280, tablet: 768, mobile: 375 };

// ── Color Field ──────────────────
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const hex = value ? hslToHex(value) : '#ffffff';
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
        />
        <div
          className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-pointer"
          style={{ backgroundColor: value ? hex : 'transparent' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground font-mono">{value ? hex : '—'}</p>
      </div>
      {value && (
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onChange(null)}>
          Clear
        </Button>
      )}
    </div>
  );
}

// ── Inline Preview ──────────────────
function InlinePreview({ path, refreshKey }: { path: string; refreshKey: number }) {
  const { language } = useLanguage();
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [fullscreen, setFullscreen] = useState(false);
  const [fsDevice, setFsDevice] = useState<DeviceMode>('desktop');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.22);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 300;
      setScale(Math.min(w / DEVICE_WIDTHS[deviceMode], 0.45));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [deviceMode]);

  const iW = DEVICE_WIDTHS[deviceMode];
  const iH = deviceMode === 'mobile' ? 812 : deviceMode === 'tablet' ? 1024 : 800;
  const fsW = DEVICE_WIDTHS[fsDevice];
  const fsH = fsDevice === 'mobile' ? 812 : fsDevice === 'tablet' ? 1024 : 900;

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Monitor className="h-4 w-4" />
            {language === 'ar' ? 'معاينة الصفحة' : 'Page Preview'}
          </h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setFsDevice(deviceMode); setFullscreen(true); }}>
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <ToggleGroup type="single" value={deviceMode} onValueChange={(v) => v && setDeviceMode(v as DeviceMode)} className="justify-start">
          <ToggleGroupItem value="desktop" size="sm" className="h-7 w-7 p-0"><Monitor className="h-3.5 w-3.5" /></ToggleGroupItem>
          <ToggleGroupItem value="tablet" size="sm" className="h-7 w-7 p-0"><Tablet className="h-3.5 w-3.5" /></ToggleGroupItem>
          <ToggleGroupItem value="mobile" size="sm" className="h-7 w-7 p-0"><Smartphone className="h-3.5 w-3.5" /></ToggleGroupItem>
        </ToggleGroup>

        <div ref={containerRef} className="border-2 border-border rounded-xl overflow-hidden shadow-lg bg-muted" style={{ height: `${iH * scale + 4}px` }}>
          <div style={{ width: `${iW}px`, height: `${iH}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <iframe key={`${path}-${refreshKey}-${deviceMode}`} src={`${path}?_preview=1`} title="Page Preview" className="w-full h-full border-0" style={{ pointerEvents: 'none' }} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          {language === 'ar' ? 'المعاينة تعكس التغييرات فورياً' : 'Preview reflects changes in real-time'}
        </p>
      </div>

      {/* Fullscreen */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-sm font-semibold">{language === 'ar' ? 'معاينة بملء الشاشة' : 'Full-screen Preview'}</DialogTitle>
            <div className="flex items-center gap-3 mr-8">
              <ToggleGroup type="single" value={fsDevice} onValueChange={(v) => v && setFsDevice(v as DeviceMode)}>
                <ToggleGroupItem value="desktop" size="sm" className="h-8 w-8 p-0"><Monitor className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="tablet" size="sm" className="h-8 w-8 p-0"><Tablet className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="mobile" size="sm" className="h-8 w-8 p-0"><Smartphone className="h-4 w-4" /></ToggleGroupItem>
              </ToggleGroup>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted flex justify-center items-start p-4">
            <div className="border-2 border-border rounded-xl overflow-hidden shadow-2xl bg-background transition-all duration-300" style={{ width: `${fsW}px`, maxWidth: '100%', height: `${fsH}px` }}>
              <iframe key={`fs-${path}-${refreshKey}-${fsDevice}`} src={`${path}?_preview=1`} title="Full-screen Preview" className="w-full h-full border-0" style={{ pointerEvents: 'auto' }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main Component ──────────────────
export function PageCustomizationSettings() {
  const { language } = useLanguage();
  const { pages, isLoading, updatePage, resetPage, isSaving } = usePageCustomizations();
  const [selectedPageKey, setSelectedPageKey] = useState<string>('homepage');
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedPage = pages.find((p) => p.page_key === selectedPageKey);

  // Local draft state for editing
  const [draft, setDraft] = useState<Partial<PageCustomization>>({});

  // Reset draft when selected page changes
  useEffect(() => {
    if (selectedPage) {
      setDraft({
        background_color: selectedPage.background_color,
        text_color: selectedPage.text_color,
        link_color: selectedPage.link_color,
        link_hover_color: selectedPage.link_hover_color,
        border_color: selectedPage.border_color,
        font_size: selectedPage.font_size,
        font_weight: selectedPage.font_weight,
        height: selectedPage.height,
        layout_style: selectedPage.layout_style,
        full_width: selectedPage.full_width,
        sticky_header: selectedPage.sticky_header,
        border_bottom: selectedPage.border_bottom,
        backdrop_blur: selectedPage.backdrop_blur,
        shadow_depth: selectedPage.shadow_depth,
        page_title: selectedPage.page_title,
        page_title_ar: selectedPage.page_title_ar,
        page_subtitle: selectedPage.page_subtitle,
        page_subtitle_ar: selectedPage.page_subtitle_ar,
        meta_title: selectedPage.meta_title,
        meta_description: selectedPage.meta_description,
        og_image_url: selectedPage.og_image_url,
        hidden_sections: selectedPage.hidden_sections ?? [],
        banner_text: selectedPage.banner_text,
        banner_text_ar: selectedPage.banner_text_ar,
        banner_visible: selectedPage.banner_visible,
        banner_color: selectedPage.banner_color,
        widget_ids: selectedPage.widget_ids ?? [],
      });
    }
  }, [selectedPage]);

  const updateDraft = <K extends keyof PageCustomization>(key: K, value: PageCustomization[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!selectedPage) return;
    updatePage({ id: selectedPage.id, updates: draft }, {
      onSuccess: () => setRefreshKey((k) => k + 1),
    });
  };

  const handleReset = () => {
    if (!selectedPage) return;
    resetPage(selectedPage.id, {
      onSuccess: () => setRefreshKey((k) => k + 1),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const previewPath = PAGE_ROUTE_MAP[selectedPageKey] ?? '/';

  return (
    <div className="space-y-4">
      {/* Page Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileStack className="h-4 w-4" />
            {language === 'ar' ? 'اختر الصفحة' : 'Select Page'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPageKey} onValueChange={setSelectedPageKey}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pages.map((p) => (
                <SelectItem key={p.page_key} value={p.page_key}>
                  {language === 'ar' ? p.page_label_ar : p.page_label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPage && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Settings */}
          <div className="space-y-4">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-4">
                <TabsTrigger value="colors" className="gap-1.5 text-xs sm:text-sm">
                  <Palette className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'الألوان' : 'Colors'}
                </TabsTrigger>
                <TabsTrigger value="typography" className="gap-1.5 text-xs sm:text-sm">
                  <Type className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'الخطوط' : 'Typography'}
                </TabsTrigger>
                <TabsTrigger value="layout" className="gap-1.5 text-xs sm:text-sm">
                  <Layout className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'التخطيط' : 'Layout'}
                </TabsTrigger>
                <TabsTrigger value="styles" className="gap-1.5 text-xs sm:text-sm">
                  <Sparkles className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'الأنماط' : 'Styles'}
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-1.5 text-xs sm:text-sm">
                  <FileText className="h-3.5 w-3.5 hidden sm:block" />
                  {language === 'ar' ? 'المحتوى' : 'Content'}
                </TabsTrigger>
              </TabsList>

              {/* Colors */}
              <TabsContent value="colors">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{language === 'ar' ? 'ألوان الصفحة' : 'Page Colors'}</CardTitle>
                    <CardDescription className="text-xs">{language === 'ar' ? 'تخصيص ألوان هذه الصفحة' : 'Customize colors for this page'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ColorField label={language === 'ar' ? 'لون الخلفية' : 'Background'} value={draft.background_color ?? null} onChange={(v) => updateDraft('background_color', v)} />
                    <ColorField label={language === 'ar' ? 'لون النص' : 'Text Color'} value={draft.text_color ?? null} onChange={(v) => updateDraft('text_color', v)} />
                    <ColorField label={language === 'ar' ? 'لون الرابط' : 'Link Color'} value={draft.link_color ?? null} onChange={(v) => updateDraft('link_color', v)} />
                    <ColorField label={language === 'ar' ? 'لون التمرير' : 'Link Hover'} value={draft.link_hover_color ?? null} onChange={(v) => updateDraft('link_hover_color', v)} />
                    <ColorField label={language === 'ar' ? 'لون الحدود' : 'Border Color'} value={draft.border_color ?? null} onChange={(v) => updateDraft('border_color', v)} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Typography */}
              <TabsContent value="typography">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{language === 'ar' ? 'إعدادات الخط' : 'Typography Settings'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <Label className="text-sm mb-2 block">{language === 'ar' ? 'حجم الخط' : 'Font Size'}</Label>
                      <ToggleGroup type="single" value={draft.font_size ?? 'medium'} onValueChange={(v) => v && updateDraft('font_size', v as any)} className="justify-start">
                        <ToggleGroupItem value="small" className="text-xs">{language === 'ar' ? 'صغير' : 'Small'}</ToggleGroupItem>
                        <ToggleGroupItem value="medium" className="text-xs">{language === 'ar' ? 'متوسط' : 'Medium'}</ToggleGroupItem>
                        <ToggleGroupItem value="large" className="text-xs">{language === 'ar' ? 'كبير' : 'Large'}</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">{language === 'ar' ? 'وزن الخط' : 'Font Weight'}</Label>
                      <ToggleGroup type="single" value={draft.font_weight ?? 'normal'} onValueChange={(v) => v && updateDraft('font_weight', v as any)} className="justify-start">
                        <ToggleGroupItem value="normal" className="text-xs">{language === 'ar' ? 'عادي' : 'Normal'}</ToggleGroupItem>
                        <ToggleGroupItem value="medium" className="text-xs">{language === 'ar' ? 'متوسط' : 'Medium'}</ToggleGroupItem>
                        <ToggleGroupItem value="semibold" className="text-xs">{language === 'ar' ? 'شبه سميك' : 'Semi Bold'}</ToggleGroupItem>
                        <ToggleGroupItem value="bold" className="text-xs">{language === 'ar' ? 'سميك' : 'Bold'}</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Layout */}
              <TabsContent value="layout">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{language === 'ar' ? 'إعدادات التخطيط' : 'Layout Settings'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <Label className="text-sm mb-2 block">{language === 'ar' ? 'الارتفاع' : 'Height'}</Label>
                      <ToggleGroup type="single" value={draft.height ?? 'default'} onValueChange={(v) => v && updateDraft('height', v as any)} className="justify-start">
                        <ToggleGroupItem value="compact" className="text-xs">{language === 'ar' ? 'مضغوط' : 'Compact'}</ToggleGroupItem>
                        <ToggleGroupItem value="default" className="text-xs">{language === 'ar' ? 'افتراضي' : 'Default'}</ToggleGroupItem>
                        <ToggleGroupItem value="tall" className="text-xs">{language === 'ar' ? 'طويل' : 'Tall'}</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">{language === 'ar' ? 'نمط التخطيط' : 'Layout Style'}</Label>
                      <ToggleGroup type="single" value={draft.layout_style ?? 'standard'} onValueChange={(v) => v && updateDraft('layout_style', v as any)} className="justify-start">
                        <ToggleGroupItem value="standard" className="text-xs">{language === 'ar' ? 'قياسي' : 'Standard'}</ToggleGroupItem>
                        <ToggleGroupItem value="centered" className="text-xs">{language === 'ar' ? 'مركزي' : 'Centered'}</ToggleGroupItem>
                        <ToggleGroupItem value="minimal" className="text-xs">{language === 'ar' ? 'بسيط' : 'Minimal'}</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{language === 'ar' ? 'عرض كامل' : 'Full Width'}</Label>
                      <Switch checked={draft.full_width ?? false} onCheckedChange={(v) => updateDraft('full_width', v)} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Styles */}
              <TabsContent value="styles">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{language === 'ar' ? 'أنماط إضافية' : 'Additional Styles'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{language === 'ar' ? 'رأس ثابت' : 'Sticky Header'}</Label>
                      <Switch checked={draft.sticky_header ?? false} onCheckedChange={(v) => updateDraft('sticky_header', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{language === 'ar' ? 'حد سفلي' : 'Border Bottom'}</Label>
                      <Switch checked={draft.border_bottom ?? false} onCheckedChange={(v) => updateDraft('border_bottom', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{language === 'ar' ? 'تمويه الخلفية' : 'Backdrop Blur'}</Label>
                      <Switch checked={draft.backdrop_blur ?? false} onCheckedChange={(v) => updateDraft('backdrop_blur', v)} />
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">{language === 'ar' ? 'عمق الظل' : 'Shadow Depth'}</Label>
                      <ToggleGroup type="single" value={draft.shadow_depth ?? 'none'} onValueChange={(v) => v && updateDraft('shadow_depth', v as any)} className="justify-start">
                        <ToggleGroupItem value="none" className="text-xs">{language === 'ar' ? 'بدون' : 'None'}</ToggleGroupItem>
                        <ToggleGroupItem value="sm" className="text-xs">SM</ToggleGroupItem>
                        <ToggleGroupItem value="md" className="text-xs">MD</ToggleGroupItem>
                        <ToggleGroupItem value="lg" className="text-xs">LG</ToggleGroupItem>
                        <ToggleGroupItem value="xl" className="text-xs">XL</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content */}
              <TabsContent value="content">
                <div className="space-y-4">
                  {/* Page Title & Subtitle */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {language === 'ar' ? 'العنوان والوصف' : 'Title & Subtitle'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'العنوان (EN)' : 'Page Title (EN)'}</Label>
                        <Input value={draft.page_title ?? ''} onChange={(e) => updateDraft('page_title', e.target.value || null)} placeholder="Custom page title..." />
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'العنوان (AR)' : 'Page Title (AR)'}</Label>
                        <Input value={draft.page_title_ar ?? ''} onChange={(e) => updateDraft('page_title_ar', e.target.value || null)} placeholder="عنوان الصفحة..." dir="rtl" />
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'العنوان الفرعي (EN)' : 'Subtitle (EN)'}</Label>
                        <Input value={draft.page_subtitle ?? ''} onChange={(e) => updateDraft('page_subtitle', e.target.value || null)} placeholder="Short description..." />
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'العنوان الفرعي (AR)' : 'Subtitle (AR)'}</Label>
                        <Input value={draft.page_subtitle_ar ?? ''} onChange={(e) => updateDraft('page_subtitle_ar', e.target.value || null)} placeholder="وصف قصير..." dir="rtl" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meta SEO */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{language === 'ar' ? 'إعدادات SEO' : 'SEO Settings'}</CardTitle>
                      <CardDescription className="text-xs">{language === 'ar' ? 'تحسين ظهور الصفحة في محركات البحث' : 'Optimize page for search engines'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'عنوان Meta' : 'Meta Title'}</Label>
                        <Input value={draft.meta_title ?? ''} onChange={(e) => updateDraft('meta_title', e.target.value || null)} placeholder="SEO title (max 60 chars)..." maxLength={60} />
                        <p className="text-xs text-muted-foreground mt-1">{(draft.meta_title ?? '').length}/60</p>
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'وصف Meta' : 'Meta Description'}</Label>
                        <Textarea value={draft.meta_description ?? ''} onChange={(e) => updateDraft('meta_description', e.target.value || null)} placeholder="SEO description (max 160 chars)..." maxLength={160} rows={3} />
                        <p className="text-xs text-muted-foreground mt-1">{(draft.meta_description ?? '').length}/160</p>
                      </div>
                      <div>
                        <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'رابط صورة OG' : 'OG Image URL'}</Label>
                        <Input value={draft.og_image_url ?? ''} onChange={(e) => updateDraft('og_image_url', e.target.value || null)} placeholder="https://..." />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Page Banner */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Megaphone className="h-4 w-4" />
                        {language === 'ar' ? 'بانر الصفحة' : 'Page Banner'}
                      </CardTitle>
                      <CardDescription className="text-xs">{language === 'ar' ? 'رسالة إعلانية مخصصة لهذه الصفحة' : 'Custom announcement message for this page'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">{language === 'ar' ? 'إظهار البانر' : 'Show Banner'}</Label>
                        <Switch checked={draft.banner_visible ?? false} onCheckedChange={(v) => updateDraft('banner_visible', v)} />
                      </div>
                      {draft.banner_visible && (
                        <>
                          <div>
                            <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'نص البانر (EN)' : 'Banner Text (EN)'}</Label>
                            <Input value={draft.banner_text ?? ''} onChange={(e) => updateDraft('banner_text', e.target.value || null)} placeholder="Announcement text..." />
                          </div>
                          <div>
                            <Label className="text-sm mb-1.5 block">{language === 'ar' ? 'نص البانر (AR)' : 'Banner Text (AR)'}</Label>
                            <Input value={draft.banner_text_ar ?? ''} onChange={(e) => updateDraft('banner_text_ar', e.target.value || null)} placeholder="نص الإعلان..." dir="rtl" />
                          </div>
                          <ColorField label={language === 'ar' ? 'لون البانر' : 'Banner Color'} value={draft.banner_color ?? null} onChange={(v) => updateDraft('banner_color', v)} />
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Show/Hide Sections */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {language === 'ar' ? 'إظهار/إخفاء الأقسام' : 'Show/Hide Sections'}
                      </CardTitle>
                      <CardDescription className="text-xs">{language === 'ar' ? 'تحكم في ظهور الأقسام في هذه الصفحة' : 'Control which sections appear on this page'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {['newsletter', 'chat_widget', 'weather_bar', 'news_banner', 'category_nav', 'comparison_bar'].map((section) => {
                        const labels: Record<string, { en: string; ar: string }> = {
                          newsletter: { en: 'Newsletter', ar: 'النشرة البريدية' },
                          chat_widget: { en: 'Chat Widget', ar: 'ويدجت الدردشة' },
                          weather_bar: { en: 'Weather Bar', ar: 'شريط الطقس' },
                          news_banner: { en: 'News Banner', ar: 'شريط الأخبار' },
                          category_nav: { en: 'Category Nav', ar: 'تنقل الفئات' },
                          comparison_bar: { en: 'Comparison Bar', ar: 'شريط المقارنة' },
                        };
                        const isHidden = (draft.hidden_sections ?? []).includes(section);
                        return (
                          <div key={section} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isHidden ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-success" />}
                              <Label className="text-sm">{language === 'ar' ? labels[section]?.ar : labels[section]?.en}</Label>
                            </div>
                            <Switch
                              checked={!isHidden}
                              onCheckedChange={(visible) => {
                                const current = draft.hidden_sections ?? [];
                                updateDraft('hidden_sections', visible ? current.filter((s) => s !== section) : [...current, section]);
                              }}
                            />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Custom Widgets */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Puzzle className="h-4 w-4" />
                        {language === 'ar' ? 'الويدجت المخصصة' : 'Custom Widgets'}
                      </CardTitle>
                      <CardDescription className="text-xs">{language === 'ar' ? 'أضف معرفات الويدجت المرتبطة بهذه الصفحة' : 'Add widget IDs linked to this page'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={(draft.widget_ids ?? []).join(', ')}
                        onChange={(e) => {
                          const ids = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          updateDraft('widget_ids', ids);
                        }}
                        placeholder={language === 'ar' ? 'أدخل معرفات الويدجت مفصولة بفواصل...' : 'Enter widget IDs separated by commas...'}
                        rows={2}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving
                  ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...')
                  : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
              </Button>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
              </Button>
            </div>
          </div>

          {/* Live Preview sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <InlinePreview path={previewPath} refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
