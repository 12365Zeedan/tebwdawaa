import { useState } from 'react';
import { Facebook, Twitter, Link2, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  title: string;
  url?: string;
  /** Optional short text for Twitter/WhatsApp */
  description?: string;
  className?: string;
}

export function SocialShareButtons({
  title,
  url,
  description,
  className = '',
}: SocialShareButtonsProps) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const shareText = description ? `${title} — ${description}` : title;

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[hsl(203,89%,53%)]/10 hover:text-[hsl(203,89%,53%)]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[hsl(220,46%,48%)]/10 hover:text-[hsl(220,46%,48%)]',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      color: 'hover:bg-[hsl(142,70%,40%)]/10 hover:text-[hsl(142,70%,40%)]',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(language === 'ar' ? 'فشل نسخ الرابط' : 'Failed to copy link');
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm text-muted-foreground me-1">
        {language === 'ar' ? 'مشاركة:' : 'Share:'}
      </span>
      {shareLinks.map((link) => (
        <Tooltip key={link.name}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-full transition-colors ${link.color}`}
              asChild
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${language === 'ar' ? 'مشاركة عبر' : 'Share on'} ${link.name}`}
              >
                <link.icon className="h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{link.name}</TooltipContent>
        </Tooltip>
      ))}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted"
            onClick={handleCopyLink}
            aria-label={language === 'ar' ? 'نسخ الرابط' : 'Copy link'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {copied
            ? language === 'ar' ? 'تم النسخ!' : 'Copied!'
            : language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
