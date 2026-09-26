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
  FileText,
  CheckCircle2,
  Sliders,
  Database
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen = false, onCloseMobile = () => {} }) => {
  const navGroups = [
    {
      title: 'MAIN',
      links: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/stations', label: 'AWS Network', icon: CloudSun },
        { to: '/monitoring', label: 'Live Monitoring', icon: LineChart },
        { to: '/rankings', label: 'Station Trust Rankings', icon: Trophy }
      ]
    },
    {
      title: 'DATA & QUALITY',
      links: [
        { to: '/anomalies', label: 'Data Quality & Anomalies', icon: Search },
        { to: '/prediction', label: 'AI Weather Outlook', icon: Sparkles },
        { to: '/alerts', label: 'Alerts & Warnings', icon: Bell }
      ]
    },
    {
      title: 'OPERATIONS',
      links: [
        { to: '/history', label: 'Historical Data', icon: Calendar },
        { to: '/analytics', label: 'Reports & Analytics', icon: BrainCircuit },
        { to: '/maintenance', label: 'Maintenance Queue', icon: Wrench }
      ]
    },
    {
      title: 'SYSTEM',
      links: [
        { to: '/dashboard#system', label: 'System Status', icon: Shield },
        { to: '/analytics#docs', label: 'Documentation & Specs', icon: FileText }
      ]
    }
  ];

  return (
    <>
      {/* 1. DESKTOP SINGLE PRIMARY SIDEBAR (240px) */}
      <aside className="hidden md:flex w-60 desktop-sidebar bg-white border-r border-slate-200 p-3 flex-col justify-between min-h-[calc(100vh-5.5rem)] flex-shrink-0 shadow-xs font-sans select-none">
        <div className="space-y-4">
          <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono">
            <span>OFFICIAL PORTAL NAVIGATION</span>
          </div>

          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="text-[10px] font-bold tracking-wider text-slate-500 px-2 py-0.5 uppercase border-b border-slate-100 mb-1">
                {group.title}
              </div>
              <nav className="flex flex-col gap-0.5">
                {group.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to + link.label}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 text-xs transition-all ${
                          isActive
                            ? 'bg-blue-900 text-white font-bold border-l-4 border-l-[#FF9933] shadow-xs'
                            : 'text-slate-800 font-medium hover:text-blue-900 hover:bg-slate-100'
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
        <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] space-y-1 text-slate-700 mt-4">
          <div className="font-bold text-blue-950 text-xs flex items-center justify-between border-b border-slate-200 pb-1">
            <span>SYSTEM STATUS</span>
            <span className="text-emerald-700 font-mono text-[10px] flex items-center gap-1 font-bold">
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden"
            onClick={onCloseMobile}
            aria-label="Close Mobile Navigation"
          />

          <aside className="fixed inset-y-0 left-0 z-[51] w-[250px] max-w-[85vw] bg-white border-r border-slate-300 p-4 shadow-xl flex flex-col justify-between overflow-y-auto md:hidden font-sans">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-blue-900 text-amber-400 flex items-center justify-center font-serif font-bold text-sm">
                    🇮🇳
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
                  <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-1 border-b border-slate-100 pb-0.5">
                    {group.title}
                  </div>
                  {group.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to + link.label}
                        to={link.to}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 text-xs ${
                            isActive
                              ? 'bg-blue-900 text-white font-bold border-l-4 border-l-[#FF9933]'
                              : 'text-slate-800 hover:bg-slate-100'
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

            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-600 font-mono mt-4">
              <p className="font-bold text-blue-950">IMD AWS Trust Network</p>
              <p className="text-[10px] text-slate-500">Government Technical Portal</p>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

