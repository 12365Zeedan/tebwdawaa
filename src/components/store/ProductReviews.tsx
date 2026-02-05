import React, { useState } from 'react';
import { Star, User, Loader2, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  useProductReviews, 
  useUserReview, 
  useCanReview,
  useCreateReview, 
  useUpdateReview,
  useDeleteReview,
  Review 
} from '@/hooks/useReviews';
import { cn } from '@/lib/utils';

interface ProductReviewsProps {
  productId: string;
}

function StarRating({ 
  rating, 
  onChange, 
  readonly = false,
  size = 'md'
}: { 
  rating: number; 
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState(0);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={cn(
            "transition-colors",
            !readonly && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hovered ? star <= hovered : star <= rating)
                ? "fill-warning text-warning"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ 
  productId, 
  existingReview,
  onCancel 
}: { 
  productId: string;
  existingReview?: Review | null;
  onCancel?: () => void;
}) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');

  const isEditing = !!existingReview;
  const isPending = createReview.isPending || updateReview.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: language === 'ar' ? 'يرجى اختيار تقييم' : 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditing && existingReview) {
        await updateReview.mutateAsync({
          id: existingReview.id,
          productId,
          rating,
          title,
          content,
        });
        toast({
          title: language === 'ar' ? 'تم التحديث' : 'Review Updated',
          description: language === 'ar' ? 'تم تحديث تقييمك بنجاح' : 'Your review has been updated',
        });
      } else {
        await createReview.mutateAsync({
          productId,
          rating,
          title,
          content,
        });
        toast({
          title: language === 'ar' ? 'شكراً لك!' : 'Thank you!',
          description: language === 'ar' ? 'تم إرسال تقييمك بنجاح' : 'Your review has been submitted',
        });
      }
      onCancel?.();
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
      <h3 className="font-semibold text-foreground">
        {isEditing 
          ? (language === 'ar' ? 'تعديل التقييم' : 'Edit Your Review')
          : (language === 'ar' ? 'أضف تقييمك' : 'Write a Review')}
      </h3>
      
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">
          {language === 'ar' ? 'تقييمك' : 'Your Rating'}
        </label>
        <StarRating rating={rating} onChange={setRating} size="lg" />
      </div>

      <Input
        placeholder={language === 'ar' ? 'عنوان التقييم (اختياري)' : 'Review title (optional)'}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        placeholder={language === 'ar' ? 'شاركنا تجربتك مع هذا المنتج...' : 'Share your experience with this product...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
          {isEditing 
            ? (language === 'ar' ? 'تحديث' : 'Update')
            : (language === 'ar' ? 'إرسال' : 'Submit')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
        )}
      </div>
    </form>
  );
}

function ReviewCard({ review, isOwn, onEdit }: { review: Review; isOwn: boolean; onEdit: () => void }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const deleteReview = useDeleteReview();

  const handleDelete = async () => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReview.mutateAsync({ id: review.id, productId: review.product_id });
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف تقييمك' : 'Your review has been deleted',
      });
    } catch (error: any) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {review.profile?.avatar_url ? (
              <img 
                src={review.profile.avatar_url} 
                alt="" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {review.profile?.full_name || (language === 'ar' ? 'مستخدم' : 'User')}
              </span>
              {review.is_verified_purchase && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {language === 'ar' ? 'مشتري موثق' : 'Verified'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </span>
            </div>
          </div>
        </div>
        
        {isOwn && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
              disabled={deleteReview.isPending}
            >
              {deleteReview.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {review.title && (
        <h4 className="font-medium text-foreground mt-3">{review.title}</h4>
      )}
      {review.content && (
        <p className="text-muted-foreground mt-2">{review.content}</p>
      )}
    </div>
  );
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { data: reviews, isLoading } = useProductReviews(productId);
  const { data: userReview } = useUserReview(productId, user?.id || null);
  const { data: canReview } = useCanReview(productId, user?.id || null);
  
  const [isEditing, setIsEditing] = useState(false);

  const showForm = user && canReview && (!userReview || isEditing);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {language === 'ar' ? 'تقييمات العملاء' : 'Customer Reviews'}
          {reviews && reviews.length > 0 && (
            <span className="text-muted-foreground font-normal ms-2">({reviews.length})</span>
          )}
        </h2>
      </div>

      {/* Review form or prompt */}
      {user ? (
        showForm ? (
          <ReviewForm 
            productId={productId} 
            existingReview={isEditing ? userReview : undefined}
            onCancel={() => setIsEditing(false)}
          />
        ) : userReview ? (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'لقد قمت بتقييم هذا المنتج بالفعل' : 'You have already reviewed this product'}
            </p>
          </div>
        ) : !canReview ? (
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {language === 'ar' 
                ? 'يمكنك تقييم هذا المنتج بعد استلام طلبك'
                : 'You can review this product after receiving your order'}
            </p>
          </div>
        ) : null
      ) : (
        <div className="p-4 rounded-xl border border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'سجل دخولك لإضافة تقييم'
              : 'Sign in to write a review'}
          </p>
        </div>
      )}

      <Separator />

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
              <div className="h-4 w-3/4 bg-muted rounded mt-4" />
            </div>
          ))}
        </div>
      ) : reviews?.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{language === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
          <p className="text-sm mt-1">
            {language === 'ar' ? 'كن أول من يقيم هذا المنتج' : 'Be the first to review this product'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews?.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              isOwn={review.user_id === user?.id}
              onEdit={() => setIsEditing(true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
