import { useState, useRef, useMemo } from "react";
import {
  GitCompareArrows,
  Upload,
  FileJson,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Equal,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ParsedBackup } from "./BackupRestoreCard";

type DiffStatus = "added" | "removed" | "modified" | "unchanged";

interface TableDiff {
  table: string;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

interface RowDiff {
  id: string;
  status: DiffStatus;
  leftRow: Record<string, unknown> | null;
  rightRow: Record<string, unknown> | null;
  changedFields: string[];
}

function computeTableDiffs(
  left: ParsedBackup,
  right: ParsedBackup
): TableDiff[] {
  const allTables = new Set([
    ...Object.keys(left.tables),
    ...Object.keys(right.tables),
  ]);
  const diffs: TableDiff[] = [];

  for (const table of allTables) {
    const leftRows = (left.tables[table] || []) as Record<string, unknown>[];
    const rightRows = (right.tables[table] || []) as Record<string, unknown>[];

    const leftMap = new Map(
      leftRows.map((r) => [String(r.id ?? JSON.stringify(r)), r])
    );
    const rightMap = new Map(
      rightRows.map((r) => [String(r.id ?? JSON.stringify(r)), r])
    );

    let added = 0,
      removed = 0,
      modified = 0,
      unchanged = 0;

    for (const [id, row] of rightMap) {
      if (!leftMap.has(id)) {
        added++;
      } else {
        const leftRow = leftMap.get(id)!;
        if (JSON.stringify(leftRow) !== JSON.stringify(row)) {
          modified++;
        } else {
          unchanged++;
        }
      }
    }
    for (const id of leftMap.keys()) {
      if (!rightMap.has(id)) removed++;
    }

    diffs.push({ table, added, removed, modified, unchanged });
  }

  return diffs.sort((a, b) => {
    const aChanges = a.added + a.removed + a.modified;
    const bChanges = b.added + b.removed + b.modified;
    return bChanges - aChanges;
  });
}

function computeRowDiffs(
  leftRows: Record<string, unknown>[],
  rightRows: Record<string, unknown>[]
): RowDiff[] {
  const leftMap = new Map(
    leftRows.map((r) => [String(r.id ?? JSON.stringify(r)), r])
  );
  const rightMap = new Map(
    rightRows.map((r) => [String(r.id ?? JSON.stringify(r)), r])
  );

  const diffs: RowDiff[] = [];

  for (const [id, row] of rightMap) {
    if (!leftMap.has(id)) {
      diffs.push({ id, status: "added", leftRow: null, rightRow: row, changedFields: Object.keys(row) });
    } else {
      const leftRow = leftMap.get(id)!;
      const changedFields = Object.keys({ ...leftRow, ...row }).filter(
        (k) => JSON.stringify(leftRow[k]) !== JSON.stringify(row[k])
      );
      diffs.push({
        id,
        status: changedFields.length > 0 ? "modified" : "unchanged",
        leftRow,
        rightRow: row,
        changedFields,
      });
    }
  }

  for (const [id, row] of leftMap) {
    if (!rightMap.has(id)) {
      diffs.push({ id, status: "removed", leftRow: row, rightRow: null, changedFields: Object.keys(row) });
    }
  }

  return diffs.sort((a, b) => {
    const order: Record<DiffStatus, number> = { added: 0, removed: 1, modified: 2, unchanged: 3 };
    return order[a.status] - order[b.status];
  });
}

function FileUploadSlot({
  label,
  backup,
  fileName,
  onSelect,
  onClear,
}: {
  label: string;
  backup: ParsedBackup | null;
  fileName: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      {!backup ? (
        <div
          onClick={() => ref.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-border hover:border-primary/50 hover:bg-muted/50"
        >
          <input
            ref={ref}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelect(file);
              if (ref.current) ref.current.value = "";
            }}
          />
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs">Upload JSON</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
          <FileJson className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{fileName}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(backup.created_at).toLocaleString()} ·{" "}
              {Object.keys(backup.tables).length} tables
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function BackupComparisonCard() {
  const { language } = useLanguage();
  const [leftBackup, setLeftBackup] = useState<ParsedBackup | null>(null);
  const [rightBackup, setRightBackup] = useState<ParsedBackup | null>(null);
  const [leftName, setLeftName] = useState<string | null>(null);
  const [rightName, setRightName] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseFile = async (file: File): Promise<ParsedBackup | null> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ParsedBackup;
      if (!data.tables || !data.version || !data.created_at) {
        throw new Error("Invalid backup format");
      }
      setParseError(null);
      return data;
    } catch {
      setParseError(language === "ar" ? "تنسيق ملف غير صالح" : "Invalid file format");
      return null;
    }
  };

  const tableDiffs = useMemo(() => {
    if (!leftBackup || !rightBackup) return [];
    return computeTableDiffs(leftBackup, rightBackup);
  }, [leftBackup, rightBackup]);

  const rowDiffs = useMemo(() => {
    if (!leftBackup || !rightBackup || !selectedTable) return [];
    const leftRows = (leftBackup.tables[selectedTable] || []) as Record<string, unknown>[];
    const rightRows = (rightBackup.tables[selectedTable] || []) as Record<string, unknown>[];
    return computeRowDiffs(leftRows, rightRows);
  }, [leftBackup, rightBackup, selectedTable]);

  const filteredRowDiffs = showUnchanged ? rowDiffs : rowDiffs.filter((d) => d.status !== "unchanged");

  const allColumns = useMemo(() => {
    if (!selectedTable || !leftBackup || !rightBackup) return [];
    const leftRows = (leftBackup.tables[selectedTable] || []) as Record<string, unknown>[];
    const rightRows = (rightBackup.tables[selectedTable] || []) as Record<string, unknown>[];
    const cols = new Set<string>();
    [...leftRows.slice(0, 1), ...rightRows.slice(0, 1)].forEach((row) =>
      Object.keys(row).forEach((k) => cols.add(k))
    );
    return Array.from(cols);
  }, [selectedTable, leftBackup, rightBackup]);

  const totalChanges = tableDiffs.reduce((s, d) => s + d.added + d.removed + d.modified, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {language === "ar" ? "مقارنة النسخ الاحتياطية" : "Compare Backups"}
          </CardTitle>
        </div>
        <CardDescription>
          {language === "ar"
            ? "ارفع ملفي نسخ احتياطية لمقارنة الاختلافات بينهما"
            : "Upload two backup files to compare differences between them"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Slots */}
        <div className="flex gap-4 items-start">
          <FileUploadSlot
            label={language === "ar" ? "النسخة الأولى (القديمة)" : "Snapshot A (older)"}
            backup={leftBackup}
            fileName={leftName}
            onSelect={async (file) => {
              const data = await parseFile(file);
              if (data) { setLeftBackup(data); setLeftName(file.name); }
            }}
            onClear={() => { setLeftBackup(null); setLeftName(null); setSelectedTable(null); }}
          />
          <div className="pt-8">
            <GitCompareArrows className="h-5 w-5 text-muted-foreground" />
          </div>
          <FileUploadSlot
            label={language === "ar" ? "النسخة الثانية (الأحدث)" : "Snapshot B (newer)"}
            backup={rightBackup}
            fileName={rightName}
            onSelect={async (file) => {
              const data = await parseFile(file);
              if (data) { setRightBackup(data); setRightName(file.name); }
            }}
            onClear={() => { setRightBackup(null); setRightName(null); setSelectedTable(null); }}
          />
        </div>

        {parseError && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            {parseError}
          </div>
        )}

        {/* Table-level diff summary */}
        {leftBackup && rightBackup && tableDiffs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {language === "ar" ? "ملخص التغييرات" : "Change Summary"}
              </p>
              <Badge variant="outline" className="text-xs">
                {totalChanges} {language === "ar" ? "تغيير" : "changes"}
              </Badge>
            </div>

            <ScrollArea className="max-h-64">
              <div className="space-y-1">
                {tableDiffs.map((diff) => {
                  const hasChanges = diff.added + diff.removed + diff.modified > 0;
                  return (
                    <button
                      key={diff.table}
                      onClick={() => setSelectedTable(diff.table)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors text-sm",
                        selectedTable === diff.table
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50",
                        !hasChanges && "opacity-50"
                      )}
                    >
                      <span className="font-mono flex-1 truncate">{diff.table}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {diff.added > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-green-600">
                            <Plus className="h-3 w-3" />
                            {diff.added}
                          </span>
                        )}
                        {diff.removed > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-red-600">
                            <Minus className="h-3 w-3" />
                            {diff.removed}
                          </span>
                        )}
                        {diff.modified > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                            ~{diff.modified}
                          </span>
                        )}
                        {!hasChanges && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Equal className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Row-level diff for selected table */}
        {selectedTable && leftBackup && rightBackup && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium font-mono">{selectedTable}</p>
                <Badge variant="secondary" className="text-[10px]">
                  {rowDiffs.filter((d) => d.status !== "unchanged").length}{" "}
                  {language === "ar" ? "تغيير" : "diffs"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowUnchanged(!showUnchanged)}
              >
                {showUnchanged
                  ? language === "ar" ? "إخفاء المتطابقة" : "Hide unchanged"
                  : language === "ar" ? "عرض الكل" : "Show all"}
              </Button>
            </div>

            {filteredRowDiffs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {language === "ar" ? "لا توجد اختلافات" : "No differences found"}
              </p>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20 sticky left-0 bg-background">
                          {language === "ar" ? "الحالة" : "Status"}
                        </TableHead>
                        {allColumns.slice(0, 6).map((col) => (
                          <TableHead key={col} className="text-xs font-mono whitespace-nowrap">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRowDiffs.slice(0, 50).map((diff, i) => (
                        <TableRow
                          key={diff.id + i}
                          className={cn(
                            diff.status === "added" && "bg-green-500/5",
                            diff.status === "removed" && "bg-red-500/5",
                            diff.status === "modified" && "bg-yellow-500/5"
                          )}
                        >
                          <TableCell className="sticky left-0 bg-inherit">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                diff.status === "added" && "border-green-500 text-green-600",
                                diff.status === "removed" && "border-red-500 text-red-600",
                                diff.status === "modified" && "border-yellow-500 text-yellow-600",
                                diff.status === "unchanged" && "text-muted-foreground"
                              )}
                            >
                              {diff.status === "added" && <Plus className="h-2.5 w-2.5 mr-0.5" />}
                              {diff.status === "removed" && <Minus className="h-2.5 w-2.5 mr-0.5" />}
                              {diff.status}
                            </Badge>
                          </TableCell>
                          {allColumns.slice(0, 6).map((col) => {
                            const row = diff.rightRow || diff.leftRow;
                            const val = row ? String(row[col] ?? "—") : "—";
                            const isChanged = diff.changedFields.includes(col);
                            return (
                              <TableCell
                                key={col}
                                className={cn(
                                  "text-xs max-w-[200px] truncate font-mono",
                                  isChanged && diff.status === "modified" && "font-semibold text-yellow-700 dark:text-yellow-400"
                                )}
                                title={val}
                              >
                                {val.length > 50 ? val.slice(0, 50) + "…" : val}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredRowDiffs.length > 50 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      {language === "ar"
                        ? `عرض 50 من ${filteredRowDiffs.length} نتيجة`
                        : `Showing 50 of ${filteredRowDiffs.length} results`}
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
