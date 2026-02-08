import { useEffect } from "react";

interface ProductJsonLdProps {
  product: {
    name: string;
    name_ar: string;
    description?: string | null;
    description_ar?: string | null;
    price: number;
    original_price?: number | null;
    image_url?: string | null;
    images?: string[] | null;
    in_stock?: boolean | null;
    rating?: number | null;
    review_count?: number | null;
    slug: string;
    vat_enabled?: boolean;
    barcode?: string | null;
    category?: { name: string; name_ar: string } | null;
  };
  currency?: string;
}

/**
 * Injects a JSON-LD Product schema into the document head.
 * Automatically cleans up on unmount or product change.
 */
export function ProductJsonLd({ product, currency = "SAR" }: ProductJsonLdProps) {
  useEffect(() => {
    const scriptId = "product-jsonld";

    // Remove previous if exists
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const images = product.images?.length
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || product.name,
      image: images,
      url: `${window.location.origin}/products/${product.slug}`,
      offers: {
        "@type": "Offer",
        price: product.vat_enabled
          ? (product.price * 1.15).toFixed(2)
          : product.price.toFixed(2),
        priceCurrency: currency,
        availability: product.in_stock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    };

    if (product.barcode) {
      jsonLd.gtin = product.barcode;
    }

    if (product.category) {
      jsonLd.category = product.category.name;
    }

    if (product.rating && product.review_count && product.review_count > 0) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.review_count,
        bestRating: 5,
        worstRating: 1,
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [product, currency]);

  return null;
}
