import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, SlidersHorizontal, Image, MessageSquareQuote, Type } from 'lucide-react';
import { useCustomWidgets, getDefaultConfig, CustomWidget } from '@/hooks/useCustomWidgets';
import { WidgetEditorDialog } from './WidgetEditorDialog';
import { SortableWidgetItem } from './SortableWidgetItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useToast } from '@/hooks/use-toast';

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

export function WidgetManager({ pageFilter }: { pageFilter?: string } = {}) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { widgets, isLoading, createWidget, updateWidget, deleteWidget } = useCustomWidgets();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicatingWidget, setDuplicatingWidget] = useState<CustomWidget | null>(null);
  const [duplicatePage, setDuplicatePage] = useState('home');
  const [editingWidget, setEditingWidget] = useState<CustomWidget | null>(null);
  const [newWidgetType, setNewWidgetType] = useState<CustomWidget['widget_type']>('carousel');
  const [newWidgetPage, setNewWidgetPage] = useState(pageFilter || 'home');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetTitleAr, setNewWidgetTitleAr] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>(pageFilter || 'all');

  // Map page keys between customization and widget systems
  const mapPageKey = (key: string) => {
    const mapping: Record<string, string> = { homepage: 'home' };
    return mapping[key] || key;
  };

  const effectiveFilter = pageFilter ? mapPageKey(pageFilter) : (selectedPage === 'all' ? null : selectedPage);
  const filteredWidgets = effectiveFilter ? widgets.filter(w => w.page === effectiveFilter) : widgets;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddWidget = () => {
    const targetPage = pageFilter ? mapPageKey(pageFilter) : newWidgetPage;
    createWidget.mutate({
      page: targetPage,
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredWidgets.findIndex(w => w.id === active.id);
    const newIndex = filteredWidgets.findIndex(w => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredWidgets, oldIndex, newIndex);

    // Update sort_order for all reordered widgets
    reordered.forEach((widget, index) => {
      if (widget.sort_order !== index) {
        updateWidget.mutate({ id: widget.id, sort_order: index });
      }
    });
  };

  const handleDuplicate = (widget: CustomWidget) => {
    setDuplicatingWidget(widget);
    setDuplicatePage(widget.page);
    setDuplicateDialogOpen(true);
  };

  const confirmDuplicate = () => {
    if (!duplicatingWidget) return;
    const targetPageWidgets = widgets.filter(w => w.page === duplicatePage);
    createWidget.mutate({
      page: duplicatePage,
      widget_type: duplicatingWidget.widget_type,
      title: duplicatingWidget.title ? `${duplicatingWidget.title} (copy)` : undefined,
      title_ar: duplicatingWidget.title_ar ? `${duplicatingWidget.title_ar} (نسخة)` : undefined,
      config: JSON.parse(JSON.stringify(duplicatingWidget.config)),
      sort_order: targetPageWidgets.length,
    }, {
      onSuccess: () => {
        setDuplicateDialogOpen(false);
        setDuplicatingWidget(null);
        toast({ title: language === 'ar' ? 'تم النسخ' : 'Widget duplicated' });
      },
    });
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredWidgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredWidgets.map((widget) => {
                  const typeInfo = WIDGET_TYPE_LABELS[widget.widget_type];
                  const pageMeta = PAGE_OPTIONS.find(p => p.value === widget.page);

                  return (
                    <SortableWidgetItem
                      key={widget.id}
                      widget={widget}
                      icon={typeInfo.icon}
                      pageLabel={language === 'ar' ? pageMeta?.ar || '' : pageMeta?.en || ''}
                      typeLabel={language === 'ar' ? typeInfo.ar : typeInfo.en}
                      onEdit={() => setEditingWidget(widget)}
                      onDuplicate={() => handleDuplicate(widget)}
                      onToggleVisibility={(checked) => updateWidget.mutate({ id: widget.id, is_visible: checked })}
                      onDelete={() => deleteWidget.mutate(widget.id)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
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

      {/* Duplicate Widget Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'نسخ الويدجت' : 'Duplicate Widget'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'اختر الصفحة المستهدفة لنسخ الويدجت إليها.'
                : 'Choose the target page to duplicate this widget to.'}
            </p>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الصفحة المستهدفة' : 'Target Page'}</Label>
              <Select value={duplicatePage} onValueChange={setDuplicatePage}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={confirmDuplicate} disabled={createWidget.isPending}>
              {language === 'ar' ? 'نسخ' : 'Duplicate'}
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
