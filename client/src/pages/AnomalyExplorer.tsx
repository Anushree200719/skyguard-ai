import React, { useState, useEffect } from 'react';
import { fetchAnomalies } from '../services/api';
import { Anomaly } from '../types';
import { AlertTriangle, Filter, Search, Info } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          ANOMALY EXPLORER & CLASSIFICATION LOG
        </h1>
        <p className="text-xs text-slate-400">Detailed AI anomaly diagnostic logs and SHAP explainability attributions</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-xl border border-sky-500/20 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase">
            <Filter className="w-4 h-4 text-sky-400" /> FILTERS:
          </div>
          <input
            type="text"
            placeholder="Station ID..."
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 w-36"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
          >
            <option value="">ALL ANOMALY TYPES</option>
            <option value="GENUINE_WEATHER_EVENT">GENUINE WEATHER EVENT</option>
            <option value="SENSOR_SPIKE">SENSOR SPIKE</option>
            <option value="SENSOR_DRIFT">SENSOR DRIFT</option>
            <option value="SENSOR_FROZEN">SENSOR FROZEN</option>
            <option value="SENSOR_NOISE">SENSOR NOISE</option>
            <option value="MISSING_DATA">MISSING DATA</option>
            <option value="MULTIVARIATE_INCONSISTENCY">MULTIVARIATE INCONSISTENCY</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
          >
            <option value="">ALL SEVERITIES</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-sky-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-orbitron text-[11px]">
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">STATION</th>
                <th className="p-3">PARAMETER</th>
                <th className="p-3">CLASSIFICATION TYPE</th>
                <th className="p-3">SEVERITY</th>
                <th className="p-3">ANOMALY SCORE</th>
                <th className="p-3">CONFIDENCE</th>
                <th className="p-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {anomalies.map((anom) => (
                <tr key={anom._id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-3 text-slate-400">{new Date(anom.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 font-bold text-sky-400">{anom.stationId}</td>
                  <td className="p-3 uppercase text-slate-300">{anom.parameter}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      anom.anomalyType === 'GENUINE_WEATHER_EVENT' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {anom.anomalyType.replace(/_/g, ' ')}
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
                  <td className="p-3 text-slate-100 font-bold">{anom.anomalyScore}</td>
                  <td className="p-3 text-emerald-400 font-bold">{(anom.confidence * 100).toFixed(0)}%</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedAnomaly(anom)}
                      className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] flex items-center gap-1 font-sans"
                    >
                      <Info className="w-3 h-3" /> SHAP EXPLAIN
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHAP Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-sky-500/30 bg-[#0c1322] shadow-2xl relative">
            <h2 className="font-orbitron font-bold text-lg text-slate-100 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-400" />
              EXPLAINABLE AI DIAGNOSTICS ({selectedAnomaly.stationId})
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold">Classification:</span>
                <p className="font-bold text-sky-400 mt-0.5">{selectedAnomaly.anomalyType.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold">Probable Cause:</span>
                <p className="text-slate-200 mt-0.5">{selectedAnomaly.probableCause}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold">Recommended Action:</span>
                <p className="text-emerald-400 font-semibold mt-0.5">{selectedAnomaly.recommendedAction}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold">Key Decision Reasons:</span>
                <ul className="list-disc list-inside mt-1 text-slate-300 space-y-1">
                  {selectedAnomaly.reasons?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
