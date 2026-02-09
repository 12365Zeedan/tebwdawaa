import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBlogCategories } from "@/hooks/useAdminBlogCategories";

interface NavbarBlogDropdownProps {
  href: string;
  label: string;
  isActive: boolean;
  fontSizeClass: string;
  fontWeightClass: string;
}

export function NavbarBlogDropdown({ href, label, isActive, fontSizeClass, fontWeightClass }: NavbarBlogDropdownProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { language } = useLanguage();
  const { data: categories } = useBlogCategories();

  const activeCategories = categories?.filter(c => c.is_active) || [];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={href}
        className={cn(
          "px-4 py-2 rounded-lg transition-colors flex items-center gap-1",
          fontSizeClass,
          fontWeightClass,
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-link hover:text-link-hover hover:bg-white/10"
        )}
      >
        {label}
        <ChevronDown className={cn("h-3 w-3 transition-transform", isHovered && "rotate-180")} />
      </Link>

      {isHovered && activeCategories.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-52 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg z-50 py-1 animate-fade-in">
          <Link
            to="/blog"
            className="block px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {language === "ar" ? "جميع المقالات" : "All Posts"}
          </Link>
          <div className="h-px bg-border mx-2 my-1" />
          {activeCategories.map(category => (
            <Link
              key={category.id}
              to={`/blog?category=${category.slug}`}
              className="block px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {language === "ar" ? category.name_ar : category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
