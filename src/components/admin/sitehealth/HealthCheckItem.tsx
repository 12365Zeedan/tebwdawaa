import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Wrench,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { HealthCheck, HealthCheckResult } from "@/data/healthChecks";

interface HealthCheckItemProps {
  check: HealthCheck;
  result?: HealthCheckResult;
  isRunning?: boolean;
}

export function HealthCheckItem({ check, result, isRunning }: HealthCheckItemProps) {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    passed: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
    running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10" },
  };

  const status = isRunning ? "running" : result?.status || "pending";
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "border rounded-lg transition-all",
        result?.status === "failed" && "border-red-500/30",
        result?.status === "warning" && "border-yellow-500/30"
      )}
    >
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
        onClick={() => result && setExpanded(!expanded)}
      >
        <div className={cn("p-1.5 rounded-full", config.bg)}>
          <Icon
            className={cn(
              "h-4 w-4",
              config.color,
              isRunning && "animate-spin"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">
              {language === "ar" ? check.nameAr : check.name}
            </p>
            {check.autoFixable && result && (result.status === "failed" || result.status === "warning") && (
              <Badge variant="outline" className="text-xs gap-1 shrink-0">
                <Wrench className="h-3 w-3" />
                {language === "ar" ? "قابل للإصلاح" : "Auto-fixable"}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {result?.message || (language === "ar" ? check.descriptionAr : check.description)}
          </p>
        </div>

        {result?.value !== undefined && (
          <span className="text-xs font-mono text-muted-foreground shrink-0">
            {result.value}
          </span>
        )}

        {result && (
          <div className="shrink-0">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {expanded && result && (
        <div className="px-4 pb-3 space-y-2 border-t border-border/50 pt-2 ml-10">
          {result.details && (
            <p className="text-xs text-muted-foreground">{result.details}</p>
          )}
          {result.recommendation && (
            <div className="flex items-start gap-2 bg-muted/50 rounded-md p-2">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">{result.recommendation}</p>
            </div>
          )}
          {check.autoFixable && (result.status === "failed" || result.status === "warning") && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
              <Wrench className="h-3 w-3" />
              {check.fixDescription || (language === "ar" ? "إصلاح تلقائي" : "Apply Fix")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
