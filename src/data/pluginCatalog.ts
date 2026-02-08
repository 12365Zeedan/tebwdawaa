export type PluginCategory = "security" | "performance" | "seo" | "marketing";

export interface PluginDefinition {
  key: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: PluginCategory;
  icon: string;
  version: string;
  author: string;
  compatibleWith: string[];
  features: { en: string; ar: string }[];
}

export const PLUGIN_CATALOG: PluginDefinition[] = [
  {
    key: "firewall",
    nameEn: "Firewall & Security",
    nameAr: "جدار الحماية والأمان",
    descriptionEn: "Protect your site from malicious attacks, brute force, and unauthorized access with advanced firewall rules.",
    descriptionAr: "احمِ موقعك من الهجمات الضارة والدخول غير المصرح به بقواعد جدار حماية متقدمة.",
    category: "security",
    icon: "Shield",
    version: "2.1.0",
    author: "SecureGuard",
    compatibleWith: ["WordPress", "Shopify", "Salla"],
    features: [
      { en: "IP blocking & rate limiting", ar: "حظر IP وتقييد المعدل" },
      { en: "Brute force protection", ar: "حماية من هجمات القوة الغاشمة" },
      { en: "Real-time threat detection", ar: "اكتشاف التهديدات في الوقت الفعلي" },
      { en: "Login security", ar: "أمان تسجيل الدخول" },
    ],
  },
  {
    key: "ssl-manager",
    nameEn: "SSL Certificate Manager",
    nameAr: "مدير شهادات SSL",
    descriptionEn: "Manage SSL certificates, enforce HTTPS, and ensure secure connections across your entire site.",
    descriptionAr: "إدارة شهادات SSL وفرض HTTPS وضمان اتصالات آمنة في جميع أنحاء موقعك.",
    category: "security",
    icon: "Lock",
    version: "1.5.2",
    author: "CertSecure",
    compatibleWith: ["WordPress", "Shopify", "Salla"],
    features: [
      { en: "Auto SSL renewal", ar: "تجديد SSL تلقائي" },
      { en: "Force HTTPS redirect", ar: "إعادة توجيه HTTPS إجباري" },
      { en: "Mixed content scanner", ar: "فاحص المحتوى المختلط" },
      { en: "Certificate monitoring", ar: "مراقبة الشهادات" },
    ],
  },
  {
    key: "litespeed-cache",
    nameEn: "LiteSpeed Cache",
    nameAr: "ذاكرة LiteSpeed التخزينية",
    descriptionEn: "Accelerate your site with advanced page caching, browser caching, and CDN integration for blazing fast load times.",
    descriptionAr: "سرّع موقعك بتخزين الصفحات المتقدم وتخزين المتصفح ودمج CDN لأوقات تحميل سريعة.",
    category: "performance",
    icon: "Zap",
    version: "3.0.1",
    author: "LiteSpeed Tech",
    compatibleWith: ["WordPress", "Shopify"],
    features: [
      { en: "Page caching & purge", ar: "تخزين الصفحات والتطهير" },
      { en: "Browser cache control", ar: "التحكم في ذاكرة المتصفح" },
      { en: "CDN integration", ar: "تكامل CDN" },
      { en: "Lazy load resources", ar: "التحميل الكسول للموارد" },
    ],
  },
  {
    key: "image-optimizer",
    nameEn: "Image Optimizer",
    nameAr: "محسّن الصور",
    descriptionEn: "Automatically compress and optimize images to reduce page size and improve loading speed without losing quality.",
    descriptionAr: "ضغط وتحسين الصور تلقائياً لتقليل حجم الصفحة وتحسين سرعة التحميل دون فقدان الجودة.",
    category: "performance",
    icon: "Image",
    version: "2.3.0",
    author: "OptiMedia",
    compatibleWith: ["WordPress", "Shopify", "Salla"],
    features: [
      { en: "Lossless & lossy compression", ar: "ضغط بدون فقدان وبفقدان" },
      { en: "WebP conversion", ar: "تحويل إلى WebP" },
      { en: "Bulk optimization", ar: "تحسين مجمع" },
      { en: "Lazy loading images", ar: "التحميل الكسول للصور" },
    ],
  },
  {
    key: "seo-optimizer",
    nameEn: "SEO Optimizer",
    nameAr: "محسّن SEO",
    descriptionEn: "Boost your search engine rankings with advanced SEO tools including meta tags, sitemaps, schema markup, and more.",
    descriptionAr: "عزز ترتيبك في محركات البحث بأدوات SEO متقدمة تشمل العلامات الوصفية وخرائط الموقع والمخطط البنائي.",
    category: "seo",
    icon: "Search",
    version: "4.1.0",
    author: "RankBoost",
    compatibleWith: ["WordPress", "Shopify", "Salla"],
    features: [
      { en: "Meta tags management", ar: "إدارة العلامات الوصفية" },
      { en: "XML sitemap generation", ar: "إنشاء خريطة موقع XML" },
      { en: "Schema/structured data", ar: "بيانات منظمة / Schema" },
      { en: "SEO analysis & scoring", ar: "تحليل وتقييم SEO" },
    ],
  },
  {
    key: "analytics-tracker",
    nameEn: "Analytics & Tracking",
    nameAr: "التحليلات والتتبع",
    descriptionEn: "Integrate Google Analytics, Facebook Pixel, and other tracking tools to monitor visitor behavior and conversions.",
    descriptionAr: "دمج Google Analytics وFacebook Pixel وأدوات تتبع أخرى لمراقبة سلوك الزوار والتحويلات.",
    category: "marketing",
    icon: "BarChart3",
    version: "1.8.0",
    author: "TrackMaster",
    compatibleWith: ["WordPress", "Shopify", "Salla"],
    features: [
      { en: "Google Analytics integration", ar: "تكامل Google Analytics" },
      { en: "Facebook Pixel support", ar: "دعم Facebook Pixel" },
      { en: "Conversion tracking", ar: "تتبع التحويلات" },
      { en: "Custom event tracking", ar: "تتبع أحداث مخصصة" },
    ],
  },
  {
    key: "email-marketing",
    nameEn: "Email Marketing",
    nameAr: "التسويق بالبريد الإلكتروني",
    descriptionEn: "Create automated email campaigns, abandoned cart reminders, and promotional newsletters to engage your customers.",
    descriptionAr: "إنشاء حملات بريد إلكتروني تلقائية وتذكيرات السلة المتروكة ونشرات إخبارية ترويجية لإشراك عملائك.",
    category: "marketing",
    icon: "Mail",
    version: "2.0.3",
    author: "MailFlow",
    compatibleWith: ["WordPress", "Shopify", "Salla"],
    features: [
      { en: "Automated email campaigns", ar: "حملات بريد إلكتروني تلقائية" },
      { en: "Abandoned cart recovery", ar: "استعادة السلة المتروكة" },
      { en: "Customer segmentation", ar: "تقسيم العملاء" },
      { en: "A/B testing", ar: "اختبار A/B" },
    ],
  },
  {
    key: "social-integration",
    nameEn: "Social Media Integration",
    nameAr: "تكامل وسائل التواصل الاجتماعي",
    descriptionEn: "Connect your store to social media platforms for product sharing, social login, and auto-posting features.",
    descriptionAr: "اربط متجرك بمنصات التواصل الاجتماعي لمشاركة المنتجات وتسجيل الدخول الاجتماعي والنشر التلقائي.",
    category: "marketing",
    icon: "Share2",
    version: "1.4.0",
    author: "SocialConnect",
    compatibleWith: ["WordPress", "Shopify", "Salla"],
    features: [
      { en: "Social sharing buttons", ar: "أزرار المشاركة الاجتماعية" },
      { en: "Social login", ar: "تسجيل الدخول الاجتماعي" },
      { en: "Auto-post to social", ar: "نشر تلقائي للتواصل الاجتماعي" },
      { en: "Instagram feed widget", ar: "ويدجت Instagram" },
    ],
  },
];

export const CATEGORY_LABELS: Record<PluginCategory, { en: string; ar: string; color: string }> = {
  security: { en: "Security", ar: "الأمان", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  performance: { en: "Performance", ar: "الأداء", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  seo: { en: "SEO", ar: "تحسين محركات البحث", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  marketing: { en: "Marketing", ar: "التسويق", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};
