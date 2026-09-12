import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  HelpCircle, 
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
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('NAG-AWS-01');
  const [predictionData, setPredictionData] = useState<any>(null);
  const [activeHorizon, setActiveHorizon] = useState<'h1' | 'h6' | 'h24'>('h6');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch available stations list
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

  // 2. Fetch prediction data when selected station changes
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
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Header & Station Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 rounded-xl border border-sky-500/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <h1 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 flex items-center gap-2">
                AI WEATHER OUTLOOK <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/30 text-sky-300">CALIBRATED</span>
              </h1>
              <p className="text-xs text-slate-400">
                Transparent short-term forecasts combining AWS telemetry momentum & Open-Meteo satellite NWP.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
            <RadioTower className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">Station:</span>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-transparent text-sky-300 font-mono font-bold focus:outline-none cursor-pointer"
            >
              {stations.map((st) => (
                <option key={st.stationId} value={st.stationId} className="bg-slate-900 text-slate-200">
                  {st.name} ({st.stationId})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadPrediction(selectedStationId)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-mono transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="p-8 glass-card border border-slate-800 rounded-xl text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-300">Computing hybrid telemetry & satellite forecast outlook...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && predictionData && (
        <>
          {/* 2. Horizon Selection Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveHorizon('h1')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                  activeHorizon === 'h1'
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Next 1 Hour
              </button>

              <button
                onClick={() => setActiveHorizon('h6')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                  activeHorizon === 'h6'
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Next 6 Hours
              </button>

              <button
                onClick={() => setActiveHorizon('h24')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
                  activeHorizon === 'h24'
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Next 24 Hours
              </button>
            </div>

            {/* Confidence Badge */}
            {activeOutlook && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AI Confidence: <strong className="font-bold text-emerald-200">{activeOutlook.confidence}%</strong> ({activeOutlook.confidenceLevel})</span>
              </div>
            )}
          </div>

          {/* 3. Parameter Forecast Outlook Cards */}
          {activeOutlook && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Temperature */}
              <div className="glass-card p-4 rounded-xl border border-sky-500/20 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-amber-400" />
                    Temperature
                  </span>
                  <span className="font-mono text-slate-500">Target</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-2xl font-bold font-mono text-slate-100">
                      {activeOutlook.temperature.predicted.toFixed(1)}°C
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Current: {activeOutlook.temperature.current.toFixed(1)}°C
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    activeOutlook.temperature.delta >= 0 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {activeOutlook.temperature.formattedDelta}
                  </div>
                </div>
              </div>

              {/* Humidity */}
              <div className="glass-card p-4 rounded-xl border border-sky-500/20 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    Humidity
                  </span>
                  <span className="font-mono text-slate-500">Target</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-2xl font-bold font-mono text-slate-100">
                      {activeOutlook.humidity.predicted}%
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Current: {activeOutlook.humidity.current}%
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    activeOutlook.humidity.delta >= 0 
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {activeOutlook.humidity.formattedDelta}
                  </div>
                </div>
              </div>

              {/* Wind Speed & Trend */}
              <div className="glass-card p-4 rounded-xl border border-sky-500/20 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-teal-400" />
                    Wind Conditions
                  </span>
                  <span className="font-mono text-slate-500">Trend</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-2xl font-bold font-mono text-slate-100">
                      {activeOutlook.wind.predicted} <span className="text-xs text-slate-400 font-normal">km/h</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Current: {activeOutlook.wind.current} km/h
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-lg text-xs font-mono font-bold">
                    {activeOutlook.wind.trend}
                  </div>
                </div>
              </div>

              {/* Rain Probability */}
              <div className="glass-card p-4 rounded-xl border border-sky-500/20 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    Rain Probability
                  </span>
                  <span className="font-mono text-slate-500">Risk</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-2xl font-bold font-mono text-slate-100">
                      {activeOutlook.rainProbability.percentage}%
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Over {activeOutlook.timeframeLabel}
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    activeOutlook.rainProbability.riskCategory === 'HIGH' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                      : (activeOutlook.rainProbability.riskCategory === 'MODERATE' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30')
                  }`}>
                    {activeOutlook.rainProbability.riskCategory} RISK
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. 24-Hour Visual Trajectory Chart */}
          {predictionData.hourlyTrajectory && predictionData.hourlyTrajectory.length > 0 && (
            <div className="glass-card p-4 sm:p-5 rounded-xl border border-sky-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron font-bold text-sm text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    24-HOUR PREDICTION TRAJECTORY
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hourly predicted temperature curve and precipitation probability trajectory for {predictionData.stationName}.
                  </p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={predictionData.hourlyTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit="°C" />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '0.75rem' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
                    <Area yAxisId="left" type="monotone" dataKey="temperature" name="Predicted Temp (°C)" stroke="#f59e0b" fill="url(#tempGradient)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="rainProbability" name="Rain Prob (%)" stroke="#3b82f6" fill="url(#rainGradient)" strokeWidth={1.5} />
                    <Line yAxisId="left" type="monotone" dataKey="windSpeed" name="Wind (km/h)" stroke="#14b8a6" strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 5. Transparency & Model Methodology Panel */}
          <div className="glass-card p-4 sm:p-5 rounded-xl border border-sky-500/20 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Info className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <div>
                <h3 className="font-orbitron font-bold text-sm text-slate-200">
                  METHODOLOGY & TRANSPARENCY DISCLOSURE
                </h3>
                <p className="text-xs text-slate-400">
                  SkyGuard AI ensures clear, honest reporting of how forecasts are computed without false AI claims.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Method & Sources */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                <div className="font-bold text-sky-300 font-mono flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  Methodology & Data Sources
                </div>
                <p className="text-slate-300">
                  {predictionData.transparency.methodology}
                </p>
                <ul className="space-y-1 text-slate-400 pt-1">
                  {predictionData.transparency.dataSources.map((src: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{src}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Machine Learning Status */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Is Machine Learning Used?
                </div>
                <p className="text-slate-300">
                  {predictionData.transparency.mlUsageNote}
                </p>
                <div className="p-2 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-slate-200">Limitations:</strong> {predictionData.transparency.limitations.join(' ')}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionPage;
