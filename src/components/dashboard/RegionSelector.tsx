import React from 'react';
import { Globe } from 'lucide-react';

export type RegionCode = 'GLOBAL' | 'US' | 'EU' | 'UK' | 'CA' | 'AU' | 'JP' | 'IN';

export interface RegionInfo {
  code: RegionCode;
  name: string;
  flag: string;
  firecrawlCountry?: string;
  proxyLabel: string;
  locationCode: string;
  languageCode: string;
}

export const REGIONS: Record<RegionCode, RegionInfo> = {
  GLOBAL: { code: 'GLOBAL', name: 'Global (Default)', flag: '🌍', proxyLabel: 'Worldwide Proxies', locationCode: '2840', languageCode: 'en' },
  US: { code: 'US', name: 'United States', flag: '🇺🇸', firecrawlCountry: 'US', proxyLabel: 'US Commercial Proxy', locationCode: '2840', languageCode: 'en' },
  EU: { code: 'EU', name: 'European Union', flag: '🇪🇺', firecrawlCountry: 'DE', proxyLabel: 'EU Residential Proxy', locationCode: '2276', languageCode: 'de' },
  UK: { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', firecrawlCountry: 'GB', proxyLabel: 'UK Residential Proxy', locationCode: '2826', languageCode: 'en' },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦', firecrawlCountry: 'CA', proxyLabel: 'CA Residential Proxy', locationCode: '2124', languageCode: 'en' },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', firecrawlCountry: 'AU', proxyLabel: 'AU Residential Proxy', locationCode: '2036', languageCode: 'en' },
  JP: { code: 'JP', name: 'Japan', flag: '🇯🇵', firecrawlCountry: 'JP', proxyLabel: 'JP Residential Proxy', locationCode: '2392', languageCode: 'ja' },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', firecrawlCountry: 'IN', proxyLabel: 'IN Residential Proxy', locationCode: '2356', languageCode: 'en' },
};

export const RegionDropdown: React.FC<{
  selectedRegion: RegionCode;
  onChange: (region: RegionCode) => void;
  className?: string;
}> = ({ selectedRegion, onChange, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="w-3.5 h-3.5 text-[#777b86]" />
      <select
        value={selectedRegion}
        onChange={(e) => onChange(e.target.value as RegionCode)}
        className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-3 py-1.5 text-xs text-[#17191c] font-medium focus:outline-none cursor-pointer shadow-sm"
      >
        {(Object.keys(REGIONS) as RegionCode[]).map((code) => {
          const region = REGIONS[code];
          return (
            <option key={code} value={code}>
              {region.flag} {region.name}
            </option>
          );
        })}
      </select>
    </div>
  );
};
