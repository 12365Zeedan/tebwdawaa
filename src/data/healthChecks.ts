export type HealthCheckSeverity = "critical" | "warning" | "info" | "good";
export type HealthCheckCategory = "performance" | "security" | "seo" | "accessibility" | "database" | "general";
export type HealthCheckStatus = "pending" | "running" | "passed" | "failed" | "warning";

export interface HealthCheck {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: HealthCheckCategory;
  severity: HealthCheckSeverity;
  autoFixable: boolean;
  fixDescription?: string;
}

export interface HealthCheckResult {
  checkId: string;
  status: HealthCheckStatus;
  message: string;
  details?: string;
  value?: string | number;
  recommendation?: string;
  fixApplied?: boolean;
}

export const healthChecks: HealthCheck[] = [
  // Performance Checks
  {
    id: "perf-bundle-size",
    name: "Bundle Size Analysis",
    nameAr: "تحليل حجم الحزمة",
    description: "Checks if the JavaScript bundle size is within acceptable limits",
    descriptionAr: "يتحقق مما إذا كان حجم حزمة JavaScript ضمن الحدود المقبولة",
    category: "performance",
    severity: "warning",
    autoFixable: false,
  },
  {
    id: "perf-image-optimization",
    name: "Image Optimization",
    nameAr: "تحسين الصور",
    description: "Checks for unoptimized or oversized images",
    descriptionAr: "يتحقق من الصور غير المحسنة أو كبيرة الحجم",
    category: "performance",
    severity: "warning",
    autoFixable: false,
    fixDescription: "Compress and resize large images",
  },
  {
    id: "perf-lazy-loading",
    name: "Lazy Loading Check",
    nameAr: "فحص التحميل الكسول",
    description: "Verifies images and components use lazy loading",
    descriptionAr: "يتحقق من استخدام التحميل الكسول للصور والمكونات",
    category: "performance",
    severity: "info",
    autoFixable: false,
  },
  {
    id: "perf-render-blocking",
    name: "Render-Blocking Resources",
    nameAr: "الموارد المعطلة للعرض",
    description: "Identifies CSS/JS that blocks page rendering",
    descriptionAr: "يحدد CSS/JS التي تمنع عرض الصفحة",
    category: "performance",
    severity: "critical",
    autoFixable: false,
  },
  {
    id: "perf-caching",
    name: "Browser Caching",
    nameAr: "التخزين المؤقت للمتصفح",
    description: "Checks caching headers and static asset caching",
    descriptionAr: "يتحقق من رؤوس التخزين المؤقت وتخزين الأصول الثابتة",
    category: "performance",
    severity: "warning",
    autoFixable: false,
  },
  // Security Checks
  {
    id: "sec-https",
    name: "HTTPS Enforcement",
    nameAr: "فرض HTTPS",
    description: "Ensures all pages are served over HTTPS",
    descriptionAr: "يضمن تقديم جميع الصفحات عبر HTTPS",
    category: "security",
    severity: "critical",
    autoFixable: false,
  },
  {
    id: "sec-headers",
    name: "Security Headers",
    nameAr: "رؤوس الأمان",
    description: "Checks for essential security headers (CSP, X-Frame-Options, etc.)",
    descriptionAr: "يتحقق من رؤوس الأمان الأساسية",
    category: "security",
    severity: "critical",
    autoFixable: false,
  },
  {
    id: "sec-rls",
    name: "Row Level Security",
    nameAr: "أمان مستوى الصف",
    description: "Verifies RLS policies are enabled on all database tables",
    descriptionAr: "يتحقق من تمكين سياسات أمان مستوى الصف على جميع جداول قاعدة البيانات",
    category: "security",
    severity: "critical",
    autoFixable: false,
  },
  {
    id: "sec-auth-config",
    name: "Authentication Configuration",
    nameAr: "تكوين المصادقة",
    description: "Checks authentication settings and password policies",
    descriptionAr: "يتحقق من إعدادات المصادقة وسياسات كلمة المرور",
    category: "security",
    severity: "warning",
    autoFixable: false,
  },
  {
    id: "sec-api-keys",
    name: "API Key Exposure",
    nameAr: "كشف مفاتيح API",
    description: "Scans for exposed API keys in client-side code",
    descriptionAr: "يبحث عن مفاتيح API المكشوفة في التعليمات البرمجية من جانب العميل",
    category: "security",
    severity: "critical",
    autoFixable: false,
  },
  // SEO Checks
  {
    id: "seo-meta-tags",
    name: "Meta Tags",
    nameAr: "علامات الميتا",
    description: "Checks for proper title, description, and Open Graph tags",
    descriptionAr: "يتحقق من عنوان ووصف وعلامات Open Graph الصحيحة",
    category: "seo",
    severity: "warning",
    autoFixable: true,
    fixDescription: "Add missing meta tags automatically",
  },
  {
    id: "seo-sitemap",
    name: "Sitemap.xml",
    nameAr: "خريطة الموقع",
    description: "Verifies sitemap exists and is properly formatted",
    descriptionAr: "يتحقق من وجود خريطة الموقع وتنسيقها بشكل صحيح",
    category: "seo",
    severity: "warning",
    autoFixable: true,
    fixDescription: "Generate sitemap.xml automatically",
  },
  {
    id: "seo-robots",
    name: "Robots.txt",
    nameAr: "ملف الروبوتات",
    description: "Checks robots.txt configuration",
    descriptionAr: "يتحقق من تكوين ملف الروبوتات",
    category: "seo",
    severity: "info",
    autoFixable: true,
    fixDescription: "Create optimized robots.txt",
  },
  {
    id: "seo-structured-data",
    name: "Structured Data (JSON-LD)",
    nameAr: "البيانات المنظمة",
    description: "Checks for proper JSON-LD schema markup on product pages",
    descriptionAr: "يتحقق من ترميز البيانات المنظمة على صفحات المنتجات",
    category: "seo",
    severity: "warning",
    autoFixable: true,
    fixDescription: "Enable JSON-LD structured data on product pages",
  },
  {
    id: "seo-canonical",
    name: "Canonical URLs",
    nameAr: "الروابط الأساسية",
    description: "Ensures canonical URLs are properly set to avoid duplicate content",
    descriptionAr: "يضمن تعيين الروابط الأساسية بشكل صحيح لتجنب المحتوى المكرر",
    category: "seo",
    severity: "info",
    autoFixable: true,
    fixDescription: "Add canonical tags to all pages",
  },
  // Accessibility Checks
  {
    id: "a11y-alt-text",
    name: "Image Alt Text",
    nameAr: "نص بديل للصور",
    description: "Checks all images have descriptive alt text",
    descriptionAr: "يتحقق من أن جميع الصور تحتوي على نص بديل وصفي",
    category: "accessibility",
    severity: "warning",
    autoFixable: false,
  },
  {
    id: "a11y-contrast",
    name: "Color Contrast",
    nameAr: "تباين الألوان",
    description: "Verifies text has sufficient color contrast against backgrounds",
    descriptionAr: "يتحقق من أن النص يحتوي على تباين ألوان كافٍ مقابل الخلفيات",
    category: "accessibility",
    severity: "warning",
    autoFixable: false,
  },
  {
    id: "a11y-heading-hierarchy",
    name: "Heading Hierarchy",
    nameAr: "تسلسل العناوين",
    description: "Checks proper heading structure (H1-H6 order)",
    descriptionAr: "يتحقق من بنية العناوين الصحيحة",
    category: "accessibility",
    severity: "info",
    autoFixable: false,
  },
  {
    id: "a11y-keyboard-nav",
    name: "Keyboard Navigation",
    nameAr: "التنقل بلوحة المفاتيح",
    description: "Verifies all interactive elements are keyboard accessible",
    descriptionAr: "يتحقق من إمكانية الوصول إلى جميع العناصر التفاعلية عبر لوحة المفاتيح",
    category: "accessibility",
    severity: "warning",
    autoFixable: false,
  },
  {
    id: "a11y-aria-labels",
    name: "ARIA Labels",
    nameAr: "تسميات ARIA",
    description: "Checks for proper ARIA labels on interactive elements",
    descriptionAr: "يتحقق من وجود تسميات ARIA الصحيحة على العناصر التفاعلية",
    category: "accessibility",
    severity: "info",
    autoFixable: false,
  },
  // Database & General
  {
    id: "db-unused-tables",
    name: "Database Table Health",
    nameAr: "صحة جداول قاعدة البيانات",
    description: "Checks for empty or unused database tables",
    descriptionAr: "يتحقق من جداول قاعدة البيانات الفارغة أو غير المستخدمة",
    category: "database",
    severity: "info",
    autoFixable: false,
  },
  {
    id: "db-storage-usage",
    name: "Storage Usage",
    nameAr: "استخدام التخزين",
    description: "Monitors database and file storage usage",
    descriptionAr: "يراقب استخدام قاعدة البيانات وتخزين الملفات",
    category: "database",
    severity: "warning",
    autoFixable: false,
  },
  {
    id: "gen-broken-links",
    name: "Broken Links Detection",
    nameAr: "كشف الروابط المعطلة",
    description: "Scans for broken internal and external links",
    descriptionAr: "يبحث عن الروابط الداخلية والخارجية المعطلة",
    category: "general",
    severity: "warning",
    autoFixable: false,
  },
  {
    id: "gen-error-pages",
    name: "Error Pages Configuration",
    nameAr: "تكوين صفحات الخطأ",
    description: "Checks for proper 404 and error page setup",
    descriptionAr: "يتحقق من إعداد صفحات 404 والخطأ بشكل صحيح",
    category: "general",
    severity: "info",
    autoFixable: false,
  },
];

export const categoryLabels: Record<HealthCheckCategory, { en: string; ar: string; color: string }> = {
  performance: { en: "Performance", ar: "الأداء", color: "text-blue-500" },
  security: { en: "Security", ar: "الأمان", color: "text-red-500" },
  seo: { en: "SEO", ar: "تحسين محركات البحث", color: "text-green-500" },
  accessibility: { en: "Accessibility", ar: "إمكانية الوصول", color: "text-purple-500" },
  database: { en: "Database", ar: "قاعدة البيانات", color: "text-orange-500" },
  general: { en: "General", ar: "عام", color: "text-muted-foreground" },
};
