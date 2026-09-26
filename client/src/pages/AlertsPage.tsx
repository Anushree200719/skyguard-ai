import React, { useState, useEffect } from 'react';
import { fetchAlerts, fetchAlertsSummary, acknowledgeAlert, fetchStations } from '../services/api';
import { Alert, AlertSummary, Station } from '../types';
import { Bell, CheckCircle2, ShieldAlert, AlertTriangle, Info, RadioTower, Filter, RefreshCw, Sparkles, Check, X } from 'lucide-react';

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

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertSummary>({ critical: 0, highRisk: 0, warning: 0, info: 0, totalActive: 0 });
  const [stations, setStations] = useState<Station[]>([]);
  
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [stationFilter, setStationFilter] = useState<string>('');
  const [ackFilter, setAckFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertsRes, summaryRes, stationsRes] = await Promise.allSettled([
        fetchAlerts({ station: stationFilter, level: severityFilter, limit: 100 }),
        fetchAlertsSummary(),
        fetchStations()
      ]);

      if (alertsRes.status === 'fulfilled' && alertsRes.value) setAlerts(alertsRes.value);
      if (summaryRes.status === 'fulfilled' && summaryRes.value) setSummary(summaryRes.value);
      if (stationsRes.status === 'fulfilled' && stationsRes.value) setStations(stationsRes.value);
    } catch (e) {
      console.warn('Alerts fetch note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [stationFilter, severityFilter]);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, acknowledged: true } : a));
      fetchAlertsSummary().then(setSummary).catch(console.warn);
    } catch (e) {
      console.warn('Acknowledge alert note:', e);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter && a.level !== severityFilter && a.category !== severityFilter) return false;
    if (stationFilter && a.stationId !== stationFilter) return false;
    if (ackFilter === 'active' && a.acknowledged) return false;
    if (ackFilter === 'acknowledged' && !a.acknowledged) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>NATIONAL WARNING SYSTEM</span>
            <span>•</span>
            <span>INCIDENT MANAGEMENT</span>
          </div>
          <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <Bell className="w-5 h-5 text-blue-900 flex-shrink-0" />
            NATIONAL AWS WARNING & INCIDENT CONTROL CENTER
          </h1>
          <p className="text-xs text-slate-600">Categorized alerts synthesized from ML anomalies, trust scores & hardware diagnostics</p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-slate-700 text-xs font-bold hover:bg-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH ALERTS</span>
        </button>
      </div>

      {/* SUMMARY COUNTERS */}
      <div className="gov-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-900" />
            <h2 className="font-bold text-xs text-blue-950 uppercase tracking-wider">
              ACTIVE WARNING OVERVIEW
            </h2>
          </div>
          <span className="gov-badge-blue text-[10px] font-bold px-2 py-0.5 rounded border font-mono">
            TOTAL ACTIVE: {summary.totalActive || 0}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-red-800 uppercase block">CRITICAL</span>
              <span className="font-mono font-bold text-2xl text-red-900">{summary.critical || 0}</span>
            </div>
            <span className="gov-badge-red text-xs font-bold px-2 py-0.5 rounded uppercase">Urgent</span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">HIGH RISK</span>
              <span className="font-mono font-bold text-2xl text-amber-900">{summary.highRisk || 0}</span>
            </div>
            <span className="gov-badge-amber text-xs font-bold px-2 py-0.5 rounded uppercase">High</span>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-yellow-800 uppercase block">WARNING</span>
              <span className="font-mono font-bold text-2xl text-yellow-900">{summary.warning || 0}</span>
            </div>
            <span className="gov-badge-amber text-xs font-bold px-2 py-0.5 rounded uppercase">Notice</span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">INFO</span>
              <span className="font-mono font-bold text-2xl text-emerald-900">{summary.info || 0}</span>
            </div>
            <span className="gov-badge-green text-xs font-bold px-2 py-0.5 rounded uppercase">Info</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="gov-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-700 font-bold uppercase font-mono flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-900" /> SEVERITY:
          </span>
          {[
            { id: '', label: 'ALL SEVERITIES' },
            { id: 'CRITICAL', label: 'CRITICAL' },
            { id: 'HIGH RISK', label: 'HIGH RISK' },
            { id: 'WARNING', label: 'WARNING' },
            { id: 'INFO', label: 'INFO' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSeverityFilter(item.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                severityFilter === item.id
                  ? 'bg-blue-900 text-white border-blue-950 font-bold'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-900"
          >
            <option value="">ALL WEATHER STATIONS</option>
            {Object.entries(STATION_DICTIONARY).map(([stId, stName]) => (
              <option key={stId} value={stId}>{stId} — {stName}</option>
            ))}
          </select>

          <select
            value={ackFilter}
            onChange={(e) => setAckFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-900"
          >
            <option value="all">ALL ALERTS</option>
            <option value="active">ACTIVE ONLY</option>
            <option value="acknowledged">ACKNOWLEDGED ONLY</option>
          </select>
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="gov-card p-10 text-center text-slate-500 text-xs font-mono space-y-1">
            <div className="font-bold text-slate-800 text-sm">No Active Alerts matching criteria</div>
            <p>All telemetry channels operating within nominal parameters.</p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isCritical = alt.level === 'CRITICAL' || alt.category === 'CRITICAL';
            const isHigh = alt.level === 'HIGH RISK' || alt.level === 'HIGH' || alt.category === 'HIGH';
            const isWarning = alt.level === 'WARNING' || alt.category === 'WARNING';
            
            const stationDisplayName = alt.stationName || STATION_DICTIONARY[alt.stationId] || alt.stationId;
            let timeStr = '--:--';
            try {
              timeStr = new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
              timeStr = '--:--';
            }

            return (
              <div
                key={alt._id}
                className={`gov-card p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 font-mono ${
                  isCritical ? 'border-l-4 border-l-red-600 bg-red-50/30' :
                  (isHigh ? 'border-l-4 border-l-amber-600 bg-amber-50/30' :
                  (isWarning ? 'border-l-4 border-l-yellow-600 bg-yellow-50/30' : 'border-l-4 border-l-blue-600 bg-blue-50/30'))
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      isCritical ? 'gov-badge-red' : (isHigh ? 'gov-badge-amber' : (isWarning ? 'gov-badge-amber' : 'gov-badge-green'))
                    }`}>
                      {isCritical ? 'CRITICAL' : (isHigh ? 'HIGH RISK' : (isWarning ? 'WARNING' : 'INFO'))}
                    </span>

                    <h3 className="font-bold text-sm text-slate-900">
                      {alt.title}
                    </h3>

                    {alt.sensor && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 font-bold uppercase">
                        {alt.sensor} SENSOR
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 bg-white p-2 rounded border border-slate-200">
                    {alt.message}
                  </p>

                  {(alt.explanation || alt.aiExplanation) && (
                    <div className="text-xs text-blue-950 bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="font-bold block text-[10px] uppercase">AI RATIONALE:</span>
                      {alt.explanation || alt.aiExplanation}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1">
                    <span className="font-bold text-blue-900">
                      {alt.stationId} — {stationDisplayName}
                    </span>
                    <span>•</span>
                    <span>Time: <strong>{timeStr}</strong></span>
                  </div>
                </div>

                <div>
                  {!alt.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(alt._id)}
                      className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold uppercase transition-colors"
                    >
                      MARK ACKNOWLEDGED
                    </button>
                  ) : (
                    <span className="gov-badge-green px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" /> ACKNOWLEDGED
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
