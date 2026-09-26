import React, { useState, useEffect } from 'react';
import { fetchStations } from '../services/api';
import { Station } from '../types';
import { RadioTower, Heart, MapPin, ArrowRight, Search, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Stations: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchStations().then(setStations).catch(console.warn);
  }, []);

  const filtered = stations.filter(
    s => s.stationId.toLowerCase().includes(search.toLowerCase()) ||
         s.name.toLowerCase().includes(search.toLowerCase()) ||
         s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>NATIONAL AWS DIRECTORY</span>
            <span>•</span>
            <span>OFFICIAL INVENTORY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <RadioTower className="w-5 h-5 text-blue-900 flex-shrink-0" />
            AUTOMATIC WEATHER STATIONS REGISTRY ({filtered.length})
          </h1>
          <p className="text-xs text-slate-600">Complete AWS network inventory, spatial coordinates, and operational health</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search station ID, district, state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 w-full focus:outline-none focus:border-blue-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Grid of Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((st) => (
          <div key={st.stationId} className="gov-card p-4 flex flex-col justify-between hover:border-slate-400 transition-colors">
            <div className="space-y-3">
              {/* Header: ID & Badge */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-mono font-bold text-sm text-blue-950">{st.stationId}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono uppercase ${
                  st.status === 'NORMAL' ? 'gov-badge-green' :
                  (st.status === 'WARNING' ? 'gov-badge-amber' :
                  (st.status === 'CRITICAL' ? 'gov-badge-red' : 'gov-badge-blue'))
                }`}>
                  {st.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Name & Location */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{st.name}</h3>
                <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{st.location}</span>
                </p>
              </div>

              {/* Health Score & Coordinates */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">HEALTH SCORE:</span>
                  <span className="font-bold text-blue-950">{st.healthScore}%</span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  <span>LAT: {st.latitude.toFixed(4)}°</span>
                  <span>LON: {st.longitude.toFixed(4)}°</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link
              to={`/stations/${st.stationId}`}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-blue-900 hover:bg-blue-950 text-white rounded font-bold text-xs uppercase transition-colors"
            >
              <span>INSPECT STATION DOSSIER</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
