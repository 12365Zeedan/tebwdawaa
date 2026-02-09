import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Search, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendsPagination, usePagination } from "./TrendsPagination";
import type { TrendingProduct } from "@/hooks/useTrendsAgent";

interface TrendingProductsTabProps {
  products: { products: TrendingProduct[]; summary: string } | null;
  isLoading: boolean;
  onAnalyze: (query?: string) => void;
}

const platformColors: Record<string, string> = {
  TikTok: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  Instagram: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Amazon.sa": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Noon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Snapchat: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "Twitter/X": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Pharmacies: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const categoryIcons: Record<string, string> = {
  cosmetics: "💄",
  skincare: "🧴",
  pharmacy: "💊",
  health: "🏥",
  beauty_tools: "💅",
  fragrance: "🌸",
  hair_care: "💇",
};

const ITEMS_PER_PAGE = 8;

export function TrendingProductsTab({ products, isLoading, onAnalyze }: TrendingProductsTabProps) {
  const { language } = useLanguage();
  const [focusQuery, setFocusQuery] = useState("");

  const sortedProducts = products
    ? [...products.products].sort((a, b) => b.trend_score - a.trend_score)
    : [];

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    setCurrentPage,
    resetPage,
  } = usePagination(sortedProducts, ITEMS_PER_PAGE);

  // Reset page when new results arrive
  useEffect(() => {
    resetPage();
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {language === "ar" ? "المنتجات الرائجة" : "Trending Products"}
          </CardTitle>
          <CardDescription>
            {language === "ar"
              ? "اكتشف المنتجات الأكثر رواجاً عبر المنصات المختلفة في السوق السعودي"
              : "Discover trending products across platforms in the Saudi market"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={language === "ar" ? "تركيز اختياري (مثال: سيروم، فيتامين)" : "Optional focus (e.g., serum, vitamin, SPF)"}
              value={focusQuery}
              onChange={(e) => setFocusQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && onAnalyze(focusQuery || undefined)}
            />
            <Button onClick={() => onAnalyze(focusQuery || undefined)} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading
                ? language === "ar" ? "جاري البحث..." : "Searching..."
                : language === "ar" ? "بحث" : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {products && !isLoading && (
        <>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{products.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedItems.map((product, idx) => {
              const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
              return (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
                          <span className="text-lg">{categoryIcons[product.category] || "📦"}</span>
                          <h3 className="font-semibold text-sm">{product.name_en}</h3>
                        </div>
                        <p className="text-xs font-arabic text-muted-foreground" dir="rtl">{product.name_ar}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 text-primary fill-primary" />
                        <span className="text-xs font-bold text-primary">{product.trend_score}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">{product.brand}</Badge>
                      <Badge className={`text-xs ${platformColors[product.platform] || "bg-gray-100 text-gray-800"}`}>
                        {product.platform}
                      </Badge>
                      {product.price_range && (
                        <Badge variant="outline" className="text-xs">{product.price_range}</Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>{language === "ar" ? "لماذا رائج:" : "Why trending:"}</strong> {product.why_trending}
                    </p>

                    {product.target_audience && (
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>{language === "ar" ? "الجمهور:" : "Audience:"}</strong> {product.target_audience}
                      </p>
                    )}

                    <div className="mt-3 p-2 bg-primary/5 rounded-md border border-primary/10">
                      <p className="text-xs font-medium text-primary">
                        💡 {product.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-0">
              <TrendsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
