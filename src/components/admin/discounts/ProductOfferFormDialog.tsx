import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductOffer } from '@/hooks/useDiscounts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const schema = z.object({
  name: z.string().min(2),
  name_ar: z.string().min(2),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  discount_percentage: z.coerce.number().min(0).max(100).optional(),
  product_ids: z.array(z.string()).min(1, 'Select at least one product'),
  min_quantity: z.coerce.number().min(1).optional(),
  group_price: z.coerce.number().optional(),
  expires_at: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOffer: ProductOffer | null;
  offerType: 'discount' | 'buy_one_get_one' | 'group';
  onCreate: (data: any) => void;
  onUpdate: (data: any) => void;
  isPending: boolean;
}

export function ProductOfferFormDialog({
  open,
  onOpenChange,
  editingOffer,
  offerType,
  onCreate,
  onUpdate,
  isPending,
}: Props) {
  const { language } = useLanguage();
  const isEditing = !!editingOffer;

  const { data: products } = useQuery({
    queryKey: ['all-products-for-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, name_ar, price')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      discount_percentage: offerType === 'discount' ? 10 : 0,
      product_ids: [],
      min_quantity: offerType === 'group' ? 3 : 1,
      group_price: undefined,
      expires_at: '',
    },
  });

  useEffect(() => {
    if (editingOffer) {
      form.reset({
        name: editingOffer.name,
        name_ar: editingOffer.name_ar,
        description: editingOffer.description || '',
        description_ar: editingOffer.description_ar || '',
        discount_percentage: editingOffer.discount_percentage,
        product_ids: editingOffer.product_ids,
        min_quantity: editingOffer.min_quantity,
        group_price: editingOffer.group_price || undefined,
        expires_at: editingOffer.expires_at ? editingOffer.expires_at.slice(0, 16) : '',
      });
    } else {
      form.reset({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        discount_percentage: offerType === 'discount' ? 10 : 0,
        product_ids: [],
        min_quantity: offerType === 'group' ? 3 : 1,
        group_price: undefined,
        expires_at: '',
      });
    }
  }, [editingOffer, open, form, offerType]);

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      offer_type: offerType,
      is_active: true,
      starts_at: new Date().toISOString(),
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      group_price: data.group_price || null,
      discount_percentage: data.discount_percentage || 0,
      min_quantity: data.min_quantity || 1,
    };

    if (isEditing) {
      onUpdate({ id: editingOffer!.id, ...payload });
    } else {
      onCreate(payload);
    }
  };

  const titleMap = {
    discount: language === 'ar' ? 'خصم منتج' : 'Product Discount',
    buy_one_get_one: language === 'ar' ? 'عرض 1+1' : '1+1 Offer',
    group: language === 'ar' ? 'عرض مجموعة' : 'Group Offer',
  };

  const selectedIds = form.watch('product_ids');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? (language === 'ar' ? 'تعديل العرض' : 'Edit Offer') : titleMap[offerType]}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الاسم (EN)' : 'Name (EN)'}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الاسم (AR)' : 'Name (AR)'}</FormLabel>
                    <FormControl><Input dir="rtl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الوصف (EN)' : 'Description (EN)'}</FormLabel>
                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الوصف (AR)' : 'Description (AR)'}</FormLabel>
                    <FormControl><Textarea rows={2} dir="rtl" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>

            {offerType === 'discount' && (
              <FormField
                control={form.control}
                name="discount_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'نسبة الخصم (%)' : 'Discount (%)'}</FormLabel>
                    <FormControl><Input type="number" min="0" max="100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {offerType === 'group' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'الحد الأدنى للكمية' : 'Min Quantity'}</FormLabel>
                      <FormControl><Input type="number" min="2" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="group_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'سعر المجموعة (SAR)' : 'Group Price (SAR)'}</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'ar' ? 'تاريخ الانتهاء' : 'Expires At'}</FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                </FormItem>
              )}
            />

            {/* Product Selection */}
            <FormField
              control={form.control}
              name="product_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === 'ar' ? 'المنتجات' : 'Products'} ({selectedIds.length} {language === 'ar' ? 'محدد' : 'selected'})
                  </FormLabel>
                  <ScrollArea className="h-48 border rounded-md p-3">
                    <div className="space-y-2">
                      {products?.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={field.value.includes(product.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, product.id]);
                              } else {
                                field.onChange(field.value.filter((id: string) => id !== product.id));
                              }
                            }}
                          />
                          <span className="text-sm flex-1">
                            {language === 'ar' ? product.name_ar : product.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{product.price} SAR</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

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
