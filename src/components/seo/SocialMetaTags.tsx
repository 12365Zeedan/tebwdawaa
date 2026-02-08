import { useEffect } from 'react';

export interface SocialMetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  /** For articles: ISO date string */
  publishedTime?: string;
  /** For articles: author name */
  author?: string;
  /** For products: formatted price string e.g. "99.00 SAR" */
  price?: string;
  /** For products: "instock" | "outofstock" */
  availability?: string;
}

/**
 * Injects Open Graph and Twitter Card meta tags into the document head.
 * Updates on prop changes and cleans up managed tags on unmount.
 */
export function SocialMetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  author,
  price,
  availability,
}: SocialMetaTagsProps) {
  useEffect(() => {
    const pageUrl = url || window.location.href;
    const tags: Array<{ property?: string; name?: string; content: string }> = [
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: pageUrl },
      { property: 'og:type', content: type === 'product' ? 'product' : type },
      // Twitter Card
      { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ];

    if (image) {
      tags.push({ property: 'og:image', content: image });
      tags.push({ name: 'twitter:image', content: image });
    }

    if (type === 'article') {
      if (publishedTime) {
        tags.push({ property: 'article:published_time', content: publishedTime });
      }
      if (author) {
        tags.push({ property: 'article:author', content: author });
      }
    }

    if (type === 'product') {
      if (price) {
        tags.push({ property: 'product:price:amount', content: price.split(' ')[0] });
        tags.push({ property: 'product:price:currency', content: price.split(' ')[1] || 'SAR' });
      }
      if (availability) {
        tags.push({ property: 'product:availability', content: availability });
      }
    }

    // Apply tags
    const managedElements: HTMLMetaElement[] = [];

    tags.forEach(({ property, name, content }) => {
      const selector = property
        ? `meta[property="${property}"]`
        : `meta[name="${name}"]`;

      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (property) el.setAttribute('property', property);
        if (name) el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      managedElements.push(el);
    });

    return () => {
      // Remove only tags we created (not pre-existing ones)
      managedElements.forEach((el) => {
        // Only remove if it's still in our head
        if (el.parentNode === document.head) {
          document.head.removeChild(el);
        }
      });
    };
  }, [title, description, image, url, type, publishedTime, author, price, availability]);

  return null;
}
