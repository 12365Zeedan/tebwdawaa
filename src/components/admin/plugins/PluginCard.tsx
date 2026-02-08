import {
  Shield, Lock, Zap, Image, Search, BarChart3, Mail, Share2,
  Download, Trash2, CheckCircle2, ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { PluginDefinition, CATEGORY_LABELS } from "@/data/pluginCatalog";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Shield, Lock, Zap, Image, Search, BarChart3, Mail, Share2,
};

interface PluginCardProps {
  plugin: PluginDefinition;
  installed: boolean;
  active: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  onToggle: (active: boolean) => void;
  isLoading: boolean;
}

export function PluginCard({
  plugin,
  installed,
  active,
  onInstall,
  onUninstall,
  onToggle,
  isLoading,
}: PluginCardProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const Icon = ICON_MAP[plugin.icon] || Shield;
  const catLabel = CATEGORY_LABELS[plugin.category];

  return (
    <Card className={cn(
      "transition-all hover:shadow-md relative overflow-hidden",
      active && installed && "ring-2 ring-primary/40"
    )}>
      {installed && active && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
      )}
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            plugin.category === "security" && "bg-red-100 text-red-600",
            plugin.category === "performance" && "bg-blue-100 text-blue-600",
            plugin.category === "seo" && "bg-green-100 text-green-600",
            plugin.category === "marketing" && "bg-purple-100 text-purple-600",
          )}>
            <Icon className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">
                {isAr ? plugin.nameAr : plugin.nameEn}
              </h3>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", catLabel.color)}>
                {isAr ? catLabel.ar : catLabel.en}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {isAr ? plugin.descriptionAr : plugin.descriptionEn}
            </p>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span>v{plugin.version}</span>
              <span>•</span>
              <span>{plugin.author}</span>
              <span>•</span>
              <div className="flex gap-1">
                {plugin.compatibleWith.map((p) => (
                  <Badge key={p} variant="secondary" className="text-[9px] px-1 py-0 h-4">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            {installed && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {plugin.features.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    <CheckCircle2 className={cn("h-2.5 w-2.5", active ? "text-primary" : "text-muted-foreground/50")} />
                    {isAr ? f.ar : f.en}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          {installed ? (
            <>
              <div className="flex items-center gap-2">
                <Switch
                  checked={active}
                  onCheckedChange={onToggle}
                  disabled={isLoading}
                />
                <span className={cn("text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}>
                  {active
                    ? (isAr ? "مفعّل" : "Active")
                    : (isAr ? "معطّل" : "Inactive")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8"
                onClick={onUninstall}
                disabled={isLoading}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {isAr ? "إزالة" : "Uninstall"}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="w-full h-9 text-xs"
              onClick={onInstall}
              disabled={isLoading}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {isAr ? "تثبيت" : "Install Plugin"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
