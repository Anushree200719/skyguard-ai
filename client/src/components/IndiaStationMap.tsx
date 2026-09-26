import React, { useEffect, useRef, useState } from 'react';
import { Station, Observation } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Circle as LeafletCircle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Filter, Info } from 'lucide-react';

interface IndiaStationMapProps {
  stations: Station[];
  latestObsMap: Record<string, Observation>;
}

export const IndiaStationMap: React.FC<IndiaStationMapProps> = ({ stations, latestObsMap }) => {
  const center: [number, number] = [21.5937, 78.9629]; // Center of India

  const createLeafletIcon = (status: string) => {
    let color = '#15803d'; // Normal = Emerald
    if (status === 'WARNING') color = '#b45309'; // Warning = Amber
    if (status === 'CRITICAL') color = '#b91c1c'; // Critical = Red
    if (status === 'WEATHER_EVENT') color = '#1d4ed8'; // Genuine Event = Blue

    const svg = `
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="10" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2.5"/>
        <circle cx="14" cy="14" r="4.5" fill="${color}"/>
      </svg>
    `;
    return L.divIcon({ html: svg, className: 'custom-leaflet-marker', iconSize: [28, 28], iconAnchor: [14, 14] });
  };

  return (
    <div className="gov-card flex flex-col w-full overflow-hidden">
      {/* Map Header Strip */}
      <div className="gov-card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-900" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-blue-950">
            NATIONAL GIS AUTOMATIC WEATHER STATION (AWS) NETWORK MAP
          </h3>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-700">
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Normal</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Warning</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Fault</div>
          <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Extreme Weather</div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="w-full h-[320px] sm:h-[400px] md:h-[480px] relative z-0 bg-slate-100">
        <MapContainer center={center} zoom={5} scrollWheelZoom={false} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map((st) => {
            const obs = latestObsMap[st.stationId];
            const icon = createLeafletIcon(st.status);

            return (
              <React.Fragment key={st.stationId}>
                <Marker position={[st.latitude, st.longitude]} icon={icon}>
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 min-w-[220px] bg-white text-slate-900 rounded">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                        <span className="font-mono font-bold text-xs text-blue-900">{st.stationId}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          st.status === 'NORMAL' ? 'gov-badge-green' :
                          (st.status === 'WARNING' ? 'gov-badge-amber' :
                          (st.status === 'CRITICAL' ? 'gov-badge-red' : 'gov-badge-blue'))
                        }`}>
                          {st.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{st.name}</p>
                      <p className="text-[11px] text-slate-600 mb-1.5">{st.location}</p>
                      
                      {obs && (
                        <div className="grid grid-cols-3 gap-1 my-2 pt-2 border-t border-slate-200 text-center font-mono text-[11px]">
                          <div className="bg-slate-100 p-1 rounded border border-slate-200">
                            <span className="text-[9px] text-slate-500 block">TEMP</span>
                            <span className="text-slate-900 font-bold">{obs.temperature ?? '--'}°C</span>
                          </div>
                          <div className="bg-slate-100 p-1 rounded border border-slate-200">
                            <span className="text-[9px] text-slate-500 block">HUM</span>
                            <span className="text-slate-900 font-bold">{obs.humidity ?? '--'}%</span>
                          </div>
                          <div className="bg-slate-100 p-1 rounded border border-slate-200">
                            <span className="text-[9px] text-slate-500 block">PRES</span>
                            <span className="text-slate-900 font-bold">{obs.pressure ?? '--'}</span>
                          </div>
                        </div>
                      )}
                      <a
                        href={`/stations/${st.stationId}`}
                        className="mt-2 block text-center text-[11px] font-bold text-white bg-blue-900 hover:bg-blue-950 py-1.5 rounded transition-colors"
                      >
                        INSPECT STATION DOSSIER &rarr;
                      </a>
                    </div>
                  </Popup>
                </Marker>
                {st.status === 'WEATHER_EVENT' && (
                  <LeafletCircle
                    center={[st.latitude, st.longitude]}
                    radius={120000}
                    pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 0.12, dashArray: '4, 4' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
