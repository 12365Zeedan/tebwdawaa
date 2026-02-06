import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle, XCircle, Trash2, MessageCircle, Clock, Filter,
  ExternalLink, ArrowLeft, ArrowRight, Reply,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useAdminBlogComments,
  useApproveComment,
  useRejectComment,
  useAdminDeleteComment,
} from '@/hooks/useBlogComments';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminBlogComments = () => {
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: comments, isLoading } = useAdminBlogComments(filter);
  const approveComment = useApproveComment();
  const rejectComment = useRejectComment();
  const deleteComment = useAdminDeleteComment();

  const handleDelete = () => {
    if (deleteId) {
      deleteComment.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(
      isAr ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );

  const getStatusBadge = (isApproved: boolean, isRejected: boolean) => {
    if (isApproved) {
      return (
        <Badge className="gap-1 bg-success text-success-foreground">
          <CheckCircle className="h-3 w-3" />
          {isAr ? 'موافق عليه' : 'Approved'}
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          {isAr ? 'مرفوض' : 'Rejected'}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-warning border-warning/30">
        <Clock className="h-3 w-3" />
        {isAr ? 'قيد المراجعة' : 'Pending'}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link to="/admin/blog">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BackArrow className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">
                {isAr ? 'إدارة التعليقات' : 'Comment Moderation'}
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {isAr ? 'مراجعة وإدارة تعليقات المدونة' : 'Review and manage blog comments'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {isAr ? 'قيد المراجعة' : 'Pending'}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              {isAr ? 'موافق عليها' : 'Approved'}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1.5">
              <XCircle className="h-3.5 w-3.5" />
              {isAr ? 'مرفوضة' : 'Rejected'}
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              {isAr ? 'الكل' : 'All'}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-card rounded-xl border border-border/50 shadow-soft p-5"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={comment.user_avatar || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {getInitials(comment.user_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-medium text-foreground">
                        {comment.user_name || (isAr ? 'مستخدم' : 'User')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                      {getStatusBadge(comment.is_approved, comment.is_rejected)}
                    </div>

                    {/* Post reference */}
                    {comment.post_title && (
                      <Link
                        to={`/blog/${comment.post_slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-2"
                      >
                        <MessageCircle className="h-3 w-3" />
                        {comment.post_title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}

                    {comment.parent_comment_id && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Reply className="h-3 w-3" />
                        {isAr ? 'رد على تعليق' : 'Reply to a comment'}
                      </div>
                    )}

                    <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words mb-4">
                      {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!comment.is_approved && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-success border-success/30 hover:bg-success/10"
                          onClick={() => approveComment.mutate(comment.id)}
                          disabled={approveComment.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                          {isAr ? 'موافقة' : 'Approve'}
                        </Button>
                      )}
                      {!comment.is_rejected && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-warning border-warning/30 hover:bg-warning/10"
                          onClick={() => rejectComment.mutate(comment.id)}
                          disabled={rejectComment.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                          {isAr ? 'رفض' : 'Reject'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isAr ? 'حذف' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card rounded-xl border border-border/50 shadow-soft p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {filter === 'pending'
                  ? (isAr ? 'لا توجد تعليقات قيد المراجعة' : 'No pending comments')
                  : filter === 'approved'
                  ? (isAr ? 'لا توجد تعليقات موافق عليها' : 'No approved comments')
                  : filter === 'rejected'
                  ? (isAr ? 'لا توجد تعليقات مرفوضة' : 'No rejected comments')
                  : (isAr ? 'لا توجد تعليقات' : 'No comments yet')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAr ? 'حذف التعليق' : 'Delete Comment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? 'هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this comment? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {isAr ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminBlogComments;
