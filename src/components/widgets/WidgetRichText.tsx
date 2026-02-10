import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { RichTextConfig } from '@/hooks/useCustomWidgets';

interface Props {
  config: RichTextConfig;
}

export function WidgetRichText({ config }: Props) {
  const { language } = useLanguage();
  const rawContent = language === 'ar' ? (config.contentAr || config.content) : config.content;
  const content = useMemo(() => rawContent ? DOMPurify.sanitize(rawContent) : '', [rawContent]);

  if (!content) return null;

  return (
    <section className={cn(config.padding || 'py-12')}>
      <div
        className="container mx-auto prose prose-slate dark:prose-invert max-w-none"
        style={{ maxWidth: config.maxWidth || '1200px' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  );
}
