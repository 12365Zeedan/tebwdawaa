import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import type { ThemeLicense, ThemeLicenseInput } from "@/hooks/useThemeLicenses";

interface LicenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license?: ThemeLicense | null;
  onSubmit: (data: ThemeLicenseInput) => Promise<void>;
  isSubmitting: boolean;
}

export function LicenseFormDialog({ open, onOpenChange, license, onSubmit, isSubmitting }: LicenseFormDialogProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [form, setForm] = useState<ThemeLicenseInput>({
    license_key: license?.license_key ?? "",
    customer_name: license?.customer_name ?? "",
    customer_email: license?.customer_email ?? "",
    platform: license?.platform ?? "wordpress",
    is_active: license?.is_active ?? true,
    expires_at: license?.expires_at ? license.expires_at.split('T')[0] : null,
    notes: license?.notes ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_email) {
      toast.error(isAr ? "أكمل الحقول المطلوبة" : "Fill required fields");
      return;
    }
    await onSubmit({
      ...form,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {license
              ? isAr ? "تعديل الترخيص" : "Edit License"
              : isAr ? "ترخيص جديد" : "New License"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {license && (
            <div className="space-y-2">
              <Label>{isAr ? "مفتاح الترخيص" : "License Key"}</Label>
              <Input value={form.license_key} disabled className="font-mono text-sm" />
            </div>
          )}

          <div className="space-y-2">
            <Label>{isAr ? "اسم العميل" : "Customer Name"} *</Label>
            <Input
              value={form.customer_name}
              onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "البريد الإلكتروني" : "Customer Email"} *</Label>
            <Input
              type="email"
              value={form.customer_email}
              onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "المنصة" : "Platform"}</Label>
            <Select value={form.platform} onValueChange={(v: 'wordpress' | 'shopify' | 'salla') => setForm(p => ({ ...p, platform: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wordpress">WordPress</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="salla">Salla</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</Label>
            <Input
              type="date"
              value={form.expires_at ?? ""}
              onChange={e => setForm(p => ({ ...p, expires_at: e.target.value || null }))}
            />
            <p className="text-xs text-muted-foreground">
              {isAr ? "اتركه فارغاً للترخيص الدائم" : "Leave empty for lifetime license"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))}
            />
            <Label>{isAr ? "نشط" : "Active"}</Label>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? "ملاحظات" : "Notes"}</Label>
            <Textarea
              value={form.notes ?? ""}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {license
                ? isAr ? "حفظ التغييرات" : "Save Changes"
                : isAr ? "إنشاء ترخيص" : "Create License"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
