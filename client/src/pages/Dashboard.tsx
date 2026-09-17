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
    <div className="space-y-5 sm:space-y-6">
      {/* COMMAND CENTER DASHBOARD TOP HEADER */}
      <div className="liquid-glass-strong p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] font-medium text-white/50 uppercase font-mono">
            <span>SKYGUARD AI</span>
            <span>•</span>
            <span>INTELLIGENCE COMMAND</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white font-poppins">
            Automatic Weather Station <span className="font-serif-italic font-normal text-white/80">Trust Layer</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-light">
            Real-time telemetry validation, spatial consensus scoring, and automated AI anomaly detection network.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="liquid-glass px-4 py-2 rounded-full text-xs font-mono text-white/90 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NETWORK: ONLINE</span>
          </div>
          <Link
            to="/monitoring"
            className="liquid-glass rounded-full px-4 py-2 text-xs font-medium tracking-wider uppercase text-white hover:bg-white/10 transition cursor-pointer"
          >
            Live Stream →
          </Link>
        </div>
      </div>

      {/* Top 8 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left 2 Cols: Leaflet India Map */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="liquid-glass p-4 sm:p-5 rounded-3xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3">
              <h2 className="font-poppins font-medium text-sm text-white flex items-center gap-2">
                <RadioTower className="w-4 h-4 text-white/80 flex-shrink-0" />
                AUTOMATIC WEATHER STATIONS — REAL-TIME MAP
              </h2>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded-full liquid-glass text-emerald-300 border border-emerald-500/30">● Normal</span>
                <span className="px-2 py-0.5 rounded-full liquid-glass text-amber-300 border border-amber-500/30">● Warning</span>
                <span className="px-2 py-0.5 rounded-full liquid-glass text-rose-300 border border-rose-500/30">● Fault</span>
                <span className="px-2 py-0.5 rounded-full liquid-glass text-sky-300 border border-sky-500/30">● Weather Event</span>
              </div>
            </div>
            <IndiaStationMap stations={stations} latestObsMap={latestObsMap} />
          </div>
        </div>

        {/* Right Col: Live Anomalies Stream */}
        <div className="space-y-4 min-w-0">
          <div className="liquid-glass p-4 sm:p-5 rounded-3xl flex flex-col h-[400px] sm:h-[460px] lg:h-[510px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <h2 className="font-poppins font-medium text-xs sm:text-sm text-white flex items-center gap-2 truncate">
                <Activity className="w-4 h-4 text-white/80 flex-shrink-0" />
                AUTOMATIC AI ANOMALY DETECTIONS
              </h2>
              <Link to="/anomalies" className="text-xs text-white/70 hover:text-white hover:underline flex-shrink-0 ml-2 font-mono">View All →</Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {anomalies.length === 0 ? (
                <div className="text-center py-16 text-white/40 text-xs font-mono">
                  No anomalies detected. All stations operating nominally.
                </div>
              ) : (
                anomalies.map((anom) => {
                  const isExpanded = expandedWhy[anom._id];
                  const confidencePct = Math.round((anom.confidence || 0.94) * 100);

                  return (
                    <div
                      key={anom._id}
                      className={`p-3.5 rounded-2xl liquid-glass text-xs transition-all space-y-2 ${
                        anom.anomalyType === 'GENUINE_WEATHER_EVENT'
                          ? 'border-sky-500/30 text-sky-200'
                          : (anom.severity === 'CRITICAL'
                          ? 'border-rose-500/30 text-rose-200'
                          : 'border-amber-500/30 text-amber-200')
                      }`}
                    >
                      <div className="flex items-center justify-between font-poppins font-medium">
                        <span className="text-white font-semibold">{anom.stationId}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full liquid-glass uppercase font-mono text-white/80">
                          {anom.anomalyType ? anom.anomalyType.replace(/_/g, ' ') : 'POSSIBLE SENSOR FAULT'}
                        </span>
                      </div>
                      <p className="text-[11px] font-light text-white/80">{anom.probableCause}</p>
                      
                      <div className="pt-1 text-[10px] font-mono text-white/50 flex items-center justify-between">
                        <span>Confidence: {confidencePct}%</span>
                        <button
                          onClick={() => toggleWhy(anom._id)}
                          className="px-2.5 py-1 liquid-glass rounded-full text-white text-[10px] font-medium font-sans flex items-center gap-1 hover:bg-white/10 transition cursor-pointer"
                        >
                          {isExpanded ? 'Hide Why?' : 'Why?'}
                        </button>
                      </div>

                      {/* Expandable Root Cause Analysis Drawer */}
                      {isExpanded && (
                        <div className="mt-2 pt-2.5 border-t border-white/10 space-y-2 text-[11px] font-mono liquid-glass p-3 rounded-xl text-white/90">
                          <div className="flex items-center justify-between">
                            <span className="text-white/50 font-medium uppercase text-[10px]">POSSIBLE CAUSE:</span>
                            <span className="font-semibold text-white">{anom.probableCause}</span>
                          </div>
                          <div>
                            <span className="text-white/50 font-medium uppercase text-[10px] block">SHORT AI EXPLANATION:</span>
                            <p className="text-white/90 font-light mt-0.5">{anom.shortExplanation || (anom.reasons ? anom.reasons[0] : 'Temperature spike detected without regional consensus.')}</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-white/60 pt-1 border-t border-white/5">
                            <span>Expected Range: {anom.expectedRange || '30.0°C – 34.0°C'}</span>
                            {anom.correctedValue && (
                              <span className="text-emerald-300 font-semibold">Est: {anom.correctedValue}°C</span>
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
