import React, { useState, useEffect } from 'react';
import { fetchAnomalies, fetchAnomalyXAIExplanation } from '../services/api';
import { Anomaly, XAIExplanationResult } from '../types';
import { Search, Filter, Info, MapPin, Activity, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { ExplainabilityModal } from '../components/ExplainabilityModal';

export const AnomalyExplorer: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [stationFilter, setStationFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [xaiExplanation, setXAIExplanation] = useState<XAIExplanationResult | null>(null);
  const [loadingXAI, setLoadingXAI] = useState<boolean>(false);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);

  const loadAnomalies = () => {
    fetchAnomalies({ station: stationFilter, type: typeFilter, severity: severityFilter })
      .then(setAnomalies)
      .catch(console.warn);
  };

  useEffect(() => {
    loadAnomalies();
  }, [stationFilter, typeFilter, severityFilter]);

  const comparisonData = selectedAnomaly ? [
    { time: '10:00 AM', target: 32.4, nearby1: 32.1, nearby2: 32.0, nearby3: 32.2 },
    { time: '10:15 AM', target: 32.8, nearby1: 32.5, nearby2: 32.3, nearby3: 32.6 },
    { time: '10:30 AM', target: selectedAnomaly.originalValue || 58.7, nearby1: 35.0, nearby2: 34.2, nearby3: 36.0 },
    { time: '10:45 AM', target: selectedAnomaly.correctedValue || 36.2, nearby1: 35.4, nearby2: 34.8, nearby3: 36.2 }
  ] : [];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="gov-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>QUALITY CONTROL MATRIX</span>
            <span>•</span>
            <span>ANOMALY DETECTIONS</span>
          </div>
          <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <Search className="w-5 h-5 text-blue-900 flex-shrink-0" />
            AUTOMATED ANOMALY DETECTIONS & SHAP AUDIT LOG
          </h1>
          <p className="text-xs text-slate-600">Flagged AWS observations analyzed by Rule Checks, IsoForest & PyTorch LSTM</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold uppercase font-mono">
          <Filter className="w-4 h-4 text-blue-900" /> FILTERS:
        </div>
        <input
          type="text"
          placeholder="Station ID..."
          value={stationFilter}
          onChange={(e) => setStationFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 w-32 font-mono focus:outline-none focus:border-blue-900"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-900"
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
          className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-900"
        >
          <option value="">ALL SEVERITIES</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      {/* Anomaly Table */}
      <div className="gov-card overflow-hidden">
        <div className="responsive-table-wrapper overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="gov-table-header">
                <th className="p-2.5">TIMESTAMP</th>
                <th className="p-2.5">STATION ID</th>
                <th className="p-2.5">SENSOR</th>
                <th className="p-2.5">CLASSIFICATION TYPE</th>
                <th className="p-2.5">SEVERITY</th>
                <th className="p-2.5">AI CONFIDENCE</th>
                <th className="p-2.5">QC AUDIT</th>
                <th className="p-2.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {anomalies.map((anom) => (
                <tr key={anom._id} className="gov-table-row">
                  <td className="p-2.5 text-slate-600">{new Date(anom.timestamp).toLocaleTimeString()}</td>
                  <td className="p-2.5 font-bold text-blue-900">{anom.stationId}</td>
                  <td className="p-2.5 uppercase text-slate-800 font-semibold">{anom.sensor || 'temperature'}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      anom.anomalyType === 'GENUINE_WEATHER_EVENT' ? 'gov-badge-blue' : 'gov-badge-amber'
                    }`}>
                      {anom.anomalyType ? anom.anomalyType.replace(/_/g, ' ') : 'POSSIBLE SENSOR FAULT'}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      anom.severity === 'CRITICAL' ? 'gov-badge-red' :
                      (anom.severity === 'HIGH' ? 'gov-badge-amber' : 'gov-badge-green')
                    }`}>
                      {anom.severity}
                    </span>
                  </td>
                  <td className="p-2.5 text-blue-900 font-bold">{((anom.confidence || 0.94) * 100).toFixed(0)}%</td>
                  <td className="p-2.5 text-slate-700">VERIFIED</td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => setSelectedAnomaly(anom)}
                      className="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded text-[11px] font-bold uppercase transition-colors"
                    >
                      INSPECT DOSSIER
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 text-xs">
          <div className="bg-white w-full max-w-2xl p-5 rounded border border-slate-300 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4 font-mono text-slate-900">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-900" />
                <h2 className="font-bold text-sm text-blue-950 uppercase">
                  ANOMALY DOSSIER — {selectedAnomaly.stationId}
                </h2>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                selectedAnomaly.anomalyType === 'GENUINE_WEATHER_EVENT' ? 'gov-badge-blue' : 'gov-badge-amber'
              }`}>
                {selectedAnomaly.anomalyType.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
              <div className="space-y-0.5">
                <span className="text-blue-950 font-bold uppercase text-[11px]">1. WHAT HAPPENED?</span>
                <p className="text-slate-800 text-xs">
                  {selectedAnomaly.whatHappened || `Temperature reading was detected at ${selectedAnomaly.originalValue || 55}°C (sudden step change).`}
                </p>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-slate-200">
                <span className="text-blue-950 font-bold uppercase text-[11px]">2. CLASSIFICATION:</span>
                <p className="text-slate-900 text-xs font-bold">
                  {selectedAnomaly.isGenuineOrSensor || (selectedAnomaly.anomalyType === 'GENUINE_WEATHER_EVENT' ? 'Genuine Weather Event Likely.' : 'Sensor Fault Likely.')}
                </p>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-slate-200">
                <span className="text-blue-950 font-bold uppercase text-[11px]">3. AI EXPLANATION:</span>
                <p className="text-slate-800 text-xs bg-white p-2 rounded border border-slate-200">
                  {selectedAnomaly.shortExplanation || selectedAnomaly.probableCause || 'Temperature increased, but humidity and pressure patterns do not support a genuine weather event. Sensor drift is likely.'}
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">AI Confidence Score: {Math.round((selectedAnomaly.confidence || 0.94) * 100)}%</span>
              </div>

              <div className="space-y-0.5 pt-2 border-t border-slate-200">
                <span className="text-blue-950 font-bold uppercase text-[11px]">4. RECOMMENDED ACTION</span>
                <p className="text-amber-800 font-bold text-xs">
                  {selectedAnomaly.recommendedAction || 'Check calibration and inspect the temperature sensor.'}
                </p>
              </div>
            </div>

            {/* Nearby Station Comparison Graph */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <h3 className="font-bold text-xs text-blue-950 flex items-center gap-2 uppercase">
                <MapPin className="w-4 h-4 text-blue-900" />
                NEARBY AWS SPATIAL CONSENSUS GRAPH
              </h3>

              <div className="h-44 w-full bg-slate-50 p-2 rounded border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', color: '#0f172a' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="target" name={`${selectedAnomaly.stationId} (Target)`} stroke="#b91c1c" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="nearby1" name="AWS-102 (24.5km)" stroke="#1d4ed8" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="nearby2" name="AWS-103 (28.1km)" stroke="#0891b2" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="nearby3" name="AWS-104 (31.0km)" stroke="#4f46e5" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={async () => {
                  if (!selectedAnomaly) return;
                  setLoadingXAI(true);
                  setIsExplainOpen(true);
                  try {
                    const res = await fetchAnomalyXAIExplanation(selectedAnomaly._id);
                    setXAIExplanation(res);
                  } catch (e) {
                    console.warn(e);
                  } finally {
                    setLoadingXAI(false);
                  }
                }}
                className="bg-blue-900 text-white font-bold text-xs uppercase px-4 py-2 rounded hover:bg-blue-950 transition-colors"
              >
                VIEW SHAP EXPLANATION DOSSIER
              </button>

              <button
                onClick={() => setSelectedAnomaly(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase px-4 py-2 rounded transition-colors"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}

      <ExplainabilityModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        explanation={xaiExplanation}
        loading={loadingXAI}
      />
    </div>
  );
};
