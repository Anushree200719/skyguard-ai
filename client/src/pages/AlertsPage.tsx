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
  
  // Filter States
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [stationFilter, setStationFilter] = useState<string>('');
  const [ackFilter, setAckFilter] = useState<string>('all'); // 'all', 'active', 'acknowledged'
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertsRes, summaryRes, stationsRes] = await Promise.allSettled([
        fetchAlerts({ station: stationFilter, level: severityFilter, limit: 100 }),
        fetchAlertsSummary(),
        fetchStations()
      ]);

      if (alertsRes.status === 'fulfilled' && alertsRes.value) {
        setAlerts(alertsRes.value);
      }
      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value);
      }
      if (stationsRes.status === 'fulfilled' && stationsRes.value) {
        setStations(stationsRes.value);
      }
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
      // Optimistically update state
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, acknowledged: true } : a));
      // Refresh summary
      fetchAlertsSummary().then(setSummary).catch(console.warn);
    } catch (e) {
      console.warn('Acknowledge alert note:', e);
    }
  };

  // Client-side filtering for smooth station/severity/ack switching
  const filteredAlerts = alerts.filter(a => {
    if (severityFilter && a.level !== severityFilter && a.category !== severityFilter) return false;
    if (stationFilter && a.stationId !== stationFilter) return false;
    if (ackFilter === 'active' && a.acknowledged) return false;
    if (ackFilter === 'acknowledged' && !a.acknowledged) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400 flex-shrink-0 animate-pulse" />
            INTELLIGENT SMART ALERT COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Categorized multi-source alerts synthesized from ML anomalies, trust scores, & sensor diagnostics</p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 rounded-lg text-xs font-mono transition-all min-h-[40px] touch-manipulation active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH ALERTS</span>
        </button>
      </div>

      {/* ACTIVE ALERTS SUMMARY COUNTERS BAR */}
      <div className="glass-card p-3 sm:p-4 rounded-xl border border-sky-500/30 bg-[#0a1426]/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            <h2 className="font-orbitron font-bold text-xs text-slate-100 uppercase tracking-wider">
              ACTIVE ALERTS OVERVIEW
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
            TOTAL ACTIVE: {summary.totalActive || 0}
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-orbitron font-bold text-rose-300 block uppercase">🔴 CRITICAL</span>
              <span className="font-orbitron font-bold text-xl sm:text-2xl text-rose-400">{summary.critical || 0}</span>
            </div>
            <span className="text-xs text-rose-400 font-mono font-bold px-2 py-1 bg-rose-500/20 rounded">Urgent</span>
          </div>

          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-orbitron font-bold text-amber-300 block uppercase">🟠 HIGH RISK</span>
              <span className="font-orbitron font-bold text-xl sm:text-2xl text-amber-400">{summary.highRisk || 0}</span>
            </div>
            <span className="text-xs text-amber-400 font-mono font-bold px-2 py-1 bg-amber-500/20 rounded">High</span>
          </div>

          <div className="p-3 bg-yellow-950/40 rounded-xl border border-yellow-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-orbitron font-bold text-yellow-300 block uppercase">🟡 WARNING</span>
              <span className="font-orbitron font-bold text-xl sm:text-2xl text-yellow-400">{summary.warning || 0}</span>
            </div>
            <span className="text-xs text-yellow-400 font-mono font-bold px-2 py-1 bg-yellow-500/20 rounded">Notice</span>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-orbitron font-bold text-emerald-300 block uppercase">🟢 INFO</span>
              <span className="font-orbitron font-bold text-xl sm:text-2xl text-emerald-400">{summary.info || 0}</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold px-2 py-1 bg-emerald-500/20 rounded">Info</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="glass-card p-3 sm:p-4 rounded-xl border border-sky-500/20 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Severity Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase font-orbitron flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-sky-400" /> SEVERITY:
            </span>
            {[
              { id: '', label: 'ALL SEVERITIES' },
              { id: 'CRITICAL', label: '🔴 CRITICAL' },
              { id: 'HIGH RISK', label: '🟠 HIGH RISK' },
              { id: 'WARNING', label: '🟡 WARNING' },
              { id: 'INFO', label: '🟢 INFO' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSeverityFilter(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all touch-manipulation min-h-[36px] ${
                  severityFilter === item.id
                    ? 'bg-sky-500 text-slate-900 border-sky-400 shadow-md font-extrabold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Station & Status Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Station Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 min-h-[38px] w-full sm:w-auto">
              <RadioTower className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-mono focus:outline-none w-full sm:w-48 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-100">ALL WEATHER STATIONS</option>
                {Object.entries(STATION_DICTIONARY).map(([stId, stName]) => (
                  <option key={stId} value={stId} className="bg-slate-900 text-slate-100">
                    {stId} — {stName}
                  </option>
                ))}
              </select>
            </div>

            {/* Acknowledged Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 min-h-[38px] w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-mono">STATUS:</span>
              <select
                value={ackFilter}
                onChange={(e) => setAckFilter(e.target.value)}
                className="bg-transparent text-slate-100 text-xs font-mono focus:outline-none w-full sm:w-36 cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-slate-100">ALL ALERTS</option>
                <option value="active" className="bg-slate-900 text-slate-100">ACTIVE ONLY</option>
                <option value="acknowledged" className="bg-slate-900 text-slate-100">ACKNOWLEDGED ONLY</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SMART ALERTS LIST */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 text-xs font-mono space-y-2">
            <div className="text-2xl">✓</div>
            <div className="font-bold text-slate-200 text-sm">No Smart Alerts matching selected criteria</div>
            <p className="text-slate-400">All weather station telemetry channels operating within expected baseline thresholds.</p>
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
                className={`glass-card p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all min-w-0 font-mono ${
                  isCritical ? 'border-rose-500/50 bg-rose-950/20 shadow-lg shadow-rose-950/30' :
                  (isHigh ? 'border-amber-500/50 bg-amber-950/20 shadow-lg shadow-amber-950/30' :
                  (isWarning ? 'border-yellow-500/40 bg-yellow-950/20' : 'border-emerald-500/40 bg-emerald-950/20'))
                }`}
              >
                <div className="min-w-0 flex-1 space-y-2">
                  {/* Badge & Title */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`text-[11px] font-orbitron font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1 ${
                      isCritical ? 'bg-rose-600 text-white border border-rose-400' :
                      (isHigh ? 'bg-amber-600 text-white border border-amber-400' :
                      (isWarning ? 'bg-yellow-600 text-slate-950 border border-yellow-400' : 'bg-emerald-600 text-white border border-emerald-400'))
                    }`}>
                      {isCritical ? '🔴 CRITICAL' : (isHigh ? '🟠 HIGH RISK' : (isWarning ? '🟡 WARNING' : '🟢 INFO'))}
                    </span>

                    <h3 className="font-orbitron font-bold text-sm sm:text-base text-slate-100 truncate">
                      {alt.title}
                    </h3>

                    {alt.sensor && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700 uppercase font-bold">
                        {alt.sensor} SENSOR
                      </span>
                    )}

                    {alt.aiConfidence && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> {Math.round(alt.aiConfidence * 100)}% AI CONFIDENCE
                      </span>
                    )}
                  </div>

                  {/* Message & Current Value */}
                  <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                    {alt.message}
                  </p>

                  {/* AI Explanation / Probable Cause */}
                  {(alt.explanation || alt.aiExplanation) && (
                    <div className="text-xs text-sky-300/90 leading-relaxed bg-sky-950/30 p-2.5 rounded-lg border border-sky-500/20">
                      <span className="font-bold text-sky-400 block mb-0.5 text-[11px] uppercase font-orbitron">POSSIBLE CAUSE & AI RATIONALE:</span>
                      {alt.explanation || alt.aiExplanation}
                    </div>
                  )}

                  {/* Station metadata & Timestamp */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-bold text-sky-400">
                      <RadioTower className="w-3.5 h-3.5 text-sky-400" /> {alt.stationId} — {stationDisplayName}
                    </span>
                    <span>•</span>
                    <span>Time: <strong className="text-slate-200">{timeStr}</strong></span>
                    {alt.dedupKey && (
                      <>
                        <span>•</span>
                        <span className="text-[10px] text-slate-500 italic">Protected by Deduplication</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Acknowledge Button */}
                <div className="flex flex-col justify-between items-end gap-2 self-stretch md:self-auto flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {!alt.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(alt._id)}
                      className="w-full md:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 hover:border-sky-400 rounded-xl text-xs font-mono font-bold touch-manipulation text-center active:scale-[0.98] min-h-[44px] shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>MARK ACKNOWLEDGED</span>
                    </button>
                  ) : (
                    <span className="px-3 py-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ACKNOWLEDGED
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
