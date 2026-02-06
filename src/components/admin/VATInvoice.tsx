import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { generateZATCAQRData } from '@/lib/zatca';
import { calculateVAT, calculateTotalWithVAT, VAT_RATE } from '@/lib/vat';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderItem {
  id: string;
  product_name: string;
  product_name_ar: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderData {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal: number;
  shipping_cost: number | null;
  total: number;
  shipping_address: {
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  } | null;
  items: OrderItem[];
}

interface CompanyInfo {
  company_name: string;
  company_address: string;
  cr_number: string;
  vat_number: string;
  company_email: string;
  company_phone: string;
  site_url: string;
  store_name: string;
}

interface VATInvoiceProps {
  order: OrderData;
  companyInfo: CompanyInfo;
}

const VATInvoice: React.FC<VATInvoiceProps> = ({ order, companyInfo }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  // Calculate VAT breakdown
  const subtotalExclVAT = order.subtotal;
  const vatAmount = calculateVAT(subtotalExclVAT);
  const subtotalInclVAT = calculateTotalWithVAT(subtotalExclVAT);
  const shippingCost = order.shipping_cost ?? 0;
  const grandTotal = subtotalInclVAT + shippingCost;

  // Generate ZATCA QR data
  const qrData = generateZATCAQRData({
    sellerName: companyInfo.company_name || companyInfo.store_name,
    vatRegistrationNumber: companyInfo.vat_number || companyInfo.cr_number || '',
    invoiceTimestamp: new Date(order.created_at).toISOString(),
    invoiceTotal: grandTotal,
    vatAmount: vatAmount,
  });

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="ltr">
      <head>
        <meta charset="utf-8">
        <title>VAT Invoice - ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <script>window.onload = function() { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isAr = language === 'ar';

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          {isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
        </Button>
      </div>

      <div
        ref={printRef}
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '32px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: '#1a1a1a',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '3px solid #000435', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000435', margin: '0 0 4px 0' }}>
              {isAr ? 'فاتورة ضريبية' : 'TAX INVOICE'}
            </h1>
            <p style={{ fontSize: '14px', color: '#000435', margin: 0, fontWeight: 600 }}>
              {isAr ? 'فاتورة ضريبية مبسطة' : 'Simplified Tax Invoice'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000435', margin: '0 0 4px 0' }}>
              {companyInfo.company_name || companyInfo.store_name}
            </h2>
            {companyInfo.cr_number && (
              <p style={{ margin: '2px 0', color: '#555', fontSize: '13px' }}>
                <strong>{isAr ? 'السجل التجاري' : 'C.R. No.'}:</strong> {companyInfo.cr_number}
              </p>
            )}
            {companyInfo.vat_number && (
              <p style={{ margin: '2px 0', color: '#555', fontSize: '13px' }}>
                <strong>{isAr ? 'الرقم الضريبي' : 'VAT No.'}:</strong> {companyInfo.vat_number}
              </p>
            )}
            {companyInfo.company_address && (
              <p style={{ margin: '2px 0', color: '#555', fontSize: '13px' }}>
                <strong>{isAr ? 'العنوان' : 'Address'}:</strong> {companyInfo.company_address}
              </p>
            )}
            {companyInfo.company_phone && (
              <p style={{ margin: '2px 0', color: '#555', fontSize: '13px' }}>
                <strong>{isAr ? 'الهاتف' : 'Tel'}:</strong> {companyInfo.company_phone}
              </p>
            )}
          </div>
        </div>

        {/* Invoice Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
              {isAr ? 'فاتورة إلى' : 'BILL TO'}
            </h3>
            <p style={{ fontWeight: 600, margin: '2px 0' }}>{order.customer_name}</p>
            <p style={{ margin: '2px 0', color: '#555' }}>{order.customer_email}</p>
            {order.customer_phone && <p style={{ margin: '2px 0', color: '#555' }}>{order.customer_phone}</p>}
            {order.shipping_address && (
              <>
                <p style={{ margin: '2px 0', color: '#555' }}>{order.shipping_address.street}</p>
                <p style={{ margin: '2px 0', color: '#555' }}>
                  {order.shipping_address.city}{order.shipping_address.postalCode ? `, ${order.shipping_address.postalCode}` : ''}
                </p>
                <p style={{ margin: '2px 0', color: '#555' }}>{order.shipping_address.country}</p>
              </>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 2px 0' }}>
                {isAr ? 'رقم الفاتورة' : 'INVOICE NO.'}
              </p>
              <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#000435' }}>{order.order_number}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 2px 0' }}>
                {isAr ? 'تاريخ الفاتورة' : 'INVOICE DATE'}
              </p>
              <p style={{ fontWeight: 600 }}>{format(new Date(order.created_at), 'dd/MM/yyyy')}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{format(new Date(order.created_at), 'HH:mm:ss')}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: '#000435' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#fff', fontSize: '12px', fontWeight: 600 }}>#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                {isAr ? 'المنتج' : 'Product'}
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'center', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                {isAr ? 'الكمية' : 'Qty'}
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                {isAr ? 'سعر الوحدة' : 'Unit Price'}
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                {isAr ? 'ضريبة القيمة المضافة' : 'VAT (15%)'}
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                {isAr ? 'الإجمالي' : 'Total'}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => {
              const itemVAT = calculateVAT(item.total_price);
              const itemTotalWithVAT = calculateTotalWithVAT(item.total_price);
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#666' }}>{index + 1}</td>
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 500 }}>
                    {isAr && item.product_name_ar ? item.product_name_ar : item.product_name}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px' }}>
                    {item.unit_price.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', color: '#666' }}>
                    {itemVAT.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '13px', fontWeight: 600 }}>
                    {itemTotalWithVAT.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals + QR Code */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* QR Code */}
          <div style={{ textAlign: 'center' }}>
            <QRCodeSVG value={qrData} size={140} level="M" />
            <p style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
              {isAr ? 'رمز الاستجابة السريعة - هيئة الزكاة والضريبة والجمارك' : 'ZATCA QR Code'}
            </p>
          </div>

          {/* Totals */}
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>{isAr ? 'المجموع (بدون ضريبة)' : 'Subtotal (Excl. VAT)'}</span>
              <span>{subtotalExclVAT.toFixed(2)} SAR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>{isAr ? 'ضريبة القيمة المضافة' : `VAT (${VAT_RATE * 100}%)`}</span>
              <span>{vatAmount.toFixed(2)} SAR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>{isAr ? 'رسوم الشحن' : 'Shipping'}</span>
              <span>{shippingCost > 0 ? `${shippingCost.toFixed(2)} SAR` : (isAr ? 'مجاني' : 'Free')}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderTop: '2px solid #000435',
              marginTop: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000435',
            }}>
              <span>{isAr ? 'الإجمالي الكلي' : 'Grand Total'}</span>
              <span>{grandTotal.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', borderTop: '1px solid #eee', paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#999', margin: '2px 0' }}>
            {isAr
              ? 'هذه فاتورة ضريبية مبسطة صادرة وفقاً لمتطلبات هيئة الزكاة والضريبة والجمارك'
              : 'This is a simplified tax invoice issued in accordance with ZATCA e-invoicing requirements'}
          </p>
          {companyInfo.site_url && (
            <p style={{ fontSize: '11px', color: '#999', margin: '2px 0' }}>
              {companyInfo.site_url}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VATInvoice;
