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
  X,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen = false, onCloseMobile = () => {} }) => {
  const navGroups = [
    {
      title: 'NATIONAL MONITORING',
      links: [
        { to: '/dashboard', label: 'National AWS Overview', icon: LayoutDashboard },
        { to: '/stations', label: 'AWS Station Directory', icon: CloudSun },
        { to: '/monitoring', label: 'Live Telemetry Feeds', icon: LineChart },
        { to: '/rankings', label: 'Data Trust Rankings', icon: Trophy }
      ]
    },
    {
      title: 'QUALITY CONTROL & AI',
      links: [
        { to: '/anomalies', label: 'Anomaly & SHAP Explorer', icon: Search },
        { to: '/prediction', label: 'AI Weather Outlook', icon: Sparkles },
        { to: '/analytics', label: 'System QC Analytics', icon: BrainCircuit }
      ]
    },
    {
      title: 'INCIDENTS & AUDITS',
      links: [
        { to: '/alerts', label: 'Warning & Alert Center', icon: Bell },
        { to: '/history', label: 'Historical Telemetry', icon: Calendar },
        { to: '/maintenance', label: 'Field Maintenance Queue', icon: Wrench }
      ]
    }
  ];

  return (
    <>
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-60 lg:w-64 desktop-sidebar bg-white border-r border-slate-200 p-3 flex-col gap-4 min-h-[calc(100vh-5.5rem)] flex-shrink-0 shadow-sm">
        <div className="flex-1 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="text-[10px] font-bold tracking-wider text-slate-500 px-2 py-1 uppercase border-b border-slate-100 mb-1.5 flex items-center justify-between">
                <span>{group.title}</span>
              </div>
              <nav className="flex flex-col gap-0.5">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-900 text-white shadow-sm font-bold border-l-4 border-amber-500'
                            : 'text-slate-700 hover:text-blue-900 hover:bg-slate-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* System Institutional Info Widget */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] space-y-1.5 text-slate-700">
          <div className="font-bold text-blue-950 text-xs flex items-center justify-between border-b border-slate-200 pb-1">
            <span>NETWORK STATUS</span>
            <span className="text-emerald-700 font-mono text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ONLINE
            </span>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-slate-600">
            <span>Rule QC Engine:</span>
            <span className="font-bold text-slate-900">VERIFIED</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-slate-600">
            <span>Spatial Consensus:</span>
            <span className="font-bold text-slate-900">ACTIVE</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-slate-600">
            <span>WMO Standards:</span>
            <span className="font-bold text-slate-900">No. 8 COMPLIANT</span>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE OVERLAY DRAWER */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
            onClick={onCloseMobile}
            aria-label="Close Mobile Navigation"
          />

          <aside className="fixed inset-y-0 left-0 z-[51] w-[280px] max-w-[85vw] bg-white border-r border-slate-300 p-4 shadow-xl flex flex-col justify-between overflow-y-auto md:hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-sm">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-blue-950">
                    SKYGUARD AI
                  </span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded border border-slate-300 text-slate-600 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-1">
                    {group.title}
                  </div>
                  {group.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-semibold ${
                            isActive
                              ? 'bg-blue-900 text-white font-bold border-l-4 border-amber-500'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
              <p className="font-bold text-blue-950">IMD AWS Trust Network</p>
              <p className="text-[10px] text-slate-500">Government Monitoring Portal</p>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
