import { useState, useMemo } from "react";
import {
  Activity,
  Play,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteHealth } from "@/hooks/useSiteHealth";
import { healthChecks, HealthCheckCategory } from "@/data/healthChecks";
import { HealthScoreCard } from "@/components/admin/sitehealth/HealthScoreCard";
import { HealthCheckItem } from "@/components/admin/sitehealth/HealthCheckItem";
import { ScanHistoryCard } from "@/components/admin/sitehealth/ScanHistoryCard";
import { ScheduleCard } from "@/components/admin/sitehealth/ScheduleCard";
import { CategoryFilter } from "@/components/admin/sitehealth/CategoryFilter";
import { StatCard } from "@/components/admin/StatCard";

export default function AdminSiteHealth() {
  const { language } = useLanguage();
  const {
    isScanning,
    scanProgress,
    currentResults,
    scanHistory,
    schedule,
    runScan,
    saveSchedule,
    deleteScan,
  } = useSiteHealth();

  const [selectedCategory, setSelectedCategory] = useState<HealthCheckCategory | "all">("all");

  // Compute stats from latest results
  const stats = useMemo(() => {
    if (currentResults.length === 0 && scanHistory.length > 0) {
      const latest = scanHistory[0];
      return {
        score: latest.overall_score,
        passed: 0,
        warnings: 0,
        failed: 0,
        issuesFound: latest.issues_found,
      };
    }

    const passed = currentResults.filter((r) => r.status === "passed").length;
    const warnings = currentResults.filter((r) => r.status === "warning").length;
    const failed = currentResults.filter((r) => r.status === "failed").length;
    const score = currentResults.length > 0 ? Math.round((passed / currentResults.length) * 100) : 0;

    return { score, passed, warnings, failed, issuesFound: warnings + failed };
  }, [currentResults, scanHistory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; issues: number }> = {};
    const categories = ["performance", "security", "seo", "accessibility", "database", "general"];
    categories.forEach((cat) => {
      const checksInCat = healthChecks.filter((c) => c.category === cat);
      const resultsInCat = currentResults.filter((r) =>
        checksInCat.some((c) => c.id === r.checkId)
      );
      const issues = resultsInCat.filter((r) => r.status === "failed" || r.status === "warning").length;
      counts[cat] = { total: checksInCat.length, issues };
    });
    return counts;
  }, [currentResults]);

  // Filtered checks
  const filteredChecks = useMemo(() => {
    if (selectedCategory === "all") return healthChecks;
    return healthChecks.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  // Check which checks are currently running
  const completedCheckIds = new Set(currentResults.map((r) => r.checkId));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              {language === "ar" ? "محسن صحة الموقع" : "Site Health Optimizer"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "ar"
                ? "مراقبة وتحسين أداء وأمان وجودة موقعك"
                : "Monitor and optimize your site's performance, security, and quality"}
            </p>
          </div>
          <Button
            onClick={() => runScan()}
            disabled={isScanning}
            className="gap-2"
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === "ar" ? "جاري الفحص..." : "Scanning..."}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {language === "ar" ? "بدء فحص شامل" : "Run Full Scan"}
              </>
            )}
          </Button>
        </div>

        {/* Scan Progress */}
        {isScanning && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  {language === "ar"
                    ? `جاري تشغيل الفحوصات... ${scanProgress}%`
                    : `Running health checks... ${scanProgress}%`}
                </span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex items-center">
            <HealthScoreCard
              score={stats.score}
              issuesFound={stats.issuesFound}
              isScanning={isScanning}
            />
          </Card>
          <StatCard
            title={language === "ar" ? "فحوصات ناجحة" : "Checks Passed"}
            value={stats.passed}
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            iconBg="bg-green-500/10"
          />
          <StatCard
            title={language === "ar" ? "تحذيرات" : "Warnings"}
            value={stats.warnings}
            icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
            iconBg="bg-yellow-500/10"
          />
          <StatCard
            title={language === "ar" ? "أخطاء حرجة" : "Critical Errors"}
            value={stats.failed}
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            iconBg="bg-red-500/10"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Health Checks */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {language === "ar" ? "نتائج الفحص" : "Health Checks"}
                  </CardTitle>
                  {currentResults.length > 0 && !isScanning && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => runScan()}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {language === "ar" ? "إعادة الفحص" : "Re-scan"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CategoryFilter
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                  counts={categoryCounts}
                />

                <div className="space-y-2">
                  {filteredChecks.map((check) => {
                    const result = currentResults.find((r) => r.checkId === check.id);
                    const isRunning = isScanning && !completedCheckIds.has(check.id);

                    return (
                      <HealthCheckItem
                        key={check.id}
                        check={check}
                        result={result}
                        isRunning={isRunning && completedCheckIds.size >= filteredChecks.indexOf(check)}
                      />
                    );
                  })}
                </div>

                {currentResults.length === 0 && !isScanning && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">
                      {language === "ar"
                        ? "اضغط على 'بدء فحص شامل' لتحليل صحة موقعك"
                        : "Click 'Run Full Scan' to analyze your site's health"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Schedule + History */}
          <div className="space-y-4">
            <ScheduleCard
              schedule={schedule}
              onSave={(data) => saveSchedule.mutate(data)}
              isSaving={saveSchedule.isPending}
            />

            <ScanHistoryCard
              scans={scanHistory}
              onDelete={(id) => deleteScan.mutate(id)}
              onViewResults={() => {}}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
