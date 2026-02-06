import React, { useState } from 'react';
import { Reply, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  BlogComment,
  useCreateComment,
  useDeleteComment,
  validateComment,
} from '@/hooks/useBlogComments';

interface CommentItemProps {
  comment: BlogComment;
  postId: string;
  postTitle?: string;
  postSlug?: string;
  depth?: number;
  maxDepth?: number;
}

export function CommentItem({
  comment,
  postId,
  postTitle,
  postSlug,
  depth = 0,
  maxDepth = 3,
}: CommentItemProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { user } = useAuth();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      isAr ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError('');

    if (!user) return;

    const validation = validateComment(replyContent);
    if (!validation.success) {
      setReplyError(validation.error.errors[0].message);
      return;
    }

    createComment.mutate(
      {
        postId,
        content: replyContent.trim(),
        userId: user.id,
        parentCommentId: comment.id,
        postTitle,
        postSlug,
        commenterName: user.user_metadata?.full_name || user.email || undefined,
      },
      {
        onSuccess: () => {
          setReplyContent('');
          setShowReplyForm(false);
        },
      }
    );
  };

  return (
    <div className={depth > 0 ? 'ms-6 md:ms-10 ps-4 border-s-2 border-border/50' : ''}>
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
          <AvatarImage src={comment.user_avatar || undefined} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
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

          {/* Action buttons */}
          <div className="flex items-center gap-1 mt-1.5">
            {user && depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-primary gap-1 px-2"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-3 w-3" />
                {isAr ? 'رد' : 'Reply'}
              </Button>
            )}
            {user?.id === comment.user_id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
                onClick={() => deleteComment.mutate({ commentId: comment.id, postId })}
              >
                <Trash2 className="h-3 w-3" />
                {isAr ? 'حذف' : 'Delete'}
              </Button>
            )}
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground gap-1 px-2"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {replies.length} {isAr ? 'ردود' : replies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>

          {/* Inline reply form */}
          {showReplyForm && (
            <form onSubmit={handleReply} className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => {
                  setReplyContent(e.target.value);
                  if (replyError) setReplyError('');
                }}
                placeholder={isAr ? `الرد على ${comment.user_name || 'المستخدم'}...` : `Reply to ${comment.user_name || 'User'}...`}
                className="min-h-[70px] resize-none bg-muted/50 text-sm"
                maxLength={2000}
              />
              {replyError && <p className="text-xs text-destructive">{replyError}</p>}
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 h-7 text-xs"
                  disabled={!replyContent.trim() || createComment.isPending}
                >
                  <Send className="h-3 w-3" />
                  {createComment.isPending
                    ? (isAr ? 'جاري الإرسال...' : 'Submitting...')
                    : (isAr ? 'إرسال الرد' : 'Submit Reply')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                    setReplyError('');
                  }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {hasReplies && showReplies && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              postTitle={postTitle}
              postSlug={postSlug}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
