import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'sky'
}) => {
  const accentBorderMap = {
    sky: 'border-t-4 border-t-blue-600 bg-white',
    emerald: 'border-t-4 border-t-emerald-600 bg-white',
    amber: 'border-t-4 border-t-amber-600 bg-white',
    rose: 'border-t-4 border-t-red-600 bg-white',
    indigo: 'border-t-4 border-t-indigo-600 bg-white',
    slate: 'border-t-4 border-t-slate-600 bg-white'
  };

  const iconBgMap = {
    sky: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-red-50 text-red-700 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  return (
    <div className={`gov-card p-4 flex items-center justify-between gap-3 min-w-0 ${accentBorderMap[color]}`}>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase truncate">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-blue-950 mt-1 truncate tracking-tight font-mono">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-600 mt-0.5 truncate font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded border flex-shrink-0 ${iconBgMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
