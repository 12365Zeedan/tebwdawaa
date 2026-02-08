import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook providing real SEO auto-fix implementations.
 * Each fix updates either the DOM, app_settings, or generates files.
 */
export function useSeoFixes() {
  /**
   * Fix meta tags: updates document title + meta description,
   * and persists via app_settings so they survive reloads.
   */
  const fixMetaTags = useCallback(async () => {
    try {
      // Fetch store name from app_settings
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["store_name", "seo_meta_description", "seo_meta_title"]);

      const settings: Record<string, string> = {};
      data?.forEach((s) => {
        try {
          settings[s.key] = typeof s.value === "string" ? JSON.parse(s.value) : String(s.value);
        } catch {
          settings[s.key] = String(s.value);
        }
      });

      const storeName = settings.store_name || "My Store";
      const title = settings.seo_meta_title || `${storeName} — Your Trusted Online Store`;
      const description =
        settings.seo_meta_description ||
        `Shop the best products at ${storeName}. Quality items, fast delivery, and excellent customer service.`;

      // Apply to DOM immediately
      document.title = title;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);

      // Update OG tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", description);

      // Persist SEO settings
      const upserts = [
        { key: "seo_meta_title", value: JSON.stringify(title), description: "SEO page title" },
        { key: "seo_meta_description", value: JSON.stringify(description), description: "SEO meta description" },
      ];

      for (const item of upserts) {
        await supabase
          .from("app_settings")
          .upsert(item, { onConflict: "key" });
      }

      toast.success("Meta tags updated and saved");
      return true;
    } catch (err) {
      console.error("Failed to fix meta tags:", err);
      toast.error("Failed to update meta tags");
      return false;
    }
  }, []);

  /**
   * Generate and store a sitemap based on actual products, categories, and blog posts.
   */
  const fixSitemap = useCallback(async () => {
    try {
      // Fetch site URL
      const { data: siteUrlData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "site_url")
        .maybeSingle();

      const siteUrl = siteUrlData?.value
        ? (typeof siteUrlData.value === "string" ? JSON.parse(siteUrlData.value) : String(siteUrlData.value))
        : window.location.origin;

      // Fetch slugs in parallel
      const [productsRes, categoriesRes, blogRes, pagesRes] = await Promise.all([
        supabase.from("products").select("slug, updated_at").eq("is_active", true).limit(500),
        supabase.from("categories").select("slug, updated_at").eq("is_active", true).limit(100),
        supabase.from("blog_posts").select("slug, updated_at").eq("is_published", true).limit(200),
        supabase.from("blog_pages").select("slug, updated_at").eq("is_published", true).limit(50),
      ]);

      const now = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Static pages
      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "daily" },
        { loc: "/products", priority: "0.9", changefreq: "daily" },
        { loc: "/categories", priority: "0.8", changefreq: "weekly" },
        { loc: "/blog", priority: "0.7", changefreq: "weekly" },
        { loc: "/about", priority: "0.5", changefreq: "monthly" },
      ];

      for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}${page.loc}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
      }

      // Products
      for (const p of productsRes.data || []) {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/products/${p.slug}</loc>\n`;
        xml += `    <lastmod>${p.updated_at?.split("T")[0] || now}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }

      // Categories
      for (const c of categoriesRes.data || []) {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/categories/${c.slug}</loc>\n`;
        xml += `    <lastmod>${c.updated_at?.split("T")[0] || now}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }

      // Blog posts
      for (const b of blogRes.data || []) {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/blog/${b.slug}</loc>\n`;
        xml += `    <lastmod>${b.updated_at?.split("T")[0] || now}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }

      // Blog pages
      for (const p of pagesRes.data || []) {
        xml += `  <url>\n`;
        xml += `    <loc>${siteUrl}/page/${p.slug}</loc>\n`;
        xml += `    <lastmod>${p.updated_at?.split("T")[0] || now}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.5</priority>\n`;
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      // Store sitemap content in app_settings
      await supabase.from("app_settings").upsert(
        {
          key: "generated_sitemap",
          value: JSON.stringify(xml),
          description: "Auto-generated sitemap.xml content",
        },
        { onConflict: "key" }
      );

      // Trigger download so admin can deploy it
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sitemap.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const urlCount =
        staticPages.length +
        (productsRes.data?.length || 0) +
        (categoriesRes.data?.length || 0) +
        (blogRes.data?.length || 0) +
        (pagesRes.data?.length || 0);

      toast.success(`Sitemap generated with ${urlCount} URLs and downloaded`);
      return true;
    } catch (err) {
      console.error("Failed to generate sitemap:", err);
      toast.error("Failed to generate sitemap");
      return false;
    }
  }, []);

  /**
   * Generate an optimized robots.txt and download it.
   */
  const fixRobotsTxt = useCallback(async () => {
    try {
      const { data: siteUrlData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "site_url")
        .maybeSingle();

      const siteUrl = siteUrlData?.value
        ? (typeof siteUrlData.value === "string" ? JSON.parse(siteUrlData.value) : String(siteUrlData.value))
        : window.location.origin;

      const robotsTxt = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        "Disallow: /auth",
        "Disallow: /checkout",
        "Disallow: /cart",
        "Disallow: /profile",
        "",
        "User-agent: Googlebot",
        "Allow: /",
        "",
        "User-agent: Bingbot",
        "Allow: /",
        "",
        `Sitemap: ${siteUrl}/sitemap.xml`,
      ].join("\n");

      await supabase.from("app_settings").upsert(
        {
          key: "generated_robots_txt",
          value: JSON.stringify(robotsTxt),
          description: "Auto-generated robots.txt content",
        },
        { onConflict: "key" }
      );

      const blob = new Blob([robotsTxt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "robots.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Optimized robots.txt generated and downloaded");
      return true;
    } catch (err) {
      console.error("Failed to generate robots.txt:", err);
      toast.error("Failed to generate robots.txt");
      return false;
    }
  }, []);

  /**
   * Add canonical URL tags to the current page and persist the setting.
   */
  const fixCanonicalUrls = useCallback(async () => {
    try {
      // Add canonical link to current page
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", window.location.origin + window.location.pathname);

      // Persist that canonical URLs are enabled
      await supabase.from("app_settings").upsert(
        {
          key: "seo_canonical_enabled",
          value: JSON.stringify(true),
          description: "Enable automatic canonical URL tags on all pages",
        },
        { onConflict: "key" }
      );

      toast.success("Canonical URL tag added and setting enabled");
      return true;
    } catch (err) {
      console.error("Failed to fix canonical URLs:", err);
      toast.error("Failed to add canonical URLs");
      return false;
    }
  }, []);

  /**
   * Run an auto-fix by check ID.
   */
  const applyFix = useCallback(
    async (checkId: string): Promise<boolean> => {
      switch (checkId) {
        case "seo-meta-tags":
          return fixMetaTags();
        case "seo-sitemap":
          return fixSitemap();
        case "seo-robots":
          return fixRobotsTxt();
        case "seo-canonical":
          return fixCanonicalUrls();
        default:
          toast.error("No auto-fix available for this check");
          return false;
      }
    },
    [fixMetaTags, fixSitemap, fixRobotsTxt, fixCanonicalUrls]
  );

  return { applyFix };
}
