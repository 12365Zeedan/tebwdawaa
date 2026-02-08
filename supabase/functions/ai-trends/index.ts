import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, query, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "ar" ? "Arabic" : "English";
    const nicheContext = `You are an expert market analyst specializing in cosmetics, beauty, skincare, pharmacy, health supplements, and medicine in the Saudi Arabian market. You understand Saudi consumer behavior, seasonal trends (Ramadan, Hajj, National Day, summer), popular local and international brands, and Arabic/English search patterns. Always provide data relevant to the Saudi market.`;

    let systemPrompt = nicheContext;
    let userPrompt = "";

    switch (type) {
      case "trending_keywords":
        systemPrompt += `\n\nYou detect and analyze trending keywords in the cosmetics, beauty, pharmacy, and health sectors for the Saudi Arabian market. Consider both Arabic and English keywords Saudi consumers use.`;
        userPrompt = `Analyze the current trending keywords for the Saudi cosmetics, beauty, pharmacy, and health market. ${query ? `Focus area: ${query}` : ""}

Return your analysis using this exact JSON structure via the provided tool.

For each keyword include:
- keyword (in ${lang})
- keyword_ar (Arabic version)  
- keyword_en (English version)
- search_volume: estimated monthly search volume (high/medium/low)
- trend_direction: "rising", "stable", or "declining"
- competition: "high", "medium", or "low"
- relevance_score: 1-100
- category: one of "cosmetics", "skincare", "pharmacy", "health", "beauty_tools", "fragrance", "hair_care"
- seasonal: boolean indicating if it's seasonal
- tip: a brief actionable tip for using this keyword`;
        break;

      case "trending_products":
        systemPrompt += `\n\nYou identify trending products across platforms (Instagram, TikTok, Twitter/X, Amazon.sa, Noon, pharmacies) in the Saudi market for cosmetics, beauty, pharmacy, and health sectors.`;
        userPrompt = `Identify the current trending products in the Saudi cosmetics, beauty, pharmacy, and health market. ${query ? `Focus area: ${query}` : ""}

Return your analysis using this exact JSON structure via the provided tool.

For each product include:
- name (in ${lang})
- name_ar (Arabic name)
- name_en (English name)
- brand: brand name
- category: one of "cosmetics", "skincare", "pharmacy", "health", "beauty_tools", "fragrance", "hair_care"
- platform: where it's trending (e.g., "TikTok", "Instagram", "Amazon.sa", "Noon", "Pharmacies")
- trend_score: 1-100
- price_range: estimated SAR price range
- why_trending: brief explanation of why it's trending
- target_audience: who is buying it
- recommendation: actionable recommendation for the store owner`;
        break;

      case "keyword_analysis":
        systemPrompt += `\n\nYou provide deep keyword analysis including search intent, competition, and content strategy recommendations for the Saudi market.`;
        userPrompt = `Provide a deep keyword analysis for: "${query}" in the Saudi cosmetics/beauty/pharmacy market.

Return your analysis using this exact JSON structure via the provided tool.

Include:
- primary_keyword: the main keyword analyzed
- search_intent: "informational", "commercial", "transactional", or "navigational"
- monthly_volume_estimate: estimated monthly searches
- difficulty: 1-100
- cpc_estimate: estimated cost-per-click in SAR
- related_keywords: array of 8-10 related keywords with their volumes
- long_tail_variations: array of 5-7 long-tail keyword variations
- content_ideas: array of 3-5 content/blog ideas using this keyword
- product_opportunities: array of 2-3 product listing optimization tips
- arabic_variations: array of Arabic keyword variations
- seasonal_notes: any seasonal relevance`;
        break;

      case "market_overview":
        systemPrompt += `\n\nYou provide comprehensive market overviews of the Saudi cosmetics, beauty, pharmacy, and health sectors with actionable business insights.`;
        userPrompt = `Provide a market overview for the Saudi cosmetics, beauty, pharmacy, and health market. ${query ? `Focus: ${query}` : ""}

Return your analysis using this exact JSON structure via the provided tool.

Include:
- market_size: brief description of market size
- growth_rate: estimated growth
- top_categories: array of top 5 performing categories with growth %
- consumer_insights: array of 5 key consumer behavior insights
- platform_breakdown: object with platform names and their importance (Instagram, TikTok, Snapchat, Twitter/X, Amazon.sa, Noon)
- upcoming_opportunities: array of 3-5 upcoming market opportunities
- challenges: array of 2-3 market challenges
- recommendations: array of 5 actionable recommendations`;
        break;

      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }

    // Define tools for structured output
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "return_analysis",
          description: "Return the structured analysis results",
          parameters: getParametersForType(type),
        },
      },
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools,
          tool_choice: {
            type: "function",
            function: { name: "return_analysis" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;
    if (toolCall?.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch {
        result = toolCall.function.arguments;
      }
    } else {
      // Fallback to message content
      result = data.choices?.[0]?.message?.content;
    }

    return new Response(JSON.stringify({ result, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-trends error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getParametersForType(type: string) {
  switch (type) {
    case "trending_keywords":
      return {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string" },
                keyword_ar: { type: "string" },
                keyword_en: { type: "string" },
                search_volume: { type: "string", enum: ["high", "medium", "low"] },
                trend_direction: { type: "string", enum: ["rising", "stable", "declining"] },
                competition: { type: "string", enum: ["high", "medium", "low"] },
                relevance_score: { type: "number" },
                category: { type: "string" },
                seasonal: { type: "boolean" },
                tip: { type: "string" },
              },
              required: ["keyword", "keyword_ar", "keyword_en", "search_volume", "trend_direction", "competition", "relevance_score", "category", "tip"],
            },
          },
          summary: { type: "string" },
        },
        required: ["keywords", "summary"],
      };

    case "trending_products":
      return {
        type: "object",
        properties: {
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                name_ar: { type: "string" },
                name_en: { type: "string" },
                brand: { type: "string" },
                category: { type: "string" },
                platform: { type: "string" },
                trend_score: { type: "number" },
                price_range: { type: "string" },
                why_trending: { type: "string" },
                target_audience: { type: "string" },
                recommendation: { type: "string" },
              },
              required: ["name", "name_ar", "name_en", "brand", "category", "platform", "trend_score", "why_trending", "recommendation"],
            },
          },
          summary: { type: "string" },
        },
        required: ["products", "summary"],
      };

    case "keyword_analysis":
      return {
        type: "object",
        properties: {
          primary_keyword: { type: "string" },
          search_intent: { type: "string" },
          monthly_volume_estimate: { type: "string" },
          difficulty: { type: "number" },
          cpc_estimate: { type: "string" },
          related_keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string" },
                volume: { type: "string" },
              },
              required: ["keyword", "volume"],
            },
          },
          long_tail_variations: { type: "array", items: { type: "string" } },
          content_ideas: { type: "array", items: { type: "string" } },
          product_opportunities: { type: "array", items: { type: "string" } },
          arabic_variations: { type: "array", items: { type: "string" } },
          seasonal_notes: { type: "string" },
        },
        required: ["primary_keyword", "search_intent", "difficulty", "related_keywords", "long_tail_variations", "content_ideas"],
      };

    case "market_overview":
      return {
        type: "object",
        properties: {
          market_size: { type: "string" },
          growth_rate: { type: "string" },
          top_categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                growth: { type: "string" },
              },
              required: ["name", "growth"],
            },
          },
          consumer_insights: { type: "array", items: { type: "string" } },
          platform_breakdown: {
            type: "object",
            additionalProperties: { type: "string" },
          },
          upcoming_opportunities: { type: "array", items: { type: "string" } },
          challenges: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
        },
        required: ["market_size", "growth_rate", "top_categories", "consumer_insights", "recommendations"],
      };

    default:
      return { type: "object", properties: {}, required: [] };
  }
}
