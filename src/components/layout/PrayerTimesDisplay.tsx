import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";
import type { PrayerTimes } from "@/hooks/usePrayerTimes";
import { PRAYER_NAMES } from "@/hooks/usePrayerTimes";

interface PrayerTimesDisplayProps {
  prayerTimes: PrayerTimes | null;
  nextPrayer: { name: string; nameAr: string; time: string } | null;
  loading: boolean;
}

export function PrayerTimesDisplay({ prayerTimes, nextPrayer, loading }: PrayerTimesDisplayProps) {
  const { language } = useLanguage();

  if (loading) {
    return <div className="h-3 w-20 rounded bg-link/20 animate-pulse" />;
  }

  if (!nextPrayer || !prayerTimes) return null;

  const prayerLabel = language === "ar" ? nextPrayer.nameAr : nextPrayer.name;
  const ordered: (keyof PrayerTimes)[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1.5 text-link/80 hover:text-link hover:bg-link/10"
        >
          <Moon className="h-3 w-3" />
          <span className="hidden sm:inline">{prayerLabel}</span>
          <span className="font-semibold">{nextPrayer.time}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <h4 className="text-sm font-semibold mb-2">
          {language === "ar" ? "أوقات الصلاة" : "Prayer Times"}
        </h4>
        <div className="space-y-1.5">
          {ordered.map((key) => {
            const isNext = key === nextPrayer.name;
            return (
              <div
                key={key}
                className={`flex items-center justify-between text-sm rounded px-2 py-1 ${
                  isNext ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                <span>{language === "ar" ? PRAYER_NAMES[key] : key}</span>
                <span className="tabular-nums">{prayerTimes[key]}</span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
