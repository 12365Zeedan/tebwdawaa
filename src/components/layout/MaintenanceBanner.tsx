import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export function MaintenanceBanner() {
  const { language } = useLanguage();
  const { data: settings } = useStoreSettings();

  if (!settings?.maintenanceMode) return null;

  return (
    <div className="bg-amber-500 text-amber-950 py-2 px-4">
      <div className="container flex items-center justify-center gap-2 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>
          {language === 'ar'
            ? 'الموقع في وضع الصيانة. بعض الميزات قد لا تعمل بشكل صحيح.'
            : 'Site is in maintenance mode. Some features may not work properly.'}
        </span>
      </div>
    </div>
  );
}
