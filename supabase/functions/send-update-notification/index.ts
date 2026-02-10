import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function maskLicenseKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.substring(0, 4) + "****" + key.substring(key.length - 4);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { licenseIds } = await req.json();

    if (!Array.isArray(licenseIds) || licenseIds.length === 0 || licenseIds.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid license IDs" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get licenses
    const { data: licenses, error: licError } = await supabase
      .from("theme_licenses")
      .select("*")
      .in("id", licenseIds)
      .eq("is_active", true);

    if (licError || !licenses || licenses.length === 0) {
      return new Response(JSON.stringify({ error: "No valid licenses found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get latest version
    const { data: latestVersion } = await supabase
      .from("theme_versions")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestVersion) {
      return new Response(JSON.stringify({ error: "No published version found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get store name from settings
    const { data: storeSetting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "store_name")
      .maybeSingle();

    const storeName = storeSetting?.value
      ? (typeof storeSetting.value === "string" ? storeSetting.value : String(storeSetting.value))
      : "Theme Store";

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(resendKey);

    let sent = 0;
    let failed = 0;

    const safeVersion = escapeHtml(String(latestVersion.version || ""));
    const safeTitle = escapeHtml(String(latestVersion.title || ""));
    const safeChangelog = latestVersion.changelog ? escapeHtml(String(latestVersion.changelog)) : "";
    const safeStoreName = escapeHtml(String(storeName));

    for (const license of licenses) {
      try {
        const platformLabel =
          license.platform === "wordpress" ? "WordPress" :
          license.platform === "shopify" ? "Shopify" : "Salla";

        const safeCustomerName = escapeHtml(String(license.customer_name || ""));
        const maskedKey = maskLicenseKey(String(license.license_key || ""));

        await resend.emails.send({
          from: `${safeStoreName} <onboarding@resend.dev>`,
          to: [license.customer_email],
          subject: `🎉 Theme Update Available - v${safeVersion}`,
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
              <h1 style="color: #1a1a1a; margin-bottom: 8px;">New Theme Update Available!</h1>
              <p style="color: #666; margin-bottom: 24px;">
                Hi ${safeCustomerName}, a new version of your ${platformLabel} theme is ready.
              </p>
              
              <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 8px 0; color: #1a1a1a;">Version ${safeVersion}</h2>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${safeTitle}</p>
                ${safeChangelog ? `
                  <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <p style="font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">What's New:</p>
                    <pre style="white-space: pre-wrap; font-family: inherit; font-size: 13px; color: #555; margin: 0;">${safeChangelog}</pre>
                  </div>
                ` : ''}
              </div>

              <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #444;">
                  <strong>Your License:</strong> ${maskedKey}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #444;">
                  <strong>Platform:</strong> ${platformLabel}
                </p>
              </div>

              <p style="color: #666; font-size: 14px;">
                Visit the theme updates page and enter your license key to download the latest version.
              </p>

              <p style="color: #999; font-size: 12px; margin-top: 32px;">
                You received this email because you purchased a ${platformLabel} theme license.
              </p>
            </div>
          `,
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
