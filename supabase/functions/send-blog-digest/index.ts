import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get days parameter (default 7 for weekly digest)
    const body = await req.json().catch(() => ({}));
    const days = body.days || 7;

    // Get recent published posts
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data: recentPosts, error: postsError } = await supabase
      .from("blog_posts")
      .select("id, title, title_ar, slug, excerpt, excerpt_ar, image_url, published_at, category, read_time")
      .eq("is_published", true)
      .gte("published_at", sinceDate.toISOString())
      .order("published_at", { ascending: false })
      .limit(10);

    if (postsError) {
      throw new Error(`Failed to fetch posts: ${postsError.message}`);
    }

    if (!recentPosts || recentPosts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No recent posts to include in digest" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get active subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email")
      .eq("is_active", true)
      .eq("is_confirmed", true);

    if (subsError) {
      throw new Error(`Failed to fetch subscribers: ${subsError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active subscribers" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(apiKey);

    // Build the base URL
    const baseUrl = supabaseUrl.replace(".supabase.co", ".lovable.app");

    // Build post cards HTML
    const postCardsHtml = recentPosts
      .map(
        (post) => `
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
          ${
            post.image_url
              ? `<img src="${post.image_url}" alt="${post.title}" style="width: 100%; height: 200px; object-fit: cover;" />`
              : ""
          }
          <div style="padding: 20px;">
            ${
              post.category
                ? `<span style="display: inline-block; background: #f0f4ff; color: #000435; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px; text-transform: uppercase;">${post.category}</span>`
                : ""
            }
            <h3 style="margin: 0 0 8px; font-size: 18px; color: #111;">
              <a href="${baseUrl}/blog/${post.slug}" style="color: #000435; text-decoration: none;">${post.title}</a>
            </h3>
            ${post.excerpt ? `<p style="margin: 0 0 12px; color: #666; font-size: 14px; line-height: 1.5;">${post.excerpt}</p>` : ""}
            <div style="display: flex; align-items: center; gap: 12px;">
              ${post.read_time ? `<span style="font-size: 12px; color: #999;">📖 ${post.read_time} min read</span>` : ""}
              <a href="${baseUrl}/blog/${post.slug}" style="font-size: 13px; color: #000435; font-weight: 600; text-decoration: none;">Read more →</a>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #000435; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📬 Weekly Blog Digest</h1>
            <p style="color: #a0b0ff; margin: 8px 0 0; font-size: 14px;">Your latest articles from the past ${days} days</p>
          </div>

          <!-- Posts -->
          <div style="padding: 30px;">
            <p style="font-size: 15px; color: #555; margin-bottom: 24px;">
              Here are the latest articles you might have missed:
            </p>
            ${postCardsHtml}
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0 0 8px; color: #999; font-size: 12px;">
              You're receiving this because you subscribed to our newsletter.
            </p>
            <a href="${baseUrl}/blog" style="color: #000435; font-size: 12px; text-decoration: underline;">View all articles</a>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to each subscriber (Resend supports batch but let's keep it simple)
    let sentCount = 0;
    let errorCount = 0;

    // Resend supports up to 100 recipients in batch
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const emails = batch.map((sub) => sub.email);

      try {
        const emailResponse = await resend.emails.send({
          from: "Blog <onboarding@resend.dev>",
          to: emails,
          subject: `📬 Weekly Digest: ${recentPosts.length} new article${recentPosts.length > 1 ? "s" : ""}`,
          html: emailHtml,
        });

        if (emailResponse.error) {
          console.error("Batch send error:", emailResponse.error);
          errorCount += batch.length;
        } else {
          sentCount += batch.length;
        }
      } catch (err) {
        console.error("Batch send exception:", err);
        errorCount += batch.length;
      }
    }

    console.log(`Blog digest sent: ${sentCount} successful, ${errorCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        errorCount,
        postsIncluded: recentPosts.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error sending blog digest:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
