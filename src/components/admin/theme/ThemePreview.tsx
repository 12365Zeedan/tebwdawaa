import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Monitor, Smartphone, Tablet, RefreshCw, Maximize2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PREVIEW_PAGES = [
  { path: '/', labelEn: 'Home', labelAr: 'الرئيسية' },
  { path: '/products', labelEn: 'Products', labelAr: 'المنتجات' },
  { path: '/categories', labelEn: 'Categories', labelAr: 'الفئات' },
  { path: '/blog', labelEn: 'Blog', labelAr: 'المدونة' },
  { path: '/about', labelEn: 'About', labelAr: 'من نحن' },
  { path: '/cart', labelEn: 'Cart', labelAr: 'السلة' },
  { path: '/wishlist', labelEn: 'Wishlist', labelAr: 'المفضلة' },
];

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceMode, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
};

export function ThemePreview() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [selectedPage, setSelectedPage] = useState('/');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenDevice, setFullscreenDevice] = useState<DeviceMode>('desktop');
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  // Calculate scale to fit the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        const iframeWidth = DEVICE_WIDTHS[deviceMode];
        const newScale = Math.min(containerWidth / iframeWidth, 0.5);
        setScale(newScale);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [deviceMode]);

  // Force iframe reload when theme changes significantly
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [
    theme.layout.sections.map(s => `${s.id}:${s.visible}`).join(','),
    theme.content.newsBanner.visible,
    theme.content.newsBanner.items.length,
  ]);

  const iframeWidth = DEVICE_WIDTHS[deviceMode];
  const iframeHeight = deviceMode === 'mobile' ? 812 : deviceMode === 'tablet' ? 1024 : 800;

  const fullscreenIframeWidth = DEVICE_WIDTHS[fullscreenDevice];
  const fullscreenIframeHeight = fullscreenDevice === 'mobile' ? 812 : fullscreenDevice === 'tablet' ? 1024 : 900;

  return (
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Monitor className="h-4 w-4" />
            {language === 'ar' ? 'معاينة مباشرة' : 'Live Preview'}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setFullscreenDevice(deviceMode);
                setFullscreen(true);
              }}
              title={language === 'ar' ? 'معاينة بملء الشاشة' : 'Full-screen Preview'}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRefreshKey(prev => prev + 1)}
              title={language === 'ar' ? 'تحديث' : 'Refresh'}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Page Selector */}
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PREVIEW_PAGES.map((page) => (
              <SelectItem key={page.path} value={page.path} className="text-xs">
                {language === 'ar' ? page.labelAr : page.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Device Toggle */}
        <ToggleGroup
          type="single"
          value={deviceMode}
          onValueChange={(val) => val && setDeviceMode(val as DeviceMode)}
          className="justify-start"
        >
          <ToggleGroupItem value="desktop" size="sm" className="h-7 w-7 p-0">
            <Monitor className="h-3.5 w-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="tablet" size="sm" className="h-7 w-7 p-0">
            <Tablet className="h-3.5 w-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="mobile" size="sm" className="h-7 w-7 p-0">
            <Smartphone className="h-3.5 w-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Iframe Preview Container */}
        <div
          ref={containerRef}
          className="border-2 border-border rounded-xl overflow-hidden shadow-lg bg-muted"
          style={{
            height: `${iframeHeight * scale + 4}px`,
          }}
        >
          <div
            style={{
              width: `${iframeWidth}px`,
              height: `${iframeHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <iframe
              key={`${selectedPage}-${refreshKey}`}
              src={`${selectedPage}?_preview=1`}
              title="Theme Preview"
              className="w-full h-full border-0"
              style={{ pointerEvents: 'none' }}
            />
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          {language === 'ar'
            ? 'المعاينة تعكس التغييرات فورياً'
            : 'Preview reflects changes in real-time'}
        </p>
      </div>

      {/* Full-screen Preview Dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-sm font-semibold">
              {language === 'ar' ? 'معاينة بملء الشاشة' : 'Full-screen Preview'}
            </DialogTitle>
            <div className="flex items-center gap-3 mr-8">
              {/* Page Selector */}
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="h-8 text-xs w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREVIEW_PAGES.map((page) => (
                    <SelectItem key={page.path} value={page.path} className="text-xs">
                      {language === 'ar' ? page.labelAr : page.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Device Toggle */}
              <ToggleGroup
                type="single"
                value={fullscreenDevice}
                onValueChange={(val) => val && setFullscreenDevice(val as DeviceMode)}
              >
                <ToggleGroupItem value="desktop" size="sm" className="h-8 w-8 p-0">
                  <Monitor className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="tablet" size="sm" className="h-8 w-8 p-0">
                  <Tablet className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="mobile" size="sm" className="h-8 w-8 p-0">
                  <Smartphone className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Refresh */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setRefreshKey(prev => prev + 1)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Fullscreen iframe area */}
          <div className="flex-1 overflow-auto bg-muted flex justify-center items-start p-4">
            <div
              className="border-2 border-border rounded-xl overflow-hidden shadow-2xl bg-background transition-all duration-300"
              style={{
                width: `${fullscreenIframeWidth}px`,
                maxWidth: '100%',
                height: `${fullscreenIframeHeight}px`,
              }}
            >
              <iframe
                key={`fullscreen-${selectedPage}-${refreshKey}-${fullscreenDevice}`}
                src={`${selectedPage}?_preview=1`}
                title="Full-screen Theme Preview"
                className="w-full h-full border-0"
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
