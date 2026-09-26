import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getReadableName = (part: string) => {
    switch (part.toLowerCase()) {
      case 'dashboard': return 'Dashboard';
      case 'stations': return 'AWS Network';
      case 'monitoring': return 'Live Data & Telemetry';
      case 'anomalies': return 'Data Quality & QC';
      case 'alerts': return 'Alert & Warning Management';
      case 'analytics': return 'Reports & Analytics';
      case 'prediction': return 'AI Predictions';
      case 'maintenance': return 'Maintenance Desk';
      case 'rankings': return 'Trust Rankings';
      default: return part.toUpperCase();
    }
  };

  return (
    <div className="w-full bg-slate-200/70 border-b border-slate-300 px-4 py-1.5 text-xs text-slate-600 mb-4 flex items-center gap-1.5 select-none font-sans">
      <Link to="/" className="flex items-center gap-1 text-blue-900 hover:text-blue-700 font-medium">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {pathnames.length > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={name}>
            {isLast ? (
              <span className="font-semibold text-slate-800">{getReadableName(name)}</span>
            ) : (
              <Link to={routeTo} className="text-blue-900 hover:text-blue-700 font-medium">
                {getReadableName(name)}
              </Link>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
