import { CheckCircle2, XCircle, Loader2, Clock, Wrench, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { healthChecks } from "@/data/healthChecks";

export type FixItemStatus = "pending" | "fixing" | "fixed" | "failed";

export interface FixItem {
  checkId: string;
  name: string;
  nameAr: string;
  status: FixItemStatus;
}

export interface FixSummary {
  fixed: string[];
  failed: string[];
  skipped: string[];
  scoreBefore: number;
  scoreAfter: number | null;
}

interface AutoFixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixItems: FixItem[];
  progress: number;
  isComplete: boolean;
  summary: FixSummary | null;
  onRescan: () => void;
  isRescanning: boolean;
}

export function AutoFixDialog({
  open,
  onOpenChange,
  fixItems,
  progress,
  isComplete,
  summary,
  onRescan,
  isRescanning,
}: AutoFixDialogProps) {
  const { language } = useLanguage();

  const currentIndex = fixItems.filter((i) => i.status === "fixed" || i.status === "failed").length;
  const total = fixItems.length;

  const statusIcon = (status: FixItemStatus) => {
    switch (status) {
      case "fixed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "fixing":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const scoreImprovement = summary && summary.scoreAfter !== null
    ? summary.scoreAfter - summary.scoreBefore
    : null;

  return (
    <Dialog open={open} onOpenChange={isComplete ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => !isComplete && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            {isComplete
              ? language === "ar" ? "اكتمل الإصلاح التلقائي!" : "Auto-Fix Complete!"
              : language === "ar" ? "جاري الإصلاح التلقائي..." : "Auto-Fix Progress"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress section */}
          {!isComplete && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {language === "ar"
                  ? `جاري إصلاح ${currentIndex + 1} من ${total} مشكلة...`
                  : `Fixing ${currentIndex + 1} of ${total} issues...`}
              </p>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Summary scores */}
          {isComplete && summary && (
            <div className="bg-muted/50 rounded-lg p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-3 text-lg font-semibold">
                <span className="text-muted-foreground">{summary.scoreBefore}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-primary">{summary.scoreAfter ?? "..."}</span>
              </div>
              {scoreImprovement !== null && scoreImprovement > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  +{scoreImprovement} {language === "ar" ? "تحسين" : "improvement"}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  {summary.fixed.length} {language === "ar" ? "تم الإصلاح" : "Fixed"}
                </span>
                {summary.failed.length > 0 && (
                  <span className="text-red-500 font-medium">
                    {summary.failed.length} {language === "ar" ? "فشل" : "Failed"}
                  </span>
                )}
                {summary.skipped.length > 0 && (
                  <span className="text-muted-foreground font-medium">
                    {summary.skipped.length} {language === "ar" ? "تم تخطيه" : "Skipped"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Fix items list */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {fixItems.map((item) => {
              const check = healthChecks.find((c) => c.id === item.checkId);
              return (
                <div
                  key={item.checkId}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                    item.status === "fixing" && "bg-primary/5",
                    item.status === "fixed" && "bg-green-500/5",
                    item.status === "failed" && "bg-red-500/5"
                  )}
                >
                  {statusIcon(item.status)}
                  <span className={cn(
                    "flex-1",
                    item.status === "pending" && "text-muted-foreground"
                  )}>
                    {language === "ar" ? item.nameAr : item.name}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {item.status === "fixing"
                      ? language === "ar" ? "جاري الإصلاح..." : "Fixing..."
                      : item.status === "fixed"
                      ? language === "ar" ? "تم" : "Done"
                      : item.status === "failed"
                      ? language === "ar" ? "فشل" : "Failed"
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {isComplete && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={onRescan}
              disabled={isRescanning}
              className="gap-2"
            >
              {isRescanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {language === "ar" ? "إعادة الفحص" : "Re-scan Now"}
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
