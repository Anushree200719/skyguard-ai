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
    sky: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
  };

  return (
    <div className="glass-card p-4 rounded-xl flex items-center justify-between border transition-all hover:scale-[1.01]">
      <div>
        <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</p>
        <h3 className="text-2xl font-orbitron font-bold text-slate-100 mt-1">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
