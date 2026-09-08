import React, { useState, useEffect } from 'react';
import { fetchStations } from '../services/api';
import { Station } from '../types';
import { RadioTower, Heart, MapPin, ArrowRight } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 flex items-center gap-2">
            <RadioTower className="w-5 h-5 text-sky-400 flex-shrink-0" />
            AUTOMATIC WEATHER STATIONS ({filtered.length})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Complete AWS network inventory across India</p>
        </div>

        <input
          type="text"
          placeholder="Search by Station ID or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 w-full sm:w-64 focus:outline-none focus:border-sky-500 font-mono shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((st) => (
          <div key={st.stationId} className="glass-card p-4 rounded-xl border border-sky-500/20 hover:border-sky-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="font-orbitron font-bold text-sm text-sky-400">{st.stationId}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  st.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  (st.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  (st.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'))
                }`}>
                  {st.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-bold text-slate-100 text-sm mb-1">{st.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {st.location}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${st.healthScore >= 90 ? 'text-emerald-400' : (st.healthScore >= 70 ? 'text-amber-400' : 'text-rose-400')}`} />
                  <span className="text-xs font-mono font-bold text-slate-200">HEALTH: {st.healthScore}%</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">LAT: {st.latitude}°</span>
              </div>
            </div>

            <Link
              to={`/stations/${st.stationId}`}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg font-orbitron font-semibold text-xs transition-all"
            >
              <span>STATION ANALYTICS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
