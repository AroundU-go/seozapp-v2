import React from 'react';
import { Globe } from 'lucide-react';

export type RegionCode = 'GLOBAL' | 'US' | 'EU' | 'UK' | 'CA' | 'AU' | 'JP' | 'IN';

export interface RegionInfo {
  code: RegionCode;
  name: string;
  flag: string;
  firecrawlCountry?: string;
  proxyLabel: string;
}

export const REGIONS: Record<RegionCode, RegionInfo> = {
  GLOBAL: { code: 'GLOBAL', name: 'Global (Default)', flag: '🌍', proxyLabel: 'Worldwide Proxies' },
  US: { code: 'US', name: 'United States', flag: '🇺🇸', firecrawlCountry: 'US', proxyLabel: 'US Commercial Proxy' },
  EU: { code: 'EU', name: 'European Union', flag: '🇪🇺', firecrawlCountry: 'DE', proxyLabel: 'EU Residential Proxy' },
  UK: { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', firecrawlCountry: 'GB', proxyLabel: 'UK Residential Proxy' },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦', firecrawlCountry: 'CA', proxyLabel: 'CA Residential Proxy' },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', firecrawlCountry: 'AU', proxyLabel: 'AU Residential Proxy' },
  JP: { code: 'JP', name: 'Japan', flag: '🇯🇵', firecrawlCountry: 'JP', proxyLabel: 'JP Residential Proxy' },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', firecrawlCountry: 'IN', proxyLabel: 'IN Residential Proxy' },
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
