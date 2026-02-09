import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Globe, Eye, EyeOff, Loader2, FileArchive } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { VersionFormDialog } from "./VersionFormDialog";
import {
  useThemeVersions,
  useCreateThemeVersion,
  useUpdateThemeVersion,
  useDeleteThemeVersion,
  type ThemeVersion,
  type ThemeVersionInput,
} from "@/hooks/useThemeVersions";
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

export function VersionsTab() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data: versions = [], isLoading } = useThemeVersions();
  const createVersion = useCreateThemeVersion();
  const updateVersion = useUpdateThemeVersion();
  const deleteVersion = useDeleteThemeVersion();

  const [formOpen, setFormOpen] = useState(false);
  const [editVersion, setEditVersion] = useState<ThemeVersion | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (data: ThemeVersionInput) => {
    await createVersion.mutateAsync(data);
    toast.success(isAr ? "تم إنشاء الإصدار" : "Version created");
  };

  const handleUpdate = async (data: ThemeVersionInput) => {
    if (!editVersion) return;
    await updateVersion.mutateAsync({ id: editVersion.id, ...data });
    toast.success(isAr ? "تم تحديث الإصدار" : "Version updated");
    setEditVersion(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteVersion.mutateAsync(deleteId);
    toast.success(isAr ? "تم حذف الإصدار" : "Version deleted");
    setDeleteId(null);
  };

  const platformFiles = (v: ThemeVersion) => {
    const files: string[] = [];
    if (v.wordpress_file_url) files.push("WP");
    if (v.shopify_file_url) files.push("Shopify");
    if (v.salla_file_url) files.push("Salla");
    return files;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">
            {isAr ? "إصدارات القالب" : "Theme Versions"}
          </CardTitle>
          <Button className="gap-1.5" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            {isAr ? "إصدار جديد" : "New Version"}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">{isAr ? "لا توجد إصدارات بعد" : "No versions yet"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? "الإصدار" : "Version"}</TableHead>
                  <TableHead>{isAr ? "العنوان" : "Title"}</TableHead>
                  <TableHead>{isAr ? "الملفات" : "Files"}</TableHead>
                  <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{isAr ? "التاريخ" : "Date"}</TableHead>
                  <TableHead className="text-right">{isAr ? "إجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map(v => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-semibold">v{v.version}</TableCell>
                    <TableCell>{isAr ? v.title_ar || v.title : v.title}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {platformFiles(v).map(p => (
                          <Badge key={p} variant="secondary" className="text-xs gap-1">
                            <FileArchive className="h-3 w-3" /> {p}
                          </Badge>
                        ))}
                        {platformFiles(v).length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {v.is_published ? (
                        <Badge className="bg-green-500/10 text-green-600 gap-1">
                          <Eye className="h-3 w-3" /> {isAr ? "منشور" : "Published"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <EyeOff className="h-3 w-3" /> {isAr ? "مسودة" : "Draft"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(v.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setEditVersion(v); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(v.id)}
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

      {/* Create dialog */}
      <VersionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isSubmitting={createVersion.isPending}
      />

      {/* Edit dialog */}
      {editVersion && (
        <VersionFormDialog
          open={!!editVersion}
          onOpenChange={open => { if (!open) setEditVersion(null); }}
          version={editVersion}
          onSubmit={handleUpdate}
          isSubmitting={updateVersion.isPending}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? "حذف الإصدار" : "Delete Version"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? "هل أنت متأكد من حذف هذا الإصدار؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to delete this version? This action cannot be undone."}
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
