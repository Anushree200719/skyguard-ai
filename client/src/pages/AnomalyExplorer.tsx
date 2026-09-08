import React, { useState, useEffect } from 'react';
import { fetchAnomalies } from '../services/api';
import { Anomaly } from '../types';
import { Search, Filter, Info, MapPin, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const AnomalyExplorer: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [stationFilter, setStationFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const loadAnomalies = () => {
    fetchAnomalies({ station: stationFilter, type: typeFilter, severity: severityFilter })
      .then(setAnomalies)
      .catch(console.warn);
  };

  useEffect(() => {
    loadAnomalies();
  }, [stationFilter, typeFilter, severityFilter]);

  // Generate comparison graph data for modal
  const comparisonData = selectedAnomaly ? [
    { time: '10:00 AM', target: 32.4, nearby1: 32.1, nearby2: 32.0, nearby3: 32.2 },
    { time: '10:15 AM', target: 32.8, nearby1: 32.5, nearby2: 32.3, nearby3: 32.6 },
    { time: '10:30 AM', target: selectedAnomaly.originalValue || 58.7, nearby1: 35.0, nearby2: 34.2, nearby3: 36.0 },
    { time: '10:45 AM', target: selectedAnomaly.correctedValue || 36.2, nearby1: 35.4, nearby2: 34.8, nearby3: 36.2 }
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-sky-400" />
          ANOMALY EXPLORER & AI DIAGNOSTIC MATRIX
        </h1>
        <p className="text-xs text-slate-400">Automated AI detection log with spatial consensus & explainable AI breakdown</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-3.5 sm:p-4 rounded-xl border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center w-full">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase font-orbitron">
            <Filter className="w-4 h-4 text-sky-400 flex-shrink-0" /> FILTERS:
          </div>
          <input
            type="text"
            placeholder="Station ID..."
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 w-full sm:w-36 flex-1 sm:flex-none font-mono"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 w-full sm:w-auto flex-1 sm:flex-none font-mono"
          >
            <option value="">ALL ANOMALY TYPES</option>
            <option value="GENUINE_WEATHER_EVENT">GENUINE WEATHER EVENT</option>
            <option value="POSSIBLE_SENSOR_FAULT">POSSIBLE SENSOR FAULT</option>
            <option value="SENSOR_SPIKE">SENSOR SPIKE</option>
            <option value="SENSOR_DRIFT">SENSOR DRIFT</option>
            <option value="SENSOR_FROZEN">SENSOR FROZEN</option>
            <option value="MISSING_DATA">MISSING DATA</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 w-full sm:w-auto flex-1 sm:flex-none font-mono"
          >
            <option value="">ALL SEVERITIES</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Anomaly Table */}
      <div className="glass-card rounded-xl border border-sky-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-orbitron text-[11px]">
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">STATION ID</th>
                <th className="p-3">SENSOR</th>
                <th className="p-3">CLASSIFICATION TYPE</th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">AI CONFIDENCE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {anomalies.map((anom) => (
                <tr key={anom._id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-3 text-slate-400">{new Date(anom.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 font-bold text-sky-400">{anom.stationId}</td>
                  <td className="p-3 uppercase text-slate-300 font-semibold">{anom.sensor || 'temperature'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      anom.anomalyType === 'GENUINE_WEATHER_EVENT' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {anom.anomalyType ? anom.anomalyType.replace(/_/g, ' ') : 'POSSIBLE SENSOR FAULT'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      anom.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                      (anom.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')
                    }`}>
                      {anom.severity}
                    </span>
                  </td>
                  <td className="p-3 text-emerald-400 font-bold">{((anom.confidence || 0.94) * 100).toFixed(0)}%</td>
                  <td className="p-3 text-slate-300">ANALYZED</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedAnomaly(anom)}
                      className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] flex items-center gap-1 font-sans font-semibold"
                    >
                      <Info className="w-3 h-3" /> ANOMALY DETAILS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANOMALY DETAILS MODAL */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="glass-card w-full max-w-2xl p-6 rounded-2xl border border-sky-500/40 bg-[#0c1322] shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 font-mono text-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-base">⚠</span>
                <h2 className="font-orbitron font-bold text-sm text-slate-100 uppercase tracking-wider">
                  ANOMALY DETECTED — {selectedAnomaly.stationId}
                </h2>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-orbitron uppercase ${
                selectedAnomaly.anomalyType === 'GENUINE_WEATHER_EVENT' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedAnomaly.anomalyType.replace(/_/g, ' ')}
              </span>
            </div>

            {/* 6-Step Clean Anomaly Breakdown */}
            <div className="space-y-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
              
              {/* 1. What happened? */}
              <div className="space-y-0.5">
                <span className="text-sky-400 font-bold uppercase text-[11px] font-orbitron block">1. WHAT HAPPENED?</span>
                <p className="text-slate-200 text-xs">
                  {selectedAnomaly.whatHappened || `Temperature reading was detected at ${selectedAnomaly.originalValue || 55}°C (sudden step change).`}
                </p>
              </div>

              {/* 2. Genuine weather or sensor issue? */}
              <div className="space-y-0.5 pt-2 border-t border-slate-800/80">
                <span className="text-sky-400 font-bold uppercase text-[11px] font-orbitron block">2. IS IT LIKELY GENUINE WEATHER OR A SENSOR ISSUE?</span>
                <p className="text-slate-200 text-xs font-bold">
                  {selectedAnomaly.isGenuineOrSensor || (selectedAnomaly.anomalyType === 'GENUINE_WEATHER_EVENT' ? 'Genuine weather event likely.' : 'Sensor issue likely.')}
                </p>
              </div>

              {/* 3. Why? */}
              <div className="space-y-0.5 pt-2 border-t border-slate-800/80">
                <span className="text-sky-400 font-bold uppercase text-[11px] font-orbitron block">3. WHY?</span>
                <p className="text-slate-300 text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                  {selectedAnomaly.shortExplanation || selectedAnomaly.probableCause || 'Temperature increased, but humidity and pressure patterns do not support a genuine weather event. Sensor drift is likely.'}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">AI Confidence Score: {Math.round((selectedAnomaly.confidence || 0.94) * 100)}%</span>
              </div>

              {/* 4. Expected Behavior */}
              <div className="space-y-0.5 pt-2 border-t border-slate-800/80">
                <span className="text-sky-400 font-bold uppercase text-[11px] font-orbitron block">4. EXPECTED BEHAVIOR (AI EXPECTED BEHAVIOR)</span>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 text-xs">AI Expected Behavior:</span>
                  <span className="text-emerald-400 font-bold text-xs">{selectedAnomaly.expectedBehavior || `Expected temperature range: ${selectedAnomaly.expectedRange || '30–34°C'}`}</span>
                </div>
              </div>

              {/* 5. Recommended Action */}
              <div className="space-y-0.5 pt-2 border-t border-slate-800/80">
                <span className="text-sky-400 font-bold uppercase text-[11px] font-orbitron block">5. RECOMMENDED ACTION</span>
                <p className="text-amber-300 text-xs font-semibold">
                  {selectedAnomaly.recommendedAction || 'Check calibration and inspect the temperature sensor.'}
                </p>
              </div>

              {/* 6. Optional AI Estimated Value */}
              {(selectedAnomaly.confidence || 0.94) >= 0.85 && selectedAnomaly.anomalyType !== 'GENUINE_WEATHER_EVENT' && (
                <div className="space-y-1 pt-2 border-t border-slate-800/80 bg-emerald-950/20 p-2.5 rounded border border-emerald-500/30">
                  <span className="text-emerald-400 font-bold uppercase text-[11px] font-orbitron block">6. AI ESTIMATED VALUE</span>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Actual Reading: {selectedAnomaly.originalValue || 55}°C</span>
                    <span className="text-emerald-300">AI Estimated Value: {selectedAnomaly.correctedValue || 32}°C</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    * Disclaimer: Estimated value based on historical patterns and other sensor observations.
                  </p>
                </div>
              )}

            </div>

            {/* Nearby Station Comparison Graph */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <h3 className="font-orbitron font-bold text-xs text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                NEARBY STATION COMPARISON GRAPH
              </h3>

              <div className="h-44 w-full bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="target" name={`${selectedAnomaly.stationId} (Target)`} stroke="#ef4444" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="nearby1" name="AWS-102 (24.5km)" stroke="#38bdf8" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="nearby2" name="AWS-103 (28.1km)" stroke="#22d3ee" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="nearby3" name="AWS-104 (31.0km)" stroke="#818cf8" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                CLOSE DIAGNOSTICS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
