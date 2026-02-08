import { useEffect } from 'react';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useBranding } from '@/hooks/useBranding';

/**
 * Injects Organization JSON-LD schema into the document head.
 * Uses company info and branding from app_settings.
 */
export function OrganizationJsonLd() {
  const { data: company } = useCompanyInfo();
  const { data: branding } = useBranding();

  useEffect(() => {
    if (!company) return;

    const siteUrl = company.site_url || window.location.origin;

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.store_name || company.company_name || 'Store',
      url: siteUrl,
    };

    if (company.company_email) {
      schema.email = company.company_email;
    }
    if (company.company_phone) {
      schema.telephone = company.company_phone;
      schema.contactPoint = {
        '@type': 'ContactPoint',
        telephone: company.company_phone,
        contactType: 'customer service',
      };
    }
    if (company.company_address) {
      schema.address = {
        '@type': 'PostalAddress',
        streetAddress: company.company_address,
      };
    }
    if (company.vat_number) {
      schema.taxID = company.vat_number;
    }

    // Use logo from branding if available
    const logoUrl = branding?.logoWhiteBg || branding?.logoTransparent;
    if (logoUrl) {
      schema.logo = logoUrl;
      schema.image = logoUrl;
    }

    const scriptId = 'org-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      // Keep the script — will be updated on next render
    };
  }, [company, branding]);

  return null;
}
