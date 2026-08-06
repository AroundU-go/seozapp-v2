import React from 'react';

interface ChartProps {
  isPlaceholder?: boolean;
}

// 30-Day Citation Trend Line & Area Chart
export const CitationTrendChart: React.FC<ChartProps> = ({ isPlaceholder = true }) => {
  const dummyDays = ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'];

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[14px] font-semibold text-[#17191c]">30-Day AI Citation Share Trend</div>
          <div className="text-[12px] text-[#777b86]">Percentage of monitored queries citing brand</div>
        </div>
        <span className="text-[12px] font-bold text-[#777b86] bg-[#f2f2f3] px-2.5 py-0.5 rounded-full">
          -
        </span>
      </div>

      {/* Graph Area with Dummy Curve Outline + '-' Mark inside */}
      <div className="relative h-[160px] w-full flex items-center justify-center">
        {/* SVG Dummy Graph Outline */}
        <svg viewBox="0 0 360 140" className="w-full h-full absolute inset-0 overflow-visible">
          <defs>
            <linearGradient id="dummyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#17191c" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#17191c" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Muted Grid Lines */}
          <line x1="20" y1="25" x2="340" y2="25" stroke="#17191c" strokeOpacity="0.06" strokeDasharray="3 3" />
          <line x1="20" y1="70" x2="340" y2="70" stroke="#17191c" strokeOpacity="0.06" strokeDasharray="3 3" />
          <line x1="20" y1="120" x2="340" y2="120" stroke="#17191c" strokeOpacity="0.1" />

          {/* Dummy Area Fill */}
          <polygon points="20,120 20,95 70,85 130,90 190,65 250,55 310,40 340,35 340,120" fill="url(#dummyGradient)" />

          {/* Dummy Dashed Graph Curve Outline */}
          <polyline
            fill="none"
            stroke="#17191c"
            strokeOpacity="0.25"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="20,95 70,85 130,90 190,65 250,55 310,40 340,35"
          />
        </svg>

        {/* Prominent '-' Mark inside the center of graph */}
        <div className="relative z-10 text-center pointer-events-none">
          <span className="text-4xl font-bold text-[#17191c] opacity-80 block font-mono">-</span>
          <span className="text-[11px] text-[#777b86] font-medium bg-[#ffffff]/90 px-2 py-0.5 rounded border border-[#17191c]/10 mt-1 inline-block">
            Unsearched / Requires Pro Scan
          </span>
        </div>
      </div>

      <div className="flex justify-between text-[11px] text-[#777b86] mt-2 px-1">
        {dummyDays.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
    </div>
  );
};

// AI Engine Visibility Bar Chart with Brand Logos & Blanked Content '-'
export const EngineVisibilityChart: React.FC<ChartProps> = ({ isPlaceholder = true }) => {
  const engineItems = [
    { name: 'ChatGPT', icon: '/icon2.png' },
    { name: 'Perplexity', icon: '/icon3.png' },
    { name: 'Claude', icon: '/icon1.png' },
    { name: 'Gemini', icon: '/icon4.png' },
    { name: 'AI Overviews', icon: '/icon4.png' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[14px] font-semibold text-[#17191c]">AI Engine Citation Share</div>
          <div className="text-[12px] text-[#777b86]">Visibility rate by target AI engine</div>
        </div>
        <span className="text-[12px] text-[#777b86] font-medium">Avg: -</span>
      </div>

      <div className="space-y-2.5">
        {engineItems.map((engine) => (
          <div key={engine.name} className="space-y-1">
            <div className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <img
                  src={engine.icon}
                  alt={engine.name}
                  className="w-4 h-4 object-contain rounded-full flex-shrink-0"
                />
                <span className="font-medium text-[#17191c]">{engine.name}</span>
              </div>
              <span className="font-bold text-[#777b86] font-mono">-</span>
            </div>

            {/* Blanked Progress Bar with '-' indicator */}
            <div className="w-full h-2 rounded-full bg-[#fafafb] overflow-hidden border border-[#17191c]/10 flex items-center justify-center">
              <div className="w-0 h-full bg-[#17191c]/20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
