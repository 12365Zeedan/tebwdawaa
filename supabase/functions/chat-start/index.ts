import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!phone || phone.length < 5 || phone.length > 20) {
      return new Response(
        JSON.stringify({ error: "Valid phone number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check for existing active conversation
    const { data: existing } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("customer_phone", phone)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ conversation_id: existing.id, existing: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new conversation
    const { data: newConv, error: convError } = await supabaseAdmin
      .from("chat_conversations")
      .insert({ customer_phone: phone })
      .select("id")
      .single();

    if (convError || !newConv) {
      return new Response(
        JSON.stringify({ error: "Failed to create conversation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch chat settings for welcome/wait messages
    const { data: settings } = await supabaseAdmin
      .from("chat_settings")
      .select("*")
      .limit(1)
      .single();

    const welcomeMsg = settings?.welcome_message || "Welcome! How can we help you?";
    const messagesToInsert: { conversation_id: string; sender_type: string; message: string }[] = [
      { conversation_id: newConv.id, sender_type: "pharmacist", message: welcomeMsg },
    ];

    // Check duty hours (Saudi Arabia timezone)
    const isWithinDuty = (() => {
      const now = new Date();
      const saTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Riyadh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);
      const [h, m] = saTime.split(":").map(Number);
      const current = h * 60 + m;
      const [sh, sm] = (settings?.duty_start_time || "08:00").split(":").map(Number);
      const [eh, em] = (settings?.duty_end_time || "23:00").split(":").map(Number);
      return current >= sh * 60 + sm && current < eh * 60 + em;
    })();

    if (!isWithinDuty && settings) {
      const offlineMsg = settings.offline_message || "We are currently outside our working hours. We will get back to you as soon as possible.";
      messagesToInsert.push({ conversation_id: newConv.id, sender_type: "pharmacist", message: offlineMsg });
    } else {
      const waitMsg = settings?.wait_message || "Please wait, the pharmacist will respond soon.";
      messagesToInsert.push({ conversation_id: newConv.id, sender_type: "pharmacist", message: waitMsg });
    }

    await supabaseAdmin.from("chat_messages").insert(messagesToInsert);

    return new Response(
      JSON.stringify({ conversation_id: newConv.id, existing: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
