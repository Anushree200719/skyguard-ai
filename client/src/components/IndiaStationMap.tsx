import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Station, Observation } from '../types';
import { Link } from 'react-router-dom';

interface IndiaStationMapProps {
  stations: Station[];
  latestObsMap: Record<string, Observation>;
}

const createCustomMarkerIcon = (status: string) => {
  let color = '#10b981'; // NORMAL = Green
  if (status === 'WARNING') color = '#f59e0b'; // Yellow
  if (status === 'CRITICAL') color = '#ef4444'; // Red
  if (status === 'WEATHER_EVENT') color = '#38bdf8'; // Genuine Event = Blue

  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2.5"/>
      <circle cx="16" cy="16" r="5" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export const IndiaStationMap: React.FC<IndiaStationMapProps> = ({ stations, latestObsMap }) => {
  const center: [number, number] = [21.5937, 78.9629]; // India geographic center

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden glass-card border border-sky-500/20 relative">
      <MapContainer center={center} zoom={5} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> Dark Matter'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {stations.map((st) => {
          const obs = latestObsMap[st.stationId];
          const icon = createCustomMarkerIcon(st.status);

          return (
            <React.Fragment key={st.stationId}>
              <Marker position={[st.latitude, st.longitude]} icon={icon}>
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 min-w-[200px] bg-slate-900 text-slate-100 rounded-md">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-2">
                      <span className="font-orbitron font-bold text-xs text-sky-400">{st.stationId}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        st.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-400' :
                        (st.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                        (st.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-300'))
                      }`}>
                        {st.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{st.name}</p>
                    <p className="text-[11px] text-slate-400">{st.location}</p>
                    
                    {obs && (
                      <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-800 text-center font-mono text-[11px]">
                        <div className="bg-slate-800/80 p-1 rounded">
                          <span className="text-[9px] text-slate-400 block">TEMP</span>
                          <span className="text-slate-100 font-bold">{obs.temperature ?? '--'}°C</span>
                        </div>
                        <div className="bg-slate-800/80 p-1 rounded">
                          <span className="text-[9px] text-slate-400 block">HUM</span>
                          <span className="text-slate-100 font-bold">{obs.humidity ?? '--'}%</span>
                        </div>
                        <div className="bg-slate-800/80 p-1 rounded">
                          <span className="text-[9px] text-slate-400 block">PRES</span>
                          <span className="text-slate-100 font-bold">{obs.pressure ?? '--'}</span>
                        </div>
                      </div>
                    )}
                    <Link
                      to={`/stations/${st.stationId}`}
                      className="mt-2 block text-center text-[11px] font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 py-1 rounded border border-sky-500/30"
                    >
                      VIEW STATION DETAILS &rarr;
                    </Link>
                  </div>
                </Popup>
              </Marker>
              {st.status === 'WEATHER_EVENT' && (
                <Circle
                  center={[st.latitude, st.longitude]}
                  radius={120000}
                  pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.15, dashArray: '4, 4' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
