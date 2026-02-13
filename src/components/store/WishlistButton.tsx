import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
  productId: string;
  variant?: 'icon' | 'default';
  className?: string;
}

export function WishlistButton({ productId, variant = 'icon', className }: WishlistButtonProps) {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const inWishlist = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please Login',
        description: language === 'ar' 
          ? 'يجب تسجيل الدخول لإضافة منتجات إلى قائمة الأمنيات'
          : 'You must be logged in to add items to your wishlist',
      });
      navigate('/auth');
      return;
    }

    try {
      await toggleWishlist(productId);
      toast({
        title: inWishlist 
          ? (language === 'ar' ? 'تمت الإزالة' : 'Removed')
          : (language === 'ar' ? 'تمت الإضافة' : 'Added'),
        description: inWishlist
          ? (language === 'ar' ? 'تمت إزالة المنتج من قائمة الأمنيات' : 'Removed from wishlist')
          : (language === 'ar' ? 'تمت إضافة المنتج إلى قائمة الأمنيات' : 'Added to wishlist'),
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ' : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        aria-label={inWishlist ? (language === 'ar' ? 'إزالة من الأمنيات' : 'Remove from wishlist') : (language === 'ar' ? 'أضف للأمنيات' : 'Add to wishlist')}
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isToggling}
        className={cn(
          'h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm',
          className
        )}
      >
        <Heart 
          className={cn(
            'h-5 w-5 transition-colors',
            inWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground'
          )} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={inWishlist ? 'secondary' : 'outline'}
      onClick={handleClick}
      disabled={isToggling}
      className={cn('gap-2', className)}
    >
      <Heart 
        className={cn(
          'h-4 w-4',
          inWishlist && 'fill-current'
        )} 
      />
      {inWishlist 
        ? (language === 'ar' ? 'في قائمة الأمنيات' : 'In Wishlist')
        : (language === 'ar' ? 'أضف للأمنيات' : 'Add to Wishlist')
      }
    </Button>
  );
}
