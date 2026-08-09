import React from 'react';

export type AiEngineId = 'chatgpt' | 'perplexity' | 'ai_overview' | 'gemini' | 'claude';

export interface AiEngineInfo {
  id: AiEngineId;
  name: string;
  provider: string;
  iconPath?: string;
  badgeBg: string;
  badgeText: string;
  svgIcon?: React.ReactNode;
}

export const AI_ENGINES: Record<AiEngineId, AiEngineInfo> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    iconPath: '/icon2.png',
    badgeBg: 'bg-[#10a37f]/10',
    badgeText: 'text-[#10a37f]',
    svgIcon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.259 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7466-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.794.794 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.47 4.47 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4997 4.4997 0 0 1-6.1408-1.6464z" />
      </svg>
    ),
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google AI',
    iconPath: '/icon4.png',
    badgeBg: 'bg-[#4285f4]/10',
    badgeText: 'text-[#4285f4]',
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'Perplexity AI',
    iconPath: '/icon3.png',
    badgeBg: 'bg-[#20b2aa]/10',
    badgeText: 'text-[#20b2aa]',
  },
  ai_overview: {
    id: 'ai_overview',
    name: 'AI Overviews',
    provider: 'Google',
    iconPath: '/google-logo.png',
    badgeBg: 'bg-[#ea4335]/10',
    badgeText: 'text-[#ea4335]',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    iconPath: '/icon1.png',
    badgeBg: 'bg-[#d97706]/10',
    badgeText: 'text-[#d97706]',
    svgIcon: (
      <svg className="w-4 h-4 text-[#d97706]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
    ),
  },
};

export const AiEngineBadge: React.FC<{ engineId: AiEngineId; showProvider?: boolean }> = ({
  engineId,
  showProvider = false,
}) => {
  const engine = AI_ENGINES[engineId] || AI_ENGINES.chatgpt;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border border-[#17191c]/10 ${engine.badgeBg} ${engine.badgeText}`}>
      {engine.iconPath ? (
        <img src={engine.iconPath} alt={engine.name} className="w-3.5 h-3.5 object-contain rounded-full" />
      ) : (
        engine.svgIcon
      )}
      <span>{engine.name}</span>
      {showProvider && <span className="text-[10px] opacity-75">({engine.provider})</span>}
    </div>
  );
};

export const AiEngineSelector: React.FC<{
  selectedEngines: AiEngineId[];
  onToggle: (id: AiEngineId) => void;
  allowedEngines?: AiEngineId[];
  onLockedClick?: (id: AiEngineId) => void;
}> = ({ selectedEngines, onToggle, allowedEngines, onLockedClick }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.keys(AI_ENGINES) as AiEngineId[]).map((id) => {
        const engine = AI_ENGINES[id];
        const isSelected = selectedEngines.includes(id);
        const isAllowed = !allowedEngines || allowedEngines.includes(id);

        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (isAllowed) {
                onToggle(id);
              } else if (onLockedClick) {
                onLockedClick(id);
              }
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              !isAllowed
                ? 'bg-[#fafafb] text-[#777b86]/60 border-[#17191c]/10 cursor-pointer opacity-70 hover:opacity-100'
                : isSelected
                ? 'bg-[#17191c] text-[#ffffff] border-[#17191c] shadow-sm'
                : 'bg-[#ffffff] text-[#777b86] border-[#17191c]/15 hover:border-[#17191c]/40'
            }`}
            title={!isAllowed ? `Upgrade plan to unlock ${engine.name}` : undefined}
          >
            {engine.iconPath ? (
              <img
                src={engine.iconPath}
                alt={engine.name}
                className={`w-4 h-4 object-contain rounded-full ${!isSelected || !isAllowed ? 'grayscale opacity-75' : ''}`}
              />
            ) : (
              <span className={isSelected && isAllowed ? 'text-white' : 'text-[#17191c]'}>{engine.svgIcon}</span>
            )}
            <span>{engine.name}</span>
            {!isAllowed && (
              <span className="text-[10px] bg-[#5d2a1a]/10 text-[#5d2a1a] px-1.5 py-0.5 rounded font-semibold ml-0.5">🔒 PRO</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
