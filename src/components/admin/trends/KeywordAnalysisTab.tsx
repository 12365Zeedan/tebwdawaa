import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Search, Target, Lightbulb, FileText, ShoppingCart, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { KeywordAnalysis } from "@/hooks/useTrendsAgent";

interface KeywordAnalysisTabProps {
  analysis: KeywordAnalysis | null;
  isLoading: boolean;
  onAnalyze: (query: string) => void;
}

export function KeywordAnalysisTab({ analysis, isLoading, onAnalyze }: KeywordAnalysisTabProps) {
  const { language } = useLanguage();
  const [keyword, setKeyword] = useState("");

  const handleAnalyze = () => {
    if (!keyword.trim()) return;
    onAnalyze(keyword.trim());
  };

  const intentColors: Record<string, string> = {
    informational: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    commercial: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    transactional: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    navigational: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {language === "ar" ? "تحليل الكلمة المفتاحية" : "Deep Keyword Analysis"}
          </CardTitle>
          <CardDescription>
            {language === "ar"
              ? "أدخل كلمة مفتاحية للحصول على تحليل معمّق يشمل حجم البحث والمنافسة وأفكار المحتوى"
              : "Enter a keyword for deep analysis including search volume, competition, and content ideas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={language === "ar" ? "أدخل كلمة مفتاحية (مثال: vitamin c serum)" : "Enter keyword (e.g., vitamin c serum)"}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <Button onClick={handleAnalyze} disabled={isLoading || !keyword.trim()}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? (language === "ar" ? "جاري التحليل..." : "Analyzing...") : (language === "ar" ? "تحليل" : "Analyze")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      )}

      {/* Results */}
      {analysis && !isLoading && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{language === "ar" ? "الكلمة" : "Keyword"}</p>
                <p className="font-bold text-lg">{analysis.primary_keyword}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{language === "ar" ? "نية البحث" : "Search Intent"}</p>
                <Badge className={`${intentColors[analysis.search_intent] || ""} capitalize`}>
                  {analysis.search_intent}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{language === "ar" ? "الصعوبة" : "Difficulty"}</p>
                <div className="space-y-1">
                  <p className="font-bold text-lg">{analysis.difficulty}/100</p>
                  <Progress value={analysis.difficulty} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{language === "ar" ? "الحجم الشهري" : "Monthly Volume"}</p>
                <p className="font-bold text-lg">{analysis.monthly_volume_estimate || "N/A"}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Related Keywords */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {language === "ar" ? "كلمات ذات صلة" : "Related Keywords"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.related_keywords.map((rk, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                      <span className="text-sm">{rk.keyword}</span>
                      <Badge variant="outline" className="text-xs">{rk.volume}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Long-tail Variations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {language === "ar" ? "كلمات طويلة الذيل" : "Long-tail Variations"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.long_tail_variations.map((lt, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{lt}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Ideas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {language === "ar" ? "أفكار محتوى" : "Content Ideas"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.content_ideas.map((idea, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {idea}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Arabic Variations */}
            {analysis.arabic_variations && analysis.arabic_variations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    {language === "ar" ? "تنويعات عربية" : "Arabic Variations"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2" dir="rtl">
                    {analysis.arabic_variations.map((av, i) => (
                      <Badge key={i} variant="outline" className="font-arabic text-xs">{av}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Product Opportunities & Seasonal */}
          {(analysis.product_opportunities?.length || analysis.seasonal_notes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.product_opportunities && analysis.product_opportunities.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {language === "ar" ? "فرص المنتجات" : "Product Opportunities"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.product_opportunities.map((po, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary font-bold">•</span> {po}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {analysis.seasonal_notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{language === "ar" ? "ملاحظات موسمية" : "Seasonal Notes"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{analysis.seasonal_notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
