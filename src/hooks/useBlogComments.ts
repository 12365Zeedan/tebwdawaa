import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export interface BlogComment {
  id: string;
  blog_post_id: string;
  user_id: string;
  content: string;
  is_approved: boolean;
  is_rejected: boolean;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_avatar?: string;
  // Nested replies (built client-side)
  replies?: BlogComment[];
}

const commentSchema = z.object({
  content: z.string()
    .trim()
    .min(3, 'Comment must be at least 3 characters')
    .max(2000, 'Comment must be less than 2000 characters'),
});

export function validateComment(content: string) {
  return commentSchema.safeParse({ content });
}

/**
 * Build a tree of comments from a flat list.
 */
function buildCommentTree(comments: BlogComment[]): BlogComment[] {
  const map = new Map<string, BlogComment>();
  const roots: BlogComment[] = [];

  comments.forEach(c => map.set(c.id, { ...c, replies: [] }));

  map.forEach(comment => {
    if (comment.parent_comment_id && map.has(comment.parent_comment_id)) {
      map.get(comment.parent_comment_id)!.replies!.push(comment);
    } else {
      roots.push(comment);
    }
  });

  return roots;
}

/**
 * Fetch comments for a blog post (public).
 * Returns flat list; use buildCommentTree for nesting.
 */
export function useBlogComments(postId: string | undefined) {
  return useQuery({
    queryKey: ['blog-comments', postId],
    queryFn: async (): Promise<BlogComment[]> => {
      if (!postId) return [];

      const { data: comments, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('blog_post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((comments || []).map(c => c.user_id))];
      let profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        (profiles || []).forEach(p => {
          profileMap.set(p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url });
        });
      }

      return (comments || []).map(c => ({
        ...c,
        parent_comment_id: (c as any).parent_comment_id ?? null,
        user_name: profileMap.get(c.user_id)?.full_name || undefined,
        user_avatar: profileMap.get(c.user_id)?.avatar_url || undefined,
      }));
    },
    enabled: !!postId,
  });
}

export { buildCommentTree };

/**
 * Submit a new comment (optionally a reply).
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      userId,
      parentCommentId,
      postTitle,
      postSlug,
      commenterName,
    }: {
      postId: string;
      content: string;
      userId: string;
      parentCommentId?: string | null;
      postTitle?: string;
      postSlug?: string;
      commenterName?: string;
    }) => {
      const validation = commentSchema.safeParse({ content });
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const insertData: any = {
        blog_post_id: postId,
        user_id: userId,
        content: validation.data.content,
      };
      if (parentCommentId) {
        insertData.parent_comment_id = parentCommentId;
      }

      const { data, error } = await supabase
        .from('blog_comments')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Fire-and-forget notification to admins
      supabase.functions
        .invoke('notify-comment', {
          body: {
            commentId: data.id,
            postTitle: postTitle || 'Untitled Post',
            postSlug: postSlug || '',
            commenterName: commenterName || 'User',
            commentContent: validation.data.content,
          },
        })
        .then(({ error: fnError }) => {
          if (fnError) console.error('Comment notification failed:', fnError.message);
        });

      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', vars.postId] });
      toast({
        title: 'Comment submitted',
        description: 'Your comment will appear after moderation.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete own comment.
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { error } = await supabase.from('blog_comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', vars.postId] });
    },
  });
}

// ---- Admin hooks ----

export interface AdminBlogComment extends BlogComment {
  post_title?: string;
  post_slug?: string;
}

/**
 * Fetch all comments for admin moderation.
 */
export function useAdminBlogComments(filter?: 'pending' | 'approved' | 'rejected' | 'all') {
  return useQuery({
    queryKey: ['admin-blog-comments', filter],
    queryFn: async (): Promise<AdminBlogComment[]> => {
      let query = supabase
        .from('blog_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false).eq('is_rejected', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      } else if (filter === 'rejected') {
        query = query.eq('is_rejected', true);
      }

      const { data: comments, error } = await query;
      if (error) throw error;

      // Get post info
      const postIds = [...new Set((comments || []).map(c => c.blog_post_id))];
      let postMap = new Map<string, { title: string; slug: string }>();
      if (postIds.length > 0) {
        const { data: posts } = await supabase
          .from('blog_posts')
          .select('id, title, slug')
          .in('id', postIds);
        (posts || []).forEach(p => postMap.set(p.id, { title: p.title, slug: p.slug }));
      }

      // Get user profiles
      const userIds = [...new Set((comments || []).map(c => c.user_id))];
      let profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        (profiles || []).forEach(p => {
          profileMap.set(p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url });
        });
      }

      return (comments || []).map(c => ({
        ...c,
        parent_comment_id: (c as any).parent_comment_id ?? null,
        post_title: postMap.get(c.blog_post_id)?.title,
        post_slug: postMap.get(c.blog_post_id)?.slug,
        user_name: profileMap.get(c.user_id)?.full_name || undefined,
        user_avatar: profileMap.get(c.user_id)?.avatar_url || undefined,
      }));
    },
  });
}

/**
 * Approve a comment.
 */
export function useApproveComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: true, is_rejected: false })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-comments'] });
      queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
      toast({ title: 'Comment approved' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

/**
 * Reject a comment.
 */
export function useRejectComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('blog_comments')
        .update({ is_approved: false, is_rejected: true })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-comments'] });
      queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
      toast({ title: 'Comment rejected' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

/**
 * Delete a comment (admin).
 */
export function useAdminDeleteComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('blog_comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-comments'] });
      queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
      toast({ title: 'Comment deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
