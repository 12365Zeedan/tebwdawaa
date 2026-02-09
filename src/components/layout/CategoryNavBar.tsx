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
      const {
        data,
        error
      } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order", {
        ascending: true
      });
      if (error) throw error;
      return data as Category[];
    }
  });
}
export function CategoryNavBar() {
  const {
    language
  } = useLanguage();
  const {
    theme
  } = useTheme();
  const {
    data: categories
  } = useAllCategories();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const parentCategories = categories?.filter(c => !c.parent_category_id) || [];
  const getSubcategories = (parentId: string) => categories?.filter(c => c.parent_category_id === parentId) || [];
  if (parentCategories.length === 0) return null;
  return <div className={cn("w-full bg-header/90 border-b border-border/30 z-40", theme.header.sticky && "sticky top-12 md:top-16", theme.header.backdropBlur && "backdrop-blur supports-[backdrop-filter]:bg-header/80")}>
      <div className={cn("gap-0.5 overflow-x-auto scrollbar-hide opacity-100 bg-white flex items-center justify-center", theme.header.fullWidth ? "px-4 sm:px-8" : "container")}>
        {parentCategories.map(cat => {
        const subs = getSubcategories(cat.id);
        const hasSubs = subs.length > 0;
        const isHovered = hoveredId === cat.id;
        return <div key={cat.id} className="relative" onMouseEnter={() => setHoveredId(cat.id)} onMouseLeave={() => setHoveredId(null)}>
              <Link to={`/categories/${cat.slug}`} className={cn("flex items-center gap-1 px-4 py-2.5 whitespace-nowrap transition-colors text-[#01012d] hover:text-[#01012d]/70 hover:bg-[#01012d]/5 text-base text-center font-semibold", isHovered && "bg-[#01012d]/5 text-[#01012d]/70")}>
                {language === "ar" ? cat.name_ar : cat.name}
                {hasSubs && <ChevronDown className={cn("h-3 w-3 transition-transform", isHovered && "rotate-180")} />}
              </Link>

              {hasSubs && isHovered && <div className="absolute top-full left-0 mt-0 w-52 rounded-b-lg border border-t-0 border-border bg-popover text-popover-foreground shadow-lg z-50 py-1 animate-fade-in">
                  <Link to={`/categories/${cat.slug}`} className="block px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    {language === "ar" ? `كل ${cat.name_ar}` : `All ${cat.name}`}
                  </Link>
                  <div className="h-px bg-border mx-2 my-1" />
                  {subs.map(sub => <Link key={sub.id} to={`/categories/${sub.slug}`} className="block px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                      {language === "ar" ? sub.name_ar : sub.name}
                    </Link>)}
                </div>}
            </div>;
      })}
      </div>
    </div>;
}