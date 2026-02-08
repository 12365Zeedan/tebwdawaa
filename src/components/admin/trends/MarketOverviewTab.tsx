import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Search, Lightbulb, AlertTriangle, TrendingUp, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { MarketOverview } from "@/hooks/useTrendsAgent";

interface MarketOverviewTabProps {
  overview: MarketOverview | null;
  isLoading: boolean;
  onAnalyze: (query?: string) => void;
}

export function MarketOverviewTab({ overview, isLoading, onAnalyze }: MarketOverviewTabProps) {
  const { language } = useLanguage();
  const [focusQuery, setFocusQuery] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {language === "ar" ? "نظرة عامة على السوق" : "Market Overview"}
          </CardTitle>
          <CardDescription>
            {language === "ar"
              ? "تحليل شامل لسوق مستحضرات التجميل والصيدليات في المملكة العربية السعودية"
              : "Comprehensive analysis of the Saudi cosmetics, beauty & pharmacy market"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={language === "ar" ? "تركيز اختياري (مثال: عناية بالبشرة)" : "Optional focus (e.g., skincare market)"}
              value={focusQuery}
              onChange={(e) => setFocusQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && onAnalyze(focusQuery || undefined)}
            />
            <Button onClick={() => onAnalyze(focusQuery || undefined)} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? (language === "ar" ? "جاري التحليل..." : "Analyzing...") : (language === "ar" ? "تحليل" : "Analyze")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      )}

      {overview && !isLoading && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-1">{language === "ar" ? "حجم السوق" : "Market Size"}</p>
                <p className="font-bold text-lg">{overview.market_size}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 dark:from-green-950 dark:to-green-900/50 dark:border-green-800">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-1">{language === "ar" ? "معدل النمو" : "Growth Rate"}</p>
                <p className="font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  {overview.growth_rate}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{language === "ar" ? "أفضل الفئات" : "Top Categories"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overview.top_categories.map((cat, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {cat.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consumer Insights */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  {language === "ar" ? "رؤى المستهلكين" : "Consumer Insights"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {overview.consumer_insights.map((insight, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Platform Breakdown */}
            {overview.platform_breakdown && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {language === "ar" ? "المنصات" : "Platform Breakdown"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(overview.platform_breakdown).map(([platform, importance], i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                        <span className="text-sm font-medium">{platform}</span>
                        <span className="text-xs text-muted-foreground">{importance}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunities */}
            {overview.upcoming_opportunities && overview.upcoming_opportunities.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    {language === "ar" ? "الفرص القادمة" : "Upcoming Opportunities"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {overview.upcoming_opportunities.map((opp, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-1">→</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Challenges */}
            {overview.challenges && overview.challenges.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    {language === "ar" ? "التحديات" : "Challenges"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {overview.challenges.map((ch, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-orange-500 font-bold mt-1">!</span>
                        <span>{ch}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                {language === "ar" ? "التوصيات" : "Actionable Recommendations"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {overview.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm">{rec}</p>
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
