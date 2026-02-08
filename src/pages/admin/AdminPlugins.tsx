import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlugins } from "@/hooks/usePlugins";
import { PLUGIN_CATALOG, CATEGORY_LABELS, PluginCategory } from "@/data/pluginCatalog";
import { PluginCard } from "@/components/admin/plugins/PluginCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Puzzle,
  Shield,
  Zap,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "installed" | "marketplace";
type CategoryFilter = "all" | PluginCategory;

export default function AdminPlugins() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const {
    installedPlugins,
    isLoading,
    installPlugin,
    uninstallPlugin,
    togglePlugin,
    isInstalled,
    isActive,
  } = usePlugins();

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filteredPlugins = PLUGIN_CATALOG.filter((plugin) => {
    const matchesSearch =
      plugin.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      plugin.nameAr.includes(search) ||
      plugin.descriptionEn.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      tab === "all" ||
      (tab === "installed" && isInstalled(plugin.key)) ||
      (tab === "marketplace" && !isInstalled(plugin.key));

    const matchesCategory =
      categoryFilter === "all" || plugin.category === categoryFilter;

    return matchesSearch && matchesTab && matchesCategory;
  });

  const installedCount = PLUGIN_CATALOG.filter((p) => isInstalled(p.key)).length;
  const activeCount = PLUGIN_CATALOG.filter((p) => isActive(p.key)).length;

  const categoryIcons: Record<CategoryFilter, React.ElementType> = {
    all: Puzzle,
    security: Shield,
    performance: Zap,
    seo: BarChart3,
    marketing: TrendingUp,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Puzzle className="h-7 w-7 text-primary" />
              {isAr ? "الإضافات" : "Plugins"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr
                ? "إدارة وتفعيل الإضافات لتعزيز وظائف متجرك"
                : "Manage and activate plugins to extend your store's functionality"}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-card rounded-lg border">
              <div className="text-lg font-bold text-primary">{installedCount}</div>
              <div className="text-[10px] text-muted-foreground">
                {isAr ? "مثبّت" : "Installed"}
              </div>
            </div>
            <div className="text-center px-4 py-2 bg-card rounded-lg border">
              <div className="text-lg font-bold text-primary">{activeCount}</div>
              <div className="text-[10px] text-muted-foreground">
                {isAr ? "مفعّل" : "Active"}
              </div>
            </div>
            <div className="text-center px-4 py-2 bg-card rounded-lg border">
              <div className="text-lg font-bold">{PLUGIN_CATALOG.length}</div>
              <div className="text-[10px] text-muted-foreground">
                {isAr ? "متاح" : "Available"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">
                {isAr ? "الكل" : "All"}
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">
                  {PLUGIN_CATALOG.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="installed">
                {isAr ? "المثبّتة" : "Installed"}
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">
                  {installedCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="marketplace">
                {isAr ? "المتجر" : "Marketplace"}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAr ? "البحث عن إضافات..." : "Search plugins..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {(["all", "security", "performance", "seo", "marketing"] as CategoryFilter[]).map(
            (cat) => {
              const CatIcon = categoryIcons[cat];
              const label =
                cat === "all"
                  ? isAr ? "الكل" : "All"
                  : isAr
                  ? CATEGORY_LABELS[cat].ar
                  : CATEGORY_LABELS[cat].en;

              return (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  onClick={() => setCategoryFilter(cat)}
                >
                  <CatIcon className="h-3.5 w-3.5" />
                  {label}
                </Button>
              );
            }
          )}
        </div>

        {/* Plugin Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredPlugins.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Puzzle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {isAr ? "لا توجد إضافات مطابقة" : "No plugins found"}
            </p>
            <p className="text-sm mt-1">
              {isAr
                ? "جرّب تغيير الفلتر أو كلمة البحث"
                : "Try changing the filter or search term"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlugins.map((plugin) => (
              <PluginCard
                key={plugin.key}
                plugin={plugin}
                installed={isInstalled(plugin.key)}
                active={isActive(plugin.key)}
                onInstall={() => installPlugin.mutate(plugin.key)}
                onUninstall={() => uninstallPlugin.mutate(plugin.key)}
                onToggle={(active) =>
                  togglePlugin.mutate({ pluginKey: plugin.key, isActive: active })
                }
                isLoading={
                  installPlugin.isPending ||
                  uninstallPlugin.isPending ||
                  togglePlugin.isPending
                }
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
