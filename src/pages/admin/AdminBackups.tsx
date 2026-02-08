import { useState } from "react";
import {
  HardDrive,
  Play,
  Loader2,
  Download,
  Database,
  Settings,
  Archive,
  Shield,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBackups, BackupScope } from "@/hooks/useBackups";
import { BackupScheduleCard } from "@/components/admin/backup/BackupScheduleCard";
import { BackupHistoryCard } from "@/components/admin/backup/BackupHistoryCard";
import { BackupRestoreCard } from "@/components/admin/backup/BackupRestoreCard";
import { BackupComparisonCard } from "@/components/admin/backup/BackupComparisonCard";
import { StatCard } from "@/components/admin/StatCard";
import { cn } from "@/lib/utils";

const backupScopes: {
  value: BackupScope;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: "full",
    labelEn: "Full Backup",
    labelAr: "نسخة كاملة",
    descEn: "All database tables, settings, and configurations",
    descAr: "جميع جداول قاعدة البيانات والإعدادات والتكوينات",
    icon: Archive,
  },
  {
    value: "database",
    labelEn: "Database Only",
    labelAr: "قاعدة البيانات فقط",
    descEn: "Products, orders, customers, and all table data",
    descAr: "المنتجات والطلبات والعملاء وجميع بيانات الجداول",
    icon: Database,
  },
  {
    value: "settings",
    labelEn: "Settings Only",
    labelAr: "الإعدادات فقط",
    descEn: "App settings, theme configs, and plugin states",
    descAr: "إعدادات التطبيق وتكوينات المظهر وحالات الإضافات",
    icon: Settings,
  },
];

export default function AdminBackups() {
  const { language } = useLanguage();
  const {
    backups,
    isLoadingBackups,
    isRunning,
    backupProgress,
    isRestoring,
    restoreProgress,
    schedule,
    runBackup,
    restoreBackup,
    saveSchedule,
    deleteBackup,
  } = useBackups();

  const [selectedScope, setSelectedScope] = useState<BackupScope>("full");
  const [notes, setNotes] = useState("");

  const handleRunBackup = async () => {
    await runBackup(selectedScope, notes || undefined);
    setNotes("");
  };

  // Stats
  const totalBackups = backups.length;
  const completedBackups = backups.filter((b) => b.status === "completed").length;
  const totalSize = backups.reduce((acc, b) => acc + (b.file_size_bytes || 0), 0);
  const lastBackup = backups.length > 0 ? backups[0] : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HardDrive className="h-6 w-6 text-primary" />
              {language === "ar" ? "النسخ الاحتياطي" : "Backups"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "ar"
                ? "إنشاء وإدارة النسخ الاحتياطية لبيانات موقعك"
                : "Create and manage backups of your site data"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={language === "ar" ? "إجمالي النسخ" : "Total Backups"}
            value={totalBackups}
            icon={<Archive className="h-5 w-5 text-primary" />}
            iconBg="bg-primary/10"
          />
          <StatCard
            title={language === "ar" ? "نسخ ناجحة" : "Successful"}
            value={completedBackups}
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            iconBg="bg-green-500/10"
          />
          <StatCard
            title={language === "ar" ? "الحجم الإجمالي" : "Total Size"}
            value={
              totalSize < 1024 * 1024
                ? `${(totalSize / 1024).toFixed(1)} KB`
                : `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
            }
            icon={<HardDrive className="h-5 w-5 text-blue-500" />}
            iconBg="bg-blue-500/10"
          />
          <StatCard
            title={language === "ar" ? "الجدول" : "Schedule"}
            value={
              schedule?.is_active
                ? language === "ar"
                  ? "مفعّل"
                  : "Active"
                : language === "ar"
                  ? "معطّل"
                  : "Inactive"
            }
            icon={<Shield className="h-5 w-5 text-orange-500" />}
            iconBg="bg-orange-500/10"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Manual Backup + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manual Backup Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "إنشاء نسخة احتياطية" : "Create Backup"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "اختر نوع النسخة الاحتياطية وابدأ فوراً"
                    : "Choose backup type and start immediately"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Scope Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {backupScopes.map((scope) => {
                    const isSelected = selectedScope === scope.value;
                    const Icon = scope.icon;
                    return (
                      <button
                        key={scope.value}
                        onClick={() => setSelectedScope(scope.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        )}
                        disabled={isRunning}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6",
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {language === "ar" ? scope.labelAr : scope.labelEn}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {language === "ar" ? scope.descAr : scope.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>
                    {language === "ar"
                      ? "ملاحظات (اختياري)"
                      : "Notes (optional)"}
                  </Label>
                  <Textarea
                    placeholder={
                      language === "ar"
                        ? "أضف ملاحظات حول هذه النسخة الاحتياطية..."
                        : "Add notes about this backup..."
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    disabled={isRunning}
                  />
                </div>

                {/* Progress */}
                {isRunning && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">
                        {language === "ar"
                          ? `جاري إنشاء النسخة الاحتياطية... ${backupProgress}%`
                          : `Creating backup... ${backupProgress}%`}
                      </span>
                    </div>
                    <Progress value={backupProgress} className="h-2" />
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={handleRunBackup}
                  disabled={isRunning}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === "ar"
                        ? "جاري النسخ الاحتياطي..."
                        : "Backing up..."}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      {language === "ar"
                        ? "بدء النسخ الاحتياطي وتنزيل"
                        : "Start Backup & Download"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Restore Backup */}
            <BackupRestoreCard
              onRestore={restoreBackup}
              isRestoring={isRestoring}
              restoreProgress={restoreProgress}
            />

            {/* Backup History */}
            <BackupHistoryCard
              backups={backups}
              onDelete={(id) => deleteBackup.mutate(id)}
              isLoading={isLoadingBackups}
            />

            {/* Backup Comparison */}
            <BackupComparisonCard />
          </div>

          {/* Right: Schedule */}
          <div className="space-y-6">
            <BackupScheduleCard
              schedule={schedule}
              onSave={(data) => saveSchedule.mutate(data)}
              isSaving={saveSchedule.isPending}
            />

            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "معلومات" : "Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>
                    {language === "ar"
                      ? "• النسخ الاحتياطية تُصدّر كملفات JSON"
                      : "• Backups are exported as JSON files"}
                  </p>
                  <p>
                    {language === "ar"
                      ? "• النسخة الكاملة تشمل جميع جداول قاعدة البيانات"
                      : "• Full backup includes all database tables"}
                  </p>
                  <p>
                    {language === "ar"
                      ? "• الحد الأقصى 1000 صف لكل جدول"
                      : "• Maximum 1,000 rows per table"}
                  </p>
                  <p>
                    {language === "ar"
                      ? "• يتم تنزيل الملف تلقائياً عند الاكتمال"
                      : "• File downloads automatically on completion"}
                  </p>
                  <p>
                    {language === "ar"
                      ? "• النسخ المجدولة تتطلب تفعيل يدوي"
                      : "• Scheduled backups require activation"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
