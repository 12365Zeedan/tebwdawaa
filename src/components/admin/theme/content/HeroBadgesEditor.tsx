import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme, HeroBadge } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Plus, Trash2 } from 'lucide-react';

export function HeroBadgesEditor() {
  const { theme, updateContent } = useTheme();
  const { language } = useLanguage();
  const content = theme.content;

  const updateBadge = (id: string, field: keyof HeroBadge, value: string) => {
    updateContent({
      ...content,
      heroBadges: content.heroBadges.map(badge =>
        badge.id === id ? { ...badge, [field]: value } : badge
      ),
    });
  };

  const addBadge = () => {
    if (content.heroBadges.length >= 5) return;
    const newBadge: HeroBadge = { id: Date.now().toString(), textEn: '', textAr: '' };
    updateContent({ ...content, heroBadges: [...content.heroBadges, newBadge] });
  };

  const removeBadge = (id: string) => {
    if (content.heroBadges.length <= 1) return;
    updateContent({ ...content, heroBadges: content.heroBadges.filter(b => b.id !== id) });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {language === 'ar' ? 'شارات الثقة' : 'Trust Badges'}
        </CardTitle>
        <CardDescription className="text-xs">
          {language === 'ar'
            ? 'إدارة شارات الثقة المعروضة في قسم البانر الرئيسي'
            : 'Manage the trust badges displayed in the hero section'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {content.heroBadges.map((badge, index) => (
            <div key={badge.id} className="border border-border rounded-lg p-3 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'ar' ? `شارة ${index + 1}` : `Badge ${index + 1}`}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeBadge(badge.id)} disabled={content.heroBadges.length <= 1}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">English</Label>
                  <Input value={badge.textEn} onChange={(e) => updateBadge(badge.id, 'textEn', e.target.value)} className="h-8 text-sm" placeholder="Badge text..." />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">العربية</Label>
                  <Input value={badge.textAr} onChange={(e) => updateBadge(badge.id, 'textAr', e.target.value)} className="h-8 text-sm" dir="rtl" placeholder="نص الشارة..." />
                </div>
              </div>
            </div>
          ))}
          {content.heroBadges.length < 5 && (
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={addBadge}>
              <Plus className="h-3.5 w-3.5" />
              {language === 'ar' ? 'إضافة شارة' : 'Add Badge'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}