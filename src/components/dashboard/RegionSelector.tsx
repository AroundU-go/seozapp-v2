import React from 'react';
import { Globe } from 'lucide-react';

export type RegionCode =
  | 'GLOBAL'
  | 'US'
  | 'UK'
  | 'CA'
  | 'AU'
  | 'IN'
  | 'DE'
  | 'FR'
  | 'IT'
  | 'ES'
  | 'NL'
  | 'PL'
  | 'DK'
  | 'SE'
  | 'NO'
  | 'FI'
  | 'BE'
  | 'CH'
  | 'AT'
  | 'IE'
  | 'PT'
  | 'JP'
  | 'KR'
  | 'SG'
  | 'MY'
  | 'ID'
  | 'PH'
  | 'TH'
  | 'VN'
  | 'BR'
  | 'MX'
  | 'AR'
  | 'CO'
  | 'NZ'
  | 'ZA'
  | 'AE'
  | 'EG'
  | 'IL'
  | 'EU';

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
  UK: { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', firecrawlCountry: 'GB', proxyLabel: 'UK Residential Proxy', locationCode: '2826', languageCode: 'en' },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦', firecrawlCountry: 'CA', proxyLabel: 'CA Residential Proxy', locationCode: '2124', languageCode: 'en' },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', firecrawlCountry: 'AU', proxyLabel: 'AU Residential Proxy', locationCode: '2036', languageCode: 'en' },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', firecrawlCountry: 'IN', proxyLabel: 'IN Residential Proxy', locationCode: '2356', languageCode: 'en' },
  DE: { code: 'DE', name: 'Germany', flag: '🇩🇪', firecrawlCountry: 'DE', proxyLabel: 'DE Residential Proxy', locationCode: '2276', languageCode: 'de' },
  FR: { code: 'FR', name: 'France', flag: '🇫🇷', firecrawlCountry: 'FR', proxyLabel: 'FR Residential Proxy', locationCode: '2250', languageCode: 'fr' },
  IT: { code: 'IT', name: 'Italy', flag: '🇮🇹', firecrawlCountry: 'IT', proxyLabel: 'IT Residential Proxy', locationCode: '2380', languageCode: 'it' },
  ES: { code: 'ES', name: 'Spain', flag: '🇪🇸', firecrawlCountry: 'ES', proxyLabel: 'ES Residential Proxy', locationCode: '2724', languageCode: 'es' },
  NL: { code: 'NL', name: 'Netherlands', flag: '🇳🇱', firecrawlCountry: 'NL', proxyLabel: 'NL Residential Proxy', locationCode: '2528', languageCode: 'nl' },
  PL: { code: 'PL', name: 'Poland', flag: '🇵🇱', firecrawlCountry: 'PL', proxyLabel: 'PL Residential Proxy', locationCode: '2616', languageCode: 'pl' },
  DK: { code: 'DK', name: 'Denmark', flag: '🇩🇰', firecrawlCountry: 'DK', proxyLabel: 'DK Residential Proxy', locationCode: '2208', languageCode: 'da' },
  SE: { code: 'SE', name: 'Sweden', flag: '🇸🇪', firecrawlCountry: 'SE', proxyLabel: 'SE Residential Proxy', locationCode: '2752', languageCode: 'sv' },
  NO: { code: 'NO', name: 'Norway', flag: '🇳🇴', firecrawlCountry: 'NO', proxyLabel: 'NO Residential Proxy', locationCode: '2578', languageCode: 'no' },
  FI: { code: 'FI', name: 'Finland', flag: '🇫🇮', firecrawlCountry: 'FI', proxyLabel: 'FI Residential Proxy', locationCode: '2246', languageCode: 'fi' },
  BE: { code: 'BE', name: 'Belgium', flag: '🇧🇪', firecrawlCountry: 'BE', proxyLabel: 'BE Residential Proxy', locationCode: '2056', languageCode: 'nl' },
  CH: { code: 'CH', name: 'Switzerland', flag: '🇨🇭', firecrawlCountry: 'CH', proxyLabel: 'CH Residential Proxy', locationCode: '2756', languageCode: 'de' },
  AT: { code: 'AT', name: 'Austria', flag: '🇦🇹', firecrawlCountry: 'AT', proxyLabel: 'AT Residential Proxy', locationCode: '2040', languageCode: 'de' },
  IE: { code: 'IE', name: 'Ireland', flag: '🇮🇪', firecrawlCountry: 'IE', proxyLabel: 'IE Residential Proxy', locationCode: '2372', languageCode: 'en' },
  PT: { code: 'PT', name: 'Portugal', flag: '🇵🇹', firecrawlCountry: 'PT', proxyLabel: 'PT Residential Proxy', locationCode: '2620', languageCode: 'pt' },
  JP: { code: 'JP', name: 'Japan', flag: '🇯🇵', firecrawlCountry: 'JP', proxyLabel: 'JP Residential Proxy', locationCode: '2392', languageCode: 'ja' },
  KR: { code: 'KR', name: 'South Korea', flag: '🇰🇷', firecrawlCountry: 'KR', proxyLabel: 'KR Residential Proxy', locationCode: '2410', languageCode: 'ko' },
  SG: { code: 'SG', name: 'Singapore', flag: '🇸🇬', firecrawlCountry: 'SG', proxyLabel: 'SG Residential Proxy', locationCode: '2702', languageCode: 'en' },
  MY: { code: 'MY', name: 'Malaysia', flag: '🇲🇾', firecrawlCountry: 'MY', proxyLabel: 'MY Residential Proxy', locationCode: '2458', languageCode: 'ms' },
  ID: { code: 'ID', name: 'Indonesia', flag: '🇮🇩', firecrawlCountry: 'ID', proxyLabel: 'ID Residential Proxy', locationCode: '2360', languageCode: 'id' },
  PH: { code: 'PH', name: 'Philippines', flag: '🇵🇭', firecrawlCountry: 'PH', proxyLabel: 'PH Residential Proxy', locationCode: '2608', languageCode: 'en' },
  TH: { code: 'TH', name: 'Thailand', flag: '🇹🇭', firecrawlCountry: 'TH', proxyLabel: 'TH Residential Proxy', locationCode: '2764', languageCode: 'th' },
  VN: { code: 'VN', name: 'Vietnam', flag: '🇻🇳', firecrawlCountry: 'VN', proxyLabel: 'VN Residential Proxy', locationCode: '2704', languageCode: 'vi' },
  BR: { code: 'BR', name: 'Brazil', flag: '🇧🇷', firecrawlCountry: 'BR', proxyLabel: 'BR Residential Proxy', locationCode: '2076', languageCode: 'pt' },
  MX: { code: 'MX', name: 'Mexico', flag: '🇲🇽', firecrawlCountry: 'MX', proxyLabel: 'MX Residential Proxy', locationCode: '2484', languageCode: 'es' },
  AR: { code: 'AR', name: 'Argentina', flag: '🇦🇷', firecrawlCountry: 'AR', proxyLabel: 'AR Residential Proxy', locationCode: '2032', languageCode: 'es' },
  CO: { code: 'CO', name: 'Colombia', flag: '🇨🇴', firecrawlCountry: 'CO', proxyLabel: 'CO Residential Proxy', locationCode: '2170', languageCode: 'es' },
  NZ: { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', firecrawlCountry: 'NZ', proxyLabel: 'NZ Residential Proxy', locationCode: '2554', languageCode: 'en' },
  ZA: { code: 'ZA', name: 'South Africa', flag: '🇿🇦', firecrawlCountry: 'ZA', proxyLabel: 'ZA Residential Proxy', locationCode: '2710', languageCode: 'en' },
  AE: { code: 'AE', name: 'UAE', flag: '🇦🇪', firecrawlCountry: 'AE', proxyLabel: 'AE Residential Proxy', locationCode: '2784', languageCode: 'en' },
  EG: { code: 'EG', name: 'Egypt', flag: '🇪🇬', firecrawlCountry: 'EG', proxyLabel: 'EG Residential Proxy', locationCode: '2818', languageCode: 'ar' },
  IL: { code: 'IL', name: 'Israel', flag: '🇮🇱', firecrawlCountry: 'IL', proxyLabel: 'IL Residential Proxy', locationCode: '2376', languageCode: 'he' },
  EU: { code: 'EU', name: 'European Union', flag: '🇪🇺', firecrawlCountry: 'DE', proxyLabel: 'EU Residential Proxy', locationCode: '2276', languageCode: 'de' },
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
        className="bg-[#fafafb] border border-[#17191c]/15 rounded-xl px-3 py-1.5 text-xs text-[#17191c] font-medium focus:outline-none cursor-pointer shadow-sm max-w-[180px] sm:max-w-none truncate"
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
