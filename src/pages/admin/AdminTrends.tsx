import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrendsAgent } from "@/hooks/useTrendsAgent";
import { TrendingKeywordsTab } from "@/components/admin/trends/TrendingKeywordsTab";
import { TrendingProductsTab } from "@/components/admin/trends/TrendingProductsTab";
import { KeywordAnalysisTab } from "@/components/admin/trends/KeywordAnalysisTab";
import { MarketOverviewTab } from "@/components/admin/trends/MarketOverviewTab";
import { Bot, TrendingUp, ShoppingBag, Target, BarChart3 } from "lucide-react";

export default function AdminTrends() {
  const { language } = useLanguage();
  const { isLoading, trendingKeywords, trendingProducts, keywordAnalysis, marketOverview, analyze } = useTrendsAgent();

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
                ? "تحليل الكلمات المفتاحية والمنتجات الرائجة في سوق مستحضرات التجميل والصيدليات السعودي"
                : "Keyword detection, trending products & market analysis for Saudi cosmetics & pharmacy"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="keywords" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="keywords" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "الكلمات الرائجة" : "Trending Keywords"}</span>
              <span className="sm:hidden">{language === "ar" ? "كلمات" : "Keywords"}</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "المنتجات الرائجة" : "Trending Products"}</span>
              <span className="sm:hidden">{language === "ar" ? "منتجات" : "Products"}</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "تحليل الكلمات" : "Keyword Analysis"}</span>
              <span className="sm:hidden">{language === "ar" ? "تحليل" : "Analysis"}</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "ar" ? "نظرة السوق" : "Market Overview"}</span>
              <span className="sm:hidden">{language === "ar" ? "السوق" : "Market"}</span>
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
