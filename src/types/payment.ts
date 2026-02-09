// Payment method types
export type PaymentMethod = 
  | 'cod'           // Cash on Delivery
  | 'bank_transfer' // Bank Transfer
  | 'mada'          // Mada (Saudi debit cards)
  | 'visa'          // Visa credit/debit
  | 'mastercard'    // Mastercard credit/debit
  | 'apple_pay'     // Apple Pay
  | 'stc_pay';      // STC Pay

// Payment status types
export type PaymentStatus = 
  | 'pending'       // Awaiting payment
  | 'processing'    // Payment being processed
  | 'completed'     // Payment successful
  | 'failed'        // Payment failed
  | 'refunded'      // Payment refunded
  | 'cancelled';    // Payment cancelled

// Payment method configuration
export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  nameAr: string;
  icon: string;
  enabled: boolean;
  description: string;
  descriptionAr: string;
  requiresOnlineProcessing: boolean;
}

// Bank account details
export interface BankAccountDetails {
  accountHolder: string;
  accountHolderAr: string;
  bankName: string;
  bankNameAr: string;
  iban: string;
  accountNumber: string;
  swiftCode: string;
}

// Payment request for gateway
export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  metadata?: Record<string, unknown>;
}

// Payment response from gateway
export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  gatewayReference?: string;
  gatewayResponse?: Record<string, unknown>;
  errorMessage?: string;
  redirectUrl?: string;
}

// Transaction record
export interface PaymentTransaction {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gatewayReference?: string;
  gatewayResponse?: Record<string, unknown>;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  paymentProofUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Available payment methods configuration
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    nameAr: 'الدفع عند الاستلام',
    icon: 'Banknote',
    enabled: true,
    description: 'Pay with cash when your order arrives',
    descriptionAr: 'ادفع نقداً عند وصول طلبك',
    requiresOnlineProcessing: false,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    nameAr: 'تحويل بنكي',
    icon: 'Building2',
    enabled: false,
    description: 'Transfer directly to our bank account',
    descriptionAr: 'حوّل مباشرة إلى حسابنا البنكي',
    requiresOnlineProcessing: false,
  },
  {
    id: 'mada',
    name: 'Mada',
    nameAr: 'مدى',
    icon: 'CreditCard',
    enabled: false,
    description: 'Pay with your Mada debit card',
    descriptionAr: 'ادفع ببطاقة مدى الخاصة بك',
    requiresOnlineProcessing: true,
  },
  {
    id: 'visa',
    name: 'Visa',
    nameAr: 'فيزا',
    icon: 'CreditCard',
    enabled: false,
    description: 'Pay with Visa credit or debit card',
    descriptionAr: 'ادفع ببطاقة فيزا الائتمانية أو مسبقة الدفع',
    requiresOnlineProcessing: true,
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    nameAr: 'ماستركارد',
    icon: 'CreditCard',
    enabled: false,
    description: 'Pay with Mastercard credit or debit card',
    descriptionAr: 'ادفع ببطاقة ماستركارد الائتمانية أو مسبقة الدفع',
    requiresOnlineProcessing: true,
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    nameAr: 'أبل باي',
    icon: 'Smartphone',
    enabled: false,
    description: 'Pay quickly with Apple Pay',
    descriptionAr: 'ادفع بسرعة باستخدام أبل باي',
    requiresOnlineProcessing: true,
  },
  {
    id: 'stc_pay',
    name: 'STC Pay',
    nameAr: 'اس تي سي باي',
    icon: 'Wallet',
    enabled: false,
    description: 'Pay with your STC Pay wallet',
    descriptionAr: 'ادفع باستخدام محفظة اس تي سي باي',
    requiresOnlineProcessing: true,
  },
];
