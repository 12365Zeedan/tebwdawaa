import { useState } from "react";
import { Package, Download, CheckCircle2, XCircle, Loader2, Key, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { format } from "date-fns";

interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion?: string;
  latestVersion?: string;
  changelog?: string;
  downloadUrl?: string;
  platform?: string;
  error?: string;
}

export default function ThemeUpdates() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [licenseKey, setLicenseKey] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsChecking(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-theme-update', {
        body: { licenseKey: licenseKey.trim(), action: 'check' },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message || (isAr ? "حدث خطأ" : "An error occurred"));
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownload = async () => {
    if (!licenseKey.trim()) return;

    setIsDownloading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-theme-update', {
        body: { licenseKey: licenseKey.trim(), action: 'download' },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (e: any) {
      setError(e.message || "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">
            {isAr ? "تحديثات القالب" : "Theme Updates"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAr
              ? "أدخل مفتاح الترخيص للتحقق من التحديثات المتاحة وتحميلها"
              : "Enter your license key to check for available updates and download them"}
          </p>
        </div>

        {/* License Key Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              {isAr ? "التحقق من التحديثات" : "Check for Updates"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="space-y-2">
                <Label>{isAr ? "مفتاح الترخيص" : "License Key"}</Label>
                <Input
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                  value={licenseKey}
                  onChange={e => setLicenseKey(e.target.value.toUpperCase())}
                  className="font-mono text-center text-lg tracking-wider"
                  dir="ltr"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={isChecking || !licenseKey.trim()}>
                {isChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {isChecking
                  ? isAr ? "جاري التحقق..." : "Checking..."
                  : isAr ? "التحقق من التحديثات" : "Check for Updates"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mt-6 border-destructive/50 bg-destructive/5">
            <CardContent className="py-4 flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card className="mt-6">
            <CardContent className="py-6">
              {result.hasUpdate ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">
                        {isAr ? "تحديث جديد متاح!" : "New Update Available!"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isAr ? "الإصدار" : "Version"} {result.latestVersion}
                        {result.platform && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {result.platform === "wordpress" ? "WordPress" : result.platform === "shopify" ? "Shopify" : "Salla"}
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  {result.changelog && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">
                          {isAr ? "ما الجديد:" : "What's New:"}
                        </p>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-4">
                          {result.changelog}
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloading
                      ? isAr ? "جاري التحميل..." : "Downloading..."
                      : isAr ? "تحميل التحديث" : "Download Update"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-medium">
                    {isAr ? "أنت تستخدم أحدث إصدار" : "You're on the latest version"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>
            {isAr
              ? "يمكنك العثور على مفتاح الترخيص في رسالة البريد الإلكتروني الخاصة بالشراء"
              : "You can find your license key in your purchase confirmation email"}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
