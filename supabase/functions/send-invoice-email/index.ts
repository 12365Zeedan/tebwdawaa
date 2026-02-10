import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VAT_RATE = 0.15;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function calculateVAT(priceExclVAT: number): number {
  return Math.round(priceExclVAT * VAT_RATE * 100) / 100;
}

function calculateTotalWithVAT(priceExclVAT: number): number {
  return Math.round(priceExclVAT * (1 + VAT_RATE) * 100) / 100;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_name_ar: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CompanyAddress {
  building_no?: string;
  secondary_no?: string;
  postal_code?: string;
  street?: string;
  district?: string;
  city?: string;
  region?: string;
  country?: string;
}

interface InvoiceRequest {
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  } | null;
  companyInfo: {
    company_name: string;
    company_address: string | CompanyAddress;
    cr_number: string;
    vat_number: string;
    company_email: string;
    company_phone: string;
    site_url: string;
    store_name: string;
  };
}

function formatAddress(addr: string | CompanyAddress): string {
  if (typeof addr === "string") {
    try {
      const parsed = JSON.parse(addr);
      if (typeof parsed === "object" && parsed !== null) {
        return formatAddressObject(parsed);
      }
    } catch {
      return escapeHtml(addr);
    }
    return escapeHtml(addr);
  }
  return formatAddressObject(addr);
}

function formatAddressObject(addr: CompanyAddress): string {
  const line1 = [addr.building_no, addr.street, addr.district]
    .filter(Boolean)
    .map(s => escapeHtml(String(s)))
    .join(", ");
  const line2 = [addr.city, addr.region, addr.postal_code]
    .filter(Boolean)
    .map(s => escapeHtml(String(s)))
    .join(", ");
  const line3 = addr.country ? escapeHtml(addr.country) : "";
  return [line1, line2, line3].filter(Boolean).join("<br>");
}

function buildInvoiceHtml(data: InvoiceRequest): string {
  const { companyInfo, items, subtotal, shippingCost } = data;

  const subtotalExclVAT = Number(subtotal);
  const vatAmount = calculateVAT(subtotalExclVAT);
  const subtotalInclVAT = calculateTotalWithVAT(subtotalExclVAT);
  const grandTotal = subtotalInclVAT + (Number(shippingCost) ?? 0);

  const companyAddress = formatAddress(companyInfo.company_address);

  const createdDate = new Date(data.createdAt);
  const dateStr = createdDate.toLocaleDateString("en-GB");
  const timeStr = createdDate.toLocaleTimeString("en-GB", { hour12: false });

  const itemsHtml = items
    .map((item, index) => {
      const itemVAT = calculateVAT(Number(item.total_price));
      const itemTotal = calculateTotalWithVAT(Number(item.total_price));
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 12px; font-size: 13px; color: #666;">${index + 1}</td>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 500;">${escapeHtml(String(item.product_name))}</td>
          <td style="padding: 10px 12px; text-align: center; font-size: 13px;">${Number(item.quantity)}</td>
          <td style="padding: 10px 12px; text-align: right; font-size: 13px;">${Number(item.unit_price).toFixed(2)}</td>
          <td style="padding: 10px 12px; text-align: right; font-size: 13px; color: #666;">${itemVAT.toFixed(2)}</td>
          <td style="padding: 10px 12px; text-align: right; font-size: 13px; font-weight: 600;">${itemTotal.toFixed(2)}</td>
        </tr>`;
    })
    .join("");

  const safeCustomerName = escapeHtml(String(data.customerName || ""));
  const safeCustomerEmail = escapeHtml(String(data.customerEmail || ""));
  const safeCustomerPhone = data.customerPhone ? escapeHtml(String(data.customerPhone)) : "";
  const safeOrderNumber = escapeHtml(String(data.orderNumber));
  const safeCompanyName = escapeHtml(String(companyInfo.company_name || companyInfo.store_name || ""));
  const safeCrNumber = escapeHtml(String(companyInfo.cr_number || ""));
  const safeVatNumber = escapeHtml(String(companyInfo.vat_number || ""));
  const safeCompanyPhone = escapeHtml(String(companyInfo.company_phone || ""));
  const safeSiteUrl = escapeHtml(String(companyInfo.site_url || ""));

  const customerAddressHtml = data.shippingAddress
    ? `
      <p style="margin: 2px 0; color: #555;">${escapeHtml(String(data.shippingAddress.street || ""))}</p>
      <p style="margin: 2px 0; color: #555;">${escapeHtml(String(data.shippingAddress.city || ""))}${data.shippingAddress.postalCode ? `, ${escapeHtml(String(data.shippingAddress.postalCode))}` : ""}</p>
      <p style="margin: 2px 0; color: #555;">${escapeHtml(String(data.shippingAddress.country || ""))}</p>`
    : "";

  return `
    <!DOCTYPE html>
    <html dir="ltr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 32px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #000435; padding-bottom: 20px;">
          <div>
            <h1 style="font-size: 28px; font-weight: bold; color: #000435; margin: 0 0 4px 0;">TAX INVOICE</h1>
            <p style="font-size: 14px; color: #000435; margin: 0; font-weight: 600;">Simplified Tax Invoice</p>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 20px; font-weight: bold; color: #000435; margin: 0 0 4px 0;">
              ${safeCompanyName}
            </h2>
            ${safeCrNumber ? `<p style="margin: 2px 0; color: #555; font-size: 13px;"><strong>C.R. No.:</strong> ${safeCrNumber}</p>` : ""}
            ${safeVatNumber ? `<p style="margin: 2px 0; color: #555; font-size: 13px;"><strong>VAT No.:</strong> ${safeVatNumber}</p>` : ""}
            ${companyAddress ? `<div style="margin: 2px 0; color: #555; font-size: 13px;"><strong>Address:</strong><br>${companyAddress}</div>` : ""}
            ${safeCompanyPhone ? `<p style="margin: 2px 0; color: #555; font-size: 13px;"><strong>Tel:</strong> ${safeCompanyPhone}</p>` : ""}
          </div>
        </div>

        <!-- Invoice Info -->
        <table style="width: 100%; margin-bottom: 24px;">
          <tr>
            <td style="vertical-align: top;">
              <p style="font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 6px;">BILL TO</p>
              <p style="font-weight: 600; margin: 2px 0;">${safeCustomerName}</p>
              <p style="margin: 2px 0; color: #555;">${safeCustomerEmail}</p>
              ${safeCustomerPhone ? `<p style="margin: 2px 0; color: #555;">${safeCustomerPhone}</p>` : ""}
              ${customerAddressHtml}
            </td>
            <td style="vertical-align: top; text-align: right;">
              <div style="margin-bottom: 8px;">
                <p style="font-size: 13px; color: #888; margin: 0 0 2px 0;">INVOICE NO.</p>
                <p style="font-weight: bold; font-size: 16px; color: #000435;">${safeOrderNumber}</p>
              </div>
              <div>
                <p style="font-size: 13px; color: #888; margin: 0 0 2px 0;">INVOICE DATE</p>
                <p style="font-weight: 600;">${dateStr}</p>
                <p style="font-size: 12px; color: #888;">${timeStr}</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #000435;">
              <th style="padding: 10px 12px; text-align: left; color: #fff; font-size: 12px; font-weight: 600;">#</th>
              <th style="padding: 10px 12px; text-align: left; color: #fff; font-size: 12px; font-weight: 600;">Product</th>
              <th style="padding: 10px 12px; text-align: center; color: #fff; font-size: 12px; font-weight: 600;">Qty</th>
              <th style="padding: 10px 12px; text-align: right; color: #fff; font-size: 12px; font-weight: 600;">Unit Price</th>
              <th style="padding: 10px 12px; text-align: right; color: #fff; font-size: 12px; font-weight: 600;">VAT (15%)</th>
              <th style="padding: 10px 12px; text-align: right; color: #fff; font-size: 12px; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="width: 280px; margin-left: auto;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
            <span style="color: #666;">Subtotal (Excl. VAT)</span>
            <span>${subtotalExclVAT.toFixed(2)} SAR</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
            <span style="color: #666;">VAT (15%)</span>
            <span>${vatAmount.toFixed(2)} SAR</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
            <span style="color: #666;">Shipping</span>
            <span>${Number(shippingCost) > 0 ? `${Number(shippingCost).toFixed(2)} SAR` : "Free"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #000435; margin-top: 4px; font-size: 16px; font-weight: bold; color: #000435;">
            <span>Grand Total</span>
            <span>${grandTotal.toFixed(2)} SAR</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px; text-align: center;">
          <p style="font-size: 11px; color: #999; margin: 2px 0;">
            This is a simplified tax invoice issued in accordance with ZATCA e-invoicing requirements
          </p>
          ${safeSiteUrl ? `<p style="font-size: 11px; color: #999; margin: 2px 0;">${safeSiteUrl}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;
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
    const data: InvoiceRequest = await req.json();

    if (!data.customerEmail || !data.orderNumber || !data.items?.length) {
      throw new Error("Missing required fields: customerEmail, orderNumber, items");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      throw new Error("Invalid email format");
    }

    if (data.items.length > 100) {
      throw new Error("Too many items");
    }

    const invoiceHtml = buildInvoiceHtml(data);

    const emailResponse = await resend.emails.send({
      from: "Invoice <onboarding@resend.dev>",
      to: [data.customerEmail],
      subject: `VAT Invoice - ${escapeHtml(String(data.orderNumber))}`,
      html: invoiceHtml,
    });

    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Invoice email sent:", emailResponse.data);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse.data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error sending invoice email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
