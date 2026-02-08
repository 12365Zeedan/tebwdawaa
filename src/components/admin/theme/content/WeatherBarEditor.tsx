import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, WeatherBarSettings } from '@/contexts/ThemeContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface GeoCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export function WeatherBarEditor() {
  const { language } = useLanguage();
  const { theme, updateContent } = useTheme();
  const settings = theme.content.weatherBar;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoCity[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const update = (partial: Partial<WeatherBarSettings>) => {
    updateContent({
      ...theme.content,
      weatherBar: { ...settings, ...partial },
    });
  };

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
      setSearchResults(
        data.results?.map((r: any) => ({
          id: r.id,
          name: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          country: r.country || '',
          admin1: r.admin1 || '',
        })) || []
      );
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

  return (
    <div className="space-y-4">
      {/* Visibility toggle */}
      <div className="flex items-center justify-between">
        <Label>{language === 'ar' ? 'إظهار شريط الطقس' : 'Show Weather Bar'}</Label>
        <Switch checked={settings.visible} onCheckedChange={(v) => update({ visible: v })} />
      </div>

      {/* Hijri date toggle */}
      <div className="flex items-center justify-between">
        <Label>{language === 'ar' ? 'عرض التاريخ الهجري' : 'Show Hijri Date'}</Label>
        <Switch checked={settings.showHijriDate} onCheckedChange={(v) => update({ showHijriDate: v })} />
      </div>

      {/* Default city */}
      <div className="space-y-2">
        <Label>{language === 'ar' ? 'المدينة الافتراضية' : 'Default City'}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 font-normal">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {settings.defaultCityName}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={language === 'ar' ? 'ابحث عن مدينة...' : 'Search city...'}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>
                  {searching
                    ? language === 'ar' ? 'جارٍ البحث...' : 'Searching...'
                    : language === 'ar' ? 'لا توجد نتائج' : 'No results'}
                </CommandEmpty>
                <CommandGroup>
                  {searchResults.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={String(c.id)}
                      onSelect={() => {
                        update({
                          defaultCityName: c.name,
                          defaultCityLat: c.latitude,
                          defaultCityLon: c.longitude,
                        });
                        setOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {[c.admin1, c.country].filter(Boolean).join(', ')}
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
  );
}
