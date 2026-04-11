import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const isAr = language === "ar";
  const { theme } = useTheme();
  const { data: categories } = useAllCategories();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const parentCategories = categories?.filter((c) => !c.parent_category_id) || [];
  const getSubcategories = (parentId: string) =>
    categories?.filter((c) => c.parent_category_id === parentId) || [];

  if (parentCategories.length === 0) return null;

  return (
    <nav
      className={cn(
        "relative z-40 w-full border-b border-border/30 bg-background",
        theme.header.sticky && "sticky top-12 md:top-16"
      )}
    >
      {/* Mobile hamburger toggle */}
      <div className="flex items-center justify-between md:hidden px-4 py-2">
        <span className="text-sm font-semibold text-foreground">
          {isAr ? "التصنيفات" : "Categories"}
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle categories"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown list */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/30 bg-background max-h-[60vh] overflow-y-auto animate-fade-in">
          {parentCategories.map((cat) => {
            const subs = getSubcategories(cat.id);
            const hasSubs = subs.length > 0;
            const isExpanded = hoveredId === cat.id;

            return (
              <div key={cat.id} className="border-b border-border/20">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/categories/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 px-4 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {isAr ? cat.name_ar : cat.name}
                  </Link>
                  {hasSubs && (
                    <button
                      onClick={() => setHoveredId(isExpanded ? null : cat.id)}
                      className="px-4 py-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                  )}
                </div>
                {hasSubs && isExpanded && (
                  <div className="bg-muted/30 pb-1">
                    {subs.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/categories/${sub.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors",
                          isAr ? "pr-8 pl-4" : "pl-8 pr-4"
                        )}
                      >
                        {isAr ? sub.name_ar : sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop horizontal scrollable bar */}
      <div
        className={cn(
          "hidden md:flex items-center",
          theme.header.fullWidth ? "px-4 lg:px-8" : "container"
        )}
      >
        <ScrollArea className="w-full" dir={isAr ? "rtl" : "ltr"}>
          <div className="flex items-center gap-0 min-w-max">
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
                      "flex items-center gap-1.5 whitespace-nowrap px-3 lg:px-4 py-2.5 text-sm lg:text-base font-semibold text-foreground transition-colors hover:text-primary",
                      isHovered && "text-primary"
                    )}
                  >
                    {isAr ? cat.name_ar : cat.name}
                    {hasSubs && (
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform duration-200",
                          isHovered && "rotate-180"
                        )}
                      />
                    )}
                  </Link>

                  {hasSubs && isHovered && (
                    <div className="absolute left-0 top-full z-50 min-w-[220px] pt-0.5">
                      <div className="overflow-hidden rounded-b-lg border border-border bg-popover py-1 text-popover-foreground shadow-lg animate-fade-in">
                        <Link
                          to={`/categories/${cat.slug}`}
                          className="block border-b border-border px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
                        >
                          {isAr ? `كل ${cat.name_ar}` : `All ${cat.name}`}
                        </Link>
                        {subs.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/categories/${sub.slug}`}
                            className="block px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-primary"
                          >
                            {isAr ? sub.name_ar : sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </nav>
  );
}