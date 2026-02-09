import { CheckCircle2, XCircle, SkipForward, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FixSummary } from "./AutoFixDialog";

interface AutoFixSummaryProps {
  summary: FixSummary;
}

export function AutoFixSummary({ summary }: AutoFixSummaryProps) {
  const { language } = useLanguage();

  const scoreImprovement = summary.scoreAfter !== null
    ? summary.scoreAfter - summary.scoreBefore
    : null;

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardContent className="py-4">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <p className="font-semibold text-sm">
            {language === "ar" ? "ملخص الإصلاح التلقائي" : "Auto-Fix Summary"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-lg font-bold">{summary.fixed.length}</p>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "تم الإصلاح" : "Fixed"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-lg font-bold">{summary.failed.length}</p>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "فشل" : "Failed"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SkipForward className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{summary.skipped.length}</p>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "تم تخطيه" : "Skipped"}
              </p>
            </div>
          </div>
        </div>

        {scoreImprovement !== null && scoreImprovement > 0 && (
          <div className="mt-3 pt-3 border-t border-green-500/20 text-center">
            <p className="text-sm text-green-600 font-medium">
              {language === "ar"
                ? `تحسن النتيجة: ${summary.scoreBefore} → ${summary.scoreAfter} (+${scoreImprovement})`
                : `Score improved: ${summary.scoreBefore} → ${summary.scoreAfter} (+${scoreImprovement})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
