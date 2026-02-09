import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lightbulb, ImageIcon } from 'lucide-react';
import type { DocSection } from '@/data/themeDocumentation';
import { sectionImages } from '@/data/themeDocumentation';

interface DocumentationSectionProps {
  section: DocSection;
}

export function DocumentationSection({ section }: DocumentationSectionProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [guideImage, setGuideImage] = useState<string | null>(null);

  useEffect(() => {
    const loader = sectionImages[section.id];
    if (loader) {
      loader().then(mod => setGuideImage(mod.default)).catch(() => setGuideImage(null));
    } else {
      setGuideImage(null);
    }
  }, [section.id]);

  return (
    <div className="space-y-4">
      {/* Visual Guide Image */}
      {guideImage && (
        <div className="rounded-lg overflow-hidden border bg-muted/30">
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {isAr ? 'دليل مرئي' : 'Visual Guide'}
            </span>
          </div>
          <img
            src={guideImage}
            alt={isAr ? section.titleAr : section.titleEn}
            className="w-full h-auto max-h-[280px] object-cover"
            loading="lazy"
          />
        </div>
      )}

      <Accordion type="multiple" defaultValue={section.items.map(i => i.id)}>
        {section.items.map((item) => (
          <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-1 mb-2">
            <AccordionTrigger className="text-sm font-semibold gap-2 px-3 hover:no-underline">
              {isAr ? item.titleAr : item.titleEn}
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-4 space-y-4">
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isAr ? item.descriptionAr : item.descriptionEn}
              </p>

              {/* Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isAr ? 'الخطوات' : 'Steps'}
                </h4>
                <ol className="space-y-2">
                  {item.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold rounded-full">
                          {idx + 1}
                        </Badge>
                      </div>
                      <span>{isAr ? step.ar : step.en}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              {item.tips && item.tips.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    {isAr ? 'نصائح' : 'Tips'}
                  </h4>
                  <ul className="space-y-1.5">
                    {item.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
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
  );
}
