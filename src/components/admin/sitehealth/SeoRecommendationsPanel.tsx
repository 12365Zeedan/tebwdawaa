import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileText,
  Tag,
  Link2,
  Share2,
  Code2,
  Heading1,
  Image,
  ListTree,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PageSeoScore } from '@/hooks/usePageSeoScores';

interface SeoCheckRecommendation {
  key: keyof PageSeoScore;
  icon: React.ReactNode;
  label: string;
  labelAr: string;
  passedText: string;
  passedTextAr: string;
  failedText: string;
  failedTextAr: string;
  fix: string;
  fixAr: string;
  priority: 'high' | 'medium' | 'low';
}

const recommendations: SeoCheckRecommendation[] = [
  {
    key: 'has_meta_title',
    icon: <FileText className="h-4 w-4" />,
    label: 'Meta Title',
    labelAr: 'عنوان الصفحة',
    passedText: 'Page has a valid meta title tag.',
    passedTextAr: 'الصفحة تحتوي على عنوان meta صحيح.',
    failedText: 'Missing or empty <title> tag — search engines cannot display a proper title.',
    failedTextAr: 'علامة <title> مفقودة أو فارغة — لن تتمكن محركات البحث من عرض عنوان مناسب.',
    fix: 'Add a unique, descriptive <title> tag (50-60 characters) with the primary keyword near the beginning.',
    fixAr: 'أضف علامة <title> فريدة ووصفية (50-60 حرف) مع الكلمة المفتاحية في البداية.',
    priority: 'high',
  },
  {
    key: 'has_meta_description',
    icon: <Tag className="h-4 w-4" />,
    label: 'Meta Description',
    labelAr: 'وصف الصفحة',
    passedText: 'Page has a meta description.',
    passedTextAr: 'الصفحة تحتوي على وصف meta.',
    failedText: 'No meta description found — search engines will auto-generate a snippet.',
    failedTextAr: 'لا يوجد وصف meta — ستقوم محركات البحث بتوليد مقتطف تلقائياً.',
    fix: 'Add a compelling <meta name="description"> tag (120-160 characters) summarizing the page content with a call-to-action.',
    fixAr: 'أضف علامة <meta name="description"> جذابة (120-160 حرف) تلخص محتوى الصفحة مع دعوة للعمل.',
    priority: 'high',
  },
  {
    key: 'has_canonical',
    icon: <Link2 className="h-4 w-4" />,
    label: 'Canonical URL',
    labelAr: 'رابط كانونيكال',
    passedText: 'Canonical URL is set correctly.',
    passedTextAr: 'رابط Canonical محدد بشكل صحيح.',
    failedText: 'Missing canonical URL — may cause duplicate content issues.',
    failedTextAr: 'رابط Canonical مفقود — قد يسبب مشاكل المحتوى المكرر.',
    fix: 'Add <link rel="canonical" href="..."> pointing to the preferred version of this page to prevent duplicate content penalties.',
    fixAr: 'أضف <link rel="canonical" href="..."> يشير إلى النسخة المفضلة من هذه الصفحة لمنع عقوبات المحتوى المكرر.',
    priority: 'medium',
  },
  {
    key: 'has_og_tags',
    icon: <Share2 className="h-4 w-4" />,
    label: 'Open Graph Tags',
    labelAr: 'علامات Open Graph',
    passedText: 'Open Graph tags are present for social sharing.',
    passedTextAr: 'علامات Open Graph موجودة للمشاركة الاجتماعية.',
    failedText: 'Missing Open Graph tags — social media shares will lack rich previews.',
    failedTextAr: 'علامات Open Graph مفقودة — مشاركات وسائل التواصل لن تعرض معاينات غنية.',
    fix: 'Add og:title, og:description, og:image, and og:url meta tags. Use images at least 1200x630px for best results.',
    fixAr: 'أضف علامات og:title و og:description و og:image و og:url. استخدم صور بحجم 1200×630 بكسل على الأقل.',
    priority: 'medium',
  },
  {
    key: 'has_structured_data',
    icon: <Code2 className="h-4 w-4" />,
    label: 'Structured Data (JSON-LD)',
    labelAr: 'بيانات منظمة (JSON-LD)',
    passedText: 'Structured data (JSON-LD) is present.',
    passedTextAr: 'البيانات المنظمة (JSON-LD) موجودة.',
    failedText: 'No structured data found — missing out on rich search results.',
    failedTextAr: 'لا توجد بيانات منظمة — فرصة ضائعة لنتائج بحث غنية.',
    fix: 'Add JSON-LD structured data relevant to the page type (Product, Article, BreadcrumbList, Organization, etc.) for rich search results.',
    fixAr: 'أضف بيانات JSON-LD المنظمة المناسبة لنوع الصفحة (منتج، مقال، قائمة تنقل، مؤسسة) للحصول على نتائج بحث غنية.',
    priority: 'medium',
  },
  {
    key: 'has_h1',
    icon: <Heading1 className="h-4 w-4" />,
    label: 'H1 Heading',
    labelAr: 'عنوان H1',
    passedText: 'Page has an H1 heading.',
    passedTextAr: 'الصفحة تحتوي على عنوان H1.',
    failedText: 'No H1 heading found — search engines use this to understand page topic.',
    failedTextAr: 'لا يوجد عنوان H1 — تستخدمه محركات البحث لفهم موضوع الصفحة.',
    fix: 'Add exactly one <h1> tag that clearly describes the main topic of the page. Include your primary keyword naturally.',
    fixAr: 'أضف علامة <h1> واحدة تصف الموضوع الرئيسي للصفحة بوضوح. تضمين الكلمة المفتاحية بشكل طبيعي.',
    priority: 'high',
  },
  {
    key: 'has_alt_texts',
    icon: <Image className="h-4 w-4" />,
    label: 'Image Alt Texts',
    labelAr: 'نصوص بديلة للصور',
    passedText: 'All images have descriptive alt attributes.',
    passedTextAr: 'جميع الصور تحتوي على نصوص بديلة وصفية.',
    failedText: 'Some images are missing alt text — hurts accessibility and image SEO.',
    failedTextAr: 'بعض الصور تفتقر للنص البديل — يضر بإمكانية الوصول و SEO الصور.',
    fix: 'Add descriptive alt attributes to all <img> tags. Describe what the image shows; avoid keyword stuffing.',
    fixAr: 'أضف سمات alt وصفية لجميع علامات <img>. صف ما تعرضه الصورة وتجنب حشو الكلمات المفتاحية.',
    priority: 'high',
  },
  {
    key: 'heading_hierarchy_valid',
    icon: <ListTree className="h-4 w-4" />,
    label: 'Heading Hierarchy',
    labelAr: 'تسلسل العناوين',
    passedText: 'Heading hierarchy is valid (single H1).',
    passedTextAr: 'تسلسل العناوين صحيح (H1 واحد).',
    failedText: 'Multiple H1 tags or broken heading hierarchy detected.',
    failedTextAr: 'تم اكتشاف علامات H1 متعددة أو تسلسل عناوين معطل.',
    fix: 'Use exactly one H1 per page. Structure content with H2 → H3 → H4 in a logical hierarchy without skipping levels.',
    fixAr: 'استخدم H1 واحد فقط لكل صفحة. نظم المحتوى بتسلسل H2 → H3 → H4 بشكل منطقي دون تخطي مستويات.',
    priority: 'low',
  },
];

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
  };
  const labels = { high: 'High', medium: 'Medium', low: 'Low' };
  return <Badge className={`${colors[priority]} text-[10px] px-1.5 py-0`}>{labels[priority]}</Badge>;
}

interface SeoRecommendationsPanelProps {
  page: PageSeoScore;
}

export function SeoRecommendationsPanel({ page }: SeoRecommendationsPanelProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const failedChecks = recommendations.filter((r) => !(page as any)[r.key]);
  const passedChecks = recommendations.filter((r) => (page as any)[r.key]);

  return (
    <div className="px-4 py-4 space-y-4 bg-muted/30 border-t" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Failed checks — actionable recommendations */}
      {failedChecks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Lightbulb className="h-4 w-4" />
            {isAr
              ? `${failedChecks.length} توصيات للتحسين`
              : `${failedChecks.length} Recommendation${failedChecks.length > 1 ? 's' : ''} to Fix`}
          </div>
          <div className="grid gap-2">
            {failedChecks.map((rec) => (
              <div
                key={rec.key}
                className="flex gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5"
              >
                <div className="mt-0.5 text-destructive/70">{rec.icon}</div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{isAr ? rec.labelAr : rec.label}</span>
                    <PriorityBadge priority={rec.priority} />
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? rec.failedTextAr : rec.failedText}
                  </p>
                  {rec.key === 'has_alt_texts' && page.missing_alt_count > 0 && (
                    <p className="text-xs text-destructive/80 font-medium">
                      {isAr
                        ? `${page.missing_alt_count} صور بدون نص بديل`
                        : `${page.missing_alt_count} image${page.missing_alt_count > 1 ? 's' : ''} missing alt text`}
                    </p>
                  )}
                  <div className="flex items-start gap-1.5 mt-1 p-2 rounded bg-background/80 border border-border/50">
                    <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground/80 font-medium">
                      {isAr ? rec.fixAr : rec.fix}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passed checks summary */}
      {passedChecks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            {isAr
              ? `${passedChecks.length} فحوصات ناجحة`
              : `${passedChecks.length} Check${passedChecks.length > 1 ? 's' : ''} Passed`}
          </div>
          <div className="grid gap-1.5">
            {passedChecks.map((rec) => (
              <div
                key={rec.key}
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-md bg-green-500/5"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">{isAr ? rec.labelAr : rec.label}:</span>{' '}
                  {isAr ? rec.passedTextAr : rec.passedText}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Page details from stored data */}
      {page.details && typeof page.details === 'object' && Object.keys(page.details).length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            {isAr ? 'تفاصيل إضافية' : 'Additional Details'}
          </p>
          <div className="flex flex-wrap gap-2">
            {(page.details as Record<string, unknown>).title_length !== undefined && (
              <Badge variant="outline" className="text-[10px]">
                {isAr ? 'طول العنوان' : 'Title length'}: {String((page.details as any).title_length)}
              </Badge>
            )}
            {(page.details as Record<string, unknown>).desc_length !== undefined && (
              <Badge variant="outline" className="text-[10px]">
                {isAr ? 'طول الوصف' : 'Desc length'}: {String((page.details as any).desc_length)}
              </Badge>
            )}
            {(page.details as Record<string, unknown>).h1_count !== undefined && (
              <Badge variant="outline" className="text-[10px]">
                {isAr ? 'عدد H1' : 'H1 count'}: {String((page.details as any).h1_count)}
              </Badge>
            )}
            {(page.details as Record<string, unknown>).images_total !== undefined && (
              <Badge variant="outline" className="text-[10px]">
                {isAr ? 'عدد الصور' : 'Images'}: {String((page.details as any).images_total)}
              </Badge>
            )}
            {(page.details as Record<string, unknown>).jsonld_count !== undefined && (
              <Badge variant="outline" className="text-[10px]">
                JSON-LD: {String((page.details as any).jsonld_count)}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
