import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Eye, EyeOff, Pencil, Trash2, Copy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { CustomWidget } from '@/hooks/useCustomWidgets';

const WIDGET_TYPE_LABELS: Record<CustomWidget['widget_type'], { en: string; ar: string; icon: React.ComponentType<any> }> = {
  carousel: { en: 'Image Carousel', ar: 'عرض شرائح', icon: () => null },
  banner: { en: 'Promotional Banner', ar: 'بانر ترويجي', icon: () => null },
  testimonials: { en: 'Testimonials', ar: 'آراء العملاء', icon: () => null },
  richtext: { en: 'Rich Text Block', ar: 'نص منسق', icon: () => null },
};

interface Props {
  widget: CustomWidget;
  icon: React.ComponentType<{ className?: string }>;
  pageLabel: string;
  typeLabel: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleVisibility: (visible: boolean) => void;
  onDelete: () => void;
}

export function SortableWidgetItem({
  widget,
  icon: Icon,
  pageLabel,
  typeLabel,
  onEdit,
  onDuplicate,
  onToggleVisibility,
  onDelete,
}: Props) {
  const { language } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-colors',
        widget.is_visible
          ? 'border-border bg-card'
          : 'border-border/50 bg-muted/30 opacity-60',
        isDragging && 'opacity-50 shadow-lg z-50 relative'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-0.5 rounded hover:bg-muted"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      <Icon className="h-4 w-4 text-primary shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {(language === 'ar' ? widget.title_ar : widget.title) || typeLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          {pageLabel} · {typeLabel}
        </p>
      </div>

      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} title={language === 'ar' ? 'تعديل' : 'Edit'}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} title={language === 'ar' ? 'نسخ' : 'Duplicate'}>
        <Copy className="h-3.5 w-3.5" />
      </Button>

      <div className="flex items-center gap-1.5">
        {widget.is_visible ? <Eye className="h-3.5 w-3.5 text-success" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
        <Switch
          checked={widget.is_visible}
          onCheckedChange={onToggleVisibility}
        />
      </div>

      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
