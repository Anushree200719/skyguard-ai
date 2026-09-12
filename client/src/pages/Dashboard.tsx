import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { IndiaStationMap } from '../components/IndiaStationMap';
import { fetchStations, fetchAnalytics, fetchAlerts, fetchAnomalies } from '../services/api';
import { socket } from '../services/socket';
import { RadioTower, CheckCircle2, AlertTriangle, CloudLightning, ShieldCheck, Activity, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [latestObsMap, setLatestObsMap] = useState<Record<string, any>>({});
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});

  const toggleWhy = (id: string) => {
    setExpandedWhy(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadData = async () => {
    try {
      const [stsResult, statsResult, altsResult, anomsResult] = await Promise.allSettled([
        fetchStations(),
        fetchAnalytics(),
        fetchAlerts(),
        fetchAnomalies({ limit: 10 })
      ]);
      if (stsResult.status === 'fulfilled' && stsResult.value) setStations(stsResult.value);
      if (statsResult.status === 'fulfilled' && statsResult.value) setAnalytics(statsResult.value.summary);
      if (altsResult.status === 'fulfilled' && altsResult.value) setAlerts(altsResult.value);
      if (anomsResult.status === 'fulfilled' && anomsResult.value) setAnomalies(anomsResult.value);
    } catch (err) {
      console.warn('Dashboard fetch note:', err);
    }
  };

  useEffect(() => {
    loadData();

    const onWeatherUpdate = (data: any) => {
      if (data?.observations) {
        const newMap: Record<string, any> = {};
        data.observations.forEach((obs: any) => {
          newMap[obs.stationId] = obs;
        });
        setLatestObsMap(prev => ({ ...prev, ...newMap }));
      }
    };

    socket.on('weather_update', onWeatherUpdate);
    socket.on('anomaly_detected', loadData);
    socket.on('alert_created', loadData);

    return () => {
      socket.off('weather_update', onWeatherUpdate);
      socket.off('anomaly_detected', loadData);
      socket.off('alert_created', loadData);
    };
  }, []);

  const normalStations = stations.filter(s => s.status === 'NORMAL').length;
  const activeStations = stations.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top 8 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard title="Total AWS Stations" value={analytics?.totalStations || stations.length || 10} subtitle="India Command Network" icon={RadioTower} color="sky" />
        <StatCard title="Network Trust Score" value={`${stations.length > 0 ? Math.round(stations.reduce((acc, s) => acc + (s.trustScore ?? s.healthScore ?? 95), 0) / stations.length) : 96}%`} subtitle="Dynamic AI Trust Index" icon={ShieldCheck} color="emerald" />
        <StatCard title="Normal Stations" value={normalStations} subtitle="Nominal Performance" icon={CheckCircle2} color="emerald" />
        <StatCard title="Under Analysis" value={stations.filter(s => s.status !== 'NORMAL').length} subtitle="AI Trust Processing" icon={Activity} color="amber" />
        <StatCard title="Detected Anomalies" value={analytics?.totalAnomalies || anomalies.length} subtitle="Auto-Flagged" icon={Search} color="amber" />
        <StatCard title="Sensor Faults" value={analytics?.sensorFaults || 0} subtitle="Hardware Issues" icon={AlertTriangle} color="rose" />
        <StatCard title="Genuine Weather Events" value={analytics?.genuineWeatherEvents || 0} subtitle="Spatial Confirmed" icon={CloudLightning} color="indigo" />
        <StatCard title="Critical Alerts" value={alerts.filter(a => a.level === 'CRITICAL').length} subtitle="Immediate Action" icon={Bell} color="rose" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Leaflet India Map */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="glass-card p-3 sm:p-4 rounded-xl border border-sky-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h2 className="font-orbitron font-bold text-xs text-slate-100 flex items-center gap-2">
                <RadioTower className="w-4 h-4 text-sky-400 flex-shrink-0" />
                AUTOMATIC WEATHER STATIONS — REAL-TIME MAP
              </h2>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● Normal</span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">● Warning</span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">● Fault</span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">● Weather Event</span>
              </div>
            </div>
            <IndiaStationMap stations={stations} latestObsMap={latestObsMap} />
          </div>
        </div>

        {/* Right Col: Live Anomalies Stream */}
        <div className="space-y-4 min-w-0">
          <div className="glass-card p-3 sm:p-4 rounded-xl border border-sky-500/20 flex flex-col h-[360px] sm:h-[420px] lg:h-[470px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
              <h2 className="font-orbitron font-bold text-xs text-slate-100 flex items-center gap-2 truncate">
                <Activity className="w-4 h-4 text-sky-400 flex-shrink-0" />
                AUTOMATIC AI ANOMALY DETECTIONS
              </h2>
              <Link to="/anomalies" className="text-xs text-sky-400 hover:underline flex-shrink-0 ml-2">View All &rarr;</Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {anomalies.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-mono">
                  No anomalies detected. All stations operating nominally.
                </div>
              ) : (
                anomalies.map((anom) => {
                  const isExpanded = expandedWhy[anom._id];
                  const confidencePct = Math.round((anom.confidence || 0.94) * 100);

                  return (
                    <div
                      key={anom._id}
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        anom.anomalyType === 'GENUINE_WEATHER_EVENT'
                          ? 'bg-sky-500/10 border-sky-500/40 text-sky-200'
                          : (anom.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                          : 'bg-amber-500/10 border-amber-500/40 text-amber-200')
                      }`}
                    >
                      <div className="flex items-center justify-between font-orbitron font-bold mb-1">
                        <span>{anom.stationId}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/80 uppercase font-mono">
                          {anom.anomalyType ? anom.anomalyType.replace(/_/g, ' ') : 'POSSIBLE SENSOR FAULT'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-300">{anom.probableCause}</p>
                      
                      <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Confidence: {confidencePct}%</span>
                        <button
                          onClick={() => toggleWhy(anom._id)}
                          className="px-2 py-0.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded text-[10px] font-bold font-sans flex items-center gap-1"
                        >
                          {isExpanded ? 'Hide Why?' : 'Why?'}
                        </button>
                      </div>

                      {/* Expandable Root Cause Analysis Drawer */}
                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-1.5 text-[11px] font-mono bg-slate-950/60 p-2 rounded">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold uppercase text-[10px]">POSSIBLE CAUSE:</span>
                            <span className="font-bold text-sky-300">{anom.probableCause}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[10px] block">SHORT AI EXPLANATION:</span>
                            <p className="text-slate-200 mt-0.5">{anom.shortExplanation || (anom.reasons ? anom.reasons[0] : 'Temperature spike detected without regional consensus.')}</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>AI Expected Behavior: {anom.expectedRange || '30.0°C – 34.0°C'}</span>
                            {anom.correctedValue && (
                              <span className="text-emerald-400 font-bold">Est: {anom.correctedValue}°C</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
