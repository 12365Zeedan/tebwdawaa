import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type AnalysisType = 'trending_keywords' | 'trending_products' | 'keyword_analysis' | 'market_overview' | 'competitor_analysis';

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

export interface Competitor {
  name: string;
  name_ar: string;
  type: 'online_store' | 'pharmacy_chain' | 'marketplace' | 'brand_direct' | 'social_seller';
  categories: string[];
  price_positioning: 'budget' | 'mid_range' | 'premium' | 'luxury';
  strengths: string[];
  weaknesses: string[];
  estimated_market_share?: string;
  popular_products?: string[];
  pricing_strategy: string;
  online_presence?: Record<string, string>;
  threat_level: 'high' | 'medium' | 'low';
}

export interface CompetitorAnalysis {
  competitors: Competitor[];
  market_gaps: string[];
  pricing_insights: string[];
  differentiation_ideas: string[];
  summary: string;
}

export interface TrendReport {
  id: string;
  analysis_type: string;
  query: string | null;
  language: string;
  result: any;
  summary: string | null;
  triggered_by: string;
  created_at: string;
}

export function useTrendsAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState<{ keywords: TrendingKeyword[]; summary: string } | null>(null);
  const [trendingProducts, setTrendingProducts] = useState<{ products: TrendingProduct[]; summary: string } | null>(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis | null>(null);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);
  const queryClient = useQueryClient();

  const analyze = async (type: AnalysisType, query?: string, language: string = 'en', saveToHistory: boolean | string = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trends', {
        body: { type, query, language, saveToHistory: saveToHistory || undefined },
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
        case 'competitor_analysis':
          setCompetitorAnalysis(result);
          break;
      }

      if (saveToHistory) {
        queryClient.invalidateQueries({ queryKey: ['trend-reports'] });
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
    competitorAnalysis,
    analyze,
  };
}

export function useTrendReports() {
  return useQuery({
    queryKey: ['trend-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trend_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as TrendReport[];
    },
  });
}

export function useDeleteTrendReport() {
  const queryClient = useQueryClient();

  return async (id: string) => {
    const { error } = await supabase.from('trend_reports').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete report');
      throw error;
    }
    queryClient.invalidateQueries({ queryKey: ['trend-reports'] });
    toast.success('Report deleted');
  };
}
