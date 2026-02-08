import { useState, useEffect, useCallback } from "react";

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface UsePrayerTimesResult {
  prayerTimes: PrayerTimes | null;
  nextPrayer: { name: string; nameAr: string; time: string } | null;
  loading: boolean;
}

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

function parseTime(timeStr: string): Date {
  const now = new Date();
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
}

function getNextPrayer(times: PrayerTimes): { name: string; nameAr: string; time: string } | null {
  const now = new Date();
  const ordered: (keyof PrayerTimes)[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  for (const name of ordered) {
    const prayerTime = parseTime(times[name]);
    if (prayerTime > now) {
      return { name, nameAr: PRAYER_NAMES[name], time: times[name] };
    }
  }
  // All prayers passed — next is tomorrow's Fajr
  return { name: "Fajr", nameAr: PRAYER_NAMES.Fajr, time: times.Fajr };
}

export function usePrayerTimes(latitude: number, longitude: number, enabled: boolean): UsePrayerTimesResult {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<UsePrayerTimesResult["nextPrayer"]>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrayerTimes = useCallback(async (lat: number, lon: number) => {
    if (!enabled) return;
    setLoading(true);
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();

      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=4`
      );
      const data = await res.json();

      if (data.code === 200 && data.data?.timings) {
        const t = data.data.timings;
        const times: PrayerTimes = {
          Fajr: t.Fajr?.split(" ")[0] || "",
          Sunrise: t.Sunrise?.split(" ")[0] || "",
          Dhuhr: t.Dhuhr?.split(" ")[0] || "",
          Asr: t.Asr?.split(" ")[0] || "",
          Maghrib: t.Maghrib?.split(" ")[0] || "",
          Isha: t.Isha?.split(" ")[0] || "",
        };
        setPrayerTimes(times);
        setNextPrayer(getNextPrayer(times));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchPrayerTimes(latitude, longitude);
  }, [latitude, longitude, fetchPrayerTimes]);

  // Update next prayer every minute
  useEffect(() => {
    if (!prayerTimes) return;
    const interval = setInterval(() => {
      setNextPrayer(getNextPrayer(prayerTimes));
    }, 60_000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return { prayerTimes, nextPrayer, loading };
}

export { PRAYER_NAMES };
export type { PrayerTimes };
