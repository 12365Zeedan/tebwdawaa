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
    <nav
      className={cn(
        "w-full bg-white border-b border-border/30 z-40",
        theme.header.sticky && "sticky top-12 md:top-16"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          theme.header.fullWidth ? "px-4 sm:px-8" : "container"
        )}
      >
        <div
          className="flex items-center overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {parentCategories.map((cat) => {
            const subs = getSubcategories(cat.id);
            const hasSubs = subs.length > 0;
            const isHovered = hoveredId === cat.id;

            return (
              <div
                key={cat.id}
                className="relative flex-shrink-0"
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

                {/* Dropdown list on hover */}
                {hasSubs && isHovered && (
                  <div
                    className="absolute top-full left-0 pt-0 z-50"
                    style={{ minWidth: "220px" }}
                  >
                    <div className="bg-popover rounded-b-lg border border-t-2 border-t-primary border-border shadow-lg py-1 animate-fade-in">
                      <Link
                        to={`/categories/${cat.slug}`}
                        className="block px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors border-b border-border"
                      >
                        {language === "ar"
                          ? `كل ${cat.name_ar}`
                          : `All ${cat.name}`}
                      </Link>
                      {subs.map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/categories/${sub.slug}`}
                          className="block px-4 py-2.5 text-sm text-popover-foreground hover:bg-primary/5 hover:text-primary transition-colors"
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
    </nav>
  );
}
