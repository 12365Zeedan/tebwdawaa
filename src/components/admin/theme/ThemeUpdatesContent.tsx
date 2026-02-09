import { useState } from "react";
import { Package, Key, Download, Send, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { VersionsTab } from "@/components/admin/updates/VersionsTab";
import { LicensesTab } from "@/components/admin/updates/LicensesTab";
import { DownloadsTab } from "@/components/admin/updates/DownloadsTab";
import { useThemeLicenses } from "@/hooks/useThemeLicenses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ThemeUpdatesContent() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data: licenses = [] } = useThemeLicenses();
  const [isSendingAll, setIsSendingAll] = useState(false);

  const handleNotifyAll = async () => {
    const activeIds = licenses.filter(l => l.is_active).map(l => l.id);
    if (activeIds.length === 0) {
      toast.error(isAr ? "لا توجد تراخيص نشطة" : "No active licenses");
      return;
    }
    setIsSendingAll(true);
    try {
      const { error } = await supabase.functions.invoke('send-update-notification', {
        body: { licenseIds: activeIds },
      });
      if (error) throw error;
      toast.success(
        isAr
          ? `تم إرسال إشعار إلى ${activeIds.length} عميل`
          : `Notification sent to ${activeIds.length} customers`
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to send notifications");
    } finally {
      setIsSendingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleNotifyAll}
          disabled={isSendingAll || licenses.filter(l => l.is_active).length === 0}
          className="gap-2"
          size="sm"
        >
          {isSendingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isAr ? "إشعار جميع العملاء" : "Notify All Customers"}
        </Button>
      </div>

      <Tabs defaultValue="versions">
        <TabsList>
          <TabsTrigger value="versions" className="gap-1.5">
            <Package className="h-4 w-4" />
            {isAr ? "الإصدارات" : "Versions"}
          </TabsTrigger>
          <TabsTrigger value="licenses" className="gap-1.5">
            <Key className="h-4 w-4" />
            {isAr ? "التراخيص" : "Licenses"}
          </TabsTrigger>
          <TabsTrigger value="downloads" className="gap-1.5">
            <Download className="h-4 w-4" />
            {isAr ? "التحميلات" : "Downloads"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="mt-4">
          <VersionsTab />
        </TabsContent>
        <TabsContent value="licenses" className="mt-4">
          <LicensesTab />
        </TabsContent>
        <TabsContent value="downloads" className="mt-4">
          <DownloadsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
