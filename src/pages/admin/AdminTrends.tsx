import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrendsAgent, type AnalysisType } from "@/hooks/useTrendsAgent";
import { TrendingKeywordsTab } from "@/components/admin/trends/TrendingKeywordsTab";
import { TrendingProductsTab } from "@/components/admin/trends/TrendingProductsTab";
import { KeywordAnalysisTab } from "@/components/admin/trends/KeywordAnalysisTab";
import { MarketOverviewTab } from "@/components/admin/trends/MarketOverviewTab";
import { CompetitorAnalysisTab } from "@/components/admin/trends/CompetitorAnalysisTab";
import { TrendHistoryTab } from "@/components/admin/trends/TrendHistoryTab";
import { Bot, TrendingUp, ShoppingBag, Target, BarChart3, Swords, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminTrends() {
  const { language } = useLanguage();
  const { isLoading, trendingKeywords, trendingProducts, keywordAnalysis, marketOverview, competitorAnalysis, analyze } = useTrendsAgent();
  const [isScheduledRunning, setIsScheduledRunning] = useState(false);

  const handleRunScheduled = async (types: AnalysisType[]) => {
    setIsScheduledRunning(true);
    try {
      for (const type of types) {
        await analyze(type, undefined, language, "scheduled");
      }
      toast.success(language === "ar" ? "تم حفظ جميع التقارير بنجاح" : "All reports saved successfully");
    } catch {
      toast.error(language === "ar" ? "حدث خطأ أثناء التحليل" : "Error during analysis");
    } finally {
      setIsScheduledRunning(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {language === "ar" ? "وكيل الاتجاهات الذكي" : "AI Trends Agent"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "ar"
                ? "تحليل الكلمات المفتاحية والمنتجات الرائجة والمنافسين في سوق مستحضرات التجميل والصيدليات السعودي"
                : "Keywords, trends, competitor analysis & market insights for Saudi cosmetics & pharmacy"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="keywords" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="keywords" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "الكلمات الرائجة" : "Keywords"}</span>
              <span className="sm:hidden">{language === "ar" ? "كلمات" : "KW"}</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "المنتجات" : "Products"}</span>
              <span className="sm:hidden">{language === "ar" ? "منتجات" : "Prod"}</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "تحليل" : "Analysis"}</span>
              <span className="sm:hidden">{language === "ar" ? "تحليل" : "Anlz"}</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "السوق" : "Market"}</span>
              <span className="sm:hidden">{language === "ar" ? "السوق" : "Mkt"}</span>
            </TabsTrigger>
            <TabsTrigger value="competitors" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Swords className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "المنافسون" : "Competitors"}</span>
              <span className="sm:hidden">{language === "ar" ? "منافسون" : "Comp"}</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "السجل" : "History"}</span>
              <span className="sm:hidden">{language === "ar" ? "سجل" : "Hist"}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keywords">
            <TrendingKeywordsTab
              keywords={trendingKeywords}
              isLoading={isLoading}
              onAnalyze={(q) => analyze("trending_keywords", q, language)}
            />
          </TabsContent>

          <TabsContent value="products">
            <TrendingProductsTab
              products={trendingProducts}
              isLoading={isLoading}
              onAnalyze={(q) => analyze("trending_products", q, language)}
            />
          </TabsContent>

          <TabsContent value="analysis">
            <KeywordAnalysisTab
              analysis={keywordAnalysis}
              isLoading={isLoading}
              onAnalyze={(q) => analyze("keyword_analysis", q, language)}
            />
          </TabsContent>

          <TabsContent value="market">
            <MarketOverviewTab
              overview={marketOverview}
              isLoading={isLoading}
              onAnalyze={(q) => analyze("market_overview", q, language)}
            />
          </TabsContent>

          <TabsContent value="competitors">
            <CompetitorAnalysisTab
              analysis={competitorAnalysis}
              isLoading={isLoading}
              onAnalyze={(q) => analyze("competitor_analysis", q, language)}
            />
          </TabsContent>

          <TabsContent value="history">
            <TrendHistoryTab
              isAnalyzing={isScheduledRunning || isLoading}
              onRunScheduled={handleRunScheduled}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
