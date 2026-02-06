import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNewsletterSubscribe } from '@/hooks/useNewsletter';

export function Footer() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const { data: settings } = useStoreSettings();
  const subscribe = useNewsletterSubscribe();
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubscribed, setFooterSubscribed] = useState(false);

  const storeName = language === 'ar' 
    ? (settings?.storeNameAr || 'صيدلية') 
    : (settings?.storeName || 'PharmaCare');

  return (
    <footer className="bg-header text-link">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                <span className="text-xl font-bold text-primary-foreground">{storeName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-xl font-bold">
                {storeName}
              </span>
            </div>
            <p className="text-sm text-link/80 leading-relaxed">
              {t('footer.aboutText')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-link/80 hover:text-link-hover transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-link/80 hover:text-link-hover transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-link/80 hover:text-link-hover transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.quickLinks')}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-link/80 hover:text-link-hover transition-colors">
                {t('nav.products')}
              </Link>
              <Link to="/categories" className="text-sm text-link/80 hover:text-link-hover transition-colors">
                {t('nav.categories')}
              </Link>
              <Link to="/blog" className="text-sm text-link/80 hover:text-link-hover transition-colors">
                {t('nav.blog')}
              </Link>
              <Link to="/about" className="text-sm text-link/80 hover:text-link-hover transition-colors">
                {t('nav.about')}
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.support')}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/contact" className="text-sm text-link/80 hover:text-link-hover transition-colors">
                {t('footer.contact')}
              </Link>
              <Link to="/privacy" className="text-sm text-link/80 hover:text-link-hover transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-sm text-link/80 hover:text-link-hover transition-colors">
                {t('footer.terms')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.contact')}</h3>
            <div className="space-y-3">
              <a href="tel:+966500000000" className="flex items-center gap-3 text-sm text-link/80 hover:text-link-hover transition-colors">
                <Phone className="h-4 w-4 rtl-flip" />
                <span dir="ltr">+966 50 000 0000</span>
              </a>
              <a href="mailto:info@pharmacare.com" className="flex items-center gap-3 text-sm text-link/80 hover:text-link-hover transition-colors">
                <Mail className="h-4 w-4" />
                <span>info@pharmacare.com</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-link/80">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>{language === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter in Footer */}
        <div className="mt-10 pt-8 border-t border-link/20">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'اشترك في النشرة البريدية' : 'Stay Updated'}
            </h3>
            <p className="text-sm text-link/80 mb-4">
              {language === 'ar'
                ? 'احصل على أحدث المقالات والعروض'
                : 'Get the latest articles and offers delivered to your inbox'}
            </p>
            {footerSubscribed ? (
              <p className="text-sm text-link/80">
                ✓ {language === 'ar' ? 'تم الاشتراك بنجاح!' : 'Successfully subscribed!'}
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!footerEmail.trim()) return;
                  subscribe.mutate(
                    { email: footerEmail.trim() },
                    { onSuccess: () => setFooterSubscribed(true) }
                  );
                }}
                className="flex gap-2"
              >
                <Input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                  className="flex-1 bg-link/10 border-link/20 text-link placeholder:text-link/50"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  className="gap-2 shrink-0"
                  disabled={subscribe.isPending}
                >
                  <Send className="h-4 w-4" />
                  {language === 'ar' ? 'اشترك' : 'Subscribe'}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-link/20">
          <p className="text-center text-sm text-link/80">
            © {currentYear} {storeName}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
