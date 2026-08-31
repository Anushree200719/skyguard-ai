import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CloudSun, 
  LineChart, 
  Search, 
  Bell, 
  Wrench, 
  BrainCircuit 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/stations', label: 'AWS Stations', icon: CloudSun },
    { to: '/monitoring', label: 'Live Monitoring', icon: LineChart },
    { to: '/anomalies', label: 'Anomaly Explorer', icon: Search },
    { to: '/alerts', label: 'Live Alerts', icon: Bell },
    { to: '/maintenance', label: 'Maintenance Queue', icon: Wrench },
    { to: '/analytics', label: 'Analytics & Insights', icon: BrainCircuit }
  ];

  return (
    <aside className="w-64 glass-card border-r border-sky-500/20 p-4 flex flex-col gap-2 min-h-[calc(100vh-4rem)]">
      <div className="text-[10px] font-orbitron text-sky-400 font-bold px-3 py-1 tracking-widest text-slate-400 uppercase">
        COMMAND CENTER NAVIGATION
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

      <div className="mt-auto p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>AI Engine:</span>
          <span className="text-emerald-400 font-semibold font-mono">HYBRID ML</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Spatial Consensus:</span>
          <span className="text-sky-400 font-semibold font-mono font-bold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Sensors Tracked:</span>
          <span className="text-indigo-400 font-semibold font-mono font-bold">6 PARAMS</span>
        </div>
      </div>
    </aside>
  );
};
