'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { colors } from '@yourclass/ui-tokens';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  app_description: string | null;
  custom_domain: string | null;
  status: string;
}

export interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  isTenantMode: boolean;
  isAdminMode: boolean;
  branding: {
    primaryColor: string;
    logoUrl: string | null;
    appName: string;
  };
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  isTenantMode: false,
  isAdminMode: false,
  branding: {
    primaryColor: colors.primary.default,
    logoUrl: null,
    appName: 'YourClass',
  },
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTenantMode, setIsTenantMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    async function detectTenant() {
      const hostname = window?.location?.hostname || '';
      const pathname = window?.location?.pathname || '';
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'yourclass.com';
      const isAdmin = pathname.startsWith('/admin');

      setIsAdminMode(isAdmin);

      if (isAdmin) {
        setIsLoading(false);
        return;
      }

      if (hostname.includes(rootDomain)) {
        const parts = hostname.split('.');
        if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
          const slug = parts[0];
          try {
            const res = await fetch(`/api/tenants/slug/${slug}`);
            const data = await res.json();
            if (data.success && data.data) {
              setTenant(data.data);
              setIsTenantMode(true);
            }
          } catch (error) {
            console.error('Failed to fetch tenant:', error);
          }
        }
      }

      setIsLoading(false);
    }

    detectTenant();
  }, []);

  const branding = {
    primaryColor: tenant?.primary_color || colors.primary.default,
    logoUrl: tenant?.logo_url,
    appName: tenant?.name || 'YourClass',
  };

  return (
    <TenantContext.Provider value={{ tenant, isLoading, isTenantMode, isAdminMode, branding }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
