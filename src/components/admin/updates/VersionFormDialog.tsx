import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, FileArchive } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import type { ThemeVersion, ThemeVersionInput } from "@/hooks/useThemeVersions";
import { uploadThemeFile } from "@/hooks/useThemeVersions";

interface VersionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version?: ThemeVersion | null;
  onSubmit: (data: ThemeVersionInput) => Promise<void>;
  isSubmitting: boolean;
}

type Platform = 'wordpress' | 'shopify' | 'salla';

const platformLabels: Record<Platform, { en: string; ar: string }> = {
  wordpress: { en: "WordPress", ar: "ووردبريس" },
  shopify: { en: "Shopify", ar: "شوبيفاي" },
  salla: { en: "Salla", ar: "سلة" },
};

export function VersionFormDialog({ open, onOpenChange, version, onSubmit, isSubmitting }: VersionFormDialogProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [form, setForm] = useState<ThemeVersionInput>({
    version: version?.version ?? "",
    title: version?.title ?? "",
    title_ar: version?.title_ar ?? "",
    changelog: version?.changelog ?? "",
    changelog_ar: version?.changelog_ar ?? "",
    wordpress_file_url: version?.wordpress_file_url ?? null,
    shopify_file_url: version?.shopify_file_url ?? null,
    salla_file_url: version?.salla_file_url ?? null,
    is_published: version?.is_published ?? false,
  });

  const [uploading, setUploading] = useState<Platform | null>(null);
  const fileInputRefs = useRef<Record<Platform, HTMLInputElement | null>>({
    wordpress: null,
    shopify: null,
    salla: null,
  });

  const handleFileUpload = async (platform: Platform, file: File) => {
    if (!form.version) {
      toast.error(isAr ? "أدخل رقم الإصدار أولاً" : "Enter version number first");
      return;
    }
    setUploading(platform);
    try {
      const path = await uploadThemeFile(file, platform, form.version);
      setForm(prev => ({ ...prev, [`${platform}_file_url`]: path }));
      toast.success(isAr ? "تم رفع الملف بنجاح" : "File uploaded successfully");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.version || !form.title) {
      toast.error(isAr ? "أكمل الحقول المطلوبة" : "Fill required fields");
      return;
    }
    await onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {version
              ? isAr ? "تعديل الإصدار" : "Edit Version"
              : isAr ? "إصدار جديد" : "New Version"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? "رقم الإصدار" : "Version"} *</Label>
              <Input
                placeholder="1.0.0"
                value={form.version}
                onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 flex items-end gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_published}
                  onCheckedChange={v => setForm(p => ({ ...p, is_published: v }))}
                />
                <Label>{isAr ? "منشور" : "Published"}</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? "العنوان (إنجليزي)" : "Title (English)"} *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
              <Input
                value={form.title_ar}
                onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? "سجل التغييرات (إنجليزي)" : "Changelog (English)"}</Label>
              <Textarea
                value={form.changelog ?? ""}
                onChange={e => setForm(p => ({ ...p, changelog: e.target.value }))}
                rows={5}
                placeholder={isAr ? "ما الجديد في هذا الإصدار..." : "What's new in this version..."}
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "سجل التغييرات (عربي)" : "Changelog (Arabic)"}</Label>
              <Textarea
                value={form.changelog_ar ?? ""}
                onChange={e => setForm(p => ({ ...p, changelog_ar: e.target.value }))}
                rows={5}
                dir="rtl"
              />
            </div>
          </div>

          {/* Platform file uploads */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {isAr ? "ملفات القوالب" : "Theme Files"}
            </Label>
            {(Object.keys(platformLabels) as Platform[]).map(platform => {
              const fileUrl = form[`${platform}_file_url` as keyof ThemeVersionInput] as string | null;
              return (
                <div key={platform} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <FileArchive className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium w-24">
                    {platformLabels[platform][isAr ? "ar" : "en"]}
                  </span>
                  {fileUrl ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-green-600 truncate flex-1">
                        ✓ {fileUrl.split('/').pop()}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setForm(p => ({ ...p, [`${platform}_file_url`]: null }))}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <input
                        ref={el => { fileInputRefs.current[platform] = el; }}
                        type="file"
                        accept=".zip"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(platform, f);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={uploading !== null}
                        onClick={() => fileInputRefs.current[platform]?.click()}
                      >
                        {uploading === platform ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        {isAr ? "رفع ZIP" : "Upload ZIP"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {version
                ? isAr ? "حفظ التغييرات" : "Save Changes"
                : isAr ? "إنشاء إصدار" : "Create Version"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
