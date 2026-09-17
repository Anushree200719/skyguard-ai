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
  Calendar,
  Trophy,
  Shield,
  Sparkles,
  X 
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen = false, onCloseMobile = () => {} }) => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/stations', label: 'AWS Stations', icon: CloudSun },
    { to: '/rankings', label: 'Reliability Rankings', icon: Trophy },
    { to: '/prediction', label: 'Weather Outlook', icon: Sparkles },
    { to: '/monitoring', label: 'Live Monitoring', icon: LineChart },
    { to: '/anomalies', label: 'Anomaly Explorer', icon: Search },
    { to: '/alerts', label: 'Live Alerts', icon: Bell },
    { to: '/history', label: 'Historical Analysis', icon: Calendar },
    { to: '/maintenance', label: 'Maintenance Queue', icon: Wrench },
    { to: '/analytics', label: 'Analytics & Insights', icon: BrainCircuit }
  ];

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Visible ONLY on md/lg desktop >= 768px, 0px on mobile) */}
      <aside className="hidden md:flex md:w-56 lg:w-64 desktop-sidebar liquid-glass-strong border-r border-white/10 p-3.5 lg:p-4 flex-col gap-2 min-h-[calc(100vh-4rem)] flex-shrink-0 bg-black/40 backdrop-blur-2xl">
        <div className="text-[10px] font-mono tracking-[0.25em] text-white/50 font-medium px-2.5 lg:px-3 py-1 uppercase">
          COMMAND MODULES
        </div>
        <nav className="flex flex-col gap-1 mt-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 lg:gap-3 px-3.5 lg:px-4 py-2.5 rounded-full font-medium text-xs lg:text-sm transition-all duration-200 ${
                    isActive
                      ? 'liquid-glass bg-white/15 text-white font-semibold shadow-lg border border-white/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-white/80" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto p-3.5 lg:p-4 liquid-glass rounded-2xl space-y-1.5 text-[11px] lg:text-xs">
          <div className="flex items-center justify-between text-white/60 font-mono">
            <span>AI Engine:</span>
            <span className="text-white font-semibold">HYBRID ML</span>
          </div>
          <div className="flex items-center justify-between text-white/60 font-mono">
            <span>Spatial Consensus:</span>
            <span className="text-white font-semibold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-white/60 font-mono">
            <span>Edge AI Support:</span>
            <span className="text-white font-semibold">CLOUD/EDGE</span>
          </div>
          <div className="flex items-center justify-between text-white/60 font-mono">
            <span>Sensors Tracked:</span>
            <span className="text-white font-semibold">6 PARAMS</span>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE OVERLAY DRAWER & DARK TRANSLUCENT BACKDROP (Visible ONLY on mobile < 768px when menu is open) */}
      {isMobileMenuOpen && (
        <>
          {/* Dark Translucent Backdrop */}
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 md:hidden transition-opacity"
            onClick={onCloseMobile}
            aria-label="Close navigation menu backdrop"
          />

          {/* Mobile Slide-Over Drawer */}
          <aside className="fixed inset-y-0 left-0 z-[51] w-[285px] max-w-[85vw] liquid-glass-strong bg-black/95 border-r border-white/20 p-4 shadow-2xl flex flex-col justify-between overflow-y-auto md:hidden backdrop-blur-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Drawer Header with Title & Close Button */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 liquid-glass rounded-xl text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-poppins font-medium text-sm tracking-tight text-white">
                    SKYGUARD <span className="font-light text-white/70">AI</span>
                  </span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full liquid-glass text-white/70 hover:text-white touch-manipulation cursor-pointer"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-[10px] font-mono text-white/50 font-medium px-1 tracking-[0.25em] uppercase">
                COMMAND MODULES
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
                        `flex items-center gap-3 px-4 py-3 rounded-full font-medium text-xs font-poppins transition-all active:scale-[0.98] touch-manipulation min-h-[44px] ${
                          isActive
                            ? 'liquid-glass bg-white/20 text-white font-semibold border border-white/30'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon className="w-4.5 h-4.5 text-white/80 flex-shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Status Box */}
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono text-white/60">
              <div className="flex items-center justify-between">
                <span>AI Engine:</span>
                <span className="text-white font-bold">HYBRID ML</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Spatial Consensus:</span>
                <span className="text-white font-bold">ONLINE</span>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
