import React, { useState, useEffect, useRef } from 'react';
import { fetchStations, fetchStationHistory } from '../services/api';
import { Station, HistoricalAnalysisResult, HistoricalPoint } from '../types';
import { Calendar, Thermometer, Droplets, Gauge, Wind, CloudRain, TrendingUp, TrendingDown, Minus, RadioTower, Sparkles, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const STATION_DICTIONARY: Record<string, string> = {
  'AWS-101': 'New Delhi IMD Headquarters',
  'AWS-102': 'Gurugram Cyber City AWS',
  'AWS-103': 'Noida Sector 62 AWS',
  'AWS-104': 'Faridabad Industrial AWS',
  'AWS-201': 'Mumbai Colaba Observatory',
  'AWS-202': 'Pune Shivajinagar AWS',
  'AWS-301': 'Bengaluru IMD Center',
  'AWS-401': 'Chennai Nungambakkam AWS',
  'AWS-501': 'Kolkata Alipore AWS',
  'AWS-601': 'Hyderabad Begumpet AWS',
  'AWS-701': 'Nagpur Central Meteorology Station'
};

const PARAMETERS = [
  { id: 'temperature', label: 'TEMPERATURE', unit: '°C', icon: Thermometer, color: '#38bdf8' },
  { id: 'humidity', label: 'HUMIDITY', unit: '%', icon: Droplets, color: '#22d3ee' },
  { id: 'pressure', label: 'PRESSURE', unit: 'hPa', icon: Gauge, color: '#818cf8' },
  { id: 'windSpeed', label: 'WIND SPEED', unit: 'm/s', icon: Wind, color: '#f59e0b' },
  { id: 'rainfall', label: 'RAINFALL', unit: 'mm', icon: CloudRain, color: '#10b981' }
];

const RANGES = [
  { id: '1h', label: 'Last Hour' },
  { id: '6h', label: 'Last 6 Hours' },
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' }
];

export const HistoricalAnalysisPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('AWS-701');
  const [selectedParam, setSelectedParam] = useState<string>('temperature');
  const [selectedRange, setSelectedRange] = useState<string>('24h');
  
  const [historyData, setHistoryData] = useState<HistoricalAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side cache to prevent repeated API requests
  const cacheRef = useRef<Map<string, HistoricalAnalysisResult>>(new Map());

  // 1. Fetch stations on mount
  useEffect(() => {
    fetchStations().then(sts => {
      if (sts && sts.length > 0) {
        setStations(sts);
      }
    }).catch(console.warn);
  }, []);

  // 2. Fetch history with caching
  const loadHistory = async (stId: string, param: string, rng: string, forceRefresh = false) => {
    const cacheKey = `${stId}_${param}_${rng}`;
    if (!forceRefresh && cacheRef.current.has(cacheKey)) {
      setHistoryData(cacheRef.current.get(cacheKey)!);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchStationHistory(stId, rng, param);
      if (data) {
        cacheRef.current.set(cacheKey, data);
        setHistoryData(data);
      }
    } catch (e: any) {
      console.warn('Historical data fetch note:', e);
      setError('Unable to load historical telemetry data. Falling back to cached observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(selectedStationId, selectedParam, selectedRange);
  }, [selectedStationId, selectedParam, selectedRange]);

  const activeParamObj = PARAMETERS.find(p => p.id === selectedParam) || PARAMETERS[0];
  const stationName = STATION_DICTIONARY[selectedStationId] || selectedStationId;
  const stats = historyData?.statistics;

  // Custom Chart Dot Renderer to highlight anomalies as glowing red markers
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload && payload.isAnomaly) {
      return (
        <g key={`dot-${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={7} fill="#ef4444" opacity={0.4} className="animate-ping" />
          <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={1.5} />
        </g>
      );
    }
    return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={2} fill={activeParamObj.color} opacity={0.6} />;
  };

  // Custom Tooltip with Anomaly Breakdown
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt: HistoricalPoint = payload[0].payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md p-3 rounded-xl border border-sky-500/40 shadow-2xl font-mono text-xs space-y-1.5 max-w-xs">
          <div className="text-slate-400 text-[10px] font-bold border-b border-slate-800 pb-1">
            {pt.timeLabel || pt.timestamp}
          </div>
          <div className="flex items-center justify-between gap-4 font-bold">
            <span className="text-slate-300">{activeParamObj.label}:</span>
            <span className="text-sky-300 text-sm">{pt.value !== null ? `${pt.value} ${activeParamObj.unit}` : 'N/A'}</span>
          </div>

          {pt.isAnomaly && (
            <div className="pt-1.5 border-t border-rose-500/30 text-rose-300 space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                ANOMALY DETECTED ({pt.severity || 'FAULT'})
              </div>
              <p className="text-[10px] text-slate-300 bg-rose-950/40 p-1.5 rounded border border-rose-500/20">
                {pt.shortExplanation || `Spontaneous reading anomaly recorded.`}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400 flex-shrink-0" />
            HISTORICAL WEATHER DATA ANALYSIS & TREND MATRIX
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Multi-horizon time-series analysis integrated with statistical metrics & anomaly markers</p>
        </div>

        <button
          onClick={() => loadHistory(selectedStationId, selectedParam, selectedRange, true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 rounded-lg text-xs font-mono transition-all min-h-[40px] touch-manipulation active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>RE-ANALYZE</span>
        </button>
      </div>

      {/* CONTROL BAR: Station Selector, Parameter Tabs, Time Range Buttons */}
      <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 space-y-3 font-mono text-xs">
        
        {/* Row 1: Station Selector & Time Range Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Station Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 w-full lg:w-auto">
            <RadioTower className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-transparent text-slate-100 text-xs font-mono focus:outline-none w-full lg:w-72 cursor-pointer font-bold"
            >
              {Object.entries(STATION_DICTIONARY).map(([stId, stName]) => (
                <option key={stId} value={stId} className="bg-slate-900 text-slate-100">
                  {stId} — {stName}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-400" /> TIME RANGE:
            </span>
            {RANGES.map(rng => (
              <button
                key={rng.id}
                onClick={() => setSelectedRange(rng.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all touch-manipulation min-h-[36px] flex-1 lg:flex-none text-center ${
                  selectedRange === rng.id
                    ? 'bg-sky-500 text-slate-900 border-sky-400 shadow-md font-extrabold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Parameter Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {PARAMETERS.map(param => {
            const Icon = param.icon;
            const isSelected = selectedParam === param.id;
            return (
              <button
                key={param.id}
                onClick={() => setSelectedParam(param.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all min-h-[40px] touch-manipulation active:scale-[0.98] ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-md'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: isSelected ? param.color : '#94a3b8' }} />
                <span>{param.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STATISTICAL METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 font-mono">
        {/* Minimum */}
        <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">MINIMUM {activeParamObj.label}</span>
          <div className="font-orbitron font-bold text-xl sm:text-2xl text-cyan-400">
            {stats?.minimum !== null && stats?.minimum !== undefined ? `${stats.minimum} ${activeParamObj.unit}` : '--'}
          </div>
          <span className="text-[10px] text-slate-500 block">Lowest reading in range</span>
        </div>

        {/* Maximum */}
        <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">MAXIMUM {activeParamObj.label}</span>
          <div className="font-orbitron font-bold text-xl sm:text-2xl text-rose-400">
            {stats?.maximum !== null && stats?.maximum !== undefined ? `${stats.maximum} ${activeParamObj.unit}` : '--'}
          </div>
          <span className="text-[10px] text-slate-500 block">Highest reading in range</span>
        </div>

        {/* Average */}
        <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">AVERAGE {activeParamObj.label}</span>
          <div className="font-orbitron font-bold text-xl sm:text-2xl text-emerald-400">
            {stats?.average !== null && stats?.average !== undefined ? `${stats.average} ${activeParamObj.unit}` : '--'}
          </div>
          <span className="text-[10px] text-slate-500 block">Mean baseline calculation</span>
        </div>

        {/* Trend */}
        <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">STATISTICAL TREND</span>
          <div className="font-orbitron font-bold text-lg sm:text-xl flex items-center gap-1.5">
            {stats?.trend === 'INCREASING' ? (
              <span className="text-amber-400 flex items-center gap-1"><TrendingUp className="w-5 h-5 text-amber-400" /> Increasing ↗</span>
            ) : (stats?.trend === 'DECREASING' ? (
              <span className="text-sky-400 flex items-center gap-1"><TrendingDown className="w-5 h-5 text-sky-400" /> Decreasing ↘</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1"><Minus className="w-5 h-5 text-emerald-400" /> Stable ➔</span>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 block">Directional trajectory evaluation</span>
        </div>
      </div>

      {/* MAIN HISTORICAL ANALYSIS CHART CARD WITH ANOMALY MARKERS */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-sky-500/30 bg-[#0a1426]/90 space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <h2 className="font-orbitron font-bold text-xs sm:text-sm text-slate-100 uppercase tracking-wider">
              {activeParamObj.label} TIME-SERIES CURVE — {selectedStationId} ({stationName})
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 font-bold text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Normal Telemetry
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping"></span> 🔴 Anomaly Marker
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg text-amber-200 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* Recharts AreaChart */}
        <div className="h-64 sm:h-80 w-full">
          {(!historyData || !historyData.points || historyData.points.length === 0) ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No historical observations recorded for selected station and time range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData.points}>
                <defs>
                  <linearGradient id="paramGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeParamObj.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={activeParamObj.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={activeParamObj.label}
                  stroke={activeParamObj.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#paramGradient)"
                  dot={renderCustomDot}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Data Source Footer Disclaimer */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
          <span>Data Source: <strong className="text-sky-300">{historyData?.dataSource || 'SkyGuard AWS Telemetry Stream'}</strong></span>
          <span>Anomalies Flagged in Range: <strong className="text-rose-400">{stats?.anomaliesDetected || 0} event(s)</strong></span>
        </div>
      </div>
    </div>
  );
};
