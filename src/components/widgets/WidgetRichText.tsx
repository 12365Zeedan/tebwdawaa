import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { RichTextConfig } from '@/hooks/useCustomWidgets';

interface Props {
  config: RichTextConfig;
}

export function WidgetRichText({ config }: Props) {
  const { language } = useLanguage();
  const content = language === 'ar' ? (config.contentAr || config.content) : config.content;

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
