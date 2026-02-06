import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, Trash2, Clock, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  useBlogComments,
  useCreateComment,
  useDeleteComment,
  validateComment,
} from '@/hooks/useBlogComments';

interface BlogCommentsProps {
  postId: string;
}

export function BlogComments({ postId }: BlogCommentsProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { user } = useAuth();
  const { data: comments, isLoading } = useBlogComments(postId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const approvedComments = (comments || []).filter(c => c.is_approved);
  const pendingComments = (comments || []).filter(c => !c.is_approved && !c.is_rejected && c.user_id === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) return;

    const validation = validateComment(content);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    createComment.mutate(
      { postId, content: content.trim(), userId: user.id },
      { onSuccess: () => setContent('') }
    );
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      isAr ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">
          {isAr ? 'التعليقات' : 'Comments'}
          {approvedComments.length > 0 && (
            <span className="text-muted-foreground font-normal text-lg ms-2">
              ({approvedComments.length})
            </span>
          )}
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 mt-1">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {getInitials(user.user_metadata?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (error) setError('');
                }}
                placeholder={isAr ? 'اكتب تعليقك...' : 'Write a comment...'}
                className="min-h-[100px] resize-none bg-muted/50"
                maxLength={2000}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? 'سيتم مراجعة تعليقك قبل النشر'
                    : 'Your comment will be reviewed before publishing'}
                </p>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2"
                  disabled={!content.trim() || createComment.isPending}
                >
                  <Send className="h-4 w-4" />
                  {createComment.isPending
                    ? (isAr ? 'جاري الإرسال...' : 'Submitting...')
                    : (isAr ? 'إرسال' : 'Submit')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-xl bg-muted/50 border border-border text-center">
          <p className="text-muted-foreground mb-3">
            {isAr ? 'سجل دخولك للتعليق' : 'Sign in to leave a comment'}
          </p>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </Link>
        </div>
      )}

      {/* Pending Comments (visible only to the author) */}
      {pendingComments.length > 0 && (
        <div className="mb-8 space-y-4">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {isAr ? 'تعليقاتك قيد المراجعة' : 'Your comments pending review'}
          </p>
          {pendingComments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.user_avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(comment.user_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {comment.user_name || (isAr ? 'مستخدم' : 'User')}
                  </span>
                  <Badge variant="outline" className="text-xs text-warning border-warning/30">
                    {isAr ? 'قيد المراجعة' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => deleteComment.mutate({ commentId: comment.id, postId })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Approved Comments */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : approvedComments.length > 0 ? (
        <div className="space-y-6">
          {approvedComments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={comment.user_avatar || undefined} />
                <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                  {getInitials(comment.user_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {comment.user_name || (isAr ? 'مستخدم' : 'User')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-7 text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
                    onClick={() => deleteComment.mutate({ commentId: comment.id, postId })}
                  >
                    <Trash2 className="h-3 w-3" />
                    {isAr ? 'حذف' : 'Delete'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>{isAr ? 'لا توجد تعليقات بعد. كن أول من يعلق!' : 'No comments yet. Be the first to comment!'}</p>
        </div>
      )}
    </section>
  );
}
