import React, { useState } from 'react';
import { Sliders, X, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { runWhatIfSimulation } from '../services/api';
import { WhatIfResult } from '../types';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [tempChange, setTempChange] = useState<number>(8);
  const [humChange, setHumChange] = useState<number>(0);
  const [presChange, setPresChange] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WhatIfResult | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await runWhatIfSimulation({ tempChange, humChange, presChange });
      setResult(res);
    } catch (err) {
      console.warn('What-If simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 text-xs">
      <div className="bg-white w-full max-w-xl p-5 rounded border border-slate-300 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-900" />
            <div>
              <h2 className="font-bold text-sm text-blue-950 uppercase tracking-wide">
                WHAT-IF SENSOR DELTA & PHYSICAL CORRELATION SIMULATOR
              </h2>
              <p className="text-[11px] text-slate-600">Simulate hypothetical sensor drifts and evaluate physical rule responses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-4 bg-slate-50 p-4 rounded border border-slate-200">
          <div className="text-xs font-bold text-blue-950 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" /> HYPOTHETICAL SENSOR DELTAS:
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 font-bold">Temperature Change:</span>
              <span className={`font-bold ${tempChange > 0 ? 'text-red-700' : (tempChange < 0 ? 'text-blue-700' : 'text-slate-900')}`}>
                {tempChange > 0 ? `+${tempChange}` : tempChange}°C
              </span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min="-15"
                max="20"
                step="1"
                value={tempChange}
                onChange={(e) => setTempChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-900"
              />
            </div>
          </div>

          {/* Humidity Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 font-bold">Humidity Change:</span>
              <span className={`font-bold ${humChange > 0 ? 'text-cyan-800' : (humChange < 0 ? 'text-amber-700' : 'text-slate-900')}`}>
                {humChange > 0 ? `+${humChange}` : humChange}%
              </span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min="-40"
                max="40"
                step="1"
                value={humChange}
                onChange={(e) => setHumChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-900"
              />
            </div>
          </div>

          {/* Pressure Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 font-bold">Pressure Change:</span>
              <span className={`font-bold ${presChange > 0 ? 'text-indigo-800' : (presChange < 0 ? 'text-amber-700' : 'text-slate-900')}`}>
                {presChange > 0 ? `+${presChange}` : presChange} hPa
              </span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={presChange}
                onChange={(e) => setPresChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-900"
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs uppercase rounded transition-colors"
          >
            {loading ? 'RUNNING CORRELATION ENGINE...' : 'RUN PHYSICAL CORRELATION SIMULATION'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3 p-4 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600 font-bold uppercase">ANOMALY EXPECTED?</span>
              <span className={`font-bold px-2 py-0.5 rounded text-xs border ${
                result.anomalyExpected ? 'gov-badge-amber' : 'gov-badge-green'
              }`}>
                {result.anomalyExpected ? 'YES (ANOMALY TRIGGERED)' : 'NO (NOMINAL)'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600 font-bold uppercase">SENSOR FAULT PROBABILITY:</span>
              <span className="font-bold text-slate-900">{result.sensorFaultPossibility}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-600 font-bold uppercase">ALERT SEVERITY LEVEL:</span>
              <span className={`font-bold px-2 py-0.5 rounded border ${
                result.alertLevel === 'CRITICAL' ? 'gov-badge-red' :
                (result.alertLevel === 'HIGH' ? 'gov-badge-amber' : 'gov-badge-green')
              }`}>
                {result.alertLevel}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-slate-600 font-bold uppercase block">EXPECTED SENSOR RESPONSE CORRELATION:</span>
              <ul className="space-y-1">
                {result.expectedResponse.map((item, idx) => (
                  <li key={idx} className="p-2 rounded bg-white border border-slate-200 text-slate-800 flex items-start gap-2 text-[11px]">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[11px] text-blue-950 space-y-0.5">
              <span className="font-bold block uppercase text-[10px] text-blue-900">CORRELATION SUMMARY:</span>
              <p>{result.summary}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
