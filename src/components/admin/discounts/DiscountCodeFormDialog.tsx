import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { DiscountCode } from '@/hooks/useDiscounts';

const schema = z.object({
  code: z.string().min(2).max(50),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().min(0.01),
  min_order_amount: z.coerce.number().min(0),
  max_discount_amount: z.coerce.number().optional(),
  usage_limit: z.coerce.number().optional(),
  influencer_name: z.string().optional(),
  influencer_name_ar: z.string().optional(),
  expires_at: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCode: DiscountCode | null;
  isInfluencer: boolean;
  onCreate: (data: any) => void;
  onUpdate: (data: any) => void;
  isPending: boolean;
}

export function DiscountCodeFormDialog({
  open,
  onOpenChange,
  editingCode,
  isInfluencer,
  onCreate,
  onUpdate,
  isPending,
}: Props) {
  const { language } = useLanguage();
  const isEditing = !!editingCode;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      description: '',
      description_ar: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 0,
      max_discount_amount: undefined,
      usage_limit: undefined,
      influencer_name: '',
      influencer_name_ar: '',
      expires_at: '',
    },
  });

  useEffect(() => {
    if (editingCode) {
      form.reset({
        code: editingCode.code,
        description: editingCode.description || '',
        description_ar: editingCode.description_ar || '',
        discount_type: editingCode.discount_type,
        discount_value: editingCode.discount_value,
        min_order_amount: editingCode.min_order_amount,
        max_discount_amount: editingCode.max_discount_amount || undefined,
        usage_limit: editingCode.usage_limit || undefined,
        influencer_name: editingCode.influencer_name || '',
        influencer_name_ar: editingCode.influencer_name_ar || '',
        expires_at: editingCode.expires_at ? editingCode.expires_at.slice(0, 16) : '',
      });
    } else {
      form.reset({
        code: '',
        description: '',
        description_ar: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 0,
        max_discount_amount: undefined,
        usage_limit: undefined,
        influencer_name: '',
        influencer_name_ar: '',
        expires_at: '',
      });
    }
  }, [editingCode, open, form]);

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      code: data.code.toUpperCase().trim(),
      is_influencer: isInfluencer,
      is_active: true,
      starts_at: new Date().toISOString(),
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      max_discount_amount: data.max_discount_amount || null,
      usage_limit: data.usage_limit || null,
      influencer_name: isInfluencer ? data.influencer_name || null : null,
      influencer_name_ar: isInfluencer ? data.influencer_name_ar || null : null,
    };

    if (isEditing) {
      onUpdate({ id: editingCode!.id, ...payload });
    } else {
      onCreate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? language === 'ar' ? 'تعديل الكود' : 'Edit Code'
              : isInfluencer
                ? language === 'ar' ? 'إضافة كود مؤثر' : 'Add Influencer Code'
                : language === 'ar' ? 'إضافة كود خصم' : 'Add Discount Code'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'ar' ? 'الكود' : 'Code'}</FormLabel>
                  <FormControl>
                    <Input placeholder="SUMMER2024" className="uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الوصف (EN)' : 'Description (EN)'}</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الوصف (AR)' : 'Description (AR)'}</FormLabel>
                    <FormControl>
                      <Textarea rows={2} dir="rtl" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'نوع الخصم' : 'Discount Type'}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">{language === 'ar' ? 'نسبة مئوية' : 'Percentage'}</SelectItem>
                        <SelectItem value="fixed">{language === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'القيمة' : 'Value'}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_order_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الحد الأدنى للطلب' : 'Min Order (SAR)'}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_discount_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'أقصى خصم (SAR)' : 'Max Discount (SAR)'}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={language === 'ar' ? 'غير محدود' : 'Unlimited'} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="usage_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'حد الاستخدام' : 'Usage Limit'}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={language === 'ar' ? 'غير محدود' : 'Unlimited'} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'تاريخ الانتهاء' : 'Expires At'}</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {isInfluencer && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="influencer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'اسم المؤثر (EN)' : 'Influencer Name (EN)'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="influencer_name_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'اسم المؤثر (AR)' : 'Influencer Name (AR)'}</FormLabel>
                      <FormControl>
                        <Input dir="rtl" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEditing
                  ? language === 'ar' ? 'تحديث' : 'Update'
                  : language === 'ar' ? 'إنشاء' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
