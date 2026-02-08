import React, { useState, useEffect, useCallback } from "react";
import { Cloud, CloudRain, Sun, CloudLightning, CloudDrizzle, Snowflake, MapPin, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { PrayerTimesDisplay } from "./PrayerTimesDisplay";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
}

interface GeoCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return <Sun className="h-4 w-4 text-yellow-400" />;
  if (code === 2 || code === 3) return <Cloud className="h-4 w-4 text-link/70" />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className="h-4 w-4 text-link/70" />;
  if (code >= 61 && code <= 65) return <CloudRain className="h-4 w-4 text-blue-400" />;
  if (code >= 71 && code <= 77) return <Snowflake className="h-4 w-4 text-link/80" />;
  if (code >= 80 && code <= 82) return <CloudRain className="h-4 w-4 text-blue-400" />;
  if (code >= 95 && code <= 99) return <CloudLightning className="h-4 w-4 text-yellow-500" />;
  return <Cloud className="h-4 w-4 text-link/70" />;
}

function getWeatherLabel(code: number, lang: string): string {
  const labels: Record<string, [string, string]> = {
    clear: ["Clear", "صافي"],
    cloudy: ["Cloudy", "غائم"],
    drizzle: ["Drizzle", "رذاذ"],
    rain: ["Rain", "مطر"],
    snow: ["Snow", "ثلج"],
    storm: ["Storm", "عاصفة"],
  };
  let key = "cloudy";
  if (code === 0 || code === 1) key = "clear";
  else if (code === 2 || code === 3) key = "cloudy";
  else if (code >= 51 && code <= 55) key = "drizzle";
  else if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) key = "rain";
  else if (code >= 71 && code <= 77) key = "snow";
  else if (code >= 95) key = "storm";
  const pair = labels[key] || labels.cloudy;
  return lang === "ar" ? pair[1] : pair[0];
}

function toHijri(date: Date, lang: string): string {
  try {
    return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-SA", {
      calendar: "islamic-umalqura",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function WeatherDateBar() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const settings = theme.content.weatherBar;

  const [city, setCity] = useState<GeoCity>({
    id: 0,
    name: settings.defaultCityName,
    latitude: settings.defaultCityLat,
    longitude: settings.defaultCityLon,
    country: "",
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoCity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const { prayerTimes, nextPrayer, loading: prayerLoading } = usePrayerTimes(
    city.latitude,
    city.longitude,
    settings.showPrayerTimes
  );

  // Sync default city from admin settings
  useEffect(() => {
    setCity(prev => {
      if (prev.name === settings.defaultCityName) return prev;
      return {
        id: 0,
        name: settings.defaultCityName,
        latitude: settings.defaultCityLat,
        longitude: settings.defaultCityLon,
        country: "",
      };
    });
  }, [settings.defaultCityName, settings.defaultCityLat, settings.defaultCityLon]);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await res.json();
      if (data.current) {
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          windSpeed: Math.round(data.current.wind_speed_10m),
        });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(city.latitude, city.longitude);
  }, [city, fetchWeather]);

  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=${language}`
      );
      const data = await res.json();
      if (data.results) {
        setSearchResults(
          data.results.map((r: any) => ({
            id: r.id,
            name: r.name,
            latitude: r.latitude,
            longitude: r.longitude,
            country: r.country || "",
            admin1: r.admin1 || "",
          }))
        );
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) searchCities(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCities]);

  if (!settings.visible) return null;

  const now = new Date();
  const dayName = now.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "gregory",
  });
  const hijriStr = settings.showHijriDate ? toHijri(now, language) : "";

  return (
    <div className="bg-header/95 border-b border-border/20 text-link">
      <div className="container flex items-center justify-between h-9 text-xs gap-3">
        {/* Date & Day */}
        <div className="flex items-center gap-2 text-link/90">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">{dayName}</span>
          <span className="text-link/60">|</span>
          <span className="hidden sm:inline">{dateStr}</span>
          {hijriStr && (
            <>
              <span className="hidden md:inline text-link/60">•</span>
              <span className="hidden md:inline text-link/70">{hijriStr}</span>
            </>
          )}
        </div>

        {/* Prayer Times + Weather + City */}
        <div className="flex items-center gap-1.5">
          {/* Prayer times */}
          {settings.showPrayerTimes && (
            <PrayerTimesDisplay
              prayerTimes={prayerTimes}
              nextPrayer={nextPrayer}
              loading={prayerLoading}
            />
          )}

          {/* Divider */}
          {settings.showPrayerTimes && weather && !loading && (
            <span className="text-link/30 hidden sm:inline">|</span>
          )}

          {/* Weather display */}
          {weather && !loading && (
            <div className="flex items-center gap-1.5 text-link/90">
              {getWeatherIcon(weather.weatherCode)}
              <span className="font-semibold">{weather.temperature}°C</span>
              <span className="hidden sm:inline text-link/60 text-[10px]">
                {getWeatherLabel(weather.weatherCode, language)}
              </span>
            </div>
          )}
          {loading && <div className="h-3 w-16 rounded bg-link/20 animate-pulse" />}

          {/* City selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1 text-link/80 hover:text-link hover:bg-link/10"
              >
                <MapPin className="h-3 w-3" />
                <span className="max-w-[80px] truncate">{city.name}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={language === "ar" ? "ابحث عن مدينة..." : "Search city..."}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {searching
                      ? language === "ar" ? "جارٍ البحث..." : "Searching..."
                      : language === "ar" ? "لا توجد نتائج" : "No results"}
                  </CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={String(c.id)}
                        onSelect={() => {
                          setCity(c);
                          setOpen(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {[c.admin1, c.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
