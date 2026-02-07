import React, { useState } from 'react';
import { MapPin, Hash, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAddTrackingEvent } from '@/hooks/useOrderTracking';

const statusOptions = [
  { value: 'pending', labelEn: 'Pending', labelAr: 'قيد الانتظار' },
  { value: 'processing', labelEn: 'Processing', labelAr: 'قيد المعالجة' },
  { value: 'shipped', labelEn: 'Shipped', labelAr: 'تم الشحن' },
  { value: 'delivered', labelEn: 'Delivered', labelAr: 'تم التوصيل' },
  { value: 'cancelled', labelEn: 'Cancelled', labelAr: 'ملغي' },
];

interface AddTrackingEventFormProps {
  orderId: string;
  currentStatus?: string;
}

export function AddTrackingEventForm({ orderId, currentStatus }: AddTrackingEventFormProps) {
  const { language } = useLanguage();
  const addEvent = useAddTrackingEvent();
  const [status, setStatus] = useState(currentStatus || 'pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent.mutate(
      {
        orderId,
        status,
        trackingNumber: trackingNumber.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTrackingNumber('');
          setLocation('');
          setNotes('');
          setIsExpanded(false);
        },
      }
    );
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => setIsExpanded(true)}
      >
        <Plus className="h-4 w-4" />
        {language === 'ar' ? 'إضافة تحديث تتبع' : 'Add Tracking Update'}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
      <h4 className="font-medium text-foreground text-sm">
        {language === 'ar' ? 'إضافة تحديث تتبع' : 'Add Tracking Update'}
      </h4>

      <div className="space-y-2">
        <Label className="text-xs">
          {language === 'ar' ? 'الحالة' : 'Status'}
        </Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {language === 'ar' ? opt.labelAr : opt.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-1">
          <Hash className="h-3 w-3" />
          {language === 'ar' ? 'رقم التتبع' : 'Tracking Number'}
        </Label>
        <Input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder={language === 'ar' ? 'مثل: SA123456789' : 'e.g. SA123456789'}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {language === 'ar' ? 'الموقع' : 'Location'}
        </Label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={language === 'ar' ? 'مثل: الرياض - مركز الفرز' : 'e.g. Riyadh - Sorting Center'}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {language === 'ar' ? 'ملاحظات' : 'Notes'}
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={language === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={addEvent.isPending}>
          {addEvent.isPending
            ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...')
            : (language === 'ar' ? 'إضافة' : 'Add Event')
          }
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
        >
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
      </div>
    </form>
  );
}
