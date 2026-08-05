import React from 'react';
import { Lock } from 'lucide-react';

interface MacbookMockupProps {
  imageSrc?: string;
  altText?: string;
  className?: string;
}

export const MacbookMockup: React.FC<MacbookMockupProps> = ({
  imageSrc = '/seozapp-v2-dashboard.png',
  altText = 'SEOzapp v2 Dashboard Interface',
  className = '',
}) => {
  return (
    <div className={`relative max-w-5xl mx-auto ${className}`}>
      {/* 1. Macbook Screen Lid Frame */}
      <div className="relative bg-[#1a1b1e] rounded-t-3xl p-3 sm:p-4 border-2 border-[#2c2d32] shadow-2xl overflow-hidden">
        {/* Top Camera Dot */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
          <div className="w-2 h-2 rounded-full bg-[#0d0d0e] border border-[#333]" />
          <div className="w-1 h-1 rounded-full bg-[#1e293b]" />
        </div>

        {/* Top Browser Header Bar */}
        <div className="bg-[#0f1012] rounded-t-xl px-4 py-2 flex items-center justify-between border-b border-[#2c2d32]/60 mb-1 z-10">
          {/* Traffic light buttons */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>

          {/* Browser Address Bar */}
          <div className="bg-[#1a1b1e] border border-[#2c2d32] rounded-lg px-4 py-1 flex items-center gap-2 text-xs text-[#979799] w-full max-w-md justify-center shadow-inner font-mono">
            <Lock className="w-3 h-3 text-[#10a37f]" />
            <span className="text-[#e2e8f0]">https://seozapp.com/dashboard</span>
          </div>

          <div className="w-12" />
        </div>

        {/* Screen Display Container */}
        <div className="relative rounded-b-xl overflow-hidden bg-[#fafafb] shadow-inner aspect-[16/10]">
          <img
            src={imageSrc}
            alt={altText}
            className="w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      </div>

      {/* 2. Macbook Aluminum Base Frame */}
      <div className="relative bg-gradient-to-b from-[#cbd5e1] via-[#94a3b8] to-[#64748b] h-4 sm:h-5 rounded-b-2xl shadow-xl flex items-start justify-center border-t border-white/40">
        {/* Center opening notch */}
        <div className="w-20 sm:w-28 h-2 bg-[#64748b] rounded-b-md shadow-inner" />
      </div>

      {/* 3. Base Shadow Reflection */}
      <div className="w-3/4 h-6 mx-auto bg-[#17191c]/20 rounded-full blur-xl -mt-2 pointer-events-none" />
    </div>
  );
};
