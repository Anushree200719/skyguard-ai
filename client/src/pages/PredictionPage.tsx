import React, { useState, useEffect } from 'react';
import { fetchStations, fetchStationPrediction } from '../services/api';
import { Station } from '../types';
import { 
  TrendingUp, 
  Sparkles, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldCheck, 
  Info, 
  RadioTower, 
  RefreshCw,
  Clock,
  Layers,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const PredictionPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('AWS-701');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [activeHorizon, setActiveHorizon] = useState<'h1' | 'h6' | 'h24'>('h6');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await fetchStations();
        if (data && data.length > 0) {
          setStations(data);
          if (!data.some((s: Station) => s.stationId === selectedStationId)) {
            setSelectedStationId(data[0].stationId);
          }
        }
      } catch (err) {
        console.warn('Unable to load stations list for prediction:', err);
      }
    };
    loadStations();
  }, []);

  const loadPrediction = async (stationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStationPrediction(stationId);
      if (res) {
        setPredictionData(res);
      } else {
        setError('No prediction data returned.');
      }
    } catch (err: any) {
      console.error('Error fetching station prediction:', err);
      setError('Unable to fetch weather predictions for this station.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStationId) {
      loadPrediction(selectedStationId);
    }
  }, [selectedStationId]);

  const activeOutlook = predictionData?.outlooks?.[activeHorizon];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>AI FORECASTING & NWP MODELING</span>
            <span>•</span>
            <span>SHORT-TERM OUTLOOK</span>
          </div>
          <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <Sparkles className="w-5 h-5 text-blue-900 flex-shrink-0" />
            AI-ENHANCED SHORT-TERM WEATHER OUTLOOK
          </h1>
          <p className="text-xs text-slate-600">AWS telemetry momentum combined with Open-Meteo satellite numerical weather prediction</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs font-mono">
            <RadioTower className="w-4 h-4 text-blue-900" />
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              {stations.map((st) => (
                <option key={st.stationId} value={st.stationId}>
                  {st.stationId} — {st.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadPrediction(selectedStationId)}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="gov-card p-8 text-center text-xs font-mono text-slate-600 animate-pulse">
          ⚡ Computing hybrid telemetry & satellite forecast outlook...
        </div>
      )}

      {error && !loading && (
        <div className="gov-card p-3 border-l-4 border-l-red-600 text-red-900 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {!loading && predictionData && (
        <>
          {/* Horizon Bar */}
          <div className="gov-card p-3 flex flex-wrap items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-600 mr-2">FORECAST HORIZON:</span>
              {[
                { id: 'h1', label: 'Next 1 Hour' },
                { id: 'h6', label: 'Next 6 Hours' },
                { id: 'h24', label: 'Next 24 Hours' }
              ].map(h => (
                <button
                  key={h.id}
                  onClick={() => setActiveHorizon(h.id as any)}
                  className={`px-3 py-1 rounded text-xs font-bold border ${
                    activeHorizon === h.id
                      ? 'bg-blue-900 text-white border-blue-950 font-bold'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>

            {activeOutlook && (
              <span className="gov-badge-green text-xs font-bold px-2.5 py-1 rounded border">
                CONFIDENCE: {activeOutlook.confidence}% ({activeOutlook.confidenceLevel})
              </span>
            )}
          </div>

          {/* Forecast Cards */}
          {activeOutlook && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
              <div className="gov-card p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-blue-900" /> Temperature
                </span>
                <div className="text-2xl font-bold text-blue-950">
                  {activeOutlook.temperature.predicted.toFixed(1)}°C
                </div>
                <div className="text-[11px] text-slate-600">
                  Current: {activeOutlook.temperature.current.toFixed(1)}°C ({activeOutlook.temperature.formattedDelta})
                </div>
              </div>

              <div className="gov-card p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-800" /> Relative Humidity
                </span>
                <div className="text-2xl font-bold text-blue-950">
                  {activeOutlook.humidity.predicted}%
                </div>
                <div className="text-[11px] text-slate-600">
                  Current: {activeOutlook.humidity.current}% ({activeOutlook.humidity.formattedDelta})
                </div>
              </div>

              <div className="gov-card p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-amber-800" /> Wind Velocity
                </span>
                <div className="text-2xl font-bold text-blue-950">
                  {activeOutlook.wind.predicted} km/h
                </div>
                <div className="text-[11px] text-slate-600">
                  Current: {activeOutlook.wind.current} km/h ({activeOutlook.wind.trend})
                </div>
              </div>

              <div className="gov-card p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-emerald-800" /> Rain Probability
                </span>
                <div className="text-2xl font-bold text-blue-950">
                  {activeOutlook.rainProbability.percentage}%
                </div>
                <div className="text-[11px] text-slate-600">
                  Risk Category: <strong className="text-blue-950">{activeOutlook.rainProbability.riskCategory}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 24-Hour Chart */}
          {predictionData.hourlyTrajectory && predictionData.hourlyTrajectory.length > 0 && (
            <div className="gov-card p-4 space-y-3 font-mono">
              <h3 className="font-bold text-xs text-blue-950 uppercase flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-900" />
                24-HOUR PREDICTED TRAJECTORY CURVE
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={predictionData.hourlyTrajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                    <YAxis yAxisId="left" stroke="#1d4ed8" fontSize={10} domain={['auto', 'auto']} unit="°C" />
                    <YAxis yAxisId="right" orientation="right" stroke="#15803d" fontSize={10} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', color: '#0f172a' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="temperature" name="Predicted Temp (°C)" stroke="#1d4ed8" fill="#dbeafe" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="rainProbability" name="Rain Prob (%)" stroke="#15803d" fill="#dcfce7" strokeWidth={1.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PredictionPage;
