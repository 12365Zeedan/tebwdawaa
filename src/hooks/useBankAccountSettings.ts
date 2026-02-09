import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BankAccountDetails } from '@/types/payment';

const BANK_KEYS = [
  'payment_bank_transfer_enabled',
  'bank_account_holder',
  'bank_account_holder_ar',
  'bank_name',
  'bank_name_ar',
  'bank_iban',
  'bank_account_number',
  'bank_swift_code',
];

function parseValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.replace(/^"|"$/g, '');
  }
  return String(value ?? '');
}

export function useBankAccountSettings() {
  return useQuery({
    queryKey: ['bank-account-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', BANK_KEYS);

      if (error) throw error;

      let enabled = false;
      const details: BankAccountDetails = {
        accountHolder: '',
        accountHolderAr: '',
        bankName: '',
        bankNameAr: '',
        iban: '',
        accountNumber: '',
        swiftCode: '',
      };

      data?.forEach((item) => {
        const val = item.value;
        switch (item.key) {
          case 'payment_bank_transfer_enabled':
            enabled = val === true || val === 'true' || val === '"true"';
            break;
          case 'bank_account_holder':
            details.accountHolder = parseValue(val);
            break;
          case 'bank_account_holder_ar':
            details.accountHolderAr = parseValue(val);
            break;
          case 'bank_name':
            details.bankName = parseValue(val);
            break;
          case 'bank_name_ar':
            details.bankNameAr = parseValue(val);
            break;
          case 'bank_iban':
            details.iban = parseValue(val);
            break;
          case 'bank_account_number':
            details.accountNumber = parseValue(val);
            break;
          case 'bank_swift_code':
            details.swiftCode = parseValue(val);
            break;
        }
      });

      return { enabled, details };
    },
    staleTime: 1000 * 60 * 5,
  });
}
