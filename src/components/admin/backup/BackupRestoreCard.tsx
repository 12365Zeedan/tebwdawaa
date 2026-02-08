import { useState, useRef, useMemo } from "react";
import {
  Upload,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ParsedBackup {
  version: string;
  created_at: string;
  scope: string;
  tables: Record<string, unknown[]>;
}

interface BackupRestoreCardProps {
  onRestore: (tables: string[], data: ParsedBackup) => Promise<void>;
  isRestoring: boolean;
  restoreProgress: number;
}

export function BackupRestoreCard({
  onRestore,
  isRestoring,
  restoreProgress,
}: BackupRestoreCardProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedBackup, setParsedBackup] = useState<ParsedBackup | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const tableEntries = useMemo(() => {
    if (!parsedBackup) return [];
    return Object.entries(parsedBackup.tables)
      .map(([name, rows]) => ({
        name,
        rowCount: Array.isArray(rows) ? rows.length : 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [parsedBackup]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setParsedBackup(null);
    setSelectedTables([]);
    setFileName(file.name);

    if (!file.name.endsWith(".json")) {
      setParseError(
        language === "ar"
          ? "يرجى رفع ملف JSON فقط"
          : "Please upload a JSON file only"
      );
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ParsedBackup;

      // Validate structure
      if (!data.tables || typeof data.tables !== "object") {
        throw new Error("Invalid backup format: missing 'tables' object");
      }
      if (!data.version || !data.created_at) {
        throw new Error("Invalid backup format: missing version or created_at");
      }

      setParsedBackup(data);
      // Auto-select all tables
      setSelectedTables(Object.keys(data.tables));
    } catch (err) {
      setParseError(
        err instanceof Error
          ? err.message
          : language === "ar"
            ? "فشل في قراءة الملف"
            : "Failed to parse file"
      );
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleTable = (name: string) => {
    setSelectedTables((prev) =>
      prev.includes(name)
        ? prev.filter((t) => t !== name)
        : [...prev, name]
    );
  };

  const selectAll = () => {
    if (selectedTables.length === tableEntries.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tableEntries.map((t) => t.name));
    }
  };

  const handleRestore = async () => {
    setShowConfirmDialog(false);
    if (parsedBackup && selectedTables.length > 0) {
      await onRestore(selectedTables, parsedBackup);
    }
  };

  const clearFile = () => {
    setParsedBackup(null);
    setParseError(null);
    setFileName(null);
    setSelectedTables([]);
  };

  const totalSelectedRows = tableEntries
    .filter((t) => selectedTables.includes(t.name))
    .reduce((sum, t) => sum + t.rowCount, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {language === "ar" ? "استعادة نسخة احتياطية" : "Restore Backup"}
            </CardTitle>
          </div>
          <CardDescription>
            {language === "ar"
              ? "ارفع ملف JSON واختر الجداول التي تريد استعادتها"
              : "Upload a JSON backup file and select tables to restore"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Zone */}
          {!parsedBackup && !isRestoring && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                parseError
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">
                {language === "ar"
                  ? "اضغط لرفع ملف النسخة الاحتياطية"
                  : "Click to upload backup file"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === "ar"
                  ? "ملفات JSON فقط"
                  : "JSON files only"}
              </p>
              {parseError && (
                <div className="flex items-center gap-2 justify-center mt-3 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">{parseError}</p>
                </div>
              )}
            </div>
          )}

          {/* Parsed File Info */}
          {parsedBackup && !isRestoring && (
            <div className="space-y-4">
              {/* File Summary */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <FileJson className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>v{parsedBackup.version}</span>
                    <span>·</span>
                    <span>
                      {new Date(parsedBackup.created_at).toLocaleDateString()}
                    </span>
                    <span>·</span>
                    <span>
                      {tableEntries.length}{" "}
                      {language === "ar" ? "جدول" : "tables"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={clearFile}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Warning Banner */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  {language === "ar"
                    ? "تحذير: استعادة البيانات ستحذف البيانات الحالية في الجداول المحددة وتستبدلها ببيانات النسخة الاحتياطية. هذا الإجراء لا يمكن التراجع عنه."
                    : "Warning: Restoring will delete existing data in selected tables and replace it with backup data. This action cannot be undone."}
                </p>
              </div>

              {/* Table Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {language === "ar"
                      ? "اختر الجداول للاستعادة"
                      : "Select Tables to Restore"}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={selectAll}
                  >
                    {selectedTables.length === tableEntries.length
                      ? language === "ar"
                        ? "إلغاء الكل"
                        : "Deselect All"
                      : language === "ar"
                        ? "تحديد الكل"
                        : "Select All"}
                  </Button>
                </div>

                <button
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {showDetails
                    ? language === "ar"
                      ? "إخفاء التفاصيل"
                      : "Hide details"
                    : language === "ar"
                      ? `عرض ${tableEntries.length} جدول`
                      : `Show ${tableEntries.length} tables`}
                </button>

                {showDetails && (
                  <div className="max-h-60 overflow-y-auto space-y-1 border rounded-lg p-2">
                    {tableEntries.map((table) => (
                      <div
                        key={table.name}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors cursor-pointer",
                          selectedTables.includes(table.name)
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => toggleTable(table.name)}
                      >
                        <Checkbox
                          checked={selectedTables.includes(table.name)}
                          onCheckedChange={() => toggleTable(table.name)}
                          className="pointer-events-none"
                        />
                        <span className="text-sm flex-1 font-mono">
                          {table.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {table.rowCount}{" "}
                          {language === "ar" ? "صف" : "rows"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selection Summary */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  <span>
                    {language === "ar"
                      ? `${selectedTables.length} جدول محدد (${totalSelectedRows} صف)`
                      : `${selectedTables.length} tables selected (${totalSelectedRows} rows)`}
                  </span>
                </div>
              </div>

              {/* Restore Button */}
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={selectedTables.length === 0}
                variant="destructive"
                className="w-full gap-2"
                size="lg"
              >
                <RotateCcw className="h-4 w-4" />
                {language === "ar"
                  ? `استعادة ${selectedTables.length} جدول`
                  : `Restore ${selectedTables.length} Table${selectedTables.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          )}

          {/* Restore Progress */}
          {isRestoring && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  {language === "ar"
                    ? `جاري الاستعادة... ${restoreProgress}%`
                    : `Restoring... ${restoreProgress}%`}
                </span>
              </div>
              <Progress value={restoreProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {language === "ar"
                  ? "يرجى عدم إغلاق الصفحة أثناء عملية الاستعادة"
                  : "Please don't close this page during the restore process"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "ar"
                ? "تأكيد الاستعادة"
                : "Confirm Restore"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {language === "ar"
                  ? `أنت على وشك استعادة ${selectedTables.length} جدول (${totalSelectedRows} صف). سيتم حذف البيانات الحالية في هذه الجداول واستبدالها ببيانات النسخة الاحتياطية.`
                  : `You are about to restore ${selectedTables.length} table${selectedTables.length !== 1 ? "s" : ""} (${totalSelectedRows} rows). Existing data in these tables will be deleted and replaced with the backup data.`}
              </p>
              <p className="font-medium text-destructive">
                {language === "ar"
                  ? "هذا الإجراء لا يمكن التراجع عنه!"
                  : "This action cannot be undone!"}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === "ar" ? "نعم، استعد الآن" : "Yes, Restore Now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
