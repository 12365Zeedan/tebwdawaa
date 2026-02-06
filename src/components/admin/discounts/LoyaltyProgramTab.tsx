import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLoyaltySettings, useUpdateLoyaltySettings } from '@/hooks/useDiscounts';
import { Skeleton } from '@/components/ui/skeleton';

const loyaltySchema = z.object({
  points_per_currency: z.coerce.number().min(0),
  currency_per_point: z.coerce.number().min(0),
  min_redeem_points: z.coerce.number().min(0),
  welcome_bonus: z.coerce.number().min(0),
  is_active: z.boolean(),
});

type LoyaltyFormData = z.infer<typeof loyaltySchema>;

export function LoyaltyProgramTab() {
  const { language } = useLanguage();
  const { data: settings, isLoading } = useLoyaltySettings();
  const updateSettings = useUpdateLoyaltySettings();

  const form = useForm<LoyaltyFormData>({
    resolver: zodResolver(loyaltySchema),
    defaultValues: {
      points_per_currency: 1,
      currency_per_point: 0.1,
      min_redeem_points: 100,
      welcome_bonus: 0,
      is_active: false,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        points_per_currency: settings.points_per_currency,
        currency_per_point: settings.currency_per_point,
        min_redeem_points: settings.min_redeem_points,
        welcome_bonus: settings.welcome_bonus,
        is_active: settings.is_active,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: LoyaltyFormData) => {
    if (!settings) return;
    updateSettings.mutate({ id: settings.id, ...data });
  };

  if (isLoading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>{language === 'ar' ? 'برنامج الولاء' : 'Loyalty Program'}</CardTitle>
            <CardDescription>
              {language === 'ar'
                ? 'إعداد نقاط المكافآت للعملاء'
                : 'Configure reward points for customers'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>{language === 'ar' ? 'تفعيل البرنامج' : 'Enable Program'}</FormLabel>
                    <FormDescription>
                      {language === 'ar' ? 'تفعيل أو تعطيل برنامج الولاء' : 'Turn loyalty program on or off'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="points_per_currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'نقاط لكل ريال' : 'Points per SAR spent'}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency_per_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'قيمة النقطة (ريال)' : 'SAR value per point'}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min_redeem_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'الحد الأدنى للاستبدال' : 'Min points to redeem'}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="welcome_bonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'نقاط الترحيب' : 'Welcome bonus points'}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
