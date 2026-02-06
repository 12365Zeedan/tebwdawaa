/**
 * ZATCA (Zakat, Tax and Customs Authority) TLV QR Code Encoder
 * Implements the Phase 2 e-invoicing QR code standard for Saudi Arabia.
 *
 * TLV format:
 *   Tag 1 – Seller name (UTF-8)
 *   Tag 2 – VAT registration number
 *   Tag 3 – Invoice timestamp (ISO 8601)
 *   Tag 4 – Invoice total (with VAT)
 *   Tag 5 – VAT amount
 */

function toTLV(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const tlv = new Uint8Array(2 + valueBytes.length);
  tlv[0] = tag;
  tlv[1] = valueBytes.length;
  tlv.set(valueBytes, 2);
  return tlv;
}

export interface ZATCAInvoiceData {
  sellerName: string;
  vatRegistrationNumber: string;
  invoiceTimestamp: string; // ISO 8601
  invoiceTotal: number;
  vatAmount: number;
}

/**
 * Generate a base64-encoded TLV string for the ZATCA QR code.
 */
export function generateZATCAQRData(data: ZATCAInvoiceData): string {
  const tlv1 = toTLV(1, data.sellerName);
  const tlv2 = toTLV(2, data.vatRegistrationNumber);
  const tlv3 = toTLV(3, data.invoiceTimestamp);
  const tlv4 = toTLV(4, data.invoiceTotal.toFixed(2));
  const tlv5 = toTLV(5, data.vatAmount.toFixed(2));

  const combined = new Uint8Array(
    tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length
  );

  let offset = 0;
  for (const tlv of [tlv1, tlv2, tlv3, tlv4, tlv5]) {
    combined.set(tlv, offset);
    offset += tlv.length;
  }

  // Convert to base64
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}
