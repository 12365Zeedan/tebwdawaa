import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Search, Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TrendingKeyword } from "@/hooks/useTrendsAgent";

interface TrendingKeywordsTabProps {
  keywords: { keywords: TrendingKeyword[]; summary: string } | null;
  isLoading: boolean;
  onAnalyze: (query?: string) => void;
}

export function TrendingKeywordsTab({ keywords, isLoading, onAnalyze }: TrendingKeywordsTabProps) {
  const { language } = useLanguage();
  const [focusQuery, setFocusQuery] = useState("");

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "rising": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getVolumeBadge = (vol: string) => {
    const colors: Record<string, string> = {
      high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
    return <Badge className={colors[vol] || ""}>{vol}</Badge>;
  };

  const getCompetitionBadge = (comp: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    };
    return <Badge className={colors[comp] || ""}>{comp}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Search + Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {language === "ar" ? "اكتشاف الكلمات الرائجة" : "Discover Trending Keywords"}
          </CardTitle>
          <CardDescription>
            {language === "ar"
              ? "اكتشف الكلمات المفتاحية الرائجة في سوق مستحضرات التجميل والصيدليات في السعودية"
              : "Discover trending keywords in the Saudi cosmetics, beauty & pharmacy market"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={language === "ar" ? "تركيز اختياري (مثال: عناية بالبشرة)" : "Optional focus (e.g., skincare, vitamin C)"}
              value={focusQuery}
              onChange={(e) => setFocusQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && onAnalyze(focusQuery || undefined)}
            />
            <Button onClick={() => onAnalyze(focusQuery || undefined)} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading
                ? language === "ar" ? "جاري التحليل..." : "Analyzing..."
                : language === "ar" ? "تحليل" : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {keywords && !isLoading && (
        <>
          {/* Summary */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{keywords.summary}</p>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "ar" ? "الكلمة المفتاحية" : "Keyword"}</TableHead>
                    <TableHead>{language === "ar" ? "عربي" : "Arabic"}</TableHead>
                    <TableHead>{language === "ar" ? "الاتجاه" : "Trend"}</TableHead>
                    <TableHead>{language === "ar" ? "الحجم" : "Volume"}</TableHead>
                    <TableHead>{language === "ar" ? "المنافسة" : "Competition"}</TableHead>
                    <TableHead>{language === "ar" ? "الملاءمة" : "Score"}</TableHead>
                    <TableHead>{language === "ar" ? "الفئة" : "Category"}</TableHead>
                    <TableHead>{language === "ar" ? "نصيحة" : "Tip"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywords.keywords.map((kw, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{kw.keyword_en}</TableCell>
                      <TableCell className="font-arabic text-right" dir="rtl">{kw.keyword_ar}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(kw.trend_direction)}
                          <span className="text-xs capitalize">{kw.trend_direction}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getVolumeBadge(kw.search_volume)}</TableCell>
                      <TableCell>{getCompetitionBadge(kw.competition)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${kw.relevance_score}%` }}
                            />
                          </div>
                          <span className="text-xs">{kw.relevance_score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">{kw.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={kw.tip}>
                        {kw.tip}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
