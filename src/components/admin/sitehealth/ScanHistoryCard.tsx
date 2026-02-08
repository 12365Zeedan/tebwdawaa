import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScanRecord {
  id: string;
  scan_type: string;
  overall_score: number;
  issues_found: number;
  issues_fixed: number;
  scan_duration_ms: number | null;
  created_at: string;
}

interface ScanHistoryCardProps {
  scans: ScanRecord[];
  onDelete: (id: string) => void;
  onViewResults: (scan: ScanRecord) => void;
}

export function ScanHistoryCard({ scans, onDelete, onViewResults }: ScanHistoryCardProps) {
  const { language } = useLanguage();

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (score >= 70) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    if (score >= 50) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    return "bg-red-500/10 text-red-600 border-red-500/20";
  };

  if (scans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === "ar" ? "سجل الفحوصات" : "Scan History"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            {language === "ar"
              ? "لا توجد فحوصات سابقة. قم بتشغيل فحص للبدء."
              : "No previous scans. Run a scan to get started."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {language === "ar" ? "سجل الفحوصات" : "Scan History"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {scans.map((scan) => (
          <div
            key={scan.id}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onViewResults(scan)}
          >
            <Badge variant="outline" className={cn("font-mono text-xs", getScoreBadge(scan.overall_score))}>
              {scan.overall_score}/100
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {scan.scan_type === "manual"
                  ? language === "ar" ? "فحص يدوي" : "Manual Scan"
                  : language === "ar" ? "فحص مجدول" : "Scheduled Scan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(scan.created_at), "MMM d, yyyy HH:mm")}
                {scan.scan_duration_ms && ` · ${(scan.scan_duration_ms / 1000).toFixed(1)}s`}
              </p>
            </div>
            {scan.issues_found > 0 && (
              <span className="text-xs text-yellow-600">
                {scan.issues_found} {language === "ar" ? "مشكلة" : "issues"}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(scan.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
