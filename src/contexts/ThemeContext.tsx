import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// ── Types ──────────────────────────────────────────
export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  headerBackground: string;
  button: string;
  buttonForeground: string;
  link: string;
  linkHover: string;
  border: string;
  success: string;
  warning: string;
  destructive: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyArabic: string;
}

export interface SectionConfig {
  id: string;
  visible: boolean;
}

export interface ThemeLayout {
  sections: SectionConfig[];
}

export interface ThemeComponents {
  borderRadius: number;
  cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  buttonStyle: 'default' | 'rounded' | 'pill' | 'sharp';
}

export interface ThemeHeader {
  height: 'compact' | 'default' | 'tall';
  sticky: boolean;
  borderBottom: boolean;
  shadow: 'none' | 'sm' | 'md';
  backdropBlur: boolean;
  layoutStyle: 'default' | 'centered' | 'minimal';
  fontSize: 'sm' | 'base' | 'lg';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  fullWidth: boolean;
  textColor: string;
  borderColor: string;
}

export interface ThemeFooter {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  linkHoverColor: string;
  borderColor: string;
  fontSize: 'sm' | 'base' | 'lg';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  layoutStyle: 'default' | 'centered' | 'minimal';
  fullWidth: boolean;
  borderTop: boolean;
  shadow: 'none' | 'sm' | 'md';
  paddingSize: 'compact' | 'default' | 'spacious';
}

export interface NewsBannerItem {
  id: string;
  textEn: string;
  textAr: string;
  emoji: string;
}

export interface HeroBadge {
  id: string;
  textEn: string;
  textAr: string;
}

export interface HeroContent {
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  ctaEn: string;
  ctaAr: string;
  secondaryCtaEn: string;
  secondaryCtaAr: string;
  imageUrl: string;
  showFloatingCards: boolean;
}

export interface SectionHeading {
  titleEn: string;
  titleAr: string;
}

export interface AboutFeature {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface AboutPageContent {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  missionTitleEn: string;
  missionTitleAr: string;
  missionDescriptionEn: string;
  missionDescriptionAr: string;
  features: AboutFeature[];
}

export interface FooterContent {
  aboutTextEn: string;
  aboutTextAr: string;
  showNewsletter: boolean;
  newsletterTitleEn: string;
  newsletterTitleAr: string;
  newsletterDescriptionEn: string;
  newsletterDescriptionAr: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

export interface WeatherBarSettings {
  visible: boolean;
  showHijriDate: boolean;
  showPrayerTimes: boolean;
  defaultCityName: string;
  defaultCityLat: number;
  defaultCityLon: number;
}

export interface ThemeContent {
  newsBanner: {
    visible: boolean;
    items: NewsBannerItem[];
  };
  heroBadges: HeroBadge[];
  hero: HeroContent;
  sectionHeadings: Record<string, SectionHeading>;
  aboutPage: AboutPageContent;
  footer: FooterContent;
  weatherBar: WeatherBarSettings;
}

export interface ThemeSettings {
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  components: ThemeComponents;
  content: ThemeContent;
  header: ThemeHeader;
  footer: ThemeFooter;
}

// ── Defaults (matching index.css) ───────────────────
export const DEFAULT_COLORS: ThemeColors = {
  background: '183 47% 91%',
  foreground: '240 96% 9%',
  primary: '200 75% 49%',
  primaryForeground: '0 0% 100%',
  secondary: '183 47% 95%',
  secondaryForeground: '240 96% 9%',
  accent: '6 78% 57%',
  accentForeground: '0 0% 100%',
  muted: '183 30% 93%',
  mutedForeground: '240 10% 40%',
  card: '0 0% 100%',
  cardForeground: '240 96% 9%',
  headerBackground: '240 96% 9%',
  button: '6 78% 57%',
  buttonForeground: '0 0% 100%',
  link: '0 0% 100%',
  linkHover: '198 73% 48%',
  border: '183 20% 85%',
  success: '142 76% 36%',
  warning: '45 93% 47%',
  destructive: '6 78% 57%',
};

export const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  fontFamily: 'Inter',
  fontFamilyArabic: 'Cairo',
};

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'hero', visible: true },
  { id: 'featured', visible: true },
  { id: 'newArrivals', visible: true },
  { id: 'bestSellers', visible: true },
  { id: 'recentlyViewed', visible: true },
  { id: 'categories', visible: true },
  { id: 'blog', visible: true },
];

export const DEFAULT_COMPONENTS: ThemeComponents = {
  borderRadius: 0.375,
  cardShadow: 'md',
  buttonStyle: 'default',
};

export const DEFAULT_NEWS_BANNER_ITEMS: NewsBannerItem[] = [
  { id: '1', textEn: '20% OFF on all skincare products', textAr: 'خصم 20% على جميع منتجات العناية بالبشرة', emoji: '🔥' },
  { id: '2', textEn: 'Free delivery on orders over 200 SAR', textAr: 'توصيل مجاني للطلبات فوق 200 ريال', emoji: '🚚' },
  { id: '3', textEn: 'New products now available', textAr: 'منتجات جديدة متوفرة الآن', emoji: '💊' },
  { id: '4', textEn: 'Join our loyalty program and earn points with every order', textAr: 'انضم لبرنامج الولاء واحصل على نقاط مع كل طلب', emoji: '⭐' },
];

export const DEFAULT_HERO_BADGES: HeroBadge[] = [
  { id: '1', textEn: 'Fast Delivery', textAr: 'توصيل سريع' },
  { id: '2', textEn: 'Genuine Products', textAr: 'منتجات أصلية' },
  { id: '3', textEn: '24/7 Support', textAr: 'دعم 24/7' },
];

export const DEFAULT_HERO_CONTENT: HeroContent = {
  titleEn: 'Your Health, Our Priority',
  titleAr: 'صحتك، أولويتنا',
  subtitleEn: 'Discover our wide range of pharmaceutical products and health essentials, delivered right to your doorstep.',
  subtitleAr: 'اكتشف مجموعتنا الواسعة من المنتجات الصيدلانية ومستلزمات الصحة، يتم توصيلها مباشرة إلى باب منزلك.',
  ctaEn: 'Shop Now',
  ctaAr: 'تسوق الآن',
  secondaryCtaEn: 'Learn More',
  secondaryCtaAr: 'اعرف المزيد',
  imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=600&fit=crop',
  showFloatingCards: true,
};

export const DEFAULT_SECTION_HEADINGS: Record<string, SectionHeading> = {
  featured: { titleEn: 'Featured Products', titleAr: 'المنتجات المميزة' },
  newArrivals: { titleEn: 'New Arrivals', titleAr: 'وصل حديثاً' },
  bestSellers: { titleEn: 'Best Sellers', titleAr: 'الأكثر مبيعاً' },
  recentlyViewed: { titleEn: 'Recently Viewed', titleAr: 'شوهد مؤخراً' },
  categories: { titleEn: 'Shop by Category', titleAr: 'تسوق حسب الفئة' },
  blog: { titleEn: 'Health Blog', titleAr: 'المدونة الصحية' },
};

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  titleEn: 'About Us',
  titleAr: 'من نحن',
  descriptionEn: 'A leading pharmacy providing exceptional health services and high-quality pharmaceutical products for our community.',
  descriptionAr: 'صيدلية رائدة في تقديم خدمات صحية متميزة ومنتجات صيدلانية عالية الجودة لمجتمعنا.',
  missionTitleEn: 'Our Mission',
  missionTitleAr: 'مهمتنا',
  missionDescriptionEn: 'We strive to provide comprehensive healthcare and reliable pharmaceutical products for all members of the community, committed to the highest standards of quality and service.',
  missionDescriptionAr: 'نسعى لتوفير رعاية صحية شاملة ومنتجات صيدلانية موثوقة لكل أفراد المجتمع، مع الالتزام بأعلى معايير الجودة والخدمة.',
  features: [
    { id: '1', icon: 'heart', titleEn: 'Trusted Healthcare', titleAr: 'رعاية صحية موثوقة', descriptionEn: 'We provide high-quality certified pharmaceutical products', descriptionAr: 'نقدم منتجات صيدلانية عالية الجودة ومعتمدة' },
    { id: '2', icon: 'shield', titleEn: 'Genuine Products', titleAr: 'منتجات أصلية', descriptionEn: 'All our products are 100% genuine and certified', descriptionAr: 'جميع منتجاتنا أصلية 100% ومعتمدة' },
    { id: '3', icon: 'truck', titleEn: 'Fast Delivery', titleAr: 'توصيل سريع', descriptionEn: 'Fast delivery to your doorstep across the Kingdom', descriptionAr: 'توصيل سريع إلى باب منزلك في جميع أنحاء المملكة' },
    { id: '4', icon: 'clock', titleEn: '24/7 Support', titleAr: 'دعم 24/7', descriptionEn: 'Support team available around the clock to help you', descriptionAr: 'فريق دعم متاح على مدار الساعة لمساعدتك' },
  ],
};

export const DEFAULT_FOOTER_CONTENT: FooterContent = {
  aboutTextEn: 'Your trusted pharmacy partner providing quality healthcare products and services to our community.',
  aboutTextAr: 'شريكك الموثوق في الصيدلة، نقدم منتجات وخدمات رعاية صحية عالية الجودة لمجتمعنا.',
  showNewsletter: true,
  newsletterTitleEn: 'Stay Updated',
  newsletterTitleAr: 'اشترك في النشرة البريدية',
  newsletterDescriptionEn: 'Get the latest articles and offers delivered to your inbox',
  newsletterDescriptionAr: 'احصل على أحدث المقالات والعروض',
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
  },
};

export const DEFAULT_WEATHER_BAR: WeatherBarSettings = {
  visible: true,
  showHijriDate: true,
  showPrayerTimes: true,
  defaultCityName: 'Riyadh',
  defaultCityLat: 24.7136,
  defaultCityLon: 46.6753,
};

export const DEFAULT_CONTENT: ThemeContent = {
  newsBanner: {
    visible: true,
    items: DEFAULT_NEWS_BANNER_ITEMS.map(i => ({ ...i })),
  },
  heroBadges: DEFAULT_HERO_BADGES.map(b => ({ ...b })),
  hero: { ...DEFAULT_HERO_CONTENT },
  sectionHeadings: JSON.parse(JSON.stringify(DEFAULT_SECTION_HEADINGS)),
  aboutPage: JSON.parse(JSON.stringify(DEFAULT_ABOUT_PAGE)),
  footer: JSON.parse(JSON.stringify(DEFAULT_FOOTER_CONTENT)),
  weatherBar: { ...DEFAULT_WEATHER_BAR },
};

export const DEFAULT_HEADER: ThemeHeader = {
  height: 'default',
  sticky: true,
  borderBottom: true,
  shadow: 'none',
  backdropBlur: true,
  layoutStyle: 'default',
  fontSize: 'sm',
  fontWeight: 'medium',
  fullWidth: false,
  textColor: '',
  borderColor: '',
};

export const DEFAULT_FOOTER: ThemeFooter = {
  backgroundColor: '',
  textColor: '',
  linkColor: '',
  linkHoverColor: '',
  borderColor: '',
  fontSize: 'sm',
  fontWeight: 'normal',
  layoutStyle: 'default',
  fullWidth: false,
  borderTop: true,
  shadow: 'none',
  paddingSize: 'default',
};

export const DEFAULT_THEME: ThemeSettings = {
  colors: { ...DEFAULT_COLORS },
  typography: { ...DEFAULT_TYPOGRAPHY },
  layout: { sections: DEFAULT_SECTIONS.map(s => ({ ...s })) },
  components: { ...DEFAULT_COMPONENTS },
  content: JSON.parse(JSON.stringify(DEFAULT_CONTENT)),
  header: { ...DEFAULT_HEADER },
  footer: { ...DEFAULT_FOOTER },
};

// ── CSS Variable Mapping ───────────────────────────
const COLOR_VAR_MAP: Record<keyof ThemeColors, string> = {
  background: '--background',
  foreground: '--foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  headerBackground: '--header-background',
  button: '--button',
  buttonForeground: '--button-foreground',
  link: '--link',
  linkHover: '--link-hover',
  border: '--border',
  success: '--success',
  warning: '--warning',
  destructive: '--destructive',
};

// ── Section labels ─────────────────────────────────
export const SECTION_LABELS: Record<string, { en: string; ar: string }> = {
  hero: { en: 'Hero Banner', ar: 'البانر الرئيسي' },
  featured: { en: 'Featured Products', ar: 'المنتجات المميزة' },
  newArrivals: { en: 'New Arrivals', ar: 'وصل حديثاً' },
  bestSellers: { en: 'Best Sellers', ar: 'الأكثر مبيعاً' },
  recentlyViewed: { en: 'Recently Viewed', ar: 'شوهد مؤخراً' },
  categories: { en: 'Categories', ar: 'الفئات' },
  blog: { en: 'Blog', ar: 'المدونة' },
};

// ── Font options ───────────────────────────────────
export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', style: 'sans-serif' },
  { value: 'Poppins', label: 'Poppins', style: 'sans-serif' },
  { value: 'DM Sans', label: 'DM Sans', style: 'sans-serif' },
  { value: 'Work Sans', label: 'Work Sans', style: 'sans-serif' },
  { value: 'Roboto', label: 'Roboto', style: 'sans-serif' },
  { value: 'Lora', label: 'Lora', style: 'serif' },
  { value: 'Merriweather', label: 'Merriweather', style: 'serif' },
  { value: 'Crimson Pro', label: 'Crimson Pro', style: 'serif' },
];

export const ARABIC_FONT_OPTIONS = [
  { value: 'Cairo', label: 'Cairo' },
];

// ── Context ────────────────────────────────────────
interface ThemeContextValue {
  theme: ThemeSettings;
  updateColor: (key: keyof ThemeColors, value: string) => void;
  updateTypography: (key: keyof ThemeTypography, value: string) => void;
  updateSectionVisibility: (sectionId: string, visible: boolean) => void;
  reorderSections: (sections: SectionConfig[]) => void;
  updateComponent: <K extends keyof ThemeComponents>(key: K, value: ThemeComponents[K]) => void;
  updateContent: (content: ThemeContent) => void;
  updateHeader: <K extends keyof ThemeHeader>(key: K, value: ThemeHeader[K]) => void;
  updateFooter: <K extends keyof ThemeFooter>(key: K, value: ThemeFooter[K]) => void;
  resetToDefaults: () => void;
  hasChanges: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme-settings';

function loadTheme(): ThemeSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        colors: { ...DEFAULT_COLORS, ...parsed.colors },
        typography: { ...DEFAULT_TYPOGRAPHY, ...parsed.typography },
        layout: {
          sections: parsed.layout?.sections?.length
            ? parsed.layout.sections
            : DEFAULT_SECTIONS.map(s => ({ ...s })),
        },
        components: { ...DEFAULT_COMPONENTS, ...parsed.components },
        header: { ...DEFAULT_HEADER, ...parsed.header },
        content: parsed.content
          ? {
              newsBanner: {
                visible: parsed.content.newsBanner?.visible ?? true,
                items: parsed.content.newsBanner?.items?.length
                  ? parsed.content.newsBanner.items
                  : DEFAULT_NEWS_BANNER_ITEMS.map(i => ({ ...i })),
              },
              heroBadges: parsed.content.heroBadges?.length
                ? parsed.content.heroBadges
                : DEFAULT_HERO_BADGES.map(b => ({ ...b })),
              hero: { ...DEFAULT_HERO_CONTENT, ...parsed.content.hero },
              sectionHeadings: {
                ...JSON.parse(JSON.stringify(DEFAULT_SECTION_HEADINGS)),
                ...parsed.content.sectionHeadings,
              },
              aboutPage: parsed.content.aboutPage
                ? {
                    ...JSON.parse(JSON.stringify(DEFAULT_ABOUT_PAGE)),
                    ...parsed.content.aboutPage,
                    features: parsed.content.aboutPage.features?.length
                      ? parsed.content.aboutPage.features
                      : DEFAULT_ABOUT_PAGE.features.map(f => ({ ...f })),
                  }
                : JSON.parse(JSON.stringify(DEFAULT_ABOUT_PAGE)),
              footer: { ...JSON.parse(JSON.stringify(DEFAULT_FOOTER_CONTENT)), ...parsed.content.footer },
              weatherBar: { ...DEFAULT_WEATHER_BAR, ...parsed.content.weatherBar },
            }
          : JSON.parse(JSON.stringify(DEFAULT_CONTENT)),
      };
    }
  } catch {
    // Ignore parse errors
  }
  return JSON.parse(JSON.stringify(DEFAULT_THEME));
}

// Dynamically load a Google Font if not already loaded
const loadedFonts = new Set<string>(['Inter', 'Cairo']);
function loadGoogleFont(fontName: string) {
  if (loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function applyThemeToDOM(theme: ThemeSettings) {
  const root = document.documentElement;

  // Apply colors
  Object.entries(COLOR_VAR_MAP).forEach(([key, cssVar]) => {
    const value = theme.colors[key as keyof ThemeColors];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  });

  // Sync input & ring with border & primary
  root.style.setProperty('--input', theme.colors.border);
  root.style.setProperty('--ring', theme.colors.primary);
  root.style.setProperty('--destructive-foreground', theme.colors.accentForeground);

  // Dynamically load selected fonts
  loadGoogleFont(theme.typography.fontFamily);
  loadGoogleFont(theme.typography.fontFamilyArabic);

  // Apply typography
  const fontStack = `'${theme.typography.fontFamily}', ui-sans-serif, system-ui, sans-serif`;
  const arabicStack = `'${theme.typography.fontFamilyArabic}', '${theme.typography.fontFamily}', system-ui, sans-serif`;
  root.style.setProperty('--font-sans', fontStack);
  root.style.setProperty('--font-arabic', arabicStack);

  // Apply border radius
  root.style.setProperty('--radius', `${theme.components.borderRadius}rem`);
}

// ── Provider ───────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(loadTheme);
  const [hasChanges, setHasChanges] = useState(false);

  // Apply to DOM on mount and whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  // Listen for storage changes from other frames (iframe live preview)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
        const merged: ThemeSettings = {
            colors: { ...DEFAULT_COLORS, ...parsed.colors },
            typography: { ...DEFAULT_TYPOGRAPHY, ...parsed.typography },
            layout: {
              sections: parsed.layout?.sections?.length
                ? parsed.layout.sections
                : DEFAULT_SECTIONS.map(s => ({ ...s })),
            },
            components: { ...DEFAULT_COMPONENTS, ...parsed.components },
            header: { ...DEFAULT_HEADER, ...parsed.header },
            footer: { ...DEFAULT_FOOTER, ...parsed.footer },
            content: parsed.content
              ? {
                  newsBanner: {
                    visible: parsed.content.newsBanner?.visible ?? true,
                    items: parsed.content.newsBanner?.items?.length
                      ? parsed.content.newsBanner.items
                      : DEFAULT_NEWS_BANNER_ITEMS.map(i => ({ ...i })),
                  },
                  heroBadges: parsed.content.heroBadges?.length
                    ? parsed.content.heroBadges
                    : DEFAULT_HERO_BADGES.map(b => ({ ...b })),
                  hero: { ...DEFAULT_HERO_CONTENT, ...parsed.content.hero },
                  sectionHeadings: {
                    ...JSON.parse(JSON.stringify(DEFAULT_SECTION_HEADINGS)),
                    ...parsed.content.sectionHeadings,
                  },
                  aboutPage: parsed.content.aboutPage
                    ? {
                        ...JSON.parse(JSON.stringify(DEFAULT_ABOUT_PAGE)),
                        ...parsed.content.aboutPage,
                        features: parsed.content.aboutPage.features?.length
                          ? parsed.content.aboutPage.features
                          : DEFAULT_ABOUT_PAGE.features.map(f => ({ ...f })),
                      }
                    : JSON.parse(JSON.stringify(DEFAULT_ABOUT_PAGE)),
                  footer: { ...JSON.parse(JSON.stringify(DEFAULT_FOOTER_CONTENT)), ...parsed.content.footer },
                  weatherBar: { ...DEFAULT_WEATHER_BAR, ...parsed.content.weatherBar },
                }
              : JSON.parse(JSON.stringify(DEFAULT_CONTENT)),
          };
          setTheme(merged);
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateColor = useCallback((key: keyof ThemeColors, value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
    setHasChanges(true);
  }, []);

  const updateTypography = useCallback((key: keyof ThemeTypography, value: string) => {
    setTheme(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value },
    }));
    setHasChanges(true);
  }, []);

  const updateSectionVisibility = useCallback((sectionId: string, visible: boolean) => {
    setTheme(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        sections: prev.layout.sections.map(s =>
          s.id === sectionId ? { ...s, visible } : s
        ),
      },
    }));
    setHasChanges(true);
  }, []);

  const reorderSections = useCallback((sections: SectionConfig[]) => {
    setTheme(prev => ({
      ...prev,
      layout: { ...prev.layout, sections },
    }));
    setHasChanges(true);
  }, []);

  const updateComponent = useCallback(<K extends keyof ThemeComponents>(key: K, value: ThemeComponents[K]) => {
    setTheme(prev => ({
      ...prev,
      components: { ...prev.components, [key]: value },
    }));
    setHasChanges(true);
  }, []);

  const updateContent = useCallback((content: ThemeContent) => {
    setTheme(prev => ({
      ...prev,
      content,
    }));
    setHasChanges(true);
  }, []);

  const updateHeader = useCallback(<K extends keyof ThemeHeader>(key: K, value: ThemeHeader[K]) => {
    setTheme(prev => ({
      ...prev,
      header: { ...prev.header, [key]: value },
    }));
    setHasChanges(true);
  }, []);

  const updateFooter = useCallback(<K extends keyof ThemeFooter>(key: K, value: ThemeFooter[K]) => {
    setTheme(prev => ({
      ...prev,
      footer: { ...prev.footer, [key]: value },
    }));
    setHasChanges(true);
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_THEME));
    setTheme(defaults);
    setHasChanges(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateColor,
        updateTypography,
        updateSectionVisibility,
        reorderSections,
        updateComponent,
        updateContent,
        updateHeader,
        updateFooter,
        resetToDefaults,
        hasChanges,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
