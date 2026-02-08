import { useState } from 'react';
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  ArrowUpDown,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePageSeoScores, PageSeoScore } from '@/hooks/usePageSeoScores';
import { SeoRecommendationsPanel } from './SeoRecommendationsPanel';

type SortField = 'page_path' | 'overall_score' | 'scanned_at';
type SortDir = 'asc' | 'desc';

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 gap-1 font-semibold">
        <CheckCircle2 className="h-3 w-3" />
        {score}%
      </Badge>
    );
  }
  if (score >= 50) {
    return (
      <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 gap-1 font-semibold">
        <AlertTriangle className="h-3 w-3" />
        {score}%
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 gap-1 font-semibold">
      <XCircle className="h-3 w-3" />
      {score}%
    </Badge>
  );
}

function CheckIcon({ passed }: { passed: boolean }) {
  return passed ? (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ) : (
    <XCircle className="h-4 w-4 text-red-400" />
  );
}

export function PageSeoBreakdown() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const {
    pageScores,
    isLoading,
    isScanning,
    scanProgress,
    averageScore,
    scanAllPages,
  } = usePageSeoScores();

  const [sortField, setSortField] = useState<SortField>('overall_score');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...pageScores].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'overall_score') return (a.overall_score - b.overall_score) * mul;
    if (sortField === 'scanned_at') return (new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime()) * mul;
    return a.page_path.localeCompare(b.page_path) * mul;
  });

  const seoChecks = [
    { key: 'has_meta_title', label: isAr ? 'عنوان الصفحة' : 'Title', tip: 'Meta title tag' },
    { key: 'has_meta_description', label: isAr ? 'الوصف' : 'Desc', tip: 'Meta description' },
    { key: 'has_canonical', label: isAr ? 'كانونيكال' : 'Canon.', tip: 'Canonical URL' },
    { key: 'has_og_tags', label: 'OG', tip: 'Open Graph tags' },
    { key: 'has_structured_data', label: 'JSON-LD', tip: 'Structured data' },
    { key: 'has_h1', label: 'H1', tip: 'H1 heading present' },
    { key: 'has_alt_texts', label: isAr ? 'صور' : 'Alt', tip: 'Image alt texts' },
    { key: 'heading_hierarchy_valid', label: isAr ? 'تسلسل' : 'Hier.', tip: 'Heading hierarchy' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {isAr ? 'تحليل SEO لكل صفحة' : 'Per-Page SEO Breakdown'}
            </CardTitle>
            {pageScores.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {isAr ? `المعدل: ${averageScore}%` : `Avg: ${averageScore}%`}
              </Badge>
            )}
          </div>
          <Button
            onClick={scanAllPages}
            disabled={isScanning}
            size="sm"
            className="gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isAr ? 'جاري الفحص...' : 'Scanning...'}
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                {isAr ? 'فحص كل الصفحات' : 'Scan All Pages'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isScanning && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                {isAr ? `فحص الصفحات... ${scanProgress}%` : `Scanning pages... ${scanProgress}%`}
              </span>
            </div>
            <Progress value={scanProgress} className="h-1.5" />
          </div>
        )}

        {pageScores.length === 0 && !isScanning && !isLoading && (
          <div className="text-center py-10 text-muted-foreground">
            <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              {isAr
                ? "اضغط 'فحص كل الصفحات' لتحليل SEO لصفحات موقعك"
                : "Click 'Scan All Pages' to analyze SEO for your site's pages"}
            </p>
          </div>
        )}

        {pageScores.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('page_path')}
                  >
                    <div className="flex items-center gap-1">
                      {isAr ? 'الصفحة' : 'Page'}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-center"
                    onClick={() => handleSort('overall_score')}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      {isAr ? 'النتيجة' : 'Score'}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  {seoChecks.map((check) => (
                    <TableHead key={check.key} className="text-center px-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs cursor-help">{check.label}</span>
                        </TooltipTrigger>
                        <TooltipContent>{check.tip}</TooltipContent>
                      </Tooltip>
                    </TableHead>
                  ))}
                  <TableHead
                    className="cursor-pointer select-none text-center"
                    onClick={() => handleSort('scanned_at')}
                  >
                    <div className="flex items-center gap-1 justify-center">
                      {isAr ? 'آخر فحص' : 'Scanned'}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((page) => {
                  const isExpanded = expandedRow === page.page_path;
                  return (
                    <Collapsible
                      key={page.page_path}
                      open={isExpanded}
                      onOpenChange={(open) =>
                        setExpandedRow(open ? page.page_path : null)
                      }
                      asChild
                    >
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <ChevronDown
                                  className={`h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                                <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm">{page.page_path}</span>
                              </div>
                              {page.page_title && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px] ms-7">
                                  {page.page_title}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <ScoreBadge score={page.overall_score} />
                            </TableCell>
                            {seoChecks.map((check) => (
                              <TableCell key={check.key} className="text-center px-1.5">
                                <CheckIcon passed={(page as any)[check.key]} />
                              </TableCell>
                            ))}
                            <TableCell className="text-center text-xs text-muted-foreground">
                              {new Date(page.scanned_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <tr>
                            <td colSpan={seoChecks.length + 3} className="p-0">
                              <SeoRecommendationsPanel page={page} />
                            </td>
                          </tr>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
