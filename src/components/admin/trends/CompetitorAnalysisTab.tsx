import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Swords, Shield, Lightbulb, TrendingUp, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendsPagination, usePagination } from "./TrendsPagination";
import type { CompetitorAnalysis, Competitor } from "@/hooks/useTrendsAgent";

interface CompetitorAnalysisTabProps {
  analysis: CompetitorAnalysis | null;
  isLoading: boolean;
  onAnalyze: (query?: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function CompetitorAnalysisTab({ analysis, isLoading, onAnalyze }: CompetitorAnalysisTabProps) {
  const { language } = useLanguage();
  const [focusQuery, setFocusQuery] = useState("");

  const competitors = analysis?.competitors || [];

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    setCurrentPage,
    resetPage,
  } = usePagination(competitors, ITEMS_PER_PAGE);

  useEffect(() => {
    resetPage();
  }, [analysis]);

  const getThreatBadge = (level: string) => {
    const styles: Record<string, string> = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    };
    return <Badge className={styles[level] || ""}>{level}</Badge>;
  };

  const getPriceBadge = (pos: string) => {
    const labels: Record<string, string> = {
      budget: "💰 Budget",
      mid_range: "⚖️ Mid-Range",
      premium: "✨ Premium",
      luxury: "👑 Luxury",
    };
    return <Badge variant="outline" className="text-xs">{labels[pos] || pos}</Badge>;
  };

  const getTypeBadge = (t: string) => {
    const labels: Record<string, string> = {
      online_store: language === "ar" ? "متجر إلكتروني" : "Online Store",
      pharmacy_chain: language === "ar" ? "سلسلة صيدليات" : "Pharmacy Chain",
      marketplace: language === "ar" ? "سوق إلكتروني" : "Marketplace",
      brand_direct: language === "ar" ? "بيع مباشر" : "Brand Direct",
      social_seller: language === "ar" ? "بائع تواصل" : "Social Seller",
    };
    return <Badge variant="secondary" className="text-xs">{labels[t] || t}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            {language === "ar" ? "تحليل المنافسين" : "Competitor Analysis"}
          </CardTitle>
          <CardDescription>
            {language === "ar"
              ? "تحليل استراتيجيات المنافسين والتسعير والمنتجات في السوق السعودي"
              : "Analyze competitor strategies, pricing & product offerings in the Saudi market"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={language === "ar" ? "تركيز اختياري (مثال: صيدليات، عناية بالبشرة)" : "Optional focus (e.g., pharmacy chains, skincare brands)"}
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

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {analysis && !isLoading && (
        <>
          {/* Summary */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Competitors Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {language === "ar" ? "المنافسون" : "Competitors"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>{language === "ar" ? "المنافس" : "Competitor"}</TableHead>
                    <TableHead>{language === "ar" ? "النوع" : "Type"}</TableHead>
                    <TableHead>{language === "ar" ? "التسعير" : "Pricing"}</TableHead>
                    <TableHead>{language === "ar" ? "التهديد" : "Threat"}</TableHead>
                    <TableHead>{language === "ar" ? "نقاط القوة" : "Strengths"}</TableHead>
                    <TableHead>{language === "ar" ? "نقاط الضعف" : "Weaknesses"}</TableHead>
                    <TableHead>{language === "ar" ? "الاستراتيجية" : "Strategy"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((comp, idx) => {
                    const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    return (
                      <TableRow key={idx}>
                        <TableCell className="text-xs text-muted-foreground font-medium">{rank}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{comp.name}</p>
                            <p className="text-xs text-muted-foreground" dir="rtl">{comp.name_ar}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(comp.type)}</TableCell>
                        <TableCell>{getPriceBadge(comp.price_positioning)}</TableCell>
                        <TableCell>{getThreatBadge(comp.threat_level)}</TableCell>
                        <TableCell>
                          <ul className="text-xs space-y-0.5">
                            {comp.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell>
                          <ul className="text-xs space-y-0.5">
                            {comp.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-red-500 mt-0.5">✗</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px]">
                          {comp.pricing_strategy}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TrendsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Market Gaps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  {language === "ar" ? "فجوات السوق" : "Market Gaps & Opportunities"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.market_gaps.map((gap, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">→</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pricing Insights */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {language === "ar" ? "رؤى التسعير" : "Pricing Insights"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.pricing_insights.map((insight, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Differentiation Ideas */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                {language === "ar" ? "أفكار التمييز" : "Differentiation Ideas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.differentiation_ideas.map((idea, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm">{idea}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
