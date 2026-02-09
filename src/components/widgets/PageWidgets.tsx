import React from 'react';
import { useCustomWidgets } from '@/hooks/useCustomWidgets';
import { WidgetRenderer } from './WidgetRenderer';

interface Props {
  page: string;
  position?: 'before' | 'after';
}

/**
 * Renders all visible custom widgets for a given page.
 * Use position='before' for widgets before main content, 'after' for after.
 * If no position specified, renders all widgets.
 */
export function PageWidgets({ page, position }: Props) {
  const { widgets } = useCustomWidgets(page);

  const visibleWidgets = widgets.filter(w => w.is_visible);

  if (visibleWidgets.length === 0) return null;

  return (
    <div className="w-full">
      {visibleWidgets.map(widget => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}
    </div>
  );
}
