import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Zap,
  Shield,
  Search,
  Accessibility,
  Database,
  Globe,
} from "lucide-react";
import type { HealthCheckCategory } from "@/data/healthChecks";

interface CategoryFilterProps {
  selected: HealthCheckCategory | "all";
  onChange: (cat: HealthCheckCategory | "all") => void;
  counts: Record<string, { total: number; issues: number }>;
}

const categoryConfig: {
  key: HealthCheckCategory | "all";
  labelEn: string;
  labelAr: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "all", labelEn: "All", labelAr: "الكل", icon: Globe },
  { key: "performance", labelEn: "Performance", labelAr: "الأداء", icon: Zap },
  { key: "security", labelEn: "Security", labelAr: "الأمان", icon: Shield },
  { key: "seo", labelEn: "SEO", labelAr: "SEO", icon: Search },
  { key: "accessibility", labelEn: "Accessibility", labelAr: "الوصول", icon: Accessibility },
  { key: "database", labelEn: "Database", labelAr: "البيانات", icon: Database },
];

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2">
      {categoryConfig.map((cat) => {
        const isSelected = selected === cat.key;
        const count = cat.key === "all" ? null : counts[cat.key];
        const Icon = cat.icon;

        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {language === "ar" ? cat.labelAr : cat.labelEn}
            {count && count.issues > 0 && (
              <Badge
                variant="destructive"
                className="h-4 min-w-4 px-1 text-[10px] leading-none"
              >
                {count.issues}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
