import React from 'react';
import { useTheme, SECTION_LABELS } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { hslToHex } from '@/lib/colorUtils';
import { Monitor } from 'lucide-react';

export function ThemePreview() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const c = theme.colors;

  const visibleSections = theme.layout.sections.filter(s => s.visible);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
        <Monitor className="h-4 w-4" />
        {language === 'ar' ? 'معاينة مباشرة' : 'Live Preview'}
      </h3>

      <div className="border-2 border-border rounded-xl overflow-hidden shadow-lg">
        {/* Scaled preview container */}
        <div className="origin-top-left" style={{ fontSize: '10px' }}>
          {/* Navbar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ backgroundColor: hslToHex(c.headerBackground) }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
                style={{ backgroundColor: hslToHex(c.primary), color: hslToHex(c.primaryForeground) }}
              >
                S
              </div>
              <span className="font-bold text-[11px]" style={{ color: hslToHex(c.link) }}>
                Store
              </span>
            </div>
            <div className="flex gap-3">
              {['Home', 'Products', 'Blog'].map(item => (
                <span key={item} className="text-[9px]" style={{ color: hslToHex(c.link) }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Sections preview */}
          <div style={{ backgroundColor: hslToHex(c.background) }}>
            {visibleSections.map((section) => {
              const labels = SECTION_LABELS[section.id];
              if (!labels) return null;

              if (section.id === 'hero') {
                return (
                  <div
                    key={section.id}
                    className="px-4 py-6 text-center"
                    style={{ backgroundColor: hslToHex(c.background) }}
                  >
                    <div
                      className="text-[14px] font-bold mb-1"
                      style={{ color: hslToHex(c.foreground), fontFamily: `'${theme.typography.fontFamily}', sans-serif` }}
                    >
                      {language === 'ar' ? 'مرحباً بكم' : 'Welcome'}
                    </div>
                    <div className="text-[9px] mb-2" style={{ color: hslToHex(c.mutedForeground) }}>
                      {language === 'ar' ? 'اكتشف منتجاتنا' : 'Discover our products'}
                    </div>
                    <div
                      className="inline-block px-4 py-1 text-[9px] font-medium"
                      style={{
                        backgroundColor: hslToHex(c.button),
                        color: hslToHex(c.buttonForeground),
                        borderRadius: `${theme.components.borderRadius}rem`,
                      }}
                    >
                      {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                    </div>
                  </div>
                );
              }

              // Product sections
              if (['featured', 'newArrivals', 'bestSellers'].includes(section.id)) {
                return (
                  <div key={section.id} className="px-4 py-3">
                    <div
                      className="text-[11px] font-bold mb-2"
                      style={{ color: hslToHex(c.foreground), fontFamily: `'${theme.typography.fontFamily}', sans-serif` }}
                    >
                      {language === 'ar' ? labels.ar : labels.en}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="p-2 border"
                          style={{
                            backgroundColor: hslToHex(c.card),
                            borderColor: hslToHex(c.border),
                            borderRadius: `${theme.components.borderRadius}rem`,
                            boxShadow: theme.components.cardShadow !== 'none'
                              ? `0 ${theme.components.cardShadow === 'sm' ? '1' : theme.components.cardShadow === 'md' ? '2' : '4'}px ${theme.components.cardShadow === 'sm' ? '2' : theme.components.cardShadow === 'md' ? '4' : '8'}px rgba(0,0,0,0.08)`
                              : 'none',
                          }}
                        >
                          <div
                            className="w-full h-8 rounded mb-1.5"
                            style={{ backgroundColor: hslToHex(c.muted) }}
                          />
                          <div className="h-1.5 rounded mb-1 w-3/4" style={{ backgroundColor: hslToHex(c.mutedForeground), opacity: 0.3 }} />
                          <div className="text-[9px] font-bold" style={{ color: hslToHex(c.primary) }}>
                            $29.99
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // Categories section
              if (section.id === 'categories') {
                return (
                  <div key={section.id} className="px-4 py-3">
                    <div
                      className="text-[11px] font-bold mb-2"
                      style={{ color: hslToHex(c.foreground), fontFamily: `'${theme.typography.fontFamily}', sans-serif` }}
                    >
                      {language === 'ar' ? labels.ar : labels.en}
                    </div>
                    <div className="flex gap-2">
                      {['A', 'B', 'C', 'D'].map(cat => (
                        <div
                          key={cat}
                          className="flex-1 py-1.5 text-center text-[8px] font-medium"
                          style={{
                            backgroundColor: hslToHex(c.secondary),
                            color: hslToHex(c.secondaryForeground),
                            borderRadius: `${theme.components.borderRadius}rem`,
                          }}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // Blog / Recently Viewed — simple placeholder
              return (
                <div key={section.id} className="px-4 py-2">
                  <div
                    className="text-[10px] font-medium py-1 border-b"
                    style={{ color: hslToHex(c.mutedForeground), borderColor: hslToHex(c.border) }}
                  >
                    {language === 'ar' ? labels.ar : labels.en}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3 text-center"
            style={{ backgroundColor: hslToHex(c.headerBackground) }}
          >
            <span className="text-[8px]" style={{ color: hslToHex(c.link) }}>
              © 2026 Store. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
