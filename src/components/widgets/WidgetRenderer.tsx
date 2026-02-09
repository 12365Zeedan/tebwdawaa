import React from 'react';
import { WidgetCarousel } from './WidgetCarousel';
import { WidgetBanner } from './WidgetBanner';
import { WidgetTestimonials } from './WidgetTestimonials';
import { WidgetRichText } from './WidgetRichText';
import type { CustomWidget, CarouselConfig, BannerConfig, TestimonialsConfig, RichTextConfig } from '@/hooks/useCustomWidgets';

interface Props {
  widget: CustomWidget;
}

export function WidgetRenderer({ widget }: Props) {
  switch (widget.widget_type) {
    case 'carousel':
      return <WidgetCarousel config={widget.config as CarouselConfig} />;
    case 'banner':
      return <WidgetBanner config={widget.config as BannerConfig} />;
    case 'testimonials':
      return (
        <WidgetTestimonials
          config={widget.config as TestimonialsConfig}
          title={widget.title}
          titleAr={widget.title_ar}
        />
      );
    case 'richtext':
      return <WidgetRichText config={widget.config as RichTextConfig} />;
    default:
      return null;
  }
}
