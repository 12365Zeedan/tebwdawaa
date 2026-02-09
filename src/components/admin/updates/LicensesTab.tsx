import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Key, Copy, Loader2, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { LicenseFormDialog } from "./LicenseFormDialog";
import {
  useThemeLicenses,
  useCreateThemeLicense,
  useUpdateThemeLicense,
  useDeleteThemeLicense,
  type ThemeLicense,
  type ThemeLicenseInput,
} from "@/hooks/useThemeLicenses";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function LicensesTab() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data: licenses = [], isLoading } = useThemeLicenses();
  const createLicense = useCreateThemeLicense();
  const updateLicense = useUpdateThemeLicense();
  const deleteLicense = useDeleteThemeLicense();

  const [formOpen, setFormOpen] = useState(false);
  const [editLicense, setEditLicense] = useState<ThemeLicense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const handleCreate = async (data: ThemeLicenseInput) => {
    await createLicense.mutateAsync(data);
    toast.success(isAr ? "تم إنشاء الترخيص" : "License created");
  };

  const handleUpdate = async (data: ThemeLicenseInput) => {
    if (!editLicense) return;
    await updateLicense.mutateAsync({ id: editLicense.id, ...data });
    toast.success(isAr ? "تم تحديث الترخيص" : "License updated");
    setEditLicense(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLicense.mutateAsync(deleteId);
    toast.success(isAr ? "تم حذف الترخيص" : "License deleted");
    setDeleteId(null);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(isAr ? "تم نسخ المفتاح" : "License key copied");
  };

  const sendNotification = async (license: ThemeLicense) => {
    setSendingTo(license.id);
    try {
      const { error } = await supabase.functions.invoke('send-update-notification', {
        body: {
          licenseIds: [license.id],
        },
      });
      if (error) throw error;
      toast.success(isAr ? "تم إرسال الإشعار" : "Notification sent");
    } catch (e: any) {
      toast.error(e.message || "Failed to send");
    } finally {
      setSendingTo(null);
    }
  };

  const platformColors: Record<string, string> = {
    wordpress: "bg-blue-500/10 text-blue-600",
    shopify: "bg-green-500/10 text-green-600",
    salla: "bg-purple-500/10 text-purple-600",
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">
            {isAr ? "التراخيص" : "Licenses"}
          </CardTitle>
          <Button className="gap-1.5" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            {isAr ? "ترخيص جديد" : "New License"}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{isAr ? "لا توجد تراخيص بعد" : "No licenses yet"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? "مفتاح الترخيص" : "License Key"}</TableHead>
                  <TableHead>{isAr ? "العميل" : "Customer"}</TableHead>
                  <TableHead>{isAr ? "المنصة" : "Platform"}</TableHead>
                  <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{isAr ? "الانتهاء" : "Expires"}</TableHead>
                  <TableHead className="text-right">{isAr ? "إجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                          {l.license_key}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyKey(l.license_key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{l.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{l.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={platformColors[l.platform] || ""}>
                        {l.platform === "wordpress" ? "WordPress" : l.platform === "shopify" ? "Shopify" : "Salla"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {l.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600">
                          {isAr ? "نشط" : "Active"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          {isAr ? "معطل" : "Inactive"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {l.expires_at
                        ? format(new Date(l.expires_at), "dd/MM/yyyy")
                        : isAr ? "دائم" : "Lifetime"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={isAr ? "إرسال إشعار" : "Send notification"}
                          disabled={sendingTo === l.id}
                          onClick={() => sendNotification(l)}
                        >
                          {sendingTo === l.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditLicense(l)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(l.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LicenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isSubmitting={createLicense.isPending}
      />

      {editLicense && (
        <LicenseFormDialog
          open={!!editLicense}
          onOpenChange={open => { if (!open) setEditLicense(null); }}
          license={editLicense}
          onSubmit={handleUpdate}
          isSubmitting={updateLicense.isPending}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? "حذف الترخيص" : "Delete License"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? "هل أنت متأكد من حذف هذا الترخيص؟"
                : "Are you sure you want to delete this license?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isAr ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
