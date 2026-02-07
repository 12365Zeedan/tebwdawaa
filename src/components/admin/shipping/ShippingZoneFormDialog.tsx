import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Save, Loader2, X, Plus } from 'lucide-react';
import type { ShippingZone, ShippingZoneInput } from '@/hooks/useShippingZones';

const SAUDI_REGIONS = [
  { en: 'Riyadh', ar: 'الرياض' },
  { en: 'Makkah', ar: 'مكة المكرمة' },
  { en: 'Madinah', ar: 'المدينة المنورة' },
  { en: 'Eastern Province', ar: 'المنطقة الشرقية' },
  { en: 'Asir', ar: 'عسير' },
  { en: 'Tabuk', ar: 'تبوك' },
  { en: 'Hail', ar: 'حائل' },
  { en: 'Northern Borders', ar: 'الحدود الشمالية' },
  { en: 'Jazan', ar: 'جازان' },
  { en: 'Najran', ar: 'نجران' },
  { en: 'Al Baha', ar: 'الباحة' },
  { en: 'Al Jawf', ar: 'الجوف' },
  { en: 'Qassim', ar: 'القصيم' },
];

interface ShippingZoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: ShippingZone | null;
  onSubmit: (data: ShippingZoneInput) => Promise<void>;
  isSubmitting: boolean;
}

export function ShippingZoneFormDialog({
  open,
  onOpenChange,
  zone,
  onSubmit,
  isSubmitting,
}: ShippingZoneFormDialogProps) {
  const { language } = useLanguage();
  const isEditing = !!zone;

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [shippingRate, setShippingRate] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<string>('');
  const [estimatedDaysMin, setEstimatedDaysMin] = useState(1);
  const [estimatedDaysMax, setEstimatedDaysMax] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [customRegion, setCustomRegion] = useState('');

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      setNameAr(zone.name_ar);
      setRegions(zone.regions);
      setShippingRate(zone.shipping_rate);
      setFreeShippingThreshold(zone.free_shipping_threshold?.toString() ?? '');
      setEstimatedDaysMin(zone.estimated_days_min);
      setEstimatedDaysMax(zone.estimated_days_max);
      setIsActive(zone.is_active);
      setSortOrder(zone.sort_order);
    } else {
      setName('');
      setNameAr('');
      setRegions([]);
      setShippingRate(0);
      setFreeShippingThreshold('');
      setEstimatedDaysMin(1);
      setEstimatedDaysMax(5);
      setIsActive(true);
      setSortOrder(0);
    }
    setCustomRegion('');
  }, [zone, open]);

  const toggleRegion = (region: string) => {
    setRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const addCustomRegion = () => {
    const trimmed = customRegion.trim();
    if (trimmed && !regions.includes(trimmed)) {
      setRegions((prev) => [...prev, trimmed]);
      setCustomRegion('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      name_ar: nameAr,
      regions,
      shipping_rate: shippingRate,
      free_shipping_threshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : null,
      estimated_days_min: estimatedDaysMin,
      estimated_days_max: estimatedDaysMax,
      is_active: isActive,
      sort_order: sortOrder,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? language === 'ar' ? 'تعديل منطقة الشحن' : 'Edit Shipping Zone'
              : language === 'ar' ? 'إضافة منطقة شحن' : 'Add Shipping Zone'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar'
              ? 'حدد المناطق وتكلفة الشحن لهذه المنطقة'
              : 'Define regions and shipping cost for this zone'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'اسم المنطقة (إنجليزي)' : 'Zone Name (English)'}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Central Region" required />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'اسم المنطقة (عربي)' : 'Zone Name (Arabic)'}</Label>
              <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: المنطقة الوسطى" dir="rtl" required />
            </div>
          </div>

          {/* Region Selection */}
          <div className="space-y-2">
            <Label>{language === 'ar' ? 'المناطق' : 'Regions'}</Label>
            <div className="flex flex-wrap gap-2">
              {SAUDI_REGIONS.map((r) => {
                const selected = regions.includes(r.en);
                return (
                  <Badge
                    key={r.en}
                    variant={selected ? 'default' : 'outline'}
                    className="cursor-pointer select-none"
                    onClick={() => toggleRegion(r.en)}
                  >
                    {language === 'ar' ? r.ar : r.en}
                    {selected && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
            {/* Custom regions */}
            {regions
              .filter((r) => !SAUDI_REGIONS.some((sr) => sr.en === r))
              .map((r) => (
                <Badge key={r} variant="default" className="cursor-pointer mr-1" onClick={() => toggleRegion(r)}>
                  {r} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            <div className="flex gap-2 mt-2">
              <Input
                value={customRegion}
                onChange={(e) => setCustomRegion(e.target.value)}
                placeholder={language === 'ar' ? 'إضافة منطقة مخصصة...' : 'Add custom region...'}
                className="flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomRegion(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addCustomRegion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Shipping Rate */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تكلفة الشحن' : 'Shipping Rate'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={shippingRate}
                onChange={(e) => setShippingRate(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'حد الشحن المجاني' : 'Free Shipping Threshold'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder={language === 'ar' ? 'اختياري' : 'Optional'}
              />
            </div>
          </div>

          {/* Estimated Days */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'أقل مدة توصيل (أيام)' : 'Min Delivery Days'}</Label>
              <Input
                type="number"
                min="0"
                value={estimatedDaysMin}
                onChange={(e) => setEstimatedDaysMin(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'أقصى مدة توصيل (أيام)' : 'Max Delivery Days'}</Label>
              <Input
                type="number"
                min="0"
                value={estimatedDaysMax}
                onChange={(e) => setEstimatedDaysMax(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الترتيب' : 'Sort Order'}</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label>{language === 'ar' ? 'مفعّل' : 'Active'}</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting || !name || !nameAr || regions.length === 0}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing
                ? language === 'ar' ? 'تحديث' : 'Update'
                : language === 'ar' ? 'إضافة' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
