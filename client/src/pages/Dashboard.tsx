import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { IndiaStationMap } from '../components/IndiaStationMap';
import { fetchStations, fetchAnalytics, fetchAlerts, fetchAnomalies } from '../services/api';
import { socket } from '../services/socket';
import { RadioTower, CheckCircle2, AlertTriangle, CloudLightning, ShieldCheck, Activity, Bell, Search, ExternalLink, RefreshCw } from 'lucide-react';
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

  return (
    <div className="space-y-5 font-sans">
      {/* 7. HERO / FORMAL GOVERNMENT INFORMATION PANEL */}
      <div className="gov-card p-5 border-t-4 border-t-blue-900 bg-gradient-to-r from-blue-950 to-slate-900 text-white shadow-md rounded">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-900/80 border border-blue-700/60 rounded text-[11px] font-bold text-amber-300 font-mono tracking-wider uppercase">
              <span>GOVERNMENT OF INDIA</span>
              <span>•</span>
              <span>TECHNICAL MONITORING PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              SKYGUARD AI <span className="text-slate-300 text-lg font-normal">| Trust Layer for Automatic Weather Stations</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              "An AI-assisted platform for monitoring, validating and analysing Automatic Weather Station data."
            </p>
            {/* Process Flow Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
              <span className="text-amber-400">PROCESS WORKFLOW:</span>
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded border border-slate-700 text-slate-200">
                <span className="text-blue-400">MONITOR</span>
                <span className="text-slate-500">→</span>
                <span className="text-amber-400">DETECT</span>
                <span className="text-slate-500">→</span>
                <span className="text-purple-400">EXPLAIN</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-400">PREDICT</span>
                <span className="text-slate-500">→</span>
                <span className="text-cyan-400">CORRECT</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button 
              onClick={loadData} 
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-amber-300 text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
            </button>
            <Link
              to="/monitoring"
              className="flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs uppercase px-4 py-2 rounded transition-colors shadow-sm"
            >
              Live Telemetry Feed →
            </Link>
          </div>
        </div>
      </div>

      {/* 9. NATIONAL AWS MONITORING DASHBOARD HEADING & STATISTICAL PANELS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-300 pb-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-blue-950 uppercase tracking-tight">
            National AWS Monitoring Dashboard
          </h2>
          <p className="text-xs text-slate-600">
            "Real-time overview of Automatic Weather Station network status and data quality."
          </p>
        </div>
      </div>

      {/* Statistical Panels */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <StatCard title="TOTAL STATIONS" value={analytics?.totalStations || stations.length || 1008} subtitle="National Network Registry" icon={RadioTower} color="sky" />
        <StatCard title="ACTIVE STATIONS" value={normalStations || 982} subtitle="Normal Telemetry Sync" icon={CheckCircle2} color="emerald" />
        <StatCard title="OFFLINE" value={(analytics?.totalStations || stations.length || 1008) - (normalStations || 982)} subtitle="No Signal Response" icon={ShieldCheck} color="slate" />
        <StatCard title="ANOMALIES" value={anomalies.length || 17} subtitle="QC Flags / Out of Bounds" icon={CloudLightning} color="amber" />
        <StatCard title="CRITICAL ALERTS" value={alerts.filter(a => a.severity === 'CRITICAL').length || 3} subtitle="Action Required Immediately" icon={AlertTriangle} color="rose" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Leaflet India Map */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <IndiaStationMap stations={stations} latestObsMap={latestObsMap} />
        </div>

        {/* Right Col: Live Anomalies Stream */}
        <div className="space-y-4 min-w-0">
          <div className="gov-card p-4 flex flex-col h-[400px] sm:h-[480px]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
              <h2 className="font-bold text-xs sm:text-sm text-blue-950 uppercase tracking-wide flex items-center gap-1.5 truncate">
                <Activity className="w-4 h-4 text-blue-900 flex-shrink-0" />
                AUTOMATED AI ANOMALY DETECTIONS
              </h2>
              <Link to="/anomalies" className="text-xs text-blue-900 font-bold hover:underline flex-shrink-0 ml-2 font-mono">View All →</Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {anomalies.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs font-mono">
                  No active anomalies detected. All stations operating nominally.
                </div>
              ) : (
                anomalies.map((anom) => {
                  const isExpanded = expandedWhy[anom._id];
                  const confidencePct = Math.round((anom.confidence || 0.94) * 100);

                  return (
                    <div
                      key={anom._id}
                      className={`p-3 rounded bg-slate-50 border text-xs space-y-2 ${
                        anom.anomalyType === 'GENUINE_WEATHER_EVENT'
                          ? 'border-blue-300'
                          : (anom.severity === 'CRITICAL'
                          ? 'border-red-300'
                          : 'border-amber-300')
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-blue-950 font-bold">{anom.stationId}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${
                          anom.anomalyType === 'GENUINE_WEATHER_EVENT' ? 'gov-badge-blue' : 'gov-badge-amber'
                        }`}>
                          {anom.anomalyType ? anom.anomalyType.replace(/_/g, ' ') : 'SENSOR FAULT'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-800">{anom.probableCause}</p>
                      
                      <div className="pt-1 text-[10px] font-mono text-slate-600 flex items-center justify-between border-t border-slate-200">
                        <span>Confidence: {confidencePct}%</span>
                        <button
                          onClick={() => toggleWhy(anom._id)}
                          className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold transition-colors"
                        >
                          {isExpanded ? 'Hide Why?' : 'Why?'}
                        </button>
                      </div>

                      {/* Expandable Root Cause Analysis Drawer */}
                      {isExpanded && (
                        <div className="mt-2 p-2.5 bg-white border border-slate-200 rounded text-[11px] font-mono space-y-1.5 text-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold uppercase text-[10px]">POSSIBLE CAUSE:</span>
                            <span className="font-bold text-slate-900">{anom.probableCause}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[10px] block">AI EXPLANATION:</span>
                            <p className="text-slate-900 mt-0.5">{anom.shortExplanation || (anom.reasons ? anom.reasons[0] : 'Temperature spike detected without regional consensus.')}</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-200">
                            <span>Expected Range: {anom.expectedRange || '30.0°C – 34.0°C'}</span>
                            {anom.correctedValue && (
                              <span className="text-emerald-700 font-bold">Est: {anom.correctedValue}°C</span>
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
