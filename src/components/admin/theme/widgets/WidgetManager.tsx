import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown, Image, MessageSquareQuote, Type, SlidersHorizontal, Pencil } from 'lucide-react';
import { useCustomWidgets, getDefaultConfig, CustomWidget } from '@/hooks/useCustomWidgets';
import { WidgetEditorDialog } from './WidgetEditorDialog';
import { cn } from '@/lib/utils';

const WIDGET_TYPE_LABELS: Record<CustomWidget['widget_type'], { en: string; ar: string; icon: React.ComponentType<any> }> = {
  carousel: { en: 'Image Carousel', ar: 'عرض شرائح', icon: SlidersHorizontal },
  banner: { en: 'Promotional Banner', ar: 'بانر ترويجي', icon: Image },
  testimonials: { en: 'Testimonials', ar: 'آراء العملاء', icon: MessageSquareQuote },
  richtext: { en: 'Rich Text Block', ar: 'نص منسق', icon: Type },
};

const PAGE_OPTIONS = [
  { value: 'home', en: 'Home', ar: 'الرئيسية' },
  { value: 'products', en: 'Products', ar: 'المنتجات' },
  { value: 'categories', en: 'Categories', ar: 'الفئات' },
  { value: 'blog', en: 'Blog', ar: 'المدونة' },
  { value: 'about', en: 'About', ar: 'من نحن' },
  { value: 'cart', en: 'Cart', ar: 'السلة' },
  { value: 'wishlist', en: 'Wishlist', ar: 'المفضلة' },
];

export function WidgetManager() {
  const { language } = useLanguage();
  const { widgets, isLoading, createWidget, updateWidget, deleteWidget } = useCustomWidgets();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<CustomWidget | null>(null);
  const [newWidgetType, setNewWidgetType] = useState<CustomWidget['widget_type']>('carousel');
  const [newWidgetPage, setNewWidgetPage] = useState('home');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetTitleAr, setNewWidgetTitleAr] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>('all');

  const filteredWidgets = selectedPage === 'all' ? widgets : widgets.filter(w => w.page === selectedPage);

  const handleAddWidget = () => {
    createWidget.mutate({
      page: newWidgetPage,
      widget_type: newWidgetType,
      title: newWidgetTitle || undefined,
      title_ar: newWidgetTitleAr || undefined,
      config: getDefaultConfig(newWidgetType),
      sort_order: widgets.length,
    }, {
      onSuccess: () => {
        setAddDialogOpen(false);
        setNewWidgetTitle('');
        setNewWidgetTitleAr('');
      },
    });
  };

  const handleMove = (widget: CustomWidget, direction: 'up' | 'down') => {
    const pageWidgets = widgets.filter(w => w.page === widget.page).sort((a, b) => a.sort_order - b.sort_order);
    const idx = pageWidgets.findIndex(w => w.id === widget.id);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= pageWidgets.length) return;

    const other = pageWidgets[newIdx];
    updateWidget.mutate({ id: widget.id, sort_order: other.sort_order });
    updateWidget.mutate({ id: other.id, sort_order: widget.sort_order });
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                {language === 'ar' ? 'كل الصفحات' : 'All Pages'}
              </SelectItem>
              {PAGE_OPTIONS.map(p => (
                <SelectItem key={p.value} value={p.value} className="text-xs">
                  {language === 'ar' ? p.ar : p.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" />
            {language === 'ar' ? 'إضافة ويدجت' : 'Add Widget'}
          </Button>
        </div>

        {/* Widget List */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        ) : filteredWidgets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'لا توجد ويدجت. أضف واحدة للبدء.' : 'No widgets yet. Add one to get started.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredWidgets.map((widget, index) => {
              const typeInfo = WIDGET_TYPE_LABELS[widget.widget_type];
              const Icon = typeInfo.icon;
              const pageMeta = PAGE_OPTIONS.find(p => p.value === widget.page);

              return (
                <div
                  key={widget.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    widget.is_visible
                      ? 'border-border bg-card'
                      : 'border-border/50 bg-muted/30 opacity-60'
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

                  <Icon className="h-4 w-4 text-primary shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {(language === 'ar' ? widget.title_ar : widget.title) || (language === 'ar' ? typeInfo.ar : typeInfo.en)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? pageMeta?.ar : pageMeta?.en} · {language === 'ar' ? typeInfo.ar : typeInfo.en}
                    </p>
                  </div>

                  {/* Edit */}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingWidget(widget)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  {/* Reorder */}
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove(widget, 'up')} disabled={index === 0}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove(widget, 'down')} disabled={index === filteredWidgets.length - 1}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center gap-1.5">
                    {widget.is_visible ? <Eye className="h-3.5 w-3.5 text-success" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    <Switch
                      checked={widget.is_visible}
                      onCheckedChange={(checked) => updateWidget.mutate({ id: widget.id, is_visible: checked })}
                    />
                  </div>

                  {/* Delete */}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteWidget.mutate(widget.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'إضافة ويدجت جديد' : 'Add New Widget'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'النوع' : 'Type'}</Label>
              <Select value={newWidgetType} onValueChange={(v) => setNewWidgetType(v as CustomWidget['widget_type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WIDGET_TYPE_LABELS).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {language === 'ar' ? val.ar : val.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الصفحة' : 'Page'}</Label>
              <Select value={newWidgetPage} onValueChange={setNewWidgetPage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_OPTIONS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {language === 'ar' ? p.ar : p.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (EN)'}</Label>
                <Input
                  value={newWidgetTitle}
                  onChange={(e) => setNewWidgetTitle(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (AR)'}</Label>
                <Input
                  value={newWidgetTitleAr}
                  onChange={(e) => setNewWidgetTitleAr(e.target.value)}
                  placeholder={language === 'ar' ? 'اختياري' : 'Optional'}
                  dir="rtl"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleAddWidget} disabled={createWidget.isPending}>
              {language === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Widget Dialog */}
      {editingWidget && (
        <WidgetEditorDialog
          widget={editingWidget}
          open={!!editingWidget}
          onOpenChange={(open) => !open && setEditingWidget(null)}
        />
      )}
    </>
  );
}
