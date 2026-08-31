import React, { useState, useEffect } from 'react';
import { fetchStations, setSimulationSpeed } from '../services/api';
import { FaultInjectorModal } from '../components/FaultInjectorModal';
import { SlidersHorizontal, Zap, Gauge, Play, FastForward } from 'lucide-react';

export const LiveSimulator: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchStations().then(setStations).catch(console.warn);
  }, []);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    setSimulationSpeed(newSpeed).catch(console.warn);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-sky-400" />
            LIVE AUTOMATIC WEATHER STATION SIMULATOR
          </h1>
          <p className="text-xs text-slate-400">Configure real-time weather telemetry frequency and test fault injections</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-orbitron font-bold text-xs rounded-lg shadow-lg shadow-rose-600/30 transition-all"
        >
          <Zap className="w-4 h-4 text-yellow-300" />
          OPEN FAULT INJECTOR
        </button>
      </div>

      <div className="glass-card p-6 rounded-xl border border-sky-500/20 space-y-6">
        <div>
          <h2 className="font-orbitron font-bold text-sm text-slate-100 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-400" />
            SIMULATION SPEED MULTIPLIER ({speed}x)
          </h2>
          <p className="text-xs text-slate-400 mt-1">Adjust telemetry emission frequency across Socket.IO broadcast loops</p>
        </div>

        <div className="flex items-center gap-4">
          {[0.5, 1.0, 2.0, 5.0].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={`px-4 py-2 rounded-lg font-mono font-bold text-xs border transition-all ${
                speed === s
                  ? 'bg-sky-500 text-slate-900 border-sky-400 font-extrabold shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {s}x SPEED
            </button>
          ))}
        </div>
      </div>

      <FaultInjectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stations={stations}
      />
    </div>
  );
};
