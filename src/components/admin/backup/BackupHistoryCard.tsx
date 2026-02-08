import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  Download,
  HardDrive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface BackupRecord {
  id: string;
  backup_type: string;
  backup_scope: string;
  status: string;
  file_size_bytes: number | null;
  tables_included: string[] | null;
  notes: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface BackupHistoryCardProps {
  backups: BackupRecord[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function BackupHistoryCard({
  backups,
  onDelete,
  isLoading,
}: BackupHistoryCardProps) {
  const { language } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      completed: { en: "Completed", ar: "مكتمل" },
      failed: { en: "Failed", ar: "فشل" },
      in_progress: { en: "In Progress", ar: "جاري" },
      pending: { en: "Pending", ar: "معلق" },
    };
    return language === "ar"
      ? labels[status]?.ar || status
      : labels[status]?.en || status;
  };

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      full: { en: "Full Backup", ar: "نسخة كاملة" },
      database: { en: "Database", ar: "قاعدة البيانات" },
      storage: { en: "Storage", ar: "التخزين" },
      settings: { en: "Settings", ar: "الإعدادات" },
    };
    return language === "ar"
      ? labels[scope]?.ar || scope
      : labels[scope]?.en || scope;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === "ar" ? "سجل النسخ الاحتياطي" : "Backup History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {language === "ar" ? "سجل النسخ الاحتياطي" : "Backup History"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {backups.length === 0 ? (
          <div className="text-center py-8">
            <HardDrive className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "لا توجد نسخ احتياطية. أنشئ نسخة احتياطية للبدء."
                : "No backups yet. Create one to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                {getStatusIcon(backup.status)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">
                      {getScopeLabel(backup.backup_scope)}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] leading-none",
                        getStatusBadgeClass(backup.status)
                      )}
                    >
                      {getStatusLabel(backup.status)}
                    </Badge>
                    {backup.backup_type === "scheduled" && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                        {language === "ar" ? "مجدول" : "Scheduled"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>
                      {format(new Date(backup.created_at), "MMM d, yyyy HH:mm")}
                    </span>
                    {backup.file_size_bytes && (
                      <>
                        <span>·</span>
                        <span>{formatSize(backup.file_size_bytes)}</span>
                      </>
                    )}
                    {backup.tables_included && backup.tables_included.length > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          {backup.tables_included.length}{" "}
                          {language === "ar" ? "جدول" : "tables"}
                        </span>
                      </>
                    )}
                  </div>
                  {backup.error_message && (
                    <p className="text-xs text-red-500 mt-1">
                      {backup.error_message}
                    </p>
                  )}
                  {backup.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {backup.notes}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => onDelete(backup.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
