import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStationById, fetchStationObservations, fetchStationLiveWeather } from '../services/api';
import { Station, Observation } from '../types';
import { 
  RadioTower, 
  ArrowLeft, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  CloudRain, 
  Sun, 
  Compass, 
  Layers, 
  Satellite, 
  Sunrise, 
  Sunset,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const StationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<Station | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [openMeteoData, setOpenMeteoData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchStationById(id).then(setStation).catch(console.warn);
      fetchStationObservations(id, 40).then(setObservations).catch(console.warn);
      fetchStationLiveWeather(id).then(res => setOpenMeteoData(res.openMeteo)).catch(console.warn);
    }
  }, [id]);

  if (!station) {
    return <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading station telemetry...</div>;
  }

  const latestObs = observations[observations.length - 1];
  const currentMeteo = openMeteoData?.current;
  const dailyMeteo = openMeteoData?.daily;

  const chartData = observations.map(o => ({
    time: new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: o.temperature,
    corrected: o.correctedTemperature ?? o.temperature,
    humidity: o.humidity,
    pressure: o.pressure,
    windSpeed: o.windSpeed,
    rainfall: o.rainfall
  }));

  const sh = station.sensorHealth || { temperature: 95, humidity: 95, pressure: 95, wind: 95, rainfall: 95 };

  return (
    <div className="space-y-6">
      {/* Back button & Station Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/stations" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-orbitron font-bold text-xl text-slate-100">{station.name}</h1>
              <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold">
                {station.stationId}
              </span>
              
              {/* Station-Specific Learning Indicator */}
              <div 
                className="group relative flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold cursor-help"
                title="SkyGuard continuously learns this station's normal environmental patterns."
              >
                <span>🧠 AI Learning: Active</span>
                <span className="hidden group-hover:block absolute top-full left-0 mt-1 w-64 p-2 bg-slate-950 text-[10px] text-slate-300 rounded shadow-xl border border-slate-700 font-sans z-30 font-normal">
                  SkyGuard continuously learns this station's normal environmental patterns.
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Location: {station.location} • Coordinates: {station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E • Elevation: {station.elevation}m MSL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">SENSOR HEALTH SCORE</span>
            <span className={`font-orbitron font-bold text-lg ${station.healthScore < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
              Sensor Health: {station.healthScore}% – {station.healthScore >= 90 ? 'Healthy' : (station.healthScore >= 70 ? 'Monitor' : 'Maintenance Recommended')}
            </span>
          </div>
          <div className="text-right border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 block font-semibold">EST. RUL</span>
            <span className="font-orbitron font-bold text-lg text-indigo-400">
              {station.rulDays || 420} DAYS
            </span>
          </div>
        </div>
      </div>

      {/* Maintenance Insight Card (Appears when necessary) */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 font-mono text-xs ${
        station.healthScore < 75 
          ? 'bg-rose-500/10 border-rose-500/40 text-rose-200' 
          : (station.healthScore < 90 
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200')
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-lg">
            {station.healthScore < 75 ? '🚨' : (station.healthScore < 90 ? '⚠' : '✓')}
          </span>
          <div>
            <span className="font-bold uppercase tracking-wider block text-[11px] font-orbitron">
              MAINTENANCE INSIGHT — {station.maintenanceStatus || (station.healthScore >= 90 ? 'Healthy' : (station.healthScore >= 70 ? 'Monitor' : 'Maintenance Recommended'))}
            </span>
            <p className="text-xs text-slate-200 mt-0.5">
              {station.maintenanceWarning || (station.healthScore >= 90 ? 'All sensors operating nominally within learned station baseline.' : 'Temperature sensor shows gradual drift. Risk of degradation is increasing.')}
            </p>
          </div>
        </div>
        <div className="text-right text-[11px]">
          <span className="text-slate-400 block">AI Expected Behavior Baseline:</span>
          <span className="font-bold text-sky-300">{station.expectedRange || '30.0°C – 34.0°C'}</span>
        </div>
      </div>

      {/* 5-Parameter Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
            <Thermometer className="w-4 h-4" /> TEMPERATURE
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.temperature ?? currentMeteo?.temperature_2m ?? '--'}°C</span>
          <span className="text-[10px] text-slate-400 block mt-1">Health: {sh.temperature}/100</span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-semibold mb-1">
            <Droplets className="w-4 h-4" /> HUMIDITY
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.humidity ?? currentMeteo?.relative_humidity_2m ?? '--'}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Health: {sh.humidity}/100</span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-semibold mb-1">
            <Gauge className="w-4 h-4" /> PRESSURE
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.pressure ?? (currentMeteo?.surface_pressure ? currentMeteo.surface_pressure.toFixed(1) : '1012.0')}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Health: {sh.pressure}/100</span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <Wind className="w-4 h-4" /> WIND SPEED
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.windSpeed ?? currentMeteo?.wind_speed_10m ?? '--'} m/s</span>
          <span className="text-[10px] text-slate-400 block mt-1">Health: {sh.wind}/100</span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <CloudRain className="w-4 h-4" /> RAINFALL
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.rainfall ?? currentMeteo?.precipitation ?? '0.0'} mm</span>
          <span className="text-[10px] text-slate-400 block mt-1">Health: {sh.rainfall}/100</span>
        </div>
      </div>

      {/* OPEN-METEO GEOPHYSICAL RADAR CARD */}
      {openMeteoData && (
        <div className="glass-card p-4 rounded-xl border border-cyan-500/30 bg-[#0c1628]/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <h2 className="font-orbitron font-bold text-xs text-slate-100">OPEN-METEO LIVE SATELLITE & SOLAR METEOROLOGY</h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><Sunrise className="w-3.5 h-3.5 text-amber-400" /> Sunrise: {dailyMeteo?.sunrise?.[0] ? dailyMeteo.sunrise[0].slice(11, 16) : '--'}</span>
              <span className="flex items-center gap-1"><Sunset className="w-3.5 h-3.5 text-orange-400" /> Moonrise: {dailyMeteo?.moonrise?.[0] ? dailyMeteo.moonrise[0].slice(11, 16) : '--'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">SOLAR RADIATION SUM</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{dailyMeteo?.shortwave_radiation_sum?.[0] !== undefined ? `${dailyMeteo.shortwave_radiation_sum[0]} MJ/m²` : '--'}</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">EVAPOTRANSPIRATION (ET0)</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{dailyMeteo?.et0_fao_evapotranspiration?.[0] !== undefined ? `${dailyMeteo.et0_fao_evapotranspiration[0]} mm` : '--'}</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">SOIL TEMP (0cm / 6cm)</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{openMeteoData?.hourly?.soil_temperature_0cm?.[0] !== undefined ? `${openMeteoData.hourly.soil_temperature_0cm[0]}°C` : '--'} / {openMeteoData?.hourly?.soil_temperature_6cm?.[0] !== undefined ? `${openMeteoData.hourly.soil_temperature_6cm[0]}°C` : '--'}</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">WIND GUSTS (10m)</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{currentMeteo?.wind_gusts_10m !== undefined ? `${currentMeteo.wind_gusts_10m} km/h` : '--'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actual vs Corrected Temperature Chart */}
      <div className="glass-card p-4 rounded-xl border border-sky-500/20">
        <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-sky-400" />
          ACTUAL SENSOR TELEMETRY VS AI CORRECTED ESTIMATE (°C)
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="temperature" name="Raw Sensor Value" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="corrected" name="AI Corrected Value" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
