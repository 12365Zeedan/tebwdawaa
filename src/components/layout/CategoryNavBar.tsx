import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number | null;
  parent_category_id: string | null;
}

function useAllCategories() {
  return useQuery({
    queryKey: ["all-categories-nav"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function CategoryNavBar() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { data: categories } = useAllCategories();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const parentCategories = categories?.filter((c) => !c.parent_category_id) || [];
  const getSubcategories = (parentId: string) =>
    categories?.filter((c) => c.parent_category_id === parentId) || [];

  if (parentCategories.length === 0) return null;

  return (
    <div
      className={cn(
        "w-full bg-white border-b border-border/30 z-40 relative",
        theme.header.sticky && "sticky top-12 md:top-16"
      )}
    >
      {/* Category links bar */}
      <div
        className={cn(
          "gap-0.5 overflow-x-auto scrollbar-hide flex items-center justify-center",
          theme.header.fullWidth ? "px-4 sm:px-8" : "container"
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {parentCategories.map((cat) => {
          const subs = getSubcategories(cat.id);
          const hasSubs = subs.length > 0;
          const isHovered = hoveredId === cat.id;

          return (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link
                to={`/categories/${cat.slug}`}
                className={cn(
                  "flex items-center gap-1 px-4 py-2.5 whitespace-nowrap transition-colors text-[#01012d] hover:text-primary text-base font-semibold",
                  isHovered && "text-primary"
                )}
              >
                {language === "ar" ? cat.name_ar : cat.name}
                {hasSubs && (
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isHovered && "rotate-180"
                    )}
                  />
                )}
              </Link>

              {/* Popup dropdown on hover */}
              {hasSubs && isHovered && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 z-50">
                  <div className="bg-popover rounded-lg border border-border shadow-xl min-w-[200px] py-2 animate-fade-in">
                    {/* "All" link */}
                    <Link
                      to={`/categories/${cat.slug}`}
                      className="block px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                    >
                      {language === "ar"
                        ? `كل ${cat.name_ar}`
                        : `All ${cat.name}`}
                    </Link>
                    <div className="h-px bg-border mx-3 my-1" />
                    {subs.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/categories/${sub.slug}`}
                        className="block px-4 py-2 text-sm text-popover-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        {language === "ar" ? sub.name_ar : sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
