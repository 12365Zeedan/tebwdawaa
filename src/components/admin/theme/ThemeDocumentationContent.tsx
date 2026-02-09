import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileDown, BookOpen, Rocket, Palette, Type, Layout, Layers, CloudSun, Megaphone, Image, Heading, Info, LayoutTemplate, Package, FolderTree, ShoppingCart, Tag, FileText, RefreshCw, Settings, Search } from 'lucide-react';
import { themeDocSections } from '@/data/themeDocumentation';
import { DocumentationSection } from '@/components/admin/docs/DocumentationSection';
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

export function ThemeDocumentationContent() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [activeSection, setActiveSection] = useState(themeDocSections[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = useDocsSearch(searchQuery, language as 'en' | 'ar');

  const handleDownloadPdf = () => {
    generateThemeDocPdf(language as 'en' | 'ar');
  };

  const currentSection = searchQuery
    ? filteredSections[0]
    : (filteredSections.find(s => s.id === activeSection) ?? filteredSections[0]);

  const Icon = currentSection ? (ICON_MAP[currentSection.icon] ?? BookOpen) : BookOpen;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isAr ? 'ابحث في الدليل...' : 'Search documentation...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleDownloadPdf} className="gap-2" size="sm">
          <FileDown className="h-4 w-4" />
          {isAr ? 'تحميل PDF' : 'Download PDF'}
        </Button>
      </div>

      {filteredSections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{isAr ? 'لا توجد نتائج' : 'No results found'}</p>
          <p className="text-xs mt-1">{isAr ? 'جرب كلمات بحث مختلفة' : 'Try different search terms'}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[220px_1fr] gap-4">
          {/* Left sidebar navigation */}
          <div className="hidden lg:block">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <nav className="space-y-1 pr-2">
                {filteredSections.map((section) => {
                  const SectionIcon = ICON_MAP[section.icon] ?? BookOpen;
                  return (
                    <button
                      key={section.id}
                      onClick={() => { setActiveSection(section.id); }}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                        currentSection?.id === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <SectionIcon className="h-3.5 w-3.5 flex-shrink-0" />
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

          {/* Content area */}
          {currentSection && (
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {isAr ? currentSection.titleAr : currentSection.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isAr
                      ? `${currentSection.items.length} موضوع`
                      : `${currentSection.items.length} topic${currentSection.items.length > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              <DocumentationSection section={currentSection} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
