import React, { useState } from 'react';
import { X, Zap, Thermometer, Radio, CloudLightning, ShieldAlert } from 'lucide-react';
import { injectFault } from '../services/api';

interface FaultInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: any[];
}

export const FaultInjectorModal: React.FC<FaultInjectorModalProps> = ({ isOpen, onClose, stations }) => {
  const [selectedStation, setSelectedStation] = useState<string>(stations[0]?.stationId || 'AWS-101');
  const [faultType, setFaultType] = useState<string>('SENSOR_SPIKE');
  const [duration, setDuration] = useState<number>(120);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  if (!isOpen) return null;

  const faults = [
    { type: 'SENSOR_SPIKE', label: 'SENSOR SPIKE', desc: 'Sudden high value jump (e.g. 58.7°C)', icon: Zap, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { type: 'SENSOR_DRIFT', label: 'SENSOR DRIFT', desc: 'Monotonic cumulative drift over cycles', icon: Thermometer, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
    { type: 'FROZEN_SENSOR', label: 'FROZEN SENSOR', desc: 'Stuck constant value output (31.4°C)', icon: Radio, color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
    { type: 'RANDOM_NOISE', label: 'RANDOM NOISE', desc: 'High variance random jitter', icon: Zap, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' },
    { type: 'MISSING_DATA', label: 'MISSING DATA', desc: 'Null values in telemetry payload', icon: ShieldAlert, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
    { type: 'MULTIVARIATE_INCONSISTENCY', label: 'MULTIVARIATE FAIL', desc: 'Extreme temp (48°C) + 95% Hum', icon: ShieldAlert, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
    { type: 'GENUINE_WEATHER_EVENT', label: 'GENUINE EVENT', desc: 'Heatwave across NCR stations (45.8°C)', icon: CloudLightning, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' }
  ];

  const handleInject = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (faultType === 'GENUINE_WEATHER_EVENT') {
        const ncrStations = ['AWS-101', 'AWS-102', 'AWS-103', 'AWS-104'];
        await injectFault({ stationId: ncrStations, faultType: 'GENUINE_WEATHER_EVENT', targetTemp: 45.8 });
        setMessage(`Injected GENUINE_WEATHER_EVENT across NCR stations! Spatial Consensus will confirm.`);
      } else {
        await injectFault({ stationId: selectedStation, faultType, durationSeconds: duration });
        setMessage(`Injected ${faultType} into ${selectedStation}`);
      }
    } catch (err: any) {
      setMessage(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-xl p-6 rounded-2xl border border-sky-500/30 bg-[#0c1322] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="p-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-lg text-slate-100">SIMULATOR FAULT INJECTOR</h2>
            <p className="text-xs text-slate-400">Inject real-time sensor anomalies or regional weather events into live feeds</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target AWS Station</label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
            >
              {stations.map((s) => (
                <option key={s.stationId} value={s.stationId}>
                  {s.stationId} - {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Select Fault Type</label>
            <div className="grid grid-cols-2 gap-2">
              {faults.map((f) => {
                const Icon = f.icon;
                const isSelected = faultType === f.type;
                return (
                  <button
                    key={f.type}
                    type="button"
                    onClick={() => setFaultType(f.type)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/20 text-slate-100 shadow-md shadow-sky-500/10'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron text-xs font-bold">{f.label}</span>
                      <Icon className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-[10px] text-slate-400">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {message && (
            <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-lg text-xs font-mono text-sky-300">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
            >
              CANCEL
            </button>
            <button
              onClick={handleInject}
              disabled={loading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-orbitron font-bold rounded-lg text-xs tracking-wider transition-all shadow-lg shadow-rose-600/30"
            >
              {loading ? 'INJECTING...' : 'TRIGGER FAULT INJECTION'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
