import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface ScanNotificationRequest {
  email: string;
  overallScore: number;
  issuesFound: number;
  totalChecks: number;
  passed: number;
  warnings: number;
  failed: number;
  issues: {
    name: string;
    status: string;
    message: string;
    recommendation?: string;
  }[];
  scanDate: string;
  storeName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(apiKey);
    const body: ScanNotificationRequest = await req.json();

    if (!body.email) {
      throw new Error("Missing email address");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw new Error("Invalid email format");
    }

    const scoreColor =
      body.overallScore >= 80 ? "#22c55e" : body.overallScore >= 50 ? "#eab308" : "#ef4444";

    const issueRows = (body.issues || []).slice(0, 50)
      .map((issue) => {
        const statusIcon = issue.status === "failed" ? "🔴" : "🟡";
        return `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${statusIcon} ${escapeHtml(String(issue.name))}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">${escapeHtml(String(issue.message))}</td>
          </tr>
        `;
      })
      .join("");

    const safeStoreName = escapeHtml(String(body.storeName || "Your Store"));
    const safeScanDate = escapeHtml(String(body.scanDate || ""));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px;">🔍 Site Health Scan Report</h1>
            <p style="margin: 6px 0 0; opacity: 0.8; font-size: 14px;">${safeStoreName} — ${safeScanDate}</p>
          </div>

          <div style="padding: 32px;">
            <!-- Score -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 100px; height: 100px; border-radius: 50%; border: 6px solid ${scoreColor}; line-height: 88px; font-size: 32px; font-weight: bold; color: ${scoreColor};">
                ${Number(body.overallScore)}
              </div>
              <p style="margin: 12px 0 0; font-size: 16px; font-weight: 600; color: #111827;">Overall Score</p>
            </div>

            <!-- Summary Grid -->
            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
              <div style="flex: 1; background: #f0fdf4; border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${Number(body.passed)}</div>
                <div style="font-size: 12px; color: #166534;">Passed</div>
              </div>
              <div style="flex: 1; background: #fefce8; border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #ca8a04;">${Number(body.warnings)}</div>
                <div style="font-size: 12px; color: #854d0e;">Warnings</div>
              </div>
              <div style="flex: 1; background: #fef2f2; border-radius: 8px; padding: 12px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${Number(body.failed)}</div>
                <div style="font-size: 12px; color: #991b1b;">Failed</div>
              </div>
            </div>

            ${
              body.issues && body.issues.length > 0
                ? `
              <h2 style="font-size: 16px; margin: 0 0 12px; color: #111827;">Issues Found</h2>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #374151;">Check</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #374151;">Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${issueRows}
                </tbody>
              </table>
            `
                : `<p style="text-align: center; color: #16a34a; font-weight: 600;">✅ No issues found — your site is in great shape!</p>`
            }

            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">This is an automated health scan notification.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Site Health <onboarding@resend.dev>",
      to: [body.email],
      subject: `Site Health Report: Score ${Number(body.overallScore)}/100 — ${Number(body.issuesFound)} issue${body.issuesFound !== 1 ? "s" : ""} found`,
      html,
    });

    console.log("Scan notification sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending scan notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
