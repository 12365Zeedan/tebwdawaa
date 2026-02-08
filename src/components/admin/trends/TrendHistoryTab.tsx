import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { History, Trash2, Eye, Clock, Calendar, RefreshCw, Bot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrendReports, useDeleteTrendReport, type TrendReport, type AnalysisType } from "@/hooks/useTrendsAgent";
import { format } from "date-fns";

interface TrendHistoryTabProps {
  isAnalyzing: boolean;
  onRunScheduled: (types: AnalysisType[]) => void;
}

const typeLabels: Record<string, { en: string; ar: string; color: string }> = {
  trending_keywords: { en: "Keywords", ar: "كلمات", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  trending_products: { en: "Products", ar: "منتجات", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  keyword_analysis: { en: "Analysis", ar: "تحليل", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  market_overview: { en: "Market", ar: "السوق", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  competitor_analysis: { en: "Competitors", ar: "منافسون", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export function TrendHistoryTab({ isAnalyzing, onRunScheduled }: TrendHistoryTabProps) {
  const { language } = useLanguage();
  const { data: reports, isLoading } = useTrendReports();
  const deleteReport = useDeleteTrendReport();
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoSchedule, setAutoSchedule] = useState(false);

  const filtered = reports?.filter((r) => filterType === "all" || r.analysis_type === filterType) || [];

  const handleRunAll = () => {
    const types: AnalysisType[] = [
      "trending_keywords",
      "trending_products",
      "market_overview",
      "competitor_analysis",
    ];
    onRunScheduled(types);
  };

  return (
    <div className="space-y-6">
      {/* Schedule Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {language === "ar" ? "التحليل المجدول" : "Scheduled Analysis"}
          </CardTitle>
          <CardDescription>
            {language === "ar"
              ? "قم بتشغيل تحليل شامل واحفظ النتائج للتتبع التاريخي"
              : "Run comprehensive analysis and save results for historical tracking"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-schedule"
                  checked={autoSchedule}
                  onCheckedChange={setAutoSchedule}
                />
                <Label htmlFor="auto-schedule" className="text-sm">
                  {language === "ar" ? "تذكير أسبوعي" : "Weekly reminder"}
                </Label>
              </div>
              {autoSchedule && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {language === "ar" ? "كل أحد" : "Every Sunday"}
                </Badge>
              )}
            </div>
            <Button onClick={handleRunAll} disabled={isAnalyzing} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing
                ? language === "ar" ? "جاري التحليل..." : "Running..."
                : language === "ar" ? "تشغيل تحليل شامل" : "Run Full Analysis"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {language === "ar"
              ? "سيقوم بتشغيل: الكلمات الرائجة، المنتجات الرائجة، نظرة السوق، وتحليل المنافسين - وحفظ النتائج"
              : "Will run: Trending Keywords, Trending Products, Market Overview & Competitor Analysis — and save all results"}
          </p>
        </CardContent>
      </Card>

      {/* Filter & History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" />
              {language === "ar" ? "سجل التقارير" : "Report History"}
            </CardTitle>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "الكل" : "All Types"}</SelectItem>
                <SelectItem value="trending_keywords">{language === "ar" ? "كلمات" : "Keywords"}</SelectItem>
                <SelectItem value="trending_products">{language === "ar" ? "منتجات" : "Products"}</SelectItem>
                <SelectItem value="keyword_analysis">{language === "ar" ? "تحليل" : "Analysis"}</SelectItem>
                <SelectItem value="market_overview">{language === "ar" ? "السوق" : "Market"}</SelectItem>
                <SelectItem value="competitor_analysis">{language === "ar" ? "منافسون" : "Competitors"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {language === "ar"
                  ? "لا توجد تقارير بعد. قم بتشغيل تحليل شامل لبدء التتبع."
                  : "No reports yet. Run a full analysis to start tracking."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                  <TableHead>{language === "ar" ? "النوع" : "Type"}</TableHead>
                  <TableHead>{language === "ar" ? "الاستعلام" : "Query"}</TableHead>
                  <TableHead>{language === "ar" ? "المصدر" : "Source"}</TableHead>
                  <TableHead>{language === "ar" ? "الملخص" : "Summary"}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((report) => {
                  const typeInfo = typeLabels[report.analysis_type] || { en: report.analysis_type, ar: report.analysis_type, color: "" };
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {format(new Date(report.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${typeInfo.color}`}>
                          {language === "ar" ? typeInfo.ar : typeInfo.en}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                        {report.query || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {report.triggered_by}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {report.summary || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "ar" ? "حذف التقرير؟" : "Delete report?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "ar"
                                    ? "سيتم حذف هذا التقرير بشكل دائم."
                                    : "This report will be permanently deleted."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{language === "ar" ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteReport(report.id)}>
                                  {language === "ar" ? "حذف" : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Expanded Report View */}
      {expandedId && (
        <ReportDetail
          report={filtered.find((r) => r.id === expandedId)!}
          onClose={() => setExpandedId(null)}
        />
      )}
    </div>
  );
}

function ReportDetail({ report, onClose }: { report: TrendReport; onClose: () => void }) {
  const { language } = useLanguage();
  if (!report) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            {language === "ar" ? "تفاصيل التقرير" : "Report Details"} — {format(new Date(report.created_at), "MMM d, yyyy HH:mm")}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted rounded-lg p-4 overflow-auto max-h-[400px] whitespace-pre-wrap">
          {JSON.stringify(report.result, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
