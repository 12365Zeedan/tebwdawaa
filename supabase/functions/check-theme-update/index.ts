import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { licenseKey, action } = await req.json();

    if (!licenseKey || typeof licenseKey !== "string" || !/^[A-Za-z0-9\-]{5,64}$/.test(licenseKey)) {
      return new Response(
        JSON.stringify({ error: "Unable to verify license." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate license
    const { data: license, error: licenseError } = await supabase
      .from("theme_licenses")
      .select("*")
      .eq("license_key", licenseKey.trim())
      .maybeSingle();

    if (licenseError || !license) {
      return new Response(
        JSON.stringify({ error: "Unable to verify license." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!license.is_active || (license.expires_at && new Date(license.expires_at) < new Date())) {
      return new Response(
        JSON.stringify({ error: "Unable to verify license." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get latest published version
    const { data: latestVersion } = await supabase
      .from("theme_versions")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestVersion) {
      return new Response(
        JSON.stringify({ hasUpdate: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const platform = license.platform as string;
    const fileUrlKey = `${platform}_file_url`;
    const fileUrl = (latestVersion as Record<string, unknown>)[fileUrlKey] as string | null;

    if (action === "download") {
      if (!fileUrl) {
        return new Response(
          JSON.stringify({ error: `No file available for ${platform} platform.` }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Generate signed URL (valid for 1 hour)
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from("theme-files")
        .createSignedUrl(fileUrl, 3600);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        return new Response(
          JSON.stringify({ error: "Failed to generate download link." }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Record download (no IP stored for privacy)
      await supabase.from("theme_update_downloads").insert({
        version_id: latestVersion.id,
        license_id: license.id,
        platform,
        ip_address: null,
      });

      return new Response(
        JSON.stringify({ downloadUrl: signedUrlData.signedUrl }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Default: check action
    return new Response(
      JSON.stringify({
        hasUpdate: true,
        latestVersion: latestVersion.version,
        changelog: latestVersion.changelog,
        platform,
        hasFile: !!fileUrl,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
