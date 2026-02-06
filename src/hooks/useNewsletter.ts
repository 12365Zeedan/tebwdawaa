import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

export function useNewsletterSubscribe() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, userId }: { email: string; userId?: string }) => {
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0].message);
      }

      const insertData: any = {
        email: parsed.data,
        is_confirmed: true, // Auto-confirm for simplicity
      };
      if (userId) {
        insertData.user_id = userId;
      }

      const { data, error } = await supabase
        .from('newsletter_subscribers' as any)
        .upsert(insertData, { onConflict: 'email' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Subscribed!',
        description: 'You\'ve been subscribed to our newsletter.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Subscription failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useNewsletterUnsubscribe() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from('newsletter_subscribers' as any)
        .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Unsubscribed',
        description: 'You\'ve been unsubscribed from the newsletter.',
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
