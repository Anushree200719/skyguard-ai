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
  { id: 'temperature', label: 'TEMPERATURE', unit: '°C', icon: Thermometer, color: '#1d4ed8' },
  { id: 'humidity', label: 'HUMIDITY', unit: '%', icon: Droplets, color: '#0891b2' },
  { id: 'pressure', label: 'PRESSURE', unit: 'hPa', icon: Gauge, color: '#4f46e5' },
  { id: 'windSpeed', label: 'WIND SPEED', unit: 'm/s', icon: Wind, color: '#b45309' },
  { id: 'rainfall', label: 'RAINFALL', unit: 'mm', icon: CloudRain, color: '#15803d' }
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

  const cacheRef = useRef<Map<string, HistoricalAnalysisResult>>(new Map());

  useEffect(() => {
    fetchStations().then(sts => {
      if (sts && sts.length > 0) setStations(sts);
    }).catch(console.warn);
  }, []);

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
      setError('Unable to load historical telemetry data.');
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

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload && payload.isAnomaly) {
      return (
        <g key={`dot-${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={6} fill="#b91c1c" />
        </g>
      );
    }
    return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={2} fill={activeParamObj.color} opacity={0.6} />;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt: HistoricalPoint = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded border border-slate-300 shadow-lg font-mono text-xs space-y-1 text-slate-900">
          <div className="text-slate-500 text-[10px] font-bold border-b border-slate-200 pb-1">
            {pt.timeLabel || pt.timestamp}
          </div>
          <div className="flex items-center justify-between gap-4 font-bold">
            <span className="text-slate-700">{activeParamObj.label}:</span>
            <span className="text-blue-900">{pt.value !== null ? `${pt.value} ${activeParamObj.unit}` : 'N/A'}</span>
          </div>

          {pt.isAnomaly && (
            <div className="pt-1 border-t border-red-200 text-red-900 space-y-0.5">
              <div className="font-bold text-[10px] uppercase">ANOMALY DETECTED</div>
              <p className="text-[10px] bg-red-50 p-1 rounded border border-red-200">
                {pt.shortExplanation || `Reading anomaly recorded.`}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>HISTORICAL DATA ARCHIVE</span>
            <span>•</span>
            <span>TIME-SERIES TRENDS</span>
          </div>
          <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <Calendar className="w-5 h-5 text-blue-900 flex-shrink-0" />
            HISTORICAL WEATHER TELEMETRY & QC TREND ANALYSIS
          </h1>
          <p className="text-xs text-slate-600">Multi-horizon time-series evaluation with statistical envelope analysis</p>
        </div>

        <button
          onClick={() => loadHistory(selectedStationId, selectedParam, selectedRange, true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-slate-700 text-xs font-bold hover:bg-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>RE-ANALYZE</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="gov-card p-4 space-y-3 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded px-3 py-1.5">
            <RadioTower className="w-4 h-4 text-blue-900" />
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-mono font-bold focus:outline-none"
            >
              {Object.entries(STATION_DICTIONARY).map(([stId, stName]) => (
                <option key={stId} value={stId}>{stId} — {stName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="text-slate-600 text-xs font-bold mr-1">RANGE:</span>
            {RANGES.map(rng => (
              <button
                key={rng.id}
                onClick={() => setSelectedRange(rng.id)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
                  selectedRange === rng.id
                    ? 'bg-blue-900 text-white border-blue-950 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PARAMETERS.map(param => {
            const isSelected = selectedParam === param.id;
            return (
              <button
                key={param.id}
                onClick={() => setSelectedParam(param.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold border ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-950'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {param.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="gov-card p-3">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">MINIMUM</span>
          <div className="font-bold text-xl text-blue-950 mt-0.5">
            {stats?.minimum !== null && stats?.minimum !== undefined ? `${stats.minimum} ${activeParamObj.unit}` : '--'}
          </div>
        </div>

        <div className="gov-card p-3">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">MAXIMUM</span>
          <div className="font-bold text-xl text-blue-950 mt-0.5">
            {stats?.maximum !== null && stats?.maximum !== undefined ? `${stats.maximum} ${activeParamObj.unit}` : '--'}
          </div>
        </div>

        <div className="gov-card p-3">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">AVERAGE</span>
          <div className="font-bold text-xl text-blue-950 mt-0.5">
            {stats?.average !== null && stats?.average !== undefined ? `${stats.average} ${activeParamObj.unit}` : '--'}
          </div>
        </div>

        <div className="gov-card p-3">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">TREND</span>
          <div className="font-bold text-lg text-blue-950 mt-0.5">
            {stats?.trend || 'STABLE'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="gov-card p-4">
        <h2 className="font-bold text-xs text-blue-950 uppercase mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-900" />
          {activeParamObj.label} TIME-SERIES CURVE — {selectedStationId} ({stationName})
        </h2>

        <div className="h-64 w-full">
          {(!historyData || !historyData.points || historyData.points.length === 0) ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
              No observations found for selected parameters.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData.points}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={activeParamObj.label}
                  stroke={activeParamObj.color}
                  strokeWidth={2}
                  fill="#dbeafe"
                  dot={renderCustomDot}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
