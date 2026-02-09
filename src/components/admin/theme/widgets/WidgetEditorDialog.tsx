import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { CustomWidget, CarouselConfig, BannerConfig, TestimonialsConfig, RichTextConfig, CarouselSlide, TestimonialItem } from '@/hooks/useCustomWidgets';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useCustomWidgets } from '@/hooks/useCustomWidgets';

interface Props {
  widget: CustomWidget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WidgetEditorDialog({ widget, open, onOpenChange }: Props) {
  const { language } = useLanguage();
  const { updateWidget } = useCustomWidgets();
  const [config, setConfig] = useState<any>(widget.config);
  const [title, setTitle] = useState(widget.title || '');
  const [titleAr, setTitleAr] = useState(widget.title_ar || '');

  useEffect(() => {
    setConfig(widget.config);
    setTitle(widget.title || '');
    setTitleAr(widget.title_ar || '');
  }, [widget]);

  const handleSave = () => {
    updateWidget.mutate({
      id: widget.id,
      title: title || null,
      title_ar: titleAr || null,
      config,
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'تعديل الويدجت' : 'Edit Widget'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{language === 'ar' ? 'العنوان (EN)' : 'Title (EN)'}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Section title" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{language === 'ar' ? 'العنوان (AR)' : 'Title (AR)'}</Label>
              <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" placeholder="عنوان القسم" />
            </div>
          </div>

          {/* Type-specific editors */}
          {widget.widget_type === 'carousel' && (
            <CarouselEditor config={config as CarouselConfig} onChange={setConfig} />
          )}
          {widget.widget_type === 'banner' && (
            <BannerEditor config={config as BannerConfig} onChange={setConfig} />
          )}
          {widget.widget_type === 'testimonials' && (
            <TestimonialsEditor config={config as TestimonialsConfig} onChange={setConfig} />
          )}
          {widget.widget_type === 'richtext' && (
            <RichTextEditor config={config as RichTextConfig} onChange={setConfig} />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={updateWidget.isPending}>
            {language === 'ar' ? 'حفظ' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Carousel Editor ──
function CarouselEditor({ config, onChange }: { config: CarouselConfig; onChange: (c: CarouselConfig) => void }) {
  const { language } = useLanguage();

  const addSlide = () => {
    const newSlide: CarouselSlide = {
      id: crypto.randomUUID(),
      imageUrl: '',
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      ctaText: '',
      ctaTextAr: '',
      ctaLink: '',
      overlayColor: 'rgba(0,0,0,0.3)',
    };
    onChange({ ...config, slides: [...config.slides, newSlide] });
  };

  const updateSlide = (id: string, updates: Partial<CarouselSlide>) => {
    onChange({
      ...config,
      slides: config.slides.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  };

  const removeSlide = (id: string) => {
    onChange({ ...config, slides: config.slides.filter(s => s.id !== id) });
  };

  return (
    <Tabs defaultValue="slides" className="w-full">
      <TabsList className="w-full grid grid-cols-2 mb-3">
        <TabsTrigger value="slides" className="text-xs">
          {language === 'ar' ? 'الشرائح' : 'Slides'}
        </TabsTrigger>
        <TabsTrigger value="settings" className="text-xs">
          {language === 'ar' ? 'الإعدادات' : 'Settings'}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="slides" className="space-y-3">
        {config.slides.map((slide, i) => (
          <div key={slide.id} className="border rounded-lg p-3 space-y-3 relative">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">{language === 'ar' ? `شريحة ${i + 1}` : `Slide ${i + 1}`}</Label>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeSlide(slide.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">{language === 'ar' ? 'صورة الشريحة' : 'Slide Image'}</Label>
                <ImageUpload
                  value={slide.imageUrl || null}
                  onChange={(url) => updateSlide(slide.id, { imageUrl: url || '' })}
                  bucket="product-images"
                  folder="widgets/carousel"
                  className="[&_img]:h-32 [&_div.h-48]:h-32"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Title (EN)" value={slide.title} onChange={(e) => updateSlide(slide.id, { title: e.target.value })} className="text-xs h-8" />
                <Input placeholder="العنوان (AR)" value={slide.titleAr} onChange={(e) => updateSlide(slide.id, { titleAr: e.target.value })} dir="rtl" className="text-xs h-8" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Description (EN)" value={slide.description} onChange={(e) => updateSlide(slide.id, { description: e.target.value })} className="text-xs h-8" />
                <Input placeholder="الوصف (AR)" value={slide.descriptionAr} onChange={(e) => updateSlide(slide.id, { descriptionAr: e.target.value })} dir="rtl" className="text-xs h-8" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="CTA (EN)" value={slide.ctaText} onChange={(e) => updateSlide(slide.id, { ctaText: e.target.value })} className="text-xs h-8" />
                <Input placeholder="زر (AR)" value={slide.ctaTextAr} onChange={(e) => updateSlide(slide.id, { ctaTextAr: e.target.value })} dir="rtl" className="text-xs h-8" />
                <Input placeholder="/link" value={slide.ctaLink} onChange={(e) => updateSlide(slide.id, { ctaLink: e.target.value })} className="text-xs h-8" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs shrink-0">{language === 'ar' ? 'لون التراكب' : 'Overlay'}</Label>
                <Input value={slide.overlayColor} onChange={(e) => updateSlide(slide.id, { overlayColor: e.target.value })} className="text-xs h-8" placeholder="rgba(0,0,0,0.3)" />
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addSlide} className="w-full gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {language === 'ar' ? 'إضافة شريحة' : 'Add Slide'}
        </Button>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{language === 'ar' ? 'تشغيل تلقائي' : 'Autoplay'}</Label>
            <Switch checked={config.autoplay} onCheckedChange={(v) => onChange({ ...config, autoplay: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">{language === 'ar' ? 'إيقاف عند التمرير' : 'Pause on Hover'}</Label>
            <Switch checked={config.pauseOnHover} onCheckedChange={(v) => onChange({ ...config, pauseOnHover: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">{language === 'ar' ? 'إظهار النقاط' : 'Show Dots'}</Label>
            <Switch checked={config.showDots} onCheckedChange={(v) => onChange({ ...config, showDots: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">{language === 'ar' ? 'إظهار الأسهم' : 'Show Arrows'}</Label>
            <Switch checked={config.showArrows} onCheckedChange={(v) => onChange({ ...config, showArrows: v })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{language === 'ar' ? 'سرعة التبديل (ملي ثانية)' : 'Interval (ms)'}</Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[config.interval]}
              onValueChange={([v]) => onChange({ ...config, interval: v })}
              min={1000}
              max={15000}
              step={500}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">{config.interval}ms</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{language === 'ar' ? 'نوع الانتقال' : 'Transition'}</Label>
          <Select value={config.transition} onValueChange={(v) => onChange({ ...config, transition: v as 'slide' | 'fade' })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="slide" className="text-xs">Slide</SelectItem>
              <SelectItem value="fade" className="text-xs">Fade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{language === 'ar' ? 'الارتفاع' : 'Height'}</Label>
          <Input value={config.height} onChange={(e) => onChange({ ...config, height: e.target.value })} className="text-xs h-8" placeholder="400px" />
        </div>
      </TabsContent>
    </Tabs>
  );
}

// ── Banner Editor ──
function BannerEditor({ config, onChange }: { config: BannerConfig; onChange: (c: BannerConfig) => void }) {
  const { language } = useLanguage();
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">{language === 'ar' ? 'صورة البانر' : 'Banner Image'}</Label>
        <ImageUpload
          value={config.imageUrl || null}
          onChange={(url) => onChange({ ...config, imageUrl: url || '' })}
          bucket="product-images"
          folder="widgets/banners"
          className="[&_img]:h-36 [&_div.h-48]:h-36"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Title (EN)" value={config.title} onChange={(e) => onChange({ ...config, title: e.target.value })} className="text-xs h-8" />
        <Input placeholder="العنوان (AR)" value={config.titleAr} onChange={(e) => onChange({ ...config, titleAr: e.target.value })} dir="rtl" className="text-xs h-8" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Description (EN)" value={config.description} onChange={(e) => onChange({ ...config, description: e.target.value })} className="text-xs h-8" />
        <Input placeholder="الوصف (AR)" value={config.descriptionAr} onChange={(e) => onChange({ ...config, descriptionAr: e.target.value })} dir="rtl" className="text-xs h-8" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="CTA (EN)" value={config.ctaText} onChange={(e) => onChange({ ...config, ctaText: e.target.value })} className="text-xs h-8" />
        <Input placeholder="زر (AR)" value={config.ctaTextAr} onChange={(e) => onChange({ ...config, ctaTextAr: e.target.value })} dir="rtl" className="text-xs h-8" />
        <Input placeholder="/link" value={config.ctaLink} onChange={(e) => onChange({ ...config, ctaLink: e.target.value })} className="text-xs h-8" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{language === 'ar' ? 'لون الخلفية (HSL)' : 'BG Color (HSL)'}</Label>
          <Input value={config.backgroundColor} onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })} className="text-xs h-8" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{language === 'ar' ? 'لون النص (HSL)' : 'Text Color (HSL)'}</Label>
          <Input value={config.textColor} onChange={(e) => onChange({ ...config, textColor: e.target.value })} className="text-xs h-8" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{language === 'ar' ? 'النمط' : 'Style'}</Label>
        <Select value={config.style} onValueChange={(v) => onChange({ ...config, style: v as BannerConfig['style'] })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="full-width" className="text-xs">Full Width</SelectItem>
            <SelectItem value="contained" className="text-xs">Contained</SelectItem>
            <SelectItem value="split" className="text-xs">Split</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Testimonials Editor ──
function TestimonialsEditor({ config, onChange }: { config: TestimonialsConfig; onChange: (c: TestimonialsConfig) => void }) {
  const { language } = useLanguage();

  const addItem = () => {
    const item: TestimonialItem = {
      id: crypto.randomUUID(),
      name: '',
      nameAr: '',
      role: '',
      roleAr: '',
      content: '',
      contentAr: '',
      avatarUrl: '',
      rating: 5,
    };
    onChange({ ...config, items: [...config.items, item] });
  };

  const updateItem = (id: string, updates: Partial<TestimonialItem>) => {
    onChange({ ...config, items: config.items.map(i => i.id === id ? { ...i, ...updates } : i) });
  };

  const removeItem = (id: string) => {
    onChange({ ...config, items: config.items.filter(i => i.id !== id) });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{language === 'ar' ? 'التخطيط' : 'Layout'}</Label>
          <Select value={config.layout} onValueChange={(v) => onChange({ ...config, layout: v as 'grid' | 'carousel' })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="grid" className="text-xs">Grid</SelectItem>
              <SelectItem value="carousel" className="text-xs">Carousel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{language === 'ar' ? 'الأعمدة' : 'Columns'}</Label>
          <Select value={String(config.columns)} onValueChange={(v) => onChange({ ...config, columns: Number(v) })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2" className="text-xs">2</SelectItem>
              <SelectItem value="3" className="text-xs">3</SelectItem>
              <SelectItem value="4" className="text-xs">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {config.items.map((item, i) => (
        <div key={item.id} className="border rounded-lg p-3 space-y-2 relative">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">#{i + 1}</Label>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeItem(item.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Name (EN)" value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} className="text-xs h-8" />
            <Input placeholder="الاسم (AR)" value={item.nameAr} onChange={(e) => updateItem(item.id, { nameAr: e.target.value })} dir="rtl" className="text-xs h-8" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Role (EN)" value={item.role} onChange={(e) => updateItem(item.id, { role: e.target.value })} className="text-xs h-8" />
            <Input placeholder="الدور (AR)" value={item.roleAr} onChange={(e) => updateItem(item.id, { roleAr: e.target.value })} dir="rtl" className="text-xs h-8" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Textarea placeholder="Content (EN)" value={item.content} onChange={(e) => updateItem(item.id, { content: e.target.value })} className="text-xs min-h-[60px]" />
            <Textarea placeholder="المحتوى (AR)" value={item.contentAr} onChange={(e) => updateItem(item.id, { contentAr: e.target.value })} dir="rtl" className="text-xs min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Avatar URL" value={item.avatarUrl} onChange={(e) => updateItem(item.id, { avatarUrl: e.target.value })} className="text-xs h-8" />
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">{language === 'ar' ? 'التقييم' : 'Rating'}</Label>
              <Slider value={[item.rating]} onValueChange={([v]) => updateItem(item.id, { rating: v })} min={1} max={5} step={1} />
              <span className="text-xs">{item.rating}</span>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="w-full gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        {language === 'ar' ? 'إضافة رأي' : 'Add Testimonial'}
      </Button>
    </div>
  );
}

// ── Rich Text Editor ──
function RichTextEditor({ config, onChange }: { config: RichTextConfig; onChange: (c: RichTextConfig) => void }) {
  const { language } = useLanguage();
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">{language === 'ar' ? 'المحتوى (EN) - HTML' : 'Content (EN) - HTML'}</Label>
        <Textarea
          value={config.content}
          onChange={(e) => onChange({ ...config, content: e.target.value })}
          className="text-xs min-h-[120px] font-mono"
          placeholder="<h2>Hello</h2><p>Your content here...</p>"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{language === 'ar' ? 'المحتوى (AR) - HTML' : 'Content (AR) - HTML'}</Label>
        <Textarea
          value={config.contentAr}
          onChange={(e) => onChange({ ...config, contentAr: e.target.value })}
          dir="rtl"
          className="text-xs min-h-[120px] font-mono"
          placeholder="<h2>مرحبا</h2><p>المحتوى هنا...</p>"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{language === 'ar' ? 'العرض الأقصى' : 'Max Width'}</Label>
          <Input value={config.maxWidth} onChange={(e) => onChange({ ...config, maxWidth: e.target.value })} className="text-xs h-8" placeholder="1200px" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{language === 'ar' ? 'الحشو' : 'Padding'}</Label>
          <Input value={config.padding} onChange={(e) => onChange({ ...config, padding: e.target.value })} className="text-xs h-8" placeholder="py-12" />
        </div>
      </div>
    </div>
  );
}
