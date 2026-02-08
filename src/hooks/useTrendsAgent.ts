import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AnalysisType = 'trending_keywords' | 'trending_products' | 'keyword_analysis' | 'market_overview';

export interface TrendingKeyword {
  keyword: string;
  keyword_ar: string;
  keyword_en: string;
  search_volume: 'high' | 'medium' | 'low';
  trend_direction: 'rising' | 'stable' | 'declining';
  competition: 'high' | 'medium' | 'low';
  relevance_score: number;
  category: string;
  seasonal?: boolean;
  tip: string;
}

export interface TrendingProduct {
  name: string;
  name_ar: string;
  name_en: string;
  brand: string;
  category: string;
  platform: string;
  trend_score: number;
  price_range?: string;
  why_trending: string;
  target_audience?: string;
  recommendation: string;
}

export interface KeywordAnalysis {
  primary_keyword: string;
  search_intent: string;
  monthly_volume_estimate?: string;
  difficulty: number;
  cpc_estimate?: string;
  related_keywords: { keyword: string; volume: string }[];
  long_tail_variations: string[];
  content_ideas: string[];
  product_opportunities?: string[];
  arabic_variations?: string[];
  seasonal_notes?: string;
}

export interface MarketOverview {
  market_size: string;
  growth_rate: string;
  top_categories: { name: string; growth: string }[];
  consumer_insights: string[];
  platform_breakdown?: Record<string, string>;
  upcoming_opportunities?: string[];
  challenges?: string[];
  recommendations: string[];
}

export function useTrendsAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState<{ keywords: TrendingKeyword[]; summary: string } | null>(null);
  const [trendingProducts, setTrendingProducts] = useState<{ products: TrendingProduct[]; summary: string } | null>(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis | null>(null);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);

  const analyze = async (type: AnalysisType, query?: string, language: string = 'en') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trends', {
        body: { type, query, language },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const result = data?.result;
      if (!result) {
        toast.error('No results returned from analysis');
        return;
      }

      switch (type) {
        case 'trending_keywords':
          setTrendingKeywords(result);
          break;
        case 'trending_products':
          setTrendingProducts(result);
          break;
        case 'keyword_analysis':
          setKeywordAnalysis(result);
          break;
        case 'market_overview':
          setMarketOverview(result);
          break;
      }

      toast.success('Analysis complete!');
    } catch (err: any) {
      console.error('Trends analysis error:', err);
      toast.error(err.message || 'Failed to run analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    trendingKeywords,
    trendingProducts,
    keywordAnalysis,
    marketOverview,
    analyze,
  };
}
