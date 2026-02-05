import React from 'react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductComparison } from '@/hooks/useProductComparison';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CompareButtonProps {
  productId: string;
  variant?: 'icon' | 'default';
  className?: string;
}

export function CompareButton({ productId, variant = 'icon', className }: CompareButtonProps) {
  const { isInComparison, toggleComparison, canAddMore } = useProductComparison();
  const { language } = useLanguage();
  const { toast } = useToast();

  const inComparison = isInComparison(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inComparison && !canAddMore) {
      toast({
        title: language === 'ar' ? 'الحد الأقصى' : 'Maximum Reached',
        description: language === 'ar' 
          ? 'يمكنك مقارنة 4 منتجات كحد أقصى'
          : 'You can compare up to 4 products',
        variant: 'destructive',
      });
      return;
    }

    const added = toggleComparison(productId);
    toast({
      title: added 
        ? (language === 'ar' ? 'تمت الإضافة للمقارنة' : 'Added to Compare')
        : (language === 'ar' ? 'تمت الإزالة' : 'Removed'),
      description: added
        ? (language === 'ar' ? 'يمكنك الآن مقارنة المنتجات' : 'You can now compare products')
        : (language === 'ar' ? 'تمت إزالة المنتج من المقارنة' : 'Product removed from comparison'),
    });
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn(
          'h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm',
          className
        )}
      >
        <Scale 
          className={cn(
            'h-5 w-5 transition-colors',
            inComparison ? 'text-primary' : 'text-muted-foreground'
          )} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={inComparison ? 'secondary' : 'outline'}
      onClick={handleClick}
      className={cn('gap-2', className)}
    >
      <Scale className="h-4 w-4" />
      {inComparison 
        ? (language === 'ar' ? 'في المقارنة' : 'In Compare')
        : (language === 'ar' ? 'قارن' : 'Compare')
      }
    </Button>
  );
}
