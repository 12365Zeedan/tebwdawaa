import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversation_id");
    const phone = url.searchParams.get("phone");

    if (!conversationId || !phone) {
      return new Response(
        JSON.stringify({ error: "conversation_id and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      return new Response(
        JSON.stringify({ error: "Invalid conversation_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone format (basic check)
    if (phone.length < 5 || phone.length > 20) {
      return new Response(
        JSON.stringify({ error: "Invalid phone format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the conversation belongs to this phone number
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("chat_conversations")
      .select("id, status")
      .eq("id", conversationId)
      .eq("customer_phone", phone)
      .maybeSingle();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      // Fetch messages for this conversation
      const { data: messages, error: msgError } = await supabaseAdmin
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (msgError) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch messages" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ messages }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      // Send a message
      if (conversation.status !== "active") {
        return new Response(
          JSON.stringify({ error: "Conversation is closed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const message = typeof body.message === "string" ? body.message.trim() : "";

      if (!message || message.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Message must be 1-2000 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: insertError } = await supabaseAdmin
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          sender_type: "customer",
          message,
        });

      if (insertError) {
        return new Response(
          JSON.stringify({ error: "Failed to send message" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabaseAdmin
        .from("chat_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
