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
    <div className="space-y-5">
      {/* GOVT COMMAND CENTER DASHBOARD TOP HEADER */}
      <div className="gov-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-4 border-t-blue-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>GOVERNMENT OF INDIA</span>
            <span>•</span>
            <span>NATIONAL METEOROLOGICAL MONITORING PORTAL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-blue-950 font-sans">
            National Automatic Weather Station (AWS) Data Quality Monitoring System
          </h1>
          <p className="text-xs text-slate-600">
            Real-time automated telemetry validation, spatial consensus scoring, and AI anomaly detection network.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            onClick={loadData} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Network
          </button>
          <Link
            to="/monitoring"
            className="bg-blue-900 text-white font-bold text-xs uppercase px-4 py-1.5 rounded hover:bg-blue-950 transition-colors"
          >
            Live Telemetry Feed →
          </Link>
        </div>
      </div>

      {/* Top 8 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total AWS Stations" value={analytics?.totalStations || stations.length || 10} subtitle="National Network Registry" icon={RadioTower} color="sky" />
        <StatCard title="Network Trust Index" value={`${stations.length > 0 ? Math.round(stations.reduce((acc, s) => acc + (s.trustScore ?? s.healthScore ?? 95), 0) / stations.length) : 96}%`} subtitle="WMO Verified Consensus" icon={ShieldCheck} color="emerald" />
        <StatCard title="Normal Operational" value={normalStations} subtitle="Nominal Telemetry" icon={CheckCircle2} color="emerald" />
        <StatCard title="Under Analysis" value={stations.filter(s => s.status !== 'NORMAL').length} subtitle="QC Audit Processing" icon={Activity} color="amber" />
        <StatCard title="Detected Anomalies" value={analytics?.totalAnomalies || anomalies.length} subtitle="Automated Flagging" icon={Search} color="amber" />
        <StatCard title="Sensor Faults" value={analytics?.sensorFaults || 0} subtitle="Hardware Calibration Issue" icon={AlertTriangle} color="rose" />
        <StatCard title="Genuine Weather Events" value={analytics?.genuineWeatherEvents || 0} subtitle="Spatial Consensus Verified" icon={CloudLightning} color="indigo" />
        <StatCard title="Critical Alerts" value={alerts.filter(a => a.level === 'CRITICAL').length} subtitle="Immediate Dispatch" icon={Bell} color="rose" />
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
