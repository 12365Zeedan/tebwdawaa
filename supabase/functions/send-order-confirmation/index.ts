import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderConfirmationRequest {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
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

    const resend = new Resend(apiKey);

    const {
      customerName,
      customerEmail,
      orderNumber,
      items,
      subtotal,
      shippingCost,
      total,
      shippingAddress,
    }: OrderConfirmationRequest = await req.json();

    if (!customerEmail || !orderNumber || !items?.length) {
      throw new Error("Missing required fields: customerEmail, orderNumber, items");
    }

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price.toFixed(2)} SAR</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.total_price.toFixed(2)} SAR</td>
        </tr>`
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
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Order Confirmed ✓</h1>
          </div>

          <!-- Body -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hello <strong>${customerName}</strong>,</p>
            <p style="font-size: 15px; color: #555;">Thank you for your order! We've received it and will begin processing it shortly.</p>

            <!-- Order Number -->
            <div style="background-color: #f0f4ff; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 13px;">ORDER NUMBER</p>
              <p style="margin: 4px 0 0; color: #000435; font-size: 20px; font-weight: bold;">${orderNumber}</p>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; font-size: 13px; color: #666;">Product</th>
                  <th style="padding: 12px; text-align: center; font-size: 13px; color: #666;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-size: 13px; color: #666;">Price</th>
                  <th style="padding: 12px; text-align: right; font-size: 13px; color: #666;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Totals -->
            <div style="border-top: 2px solid #eee; padding-top: 16px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="color: #666;">Subtotal:</span>
                <span style="color: #333; font-weight: 500;">${subtotal.toFixed(2)} SAR</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="color: #666;">Shipping:</span>
                <span style="color: #333; font-weight: 500;">${shippingCost > 0 ? shippingCost.toFixed(2) + " SAR" : "Free"}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #eee; margin-top: 8px;">
                <span style="color: #000435; font-size: 18px; font-weight: bold;">Total:</span>
                <span style="color: #000435; font-size: 18px; font-weight: bold;">${total.toFixed(2)} SAR</span>
              </div>
            </div>

            <!-- Shipping Address -->
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px; color: #333; font-weight: 600; font-size: 14px;">Shipping Address</p>
              <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
                ${shippingAddress.street}<br>
                ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
                ${shippingAddress.country}
              </p>
            </div>

            <p style="font-size: 14px; color: #888; margin-top: 24px;">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              This is an automated email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Orders <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order Confirmed - ${orderNumber}`,
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Order confirmation email sent:", emailResponse.data);

    return new Response(JSON.stringify({ success: true, data: emailResponse.data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending order confirmation email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
