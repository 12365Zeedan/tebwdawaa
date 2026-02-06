import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CopyProtectionSettings {
  disable_right_click: boolean;
  disable_text_selection: boolean;
  disable_copy_paste: boolean;
  disable_print_screen: boolean;
  show_watermark: boolean;
  watermark_text: string;
}

const defaultSettings: CopyProtectionSettings = {
  disable_right_click: false,
  disable_text_selection: false,
  disable_copy_paste: false,
  disable_print_screen: false,
  show_watermark: false,
  watermark_text: '',
};

function useCopyProtectionSettings() {
  return useQuery({
    queryKey: ['copy-protection-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'copy_protection')
        .maybeSingle();

      if (error) throw error;
      if (!data) return defaultSettings;

      return (data.value as unknown as CopyProtectionSettings) || defaultSettings;
    },
  });
}

function useSaveCopyProtection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: CopyProtectionSettings) => {
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .eq('key', 'copy_protection')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('app_settings')
          .update({ value: settings as any, description: 'Blog copy protection settings' })
          .eq('key', 'copy_protection');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_settings')
          .insert({ key: 'copy_protection', value: settings as any, description: 'Blog copy protection settings' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copy-protection-settings'] });
      toast({ title: 'Settings saved successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function CopyProtectionTab() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const { data: savedSettings, isLoading } = useCopyProtectionSettings();
  const saveSettings = useSaveCopyProtection();
  const [settings, setSettings] = useState<CopyProtectionSettings>(defaultSettings);

  useEffect(() => {
    if (savedSettings) setSettings(savedSettings);
  }, [savedSettings]);

  const handleSave = () => {
    saveSettings.mutate(settings);
  };

  const protectionOptions = [
    {
      key: 'disable_right_click' as const,
      label: isAr ? 'تعطيل النقر بزر الماوس الأيمن' : 'Disable Right-Click',
      description: isAr ? 'منع المستخدمين من فتح قائمة النقر بزر الماوس الأيمن على صفحات المدونة' : 'Prevent users from opening the context menu on blog pages',
    },
    {
      key: 'disable_text_selection' as const,
      label: isAr ? 'تعطيل تحديد النص' : 'Disable Text Selection',
      description: isAr ? 'منع المستخدمين من تحديد ونسخ النص من المقالات' : 'Prevent users from selecting and copying text from articles',
    },
    {
      key: 'disable_copy_paste' as const,
      label: isAr ? 'تعطيل النسخ واللصق' : 'Disable Copy & Paste',
      description: isAr ? 'تعطيل اختصارات لوحة المفاتيح Ctrl+C / Cmd+C على صفحات المدونة' : 'Disable keyboard shortcuts Ctrl+C / Cmd+C on blog pages',
    },
    {
      key: 'disable_print_screen' as const,
      label: isAr ? 'تعطيل الطباعة' : 'Disable Print',
      description: isAr ? 'تعطيل اختصار Ctrl+P / Cmd+P لمنع طباعة المقالات' : 'Disable Ctrl+P / Cmd+P to prevent printing articles',
    },
    {
      key: 'show_watermark' as const,
      label: isAr ? 'إظهار علامة مائية' : 'Show Watermark',
      description: isAr ? 'إظهار علامة مائية شفافة فوق محتوى المدونة' : 'Display a transparent watermark overlay on blog content',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {isAr ? 'حماية محتوى المدونة من النسخ والسرقة' : 'Protect blog content from copying and theft'}
        </p>
        <Button className="gap-2" onClick={handleSave} disabled={saveSettings.isPending}>
          {saveSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isAr ? 'حفظ الإعدادات' : 'Save Settings'}
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-soft divide-y divide-border">
        {protectionOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                {settings[option.key] ? (
                  <ShieldCheck className="h-5 w-5 text-success" />
                ) : (
                  <Shield className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
              </div>
            </div>
            <Switch
              checked={settings[option.key]}
              onCheckedChange={(val) => setSettings(prev => ({ ...prev, [option.key]: val }))}
            />
          </div>
        ))}
      </div>

      {/* Watermark Text (only visible when watermark is enabled) */}
      {settings.show_watermark && (
        <div className="bg-card rounded-xl border border-border/50 shadow-soft p-6 space-y-3">
          <Label className="text-foreground">{isAr ? 'نص العلامة المائية' : 'Watermark Text'}</Label>
          <input
            type="text"
            value={settings.watermark_text}
            onChange={e => setSettings(prev => ({ ...prev, watermark_text: e.target.value }))}
            placeholder={isAr ? 'مثال: © اسم الموقع' : 'e.g., © Your Site Name'}
            className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      )}

      {/* Preview */}
      <div className="bg-muted/30 rounded-xl border border-border/50 p-6">
        <h3 className="text-sm font-medium text-foreground mb-2">
          {isAr ? 'ملاحظة' : 'Note'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isAr
            ? 'هذه الإعدادات تضيف طبقة حماية أساسية. لا يمكن منع النسخ بشكل كامل لأن المتصفحات توفر أدوات مطور. هذه الإعدادات تهدف لتقليل النسخ العرضي.'
            : 'These settings add a basic protection layer. Complete copy prevention is not possible since browsers provide developer tools. These settings aim to reduce casual copying.'}
        </p>
      </div>
    </div>
  );
}
