import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CommentNotificationRequest {
  commentId: string;
  postTitle: string;
  postSlug: string;
  commenterName: string;
  commentContent: string;
}

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

    const {
      commentId,
      postTitle,
      postSlug,
      commenterName,
      commentContent,
    }: CommentNotificationRequest = await req.json();

    if (!commentId || !postTitle || !commentContent) {
      throw new Error("Missing required fields");
    }

    // Get admin users' emails
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      throw new Error(`Failed to fetch admin roles: ${rolesError.message}`);
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get admin emails from auth.users
    const adminEmails: string[] = [];
    for (const role of adminRoles) {
      const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(
        JSON.stringify({ success: true, message: "No admin emails found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(apiKey);

    // Truncate comment for preview
    const previewContent =
      commentContent.length > 300
        ? commentContent.substring(0, 300) + "..."
        : commentContent;

    const moderationUrl = `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/admin/blog/comments`;

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
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">💬 New Comment Pending Review</h1>
          </div>

          <!-- Body -->
          <div style="padding: 30px;">
            <p style="font-size: 15px; color: #555; margin-bottom: 20px;">
              A new comment has been submitted and needs your review.
            </p>

            <!-- Post Reference -->
            <div style="background-color: #f0f4ff; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 4px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Article</p>
              <p style="margin: 0; color: #000435; font-size: 16px; font-weight: 600;">${postTitle}</p>
            </div>

            <!-- Comment Details -->
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background-color: #e0e7ff; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                  <span style="color: #000435; font-weight: bold; font-size: 14px;">${(commenterName || "U").charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p style="margin: 0; color: #333; font-weight: 600; font-size: 14px;">${commenterName || "Anonymous User"}</p>
                </div>
              </div>
              <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${previewContent}</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 24px 0;">
              <a href="${moderationUrl}" style="display: inline-block; background-color: #000435; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Review Comments
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              This is an automated notification. You're receiving this because you're an admin.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Blog <onboarding@resend.dev>",
      to: adminEmails,
      subject: `New comment on "${postTitle}" — Review needed`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Comment notification email sent:", emailResponse.data);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse.data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error sending comment notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
