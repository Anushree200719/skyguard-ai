import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'sky'
}) => {
  const colorMap = {
    sky: 'bg-white/10 text-white border-white/20',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
  };

  return (
    <div className="liquid-glass p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border-none gap-2.5 transition-all hover:scale-[1.02] hover:bg-white/[0.04] min-w-0">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-medium text-white/50 tracking-wider uppercase truncate">{title}</p>
        <h3 className="text-lg sm:text-xl md:text-2xl font-poppins font-medium text-white mt-0.5 sm:mt-1 truncate tracking-tight">{value}</h3>
        {subtitle && <p className="text-[10px] sm:text-[11px] text-white/60 mt-0.5 font-light truncate">{subtitle}</p>}
      </div>
      <div className={`p-2.5 sm:p-3 rounded-xl border flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" />
      </div>
    </div>
  );
};
