import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VAT_RATE = 0.15;

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
      return addr;
    }
    return addr;
  }
  return formatAddressObject(addr);
}

function formatAddressObject(addr: CompanyAddress): string {
  const line1 = [addr.building_no, addr.street, addr.district]
    .filter(Boolean)
    .join(", ");
  const line2 = [addr.city, addr.region, addr.postal_code]
    .filter(Boolean)
    .join(", ");
  const line3 = addr.country || "";
  return [line1, line2, line3].filter(Boolean).join("<br>");
}

function buildInvoiceHtml(data: InvoiceRequest): string {
  const { companyInfo, items, subtotal, shippingCost } = data;

  const subtotalExclVAT = subtotal;
  const vatAmount = calculateVAT(subtotalExclVAT);
  const subtotalInclVAT = calculateTotalWithVAT(subtotalExclVAT);
  const grandTotal = subtotalInclVAT + (shippingCost ?? 0);

  const companyAddress = formatAddress(companyInfo.company_address);

  const createdDate = new Date(data.createdAt);
  const dateStr = createdDate.toLocaleDateString("en-GB");
  const timeStr = createdDate.toLocaleTimeString("en-GB", { hour12: false });

  const itemsHtml = items
    .map((item, index) => {
      const itemVAT = calculateVAT(item.total_price);
      const itemTotal = calculateTotalWithVAT(item.total_price);
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 12px; font-size: 13px; color: #666;">${index + 1}</td>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 500;">${item.product_name}</td>
          <td style="padding: 10px 12px; text-align: center; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 10px 12px; text-align: right; font-size: 13px;">${item.unit_price.toFixed(2)}</td>
          <td style="padding: 10px 12px; text-align: right; font-size: 13px; color: #666;">${itemVAT.toFixed(2)}</td>
          <td style="padding: 10px 12px; text-align: right; font-size: 13px; font-weight: 600;">${itemTotal.toFixed(2)}</td>
        </tr>`;
    })
    .join("");

  const customerAddressHtml = data.shippingAddress
    ? `
      <p style="margin: 2px 0; color: #555;">${data.shippingAddress.street || ""}</p>
      <p style="margin: 2px 0; color: #555;">${data.shippingAddress.city || ""}${data.shippingAddress.postalCode ? `, ${data.shippingAddress.postalCode}` : ""}</p>
      <p style="margin: 2px 0; color: #555;">${data.shippingAddress.country || ""}</p>`
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
              ${companyInfo.company_name || companyInfo.store_name}
            </h2>
            ${companyInfo.cr_number ? `<p style="margin: 2px 0; color: #555; font-size: 13px;"><strong>C.R. No.:</strong> ${companyInfo.cr_number}</p>` : ""}
            ${companyInfo.vat_number ? `<p style="margin: 2px 0; color: #555; font-size: 13px;"><strong>VAT No.:</strong> ${companyInfo.vat_number}</p>` : ""}
            ${companyAddress ? `<div style="margin: 2px 0; color: #555; font-size: 13px;"><strong>Address:</strong><br>${companyAddress}</div>` : ""}
            ${companyInfo.company_phone ? `<p style="margin: 2px 0; color: #555; font-size: 13px;"><strong>Tel:</strong> ${companyInfo.company_phone}</p>` : ""}
          </div>
        </div>

        <!-- Invoice Info -->
        <table style="width: 100%; margin-bottom: 24px;">
          <tr>
            <td style="vertical-align: top;">
              <p style="font-size: 13px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 6px;">BILL TO</p>
              <p style="font-weight: 600; margin: 2px 0;">${data.customerName}</p>
              <p style="margin: 2px 0; color: #555;">${data.customerEmail}</p>
              ${data.customerPhone ? `<p style="margin: 2px 0; color: #555;">${data.customerPhone}</p>` : ""}
              ${customerAddressHtml}
            </td>
            <td style="vertical-align: top; text-align: right;">
              <div style="margin-bottom: 8px;">
                <p style="font-size: 13px; color: #888; margin: 0 0 2px 0;">INVOICE NO.</p>
                <p style="font-weight: bold; font-size: 16px; color: #000435;">${data.orderNumber}</p>
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
            <span>${shippingCost > 0 ? `${shippingCost.toFixed(2)} SAR` : "Free"}</span>
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
          ${companyInfo.site_url ? `<p style="font-size: 11px; color: #999; margin: 2px 0;">${companyInfo.site_url}</p>` : ""}
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
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(apiKey);
    const data: InvoiceRequest = await req.json();

    if (!data.customerEmail || !data.orderNumber || !data.items?.length) {
      throw new Error("Missing required fields: customerEmail, orderNumber, items");
    }

    const invoiceHtml = buildInvoiceHtml(data);

    const emailResponse = await resend.emails.send({
      from: "Invoice <onboarding@resend.dev>",
      to: [data.customerEmail],
      subject: `VAT Invoice - ${data.orderNumber}`,
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
