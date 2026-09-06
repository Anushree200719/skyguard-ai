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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-xl p-6 rounded-2xl border border-sky-500/40 bg-[#0a1220] shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg">
              <Sliders className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-sm text-slate-100 flex items-center gap-2">
                WHAT-IF WEATHER SIMULATOR
              </h2>
              <p className="text-[11px] text-slate-400">Educational sensor reaction and physical correlation modeling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider font-orbitron flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> HYPOTHETICAL SENSOR DELTAS:
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Temperature Change:</span>
              <span className={`font-bold ${tempChange > 0 ? 'text-rose-400' : (tempChange < 0 ? 'text-sky-400' : 'text-slate-300')}`}>
                {tempChange > 0 ? `+${tempChange}` : tempChange}°C
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="20"
              step="1"
              value={tempChange}
              onChange={(e) => setTempChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Humidity Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Humidity Change:</span>
              <span className={`font-bold ${humChange > 0 ? 'text-cyan-400' : (humChange < 0 ? 'text-amber-400' : 'text-slate-300')}`}>
                {humChange > 0 ? `+${humChange}` : humChange}%
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="1"
              value={humChange}
              onChange={(e) => setHumChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Pressure Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Pressure Change:</span>
              <span className={`font-bold ${presChange > 0 ? 'text-indigo-400' : (presChange < 0 ? 'text-amber-400' : 'text-slate-300')}`}>
                {presChange > 0 ? `+${presChange}` : presChange} hPa
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={presChange}
              onChange={(e) => setPresChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-orbitron font-bold text-xs rounded-lg transition-all shadow-lg shadow-sky-500/20"
          >
            {loading ? 'RUNNING PHYSICAL CORRELATION ENGINE...' : 'RUN SIMULATION'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3 p-4 bg-slate-900/80 rounded-xl border border-sky-500/30 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold uppercase">ANOMALY EXPECTED?</span>
              <span className={`font-orbitron font-bold px-2 py-0.5 rounded text-xs ${
                result.anomalyExpected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {result.anomalyExpected ? 'YES' : 'NO'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold uppercase">SENSOR FAULT POSSIBILITY:</span>
              <span className="font-bold text-slate-200">{result.sensorFaultPossibility}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold uppercase">ALERT LEVEL:</span>
              <span className={`font-bold px-2 py-0.5 rounded ${
                result.alertLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                (result.alertLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')
              }`}>
                {result.alertLevel}
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-slate-400 font-semibold uppercase block">EXPECTED RESPONSE OF OTHER SENSORS:</span>
              <ul className="space-y-1">
                {result.expectedResponse.map((item, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-slate-300 flex items-start gap-2 text-[11px]">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded bg-sky-950/40 border border-sky-500/20 text-[11px] text-sky-200 space-y-0.5">
              <span className="font-bold block uppercase text-[10px] text-sky-400 font-orbitron">AI SUMMARY:</span>
              <p>{result.summary}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
