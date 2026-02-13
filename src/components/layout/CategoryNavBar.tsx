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

  const hoveredParent = hoveredId ? parentCategories.find((c) => c.id === hoveredId) : null;
  const hoveredSubs = hoveredId ? getSubcategories(hoveredId) : [];

  return (
    <div
      className={cn(
        "w-full bg-header/90 border-b border-border/30 z-40",
        theme.header.sticky && "sticky top-12 md:top-16",
        theme.header.backdropBlur &&
          "backdrop-blur supports-[backdrop-filter]:bg-header/80"
      )}
    >
      {/* Category links bar */}
      <div
        className={cn(
          "gap-0.5 overflow-x-auto scrollbar-hide opacity-100 bg-white flex items-center justify-center",
          theme.header.fullWidth ? "px-4 sm:px-8" : "container"
        )}
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
                  "flex items-center gap-1 px-4 py-2.5 whitespace-nowrap transition-colors text-[#01012d] hover:text-[#01012d]/70 hover:bg-[#01012d]/5 text-base text-center font-semibold",
                  isHovered && "bg-[#01012d]/5 text-[#01012d]/70"
                )}
              >
                {language === "ar" ? cat.name_ar : cat.name}
                {hasSubs && (
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isHovered && "rotate-180"
                    )}
                  />
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Dropdown rendered OUTSIDE the bar, below the navbar */}
      {hoveredParent && hoveredSubs.length > 0 && (
        <div
          className="absolute left-0 w-full bg-popover border-t border-border shadow-lg z-50 animate-fade-in"
          onMouseEnter={() => setHoveredId(hoveredParent.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className={cn("py-4", theme.header.fullWidth ? "px-4 sm:px-8" : "container")}>
            <Link
              to={`/categories/${hoveredParent.slug}`}
              className="inline-block px-4 py-2 text-sm font-semibold text-primary hover:underline transition-colors"
            >
              {language === "ar"
                ? `كل ${hoveredParent.name_ar}`
                : `All ${hoveredParent.name}`}
            </Link>
            <div className="flex flex-wrap gap-x-8 gap-y-1 px-4 mt-1">
              {hoveredSubs.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/categories/${sub.slug}`}
                  className="block py-1.5 text-sm text-popover-foreground hover:text-primary transition-colors"
                >
                  {language === "ar" ? sub.name_ar : sub.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
