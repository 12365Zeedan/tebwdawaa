import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileDown, BookOpen, Rocket, Palette, Type, Layout, Layers, CloudSun, Megaphone, Image, Heading, Info, LayoutTemplate, Package, FolderTree, ShoppingCart, Tag, FileText, RefreshCw, Settings } from 'lucide-react';
import { themeDocSections } from '@/data/themeDocumentation';
import { DocumentationSection } from '@/components/admin/docs/DocumentationSection';
import { generateThemeDocPdf } from '@/lib/generateThemeDocPdf';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  rocket: Rocket,
  palette: Palette,
  type: Type,
  layout: Layout,
  layers: Layers,
  'cloud-sun': CloudSun,
  megaphone: Megaphone,
  image: Image,
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

export default function AdminThemeDocumentation() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [activeSection, setActiveSection] = useState(themeDocSections[0].id);

  const handleDownloadPdf = () => {
    generateThemeDocPdf(language as 'en' | 'ar');
  };

  const currentSection = themeDocSections.find(s => s.id === activeSection) ?? themeDocSections[0];
  const Icon = ICON_MAP[currentSection.icon] ?? BookOpen;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              {isAr ? 'دليل إعداد القالب' : 'Theme Documentation'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr
                ? 'دليل شامل خطوة بخطوة لإعداد وتخصيص جميع مكونات القالب'
                : 'A comprehensive step-by-step guide to setting up and customizing all theme components'}
            </p>
          </div>
          <Button onClick={handleDownloadPdf} className="gap-2">
            <FileDown className="h-4 w-4" />
            {isAr ? 'تحميل PDF' : 'Download PDF'}
          </Button>
        </div>

        {/* Main layout: Sidebar + Content */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Left sidebar navigation */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <nav className="space-y-1 pr-2">
                  {themeDocSections.map((section) => {
                    const SectionIcon = ICON_MAP[section.icon] ?? BookOpen;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                          activeSection === section.id
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
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {themeDocSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {isAr ? section.titleAr : section.titleEn}
                </option>
              ))}
            </select>
          </div>

          {/* Content area */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isAr ? currentSection.titleAr : currentSection.titleEn}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? `${currentSection.items.length} موضوع`
                    : `${currentSection.items.length} topic${currentSection.items.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <DocumentationSection section={currentSection} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
