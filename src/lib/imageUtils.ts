/**
 * Optimizes an Unsplash image URL by requesting WebP format and right-sizing.
 * For non-Unsplash URLs, returns the original URL unchanged.
 */
export function optimizeImageUrl(url: string, width: number, height?: number): string {
  if (!url || !url.includes('images.unsplash.com')) return url;

  try {
    const u = new URL(url);
    u.searchParams.set('fm', 'webp');
    u.searchParams.set('q', '80');
    u.searchParams.set('w', String(width));
    if (height) u.searchParams.set('h', String(height));
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Generates a srcSet string for responsive Unsplash images.
 */
export function generateSrcSet(url: string, widths: number[]): string {
  if (!url || !url.includes('images.unsplash.com')) return '';

  return widths
    .map((w) => `${optimizeImageUrl(url, w)} ${w}w`)
    .join(', ');
}
