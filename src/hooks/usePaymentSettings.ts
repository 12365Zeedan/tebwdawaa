import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from '@/types/payment';

interface PaymentSettings {
  paymentMethodsEnabled: Record<PaymentMethod, boolean>;
  minOrderAmount: number;
  requirePhoneCheckout: boolean;
  checkoutNotesEnabled: boolean;
}

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  paymentMethodsEnabled: {
    cod: true,
    bank_transfer: false,
    mada: false,
    visa: false,
    mastercard: false,
    apple_pay: false,
    stc_pay: false,
  },
  minOrderAmount: 0,
  requirePhoneCheckout: false,
  checkoutNotesEnabled: true,
};

const PAYMENT_KEYS = [
  'payment_cod_enabled',
  'payment_bank_transfer_enabled',
  'payment_mada_enabled',
  'payment_visa_enabled',
  'payment_mastercard_enabled',
  'payment_apple_pay_enabled',
  'payment_stc_pay_enabled',
  'min_order_amount',
  'require_phone_checkout',
  'checkout_notes_enabled',
];

const keyToMethod: Record<string, PaymentMethod> = {
  payment_cod_enabled: 'cod',
  payment_bank_transfer_enabled: 'bank_transfer',
  payment_mada_enabled: 'mada',
  payment_visa_enabled: 'visa',
  payment_mastercard_enabled: 'mastercard',
  payment_apple_pay_enabled: 'apple_pay',
  payment_stc_pay_enabled: 'stc_pay',
};

function parseBool(value: unknown): boolean {
  return value === true || value === 'true' || value === '"true"';
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', PAYMENT_KEYS);

      if (error) throw error;

      const settings = { ...DEFAULT_PAYMENT_SETTINGS };
      settings.paymentMethodsEnabled = { ...DEFAULT_PAYMENT_SETTINGS.paymentMethodsEnabled };

      data?.forEach((item) => {
        const value = typeof item.value === 'string'
          ? JSON.parse(item.value)
          : item.value;

        if (item.key in keyToMethod) {
          const method = keyToMethod[item.key];
          settings.paymentMethodsEnabled[method] = parseBool(value);
        } else if (item.key === 'min_order_amount') {
          settings.minOrderAmount = Number(value) || 0;
        } else if (item.key === 'require_phone_checkout') {
          settings.requirePhoneCheckout = parseBool(value);
        } else if (item.key === 'checkout_notes_enabled') {
          settings.checkoutNotesEnabled = parseBool(value);
        }
      });

      return settings;
    },
    staleTime: 1000 * 60 * 5,
  });
}
