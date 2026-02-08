import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface HealthScoreCardProps {
  score: number;
  issuesFound: number;
  isScanning: boolean;
}

export function HealthScoreCard({ score, issuesFound, isScanning }: HealthScoreCardProps) {
  const { language } = useLanguage();

  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-green-500";
    if (s >= 70) return "text-yellow-500";
    if (s >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return language === "ar" ? "ممتاز" : "Excellent";
    if (s >= 70) return language === "ar" ? "جيد" : "Good";
    if (s >= 50) return language === "ar" ? "يحتاج تحسين" : "Needs Improvement";
    return language === "ar" ? "حرج" : "Critical";
  };

  const getScoreRingColor = (s: number) => {
    if (s >= 90) return "stroke-green-500";
    if (s >= 70) return "stroke-yellow-500";
    if (s >= 50) return "stroke-orange-500";
    return "stroke-red-500";
  };

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            className="stroke-muted"
            strokeWidth="10"
          />
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            className={cn("transition-all duration-1000 ease-out", getScoreRingColor(score))}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isScanning ? circumference : strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-bold", getScoreColor(score))}>
            {isScanning ? "..." : score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <p className={cn("text-lg font-semibold mt-3", getScoreColor(score))}>
        {isScanning ? (language === "ar" ? "جاري الفحص..." : "Scanning...") : getScoreLabel(score)}
      </p>
      {!isScanning && issuesFound > 0 && (
        <p className="text-sm text-muted-foreground mt-1">
          {language === "ar"
            ? `${issuesFound} مشكلة تم اكتشافها`
            : `${issuesFound} issues detected`}
        </p>
      )}
    </div>
  );
}
