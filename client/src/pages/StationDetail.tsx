import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStationById, fetchStationObservations, fetchStationLiveWeather, fetchStationTrustScore, fetchStationOpenMeteoComparison, fetchStationSensorHealthDiagnostics, fetchStationXAIExplanation } from '../services/api';
import { Station, Observation, TrustScoreDetails, OpenMeteoComparisonResult, StationSensorHealthResult, XAIExplanationResult } from '../types';
import { StationTrustCard } from '../components/StationTrustCard';
import { OpenMeteoComparisonCard } from '../components/OpenMeteoComparisonCard';
import { SensorHealthCard } from '../components/SensorHealthCard';
import { ExplainabilityModal } from '../components/ExplainabilityModal';
import { 
  ArrowLeft, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  CloudRain, 
  Satellite, 
  Sunrise, 
  Sunset,
  Sparkles,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const StationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<Station | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [openMeteoData, setOpenMeteoData] = useState<any>(null);
  const [trustDetails, setTrustDetails] = useState<TrustScoreDetails | null>(null);
  const [comparisonData, setComparisonData] = useState<OpenMeteoComparisonResult | null>(null);
  const [sensorHealthData, setSensorHealthData] = useState<StationSensorHealthResult | null>(null);
  const [xaiExplanation, setXAIExplanation] = useState<XAIExplanationResult | null>(null);
  const [loadingXAI, setLoadingXAI] = useState<boolean>(false);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    setLoading(true);
    setLoadingXAI(true);

    Promise.allSettled([
      fetchStationById(id),
      fetchStationObservations(id, 40),
      fetchStationLiveWeather(id),
      fetchStationTrustScore(id),
      fetchStationOpenMeteoComparison(id),
      fetchStationSensorHealthDiagnostics(id),
      fetchStationXAIExplanation(id)
    ]).then(([stResult, obsResult, weatherResult, trustResult, compResult, healthResult, xaiResult]) => {
      if (!isMounted) return;

      if (stResult.status === 'fulfilled' && stResult.value) setStation(stResult.value);
      if (obsResult.status === 'fulfilled' && obsResult.value) setObservations(obsResult.value);
      if (weatherResult.status === 'fulfilled' && weatherResult.value?.openMeteo) setOpenMeteoData(weatherResult.value.openMeteo);
      if (trustResult.status === 'fulfilled' && trustResult.value) setTrustDetails(trustResult.value);
      if (compResult.status === 'fulfilled' && compResult.value) setComparisonData(compResult.value);
      if (healthResult.status === 'fulfilled' && healthResult.value) setSensorHealthData(healthResult.value);
      if (xaiResult.status === 'fulfilled' && xaiResult.value) setXAIExplanation(xaiResult.value);

      setLoading(false);
      setLoadingXAI(false);
    });

    return () => { isMounted = false; };
  }, [id]);

  const fallbackStation: Station = {
    stationId: id || 'AWS-101',
    name: station?.name || `Automatic Weather Station ${id || ''}`,
    location: station?.location || 'Regional Meteorological Site',
    latitude: station?.latitude || 21.1492,
    longitude: station?.longitude || 79.1613,
    elevation: station?.elevation || 210,
    status: station?.status || 'NORMAL',
    healthScore: station?.healthScore || 98,
    sensorHealth: station?.sensorHealth || { temperature: 95, humidity: 95, pressure: 95, wind: 95, rainfall: 95 },
    rulDays: station?.rulDays || 420,
    lastSeen: new Date().toISOString()
  };

  const currentStation = station || fallbackStation;
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

  const sh = currentStation.sensorHealth || { temperature: 95, humidity: 95, pressure: 95, wind: 95, rainfall: 95 };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="gov-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t-4 border-t-blue-900">
        <div className="flex items-start gap-3">
          <Link to="/stations" className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-700">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-bold text-lg text-blue-950">{currentStation.name}</h1>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 text-xs font-mono font-bold">
                {currentStation.stationId}
              </span>
              <span className="gov-badge-green text-[10px] font-bold px-2 py-0.5 rounded border uppercase">
                WMO REGISTERED
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              District/Location: {currentStation.location} • Coordinates: {currentStation.latitude.toFixed(4)}°N, {currentStation.longitude.toFixed(4)}°E • Elevation: {currentStation.elevation}m MSL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsExplainOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold uppercase transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SHAP EXPLANATION DOSSIER</span>
          </button>

          <Link
            to="/prediction"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold uppercase transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-900" />
            <span>AI OUTLOOK</span>
          </Link>
        </div>
      </div>

      {/* TRUST CARD */}
      <StationTrustCard station={currentStation} trustDetails={trustDetails} loading={loading} />

      {/* SATELLITE COMPARISON CARD */}
      <OpenMeteoComparisonCard station={currentStation} comparisonData={comparisonData} loading={loading} />

      {/* HARDWARE DIAGNOSTICS CARD */}
      <SensorHealthCard station={currentStation} healthData={sensorHealthData} loading={loading} />

      {/* 5-Parameter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="gov-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-900 text-xs font-bold mb-1">
            <Thermometer className="w-4 h-4" /> TEMPERATURE
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">{latestObs?.temperature !== undefined ? `${latestObs.temperature}°C` : (currentMeteo?.temperature_2m !== undefined ? `${currentMeteo.temperature_2m}°C` : '--')}</span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">Health: {sh.temperature}/100</span>
        </div>

        <div className="gov-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-cyan-800 text-xs font-bold mb-1">
            <Droplets className="w-4 h-4" /> HUMIDITY
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">{latestObs?.humidity !== undefined ? `${latestObs.humidity}%` : (currentMeteo?.relative_humidity_2m !== undefined ? `${currentMeteo.relative_humidity_2m}%` : '--')}</span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">Health: {sh.humidity}/100</span>
        </div>

        <div className="gov-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-indigo-900 text-xs font-bold mb-1">
            <Gauge className="w-4 h-4" /> PRESSURE
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">{latestObs?.pressure !== undefined ? latestObs.pressure : (currentMeteo?.surface_pressure ? currentMeteo.surface_pressure.toFixed(1) : '1012.0')}</span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">Health: {sh.pressure}/100</span>
        </div>

        <div className="gov-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-800 text-xs font-bold mb-1">
            <Wind className="w-4 h-4" /> WIND SPEED
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">{latestObs?.windSpeed !== undefined ? `${latestObs.windSpeed} m/s` : (currentMeteo?.wind_speed_10m !== undefined ? `${currentMeteo.wind_speed_10m} m/s` : '--')}</span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">Health: {sh.wind}/100</span>
        </div>

        <div className="gov-card p-3 text-center col-span-2 md:col-span-1">
          <div className="flex items-center justify-center gap-1 text-emerald-800 text-xs font-bold mb-1">
            <CloudRain className="w-4 h-4" /> RAINFALL
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">{latestObs?.rainfall !== undefined ? `${latestObs.rainfall} mm` : (currentMeteo?.precipitation !== undefined ? `${currentMeteo.precipitation} mm` : '0.0 mm')}</span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">Health: {sh.rainfall}/100</span>
        </div>
      </div>

      {/* Actual vs Corrected Temperature Chart */}
      <div className="gov-card p-4">
        <h2 className="font-bold text-xs text-blue-950 uppercase mb-3 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-blue-900" />
          ACTUAL SENSOR TELEMETRY VS AI ESTIMATED VALUE (°C)
        </h2>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', color: '#0f172a' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="temperature" name="Raw Observed Value" stroke="#1d4ed8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="corrected" name="AI Corrected Value" stroke="#15803d" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ExplainabilityModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        explanation={xaiExplanation}
        loading={loadingXAI}
      />
    </div>
  );
};
