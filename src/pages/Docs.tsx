import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileDown, BookOpen, Rocket, Palette, Type, Layout, Layers, CloudSun, Megaphone, Image as ImageIcon, Heading, Info, LayoutTemplate, Package, FolderTree, ShoppingCart, Tag, FileText, RefreshCw, Settings, Search, CheckCircle2, Lightbulb, ImageIcon as VisualIcon } from 'lucide-react';
import { themeDocSections, sectionImages, type DocSection } from '@/data/themeDocumentation';
import { generateThemeDocPdf } from '@/lib/generateThemeDocPdf';
import { useDocsSearch } from '@/hooks/useDocsSearch';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  rocket: Rocket,
  palette: Palette,
  type: Type,
  layout: Layout,
  layers: Layers,
  'cloud-sun': CloudSun,
  megaphone: Megaphone,
  image: ImageIcon,
  heading: Heading,
  info: Info,
  'layout-template': LayoutTemplate,
  package: Package,
  'folder-tree': FolderTree,
  'shopping-cart': ShoppingCart,
  tag: Tag,
  'file-text': FileText,
  'refresh-cw': RefreshCw,
  settings: Settings,
};

function SectionVisualGuide({ sectionId, title }: { sectionId: string; title: string }) {
  const [guideImage, setGuideImage] = useState<string | null>(null);
  const { language } = useLanguage();
  const isAr = language === 'ar';

  useEffect(() => {
    const loader = sectionImages[sectionId];
    if (loader) {
      loader().then(mod => setGuideImage(mod.default)).catch(() => setGuideImage(null));
    } else {
      setGuideImage(null);
    }
  }, [sectionId]);

  if (!guideImage) return null;

  return (
    <div className="rounded-lg overflow-hidden border bg-muted/30">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
        <VisualIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {isAr ? 'دليل مرئي' : 'Visual Guide'}
        </span>
      </div>
      <img
        src={guideImage}
        alt={title}
        className="w-full h-auto max-h-[280px] object-cover"
        loading="lazy"
      />
    </div>
  );
}

export default function DocsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [activeSection, setActiveSection] = useState(themeDocSections[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = useDocsSearch(searchQuery, language as 'en' | 'ar');

  const currentSection = searchQuery
    ? filteredSections[0]
    : (filteredSections.find(s => s.id === activeSection) ?? filteredSections[0]);

  const Icon = currentSection ? (ICON_MAP[currentSection.icon] ?? BookOpen) : BookOpen;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {isAr ? 'دليل إعداد القالب' : 'Theme Setup Guide'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isAr
              ? 'دليل شامل خطوة بخطوة لإعداد وتخصيص جميع مكونات القالب'
              : 'A comprehensive step-by-step guide to setting up and customizing all theme components'}
          </p>
        </div>

        {/* Search + Download */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center mb-8 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAr ? 'ابحث في الدليل...' : 'Search documentation...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => generateThemeDocPdf(language as 'en' | 'ar')} variant="outline" className="gap-2" size="sm">
            <FileDown className="h-4 w-4" />
            {isAr ? 'تحميل PDF' : 'Download PDF'}
          </Button>
        </div>

        {filteredSections.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">{isAr ? 'لا توجد نتائج' : 'No results found'}</p>
            <p className="text-sm mt-1">{isAr ? 'جرب كلمات بحث مختلفة' : 'Try different search terms'}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
                  {isAr ? 'الأقسام' : 'Sections'}
                </h3>
                <ScrollArea className="h-[calc(100vh-14rem)]">
                  <nav className="space-y-1 pr-2">
                    {filteredSections.map((section) => {
                      const SectionIcon = ICON_MAP[section.icon] ?? BookOpen;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                            currentSection?.id === section.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                        >
                          <SectionIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{isAr ? section.titleAr : section.titleEn}</span>
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                            {section.items.length}
                          </Badge>
                        </button>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </div>
            </div>

            {/* Mobile section selector */}
            <div className="lg:hidden">
              <select
                value={currentSection?.id ?? ''}
                onChange={(e) => setActiveSection(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {filteredSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {isAr ? section.titleAr : section.titleEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            {currentSection && (
              <div className="space-y-6">
                {/* Section header */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {isAr ? currentSection.titleAr : currentSection.titleEn}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isAr
                        ? `${currentSection.items.length} موضوع`
                        : `${currentSection.items.length} topic${currentSection.items.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                {/* Visual guide */}
                <SectionVisualGuide
                  sectionId={currentSection.id}
                  title={isAr ? currentSection.titleAr : currentSection.titleEn}
                />

                {/* Documentation items */}
                <Accordion type="multiple" defaultValue={currentSection.items.map(i => i.id)}>
                  {currentSection.items.map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-1 mb-3 bg-card">
                      <AccordionTrigger className="text-sm font-semibold gap-2 px-4 hover:no-underline">
                        {isAr ? item.titleAr : item.titleEn}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-5 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {isAr ? item.descriptionAr : item.descriptionEn}
                        </p>

                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {isAr ? 'الخطوات' : 'Steps'}
                          </h4>
                          <ol className="space-y-2.5">
                            {item.steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm">
                                <div className="flex-shrink-0 mt-0.5">
                                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </div>
                                </div>
                                <span className="pt-0.5">{isAr ? step.ar : step.en}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {item.tips && item.tips.length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Lightbulb className="h-3.5 w-3.5" />
                              {isAr ? 'نصائح' : 'Tips'}
                            </h4>
                            <ul className="space-y-2">
                              {item.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                  <span>{isAr ? tip.ar : tip.en}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
