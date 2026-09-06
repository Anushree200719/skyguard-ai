import React, { useEffect, useRef, useState } from 'react';
import { Station, Observation } from '../types';
import { MapContainer, TileLayer, Marker, Popup, Circle as LeafletCircle } from 'react-leaflet';
import L from 'leaflet';

interface IndiaStationMapProps {
  stations: Station[];
  latestObsMap: Record<string, Observation>;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBmsgu5kc_HKz72ldKL5iJuTKf9X-Gwzn4';

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#091122" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#091122" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#0f1c38" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#16233b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1e3a8a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#040814" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
];

export const IndiaStationMap: React.FC<IndiaStationMapProps> = ({ stations, latestObsMap }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);
  const [googleError, setGoogleError] = useState<boolean>(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  // Load Google Maps API Script dynamically
  useEffect(() => {
    if ((window as any).google && (window as any).google.maps) {
      setGoogleLoaded(true);
      return;
    }

    const scriptId = 'google-maps-api-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;

      script.onload = () => {
        setGoogleLoaded(true);
      };

      script.onerror = () => {
        setGoogleError(true);
      };

      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setGoogleLoaded(true));
    }
  }, []);

  // Initialize and update Google Map instance
  useEffect(() => {
    if (!googleLoaded || !mapRef.current || googleError) return;

    try {
      const google = (window as any).google;
      if (!google || !google.maps || typeof google.maps.Map !== 'function') {
        setGoogleError(true);
        return;
      }

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 21.5937, lng: 78.9629 }, // Center of India
          zoom: 5,
          styles: DARK_MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });
      }

      const map = mapInstanceRef.current;

      // Clear existing markers & circles
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
      circlesRef.current.forEach(c => c.setMap(null));
      circlesRef.current = [];

      const infoWindow = new google.maps.InfoWindow();

      stations.forEach(st => {
        const obs = latestObsMap[st.stationId];

        let color = '#10b981'; // NORMAL = Emerald
        if (st.status === 'WARNING') color = '#f59e0b';
        if (st.status === 'CRITICAL') color = '#ef4444';
        if (st.status === 'WEATHER_EVENT') color = '#38bdf8';

        // Custom SVG Marker Icon
        const svgIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2.5"/>
              <circle cx="16" cy="16" r="5" fill="${color}"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        };

        const marker = new google.maps.Marker({
          position: { lat: st.latitude, lng: st.longitude },
          map: map,
          title: `${st.stationId} — ${st.name}`,
          icon: svgIcon
        });

        const statusClass = 
          st.status === 'NORMAL' ? 'background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.4);' :
          (st.status === 'WARNING' ? 'background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);' :
          (st.status === 'CRITICAL' ? 'background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.4);' : 
          'background:rgba(56,189,248,0.2);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);'));

        const contentString = `
          <div style="font-family: sans-serif; padding: 6px; min-width: 210px; background-color: #0f172a; color: #f8fafc; border-radius: 8px;">
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: bold; font-size: 13px; color: #38bdf8;">${st.stationId}</span>
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; ${statusClass}">
                ${st.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style="font-weight: bold; font-size: 12px; color: #e2e8f0;">${st.name}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">${st.location}</div>
            
            ${obs ? `
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding-top: 6px; border-top: 1px solid #1e293b; text-align: center; font-size: 11px;">
                <div style="background: #1e293b; padding: 4px; border-radius: 4px;">
                  <span style="font-size: 9px; color: #94a3b8; display: block;">TEMP</span>
                  <span style="font-weight: bold; color: #f8fafc;">${obs.temperature ?? '--'}°C</span>
                </div>
                <div style="background: #1e293b; padding: 4px; border-radius: 4px;">
                  <span style="font-size: 9px; color: #94a3b8; display: block;">HUM</span>
                  <span style="font-weight: bold; color: #f8fafc;">${obs.humidity ?? '--'}%</span>
                </div>
                <div style="background: #1e293b; padding: 4px; border-radius: 4px;">
                  <span style="font-size: 9px; color: #94a3b8; display: block;">PRES</span>
                  <span style="font-weight: bold; color: #f8fafc;">${obs.pressure ?? '--'}</span>
                </div>
              </div>
            ` : ''}

            <a href="/stations/${st.stationId}" style="display: block; text-align: center; font-size: 11px; font-weight: bold; color: #38bdf8; background: rgba(56,189,248,0.15); padding: 6px; margin-top: 8px; border-radius: 4px; text-decoration: none; border: 1px solid rgba(56,189,248,0.3);">
              VIEW STATION DETAILS &rarr;
            </a>
          </div>
        `;

        marker.addListener('click', () => {
          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);

        // Draw Weather Event Circle
        if (st.status === 'WEATHER_EVENT') {
          const circle = new google.maps.Circle({
            strokeColor: '#38bdf8',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#38bdf8',
            fillOpacity: 0.15,
            map: map,
            center: { lat: st.latitude, lng: st.longitude },
            radius: 120000
          });
          circlesRef.current.push(circle);
        }
      });
    } catch (err) {
      console.warn('Google Maps API load note, falling back to Leaflet vector basemap:', err);
      setGoogleError(true);
    }
  }, [googleLoaded, googleError, stations, latestObsMap]);

  // Leaflet CARTO Basemap Fallback
  if (googleError || (!googleLoaded && typeof window !== 'undefined' && !(window as any).google)) {
    const center: [number, number] = [21.5937, 78.9629];
    const createLeafletIcon = (status: string) => {
      let color = '#10b981';
      if (status === 'WARNING') color = '#f59e0b';
      if (status === 'CRITICAL') color = '#ef4444';
      if (status === 'WEATHER_EVENT') color = '#38bdf8';
      const svg = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2.5"/>
          <circle cx="16" cy="16" r="5" fill="${color}"/>
        </svg>
      `;
      return L.divIcon({ html: svg, className: 'custom-leaflet-marker', iconSize: [32, 32], iconAnchor: [16, 16] });
    };

    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden glass-card border border-sky-500/20 relative z-0">
        <MapContainer center={center} zoom={5} scrollWheelZoom={false} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> Dark Matter'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains={['a', 'b', 'c', 'd']}
          />
          {stations.map((st) => {
            const obs = latestObsMap[st.stationId];
            const icon = createLeafletIcon(st.status);

            return (
              <React.Fragment key={st.stationId}>
                <Marker position={[st.latitude, st.longitude]} icon={icon}>
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 min-w-[210px] bg-slate-900 text-slate-100 rounded-md">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-2">
                        <span className="font-orbitron font-bold text-xs text-sky-400">{st.stationId}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          st.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          (st.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          (st.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'))
                        }`}>
                          {st.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{st.name}</p>
                      <p className="text-[11px] text-slate-400 mb-1">{st.location}</p>
                      
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
                      <a
                        href={`/stations/${st.stationId}`}
                        className="mt-2 block text-center text-[11px] font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 py-1 rounded border border-sky-500/30"
                      >
                        VIEW STATION DETAILS &rarr;
                      </a>
                    </div>
                  </Popup>
                </Marker>
                {st.status === 'WEATHER_EVENT' && (
                  <LeafletCircle
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
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden glass-card border border-sky-500/20 relative z-0">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
