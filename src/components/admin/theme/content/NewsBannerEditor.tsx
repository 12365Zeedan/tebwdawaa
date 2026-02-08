import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme, NewsBannerItem } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Megaphone, Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NewsBannerEditor() {
  const { theme, updateContent } = useTheme();
  const { language } = useLanguage();
  const content = theme.content;

  const updateVisibility = (visible: boolean) => {
    updateContent({ ...content, newsBanner: { ...content.newsBanner, visible } });
  };

  const updateItem = (id: string, field: keyof NewsBannerItem, value: string) => {
    updateContent({
      ...content,
      newsBanner: {
        ...content.newsBanner,
        items: content.newsBanner.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    });
  };

  const addItem = () => {
    const newItem: NewsBannerItem = { id: Date.now().toString(), textEn: '', textAr: '', emoji: '📢' };
    updateContent({
      ...content,
      newsBanner: { ...content.newsBanner, items: [...content.newsBanner.items, newItem] },
    });
  };

  const removeItem = (id: string) => {
    if (content.newsBanner.items.length <= 1) return;
    updateContent({
      ...content,
      newsBanner: { ...content.newsBanner, items: content.newsBanner.items.filter(item => item.id !== id) },
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const items = [...content.newsBanner.items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    updateContent({ ...content, newsBanner: { ...content.newsBanner, items } });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              {language === 'ar' ? 'شريط الأخبار' : 'News Banner'}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {language === 'ar'
                ? 'إدارة الرسائل المتحركة في أعلى الصفحة'
                : 'Manage the scrolling announcement messages'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">
              {language === 'ar' ? 'مرئي' : 'Visible'}
            </Label>
            <Switch checked={content.newsBanner.visible} onCheckedChange={updateVisibility} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('space-y-3', !content.newsBanner.visible && 'opacity-50 pointer-events-none')}>
          {content.newsBanner.items.map((item, index) => (
            <div key={item.id} className="border border-border rounded-lg p-3 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {language === 'ar' ? `رسالة ${index + 1}` : `Message ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, 'down')} disabled={index === content.newsBanner.items.length - 1}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItem(item.id)} disabled={content.newsBanner.items.length <= 1}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                <Label className="text-xs whitespace-nowrap">Emoji</Label>
                <Input value={item.emoji} onChange={(e) => updateItem(item.id, 'emoji', e.target.value)} className="h-8 text-sm w-16" maxLength={4} />
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">English</Label>
                  <Input value={item.textEn} onChange={(e) => updateItem(item.id, 'textEn', e.target.value)} className="h-8 text-sm" placeholder="Enter message in English..." />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">العربية</Label>
                  <Input value={item.textAr} onChange={(e) => updateItem(item.id, 'textAr', e.target.value)} className="h-8 text-sm" dir="rtl" placeholder="أدخل الرسالة بالعربية..." />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" />
            {language === 'ar' ? 'إضافة رسالة' : 'Add Message'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}