import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const InfoTooltip = ({ label, description }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-2 group z-40">
      <HelpCircle
        size={14}
        className="text-zinc-500 hover:text-primary cursor-help transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      />
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 text-xs text-zinc-300 pointer-events-none">
          <div className="font-semibold text-white mb-1">{label}</div>
          {description}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
