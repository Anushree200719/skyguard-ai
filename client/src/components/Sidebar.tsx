import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  RadioTower, 
  AlertTriangle, 
  BellRing, 
  Wrench, 
  BarChart3, 
  SlidersHorizontal 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/stations', label: 'AWS Stations', icon: RadioTower },
    { to: '/anomalies', label: 'Anomaly Explorer', icon: AlertTriangle },
    { to: '/alerts', label: 'Live Alerts', icon: BellRing },
    { to: '/maintenance', label: 'Maintenance Queue', icon: Wrench },
    { to: '/analytics', label: 'Analytics & Quality', icon: BarChart3 },
    { to: '/simulator', label: 'Live Simulator', icon: SlidersHorizontal }
  ];

  return (
    <aside className="w-64 glass-card border-r border-sky-500/20 p-4 flex flex-col gap-2 min-h-[calc(100vh-4rem)]">
      <div className="text-[10px] font-orbitron text-sky-400 font-bold px-3 py-1 tracking-widest text-slate-400 uppercase">
        NAVIGATION MENU
      </div>
      <nav className="flex flex-col gap-1 mt-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-lg shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>ML Engine:</span>
          <span className="text-emerald-400 font-semibold font-mono">HYBRID AI</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
          <span>Spatial Consensus:</span>
          <span className="text-sky-400 font-semibold font-mono font-bold">ONLINE</span>
        </div>
      </div>
    </aside>
  );
};
