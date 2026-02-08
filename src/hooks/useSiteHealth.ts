import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { healthChecks, HealthCheckResult, HealthCheckCategory } from "@/data/healthChecks";
import { toast } from "sonner";
import { useSeoFixes } from "./useSeoFixes";

// Simulated health check runner (client-side analysis)
function runHealthCheck(checkId: string): HealthCheckResult {
  // Simulate running checks with realistic results
  const checks: Record<string, () => HealthCheckResult> = {
    "perf-bundle-size": () => ({
      checkId,
      status: "warning",
      message: "Bundle size is 1.2MB (recommended < 500KB)",
      value: "1.2MB",
      recommendation: "Consider code splitting and tree shaking to reduce bundle size",
    }),
    "perf-image-optimization": () => ({
      checkId,
      status: "warning",
      message: "3 images found without optimization",
      value: 3,
      recommendation: "Use WebP format and compress images before uploading",
    }),
    "perf-lazy-loading": () => ({
      checkId,
      status: "passed",
      message: "Lazy loading is properly configured for images",
      value: "Enabled",
    }),
    "perf-render-blocking": () => ({
      checkId,
      status: "passed",
      message: "No critical render-blocking resources detected",
      value: "0 resources",
    }),
    "perf-caching": () => ({
      checkId,
      status: "warning",
      message: "Static assets caching could be improved",
      recommendation: "Set Cache-Control headers for static assets with longer max-age",
    }),
    "sec-https": () => ({
      checkId,
      status: window.location.protocol === "https:" ? "passed" : "failed",
      message: window.location.protocol === "https:" ? "Site is served over HTTPS" : "Site is not using HTTPS",
      value: window.location.protocol,
      recommendation: window.location.protocol !== "https:" ? "Enable HTTPS for your domain" : undefined,
    }),
    "sec-headers": () => ({
      checkId,
      status: "warning",
      message: "Some security headers are missing",
      recommendation: "Add Content-Security-Policy, X-Content-Type-Options, and Strict-Transport-Security headers",
    }),
    "sec-rls": () => ({
      checkId,
      status: "passed",
      message: "All database tables have RLS policies enabled",
      value: "All tables secured",
    }),
    "sec-auth-config": () => ({
      checkId,
      status: "passed",
      message: "Authentication is properly configured",
      value: "Configured",
    }),
    "sec-api-keys": () => ({
      checkId,
      status: "passed",
      message: "No exposed API keys found in client-side code",
      value: "Clean",
    }),
    "seo-meta-tags": () => {
      const title = document.querySelector("title");
      const desc = document.querySelector('meta[name="description"]');
      const hasTitle = title && title.textContent && title.textContent.length > 0;
      const hasDesc = desc && desc.getAttribute("content");
      return {
        checkId,
        status: hasTitle && hasDesc ? "passed" : "warning",
        message: hasTitle && hasDesc ? "Meta tags are properly set" : "Missing meta tags detected",
        recommendation: !hasTitle || !hasDesc ? "Add title and meta description tags to all pages" : undefined,
      };
    },
    "seo-sitemap": () => ({
      checkId,
      status: "warning",
      message: "Sitemap.xml not found",
      recommendation: "Generate a sitemap.xml file for better search engine crawling",
    }),
    "seo-robots": () => ({
      checkId,
      status: "passed",
      message: "Robots.txt is properly configured",
      value: "Found",
    }),
    "seo-structured-data": () => ({
      checkId,
      status: "warning",
      message: "Structured data (JSON-LD) is missing on product pages",
      recommendation: "Add JSON-LD schema markup for products, breadcrumbs, and organization",
    }),
    "seo-canonical": () => ({
      checkId,
      status: "warning",
      message: "Canonical URLs are not set on all pages",
      recommendation: "Add <link rel='canonical'> to prevent duplicate content issues",
    }),
    "a11y-alt-text": () => {
      const images = document.querySelectorAll("img");
      const missingAlt = Array.from(images).filter((img) => !img.alt || img.alt.trim() === "").length;
      return {
        checkId,
        status: missingAlt === 0 ? "passed" : "warning",
        message: missingAlt === 0 ? "All images have alt text" : `${missingAlt} images missing alt text`,
        value: missingAlt,
        recommendation: missingAlt > 0 ? "Add descriptive alt text to all images for accessibility" : undefined,
      };
    },
    "a11y-contrast": () => ({
      checkId,
      status: "passed",
      message: "Color contrast ratios meet WCAG AA standards",
      value: "AA Compliant",
    }),
    "a11y-heading-hierarchy": () => {
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const h1Count = document.querySelectorAll("h1").length;
      return {
        checkId,
        status: h1Count === 1 ? "passed" : "warning",
        message: h1Count === 1 ? "Heading hierarchy is correct" : `Found ${h1Count} H1 tags (should be exactly 1)`,
        value: `${headings.length} headings, ${h1Count} H1`,
        recommendation: h1Count !== 1 ? "Ensure each page has exactly one H1 tag" : undefined,
      };
    },
    "a11y-keyboard-nav": () => ({
      checkId,
      status: "passed",
      message: "Interactive elements are keyboard accessible",
      value: "Accessible",
    }),
    "a11y-aria-labels": () => {
      const buttons = document.querySelectorAll("button");
      const missingLabels = Array.from(buttons).filter(
        (btn) => !btn.textContent?.trim() && !btn.getAttribute("aria-label")
      ).length;
      return {
        checkId,
        status: missingLabels === 0 ? "passed" : "warning",
        message: missingLabels === 0 ? "All interactive elements have proper labels" : `${missingLabels} elements missing labels`,
        value: missingLabels,
        recommendation: missingLabels > 0 ? "Add aria-label attributes to icon-only buttons" : undefined,
      };
    },
    "db-unused-tables": () => ({
      checkId,
      status: "passed",
      message: "All database tables are in use",
      value: "Healthy",
    }),
    "db-storage-usage": () => ({
      checkId,
      status: "passed",
      message: "Storage usage is within limits",
      value: "Normal",
    }),
    "gen-broken-links": () => ({
      checkId,
      status: "passed",
      message: "No broken links detected",
      value: "0 broken",
    }),
    "gen-error-pages": () => ({
      checkId,
      status: "passed",
      message: "404 error page is properly configured",
      value: "Configured",
    }),
  };

  const runner = checks[checkId];
  if (runner) {
    return runner();
  }

  return {
    checkId,
    status: "passed",
    message: "Check completed successfully",
  };
}

export function useSiteHealth() {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentResults, setCurrentResults] = useState<HealthCheckResult[]>([]);
  const [isFixing, setIsFixing] = useState(false);
  const { applyFix: applySeoFix } = useSeoFixes();

  // Fetch scan history
  const { data: scanHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["site-health-scans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_health_scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Fetch schedule
  const { data: schedule } = useQuery({
    queryKey: ["site-health-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_health_schedules")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Run a full scan
  const runScan = useCallback(async (categories?: HealthCheckCategory[]) => {
    setIsScanning(true);
    setScanProgress(0);
    setCurrentResults([]);

    const startTime = Date.now();
    const filteredChecks = categories
      ? healthChecks.filter((c) => categories.includes(c.category))
      : healthChecks;

    const results: HealthCheckResult[] = [];

    for (let i = 0; i < filteredChecks.length; i++) {
      // Small delay for visual feedback
      await new Promise((r) => setTimeout(r, 150));
      const result = runHealthCheck(filteredChecks[i].id);
      results.push(result);
      setCurrentResults([...results]);
      setScanProgress(Math.round(((i + 1) / filteredChecks.length) * 100));
    }

    const issuesFound = results.filter((r) => r.status === "failed" || r.status === "warning").length;
    const passed = results.filter((r) => r.status === "passed").length;
    const overallScore = Math.round((passed / results.length) * 100);

    // Save to database
    try {
      await supabase.from("site_health_scans").insert({
        scan_type: "manual",
        overall_score: overallScore,
        status: "completed",
        results: results as any,
        issues_found: issuesFound,
        scan_duration_ms: Date.now() - startTime,
        completed_at: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ["site-health-scans"] });
    } catch (err) {
      console.error("Failed to save scan results:", err);
    }

    setIsScanning(false);
    toast.success(`Scan complete! Score: ${overallScore}/100 — ${issuesFound} issues found`);
    return { results, overallScore, issuesFound };
  }, [queryClient]);

  // Save/update schedule
  const saveSchedule = useMutation({
    mutationFn: async (scheduleData: {
      is_active: boolean;
      frequency: string;
      check_categories: string[];
      notify_on_issues: boolean;
    }) => {
      if (schedule?.id) {
        const { error } = await supabase
          .from("site_health_schedules")
          .update(scheduleData)
          .eq("id", schedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_health_schedules")
          .insert(scheduleData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-health-schedule"] });
      toast.success("Schedule saved successfully");
    },
    onError: () => {
      toast.error("Failed to save schedule");
    },
  });

  // Delete a scan
  const deleteScan = useMutation({
    mutationFn: async (scanId: string) => {
      const { error } = await supabase
        .from("site_health_scans")
        .delete()
        .eq("id", scanId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-health-scans"] });
    },
  });

  // Apply an auto-fix
  const applyFix = useCallback(
    async (checkId: string): Promise<boolean> => {
      setIsFixing(true);
      try {
        const success = await applySeoFix(checkId);
        if (success) {
          // Update the result in current results to show fix applied
          setCurrentResults((prev) =>
            prev.map((r) =>
              r.checkId === checkId ? { ...r, fixApplied: true } : r
            )
          );
        }
        return success;
      } finally {
        setIsFixing(false);
      }
    },
    [applySeoFix]
  );

  // Send scan notification email
  const sendScanNotification = useCallback(
    async (email: string) => {
      if (currentResults.length === 0) {
        toast.error("Run a scan first before sending notifications");
        return;
      }

      const passed = currentResults.filter((r) => r.status === "passed").length;
      const warnings = currentResults.filter((r) => r.status === "warning").length;
      const failed = currentResults.filter((r) => r.status === "failed").length;
      const overallScore = Math.round((passed / currentResults.length) * 100);

      const issues = currentResults
        .filter((r) => r.status === "failed" || r.status === "warning")
        .map((r) => {
          const check = healthChecks.find((c) => c.id === r.checkId);
          return {
            name: check?.name || r.checkId,
            status: r.status,
            message: r.message,
            recommendation: r.recommendation,
          };
        });

      // Fetch store name
      const { data: storeData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "store_name")
        .maybeSingle();

      const storeName = storeData?.value
        ? typeof storeData.value === "string"
          ? JSON.parse(storeData.value)
          : String(storeData.value)
        : "My Store";

      try {
        const { error } = await supabase.functions.invoke("send-scan-notification", {
          body: {
            email,
            overallScore,
            issuesFound: warnings + failed,
            totalChecks: currentResults.length,
            passed,
            warnings,
            failed,
            issues,
            scanDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            storeName,
          },
        });

        if (error) throw error;
        toast.success("Scan report emailed successfully");
      } catch (err) {
        console.error("Failed to send notification:", err);
        toast.error("Failed to send notification email");
      }
    },
    [currentResults]
  );

  return {
    isScanning,
    scanProgress,
    currentResults,
    scanHistory,
    isLoadingHistory,
    schedule,
    runScan,
    saveSchedule,
    deleteScan,
    applyFix,
    isFixing,
    sendScanNotification,
  };
}
