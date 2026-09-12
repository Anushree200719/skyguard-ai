import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CloudSun, 
  LineChart, 
  Search, 
  Bell, 
  Wrench, 
  BrainCircuit,
  Shield,
  X 
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen = false, onCloseMobile = () => {} }) => {
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
    <>
      {/* 1. DESKTOP SIDEBAR (Visible ONLY on md/lg desktop >= 768px, 0px on mobile) */}
      <aside className="hidden md:flex md:w-56 lg:w-64 desktop-sidebar glass-card border-r border-sky-500/20 p-3 lg:p-4 flex-col gap-2 min-h-[calc(100vh-4rem)] flex-shrink-0">
        <div className="text-[10px] font-orbitron text-sky-400 font-bold px-2 lg:px-3 py-1 tracking-widest text-slate-400 uppercase">
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
                  `flex items-center gap-2.5 lg:gap-3 px-3 lg:px-3.5 py-2.5 rounded-lg font-medium text-xs lg:text-sm transition-all ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-lg shadow-sky-500/10 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-sky-400" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto p-3 lg:p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1 text-[11px] lg:text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>AI Engine:</span>
            <span className="text-emerald-400 font-semibold font-mono">HYBRID ML</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Spatial Consensus:</span>
            <span className="text-sky-400 font-semibold font-mono font-bold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Edge AI Support:</span>
            <span className="text-emerald-400 font-semibold font-mono font-bold">CLOUD/EDGE</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Sensors Tracked:</span>
            <span className="text-indigo-400 font-semibold font-mono font-bold">6 PARAMS</span>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE OVERLAY DRAWER & DARK TRANSLUCENT BACKDROP (Visible ONLY on mobile < 768px when menu is open) */}
      {isMobileMenuOpen && (
        <>
          {/* Dark Translucent Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 md:hidden transition-opacity"
            onClick={onCloseMobile}
            aria-label="Close navigation menu backdrop"
          />

          {/* Mobile Slide-Over Drawer */}
          <aside className="fixed inset-y-0 left-0 z-[51] w-[280px] max-w-[80vw] bg-[#070a12]/98 border-r border-sky-500/30 p-4 shadow-2xl flex flex-col justify-between overflow-y-auto md:hidden backdrop-blur-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Drawer Header with Title & Close Button */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-500/10 border border-sky-500/30 rounded-lg">
                    <Shield className="w-5 h-5 text-sky-400 animate-pulse" />
                  </div>
                  <span className="font-orbitron font-bold text-sm tracking-wider text-slate-100">
                    SKYGUARD <span className="text-sky-400">AI</span>
                  </span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 touch-manipulation cursor-pointer"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-[10px] font-orbitron text-sky-400 font-bold px-1 tracking-widest text-slate-400 uppercase">
                COMMAND CENTER NAVIGATION
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-3 rounded-lg font-medium text-xs font-mono transition-all active:scale-[0.98] touch-manipulation min-h-[44px] ${
                          isActive
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-md shadow-sky-500/10 font-bold'
                            : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4.5 h-4.5 text-sky-400 flex-shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Status Box */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex items-center justify-between">
                <span>AI Engine:</span>
                <span className="text-emerald-400 font-bold">HYBRID ML</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Spatial Consensus:</span>
                <span className="text-sky-400 font-bold">ONLINE</span>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
