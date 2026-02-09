import React, { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNewsletterSubscribe } from '@/hooks/useNewsletter';

export function NewsletterSubscription() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { user } = useAuth();
  const subscribe = useNewsletterSubscribe();

  const [email, setEmail] = useState(user?.email || '');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    subscribe.mutate(
      { email: email.trim(), userId: user?.id },
      { onSuccess: () => setSubscribed(true) }
    );
  };

  if (subscribed) {
    return (
      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-8 text-center">
        <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {isAr ? 'تم الاشتراك بنجاح!' : 'Successfully Subscribed!'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isAr
            ? 'ستصلك أحدث المقالات والنصائح الصحية في بريدك الإلكتروني.'
            : "You'll receive our latest articles and health tips in your inbox."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {isAr ? 'اشترك في النشرة البريدية' : 'Subscribe to Newsletter'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? 'احصل على أحدث المقالات والنصائح الصحية'
              : 'Get the latest articles and health tips'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isAr ? 'بريدك الإلكتروني' : 'Your email address'}
          className="flex-1 bg-white text-foreground placeholder:text-muted-foreground"
          required
        />
        <Button
          type="submit"
          className="gap-2 shrink-0"
          disabled={subscribe.isPending || !email.trim()}
        >
          <Send className="h-4 w-4" />
          {subscribe.isPending
            ? (isAr ? 'جاري...' : 'Subscribing...')
            : (isAr ? 'اشترك' : 'Subscribe')}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-3">
        {isAr
          ? 'لا بريد مزعج. يمكنك إلغاء الاشتراك في أي وقت.'
          : 'No spam. Unsubscribe anytime.'}
      </p>
    </div>
  );
}
