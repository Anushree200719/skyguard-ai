import React, { useState, useEffect } from 'react';
import { fetchStations, fetchStationObservations } from '../services/api';
import { socket } from '../services/socket';
import { Station, Observation } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { LineChart as ChartIcon, Thermometer, Droplets, Gauge, Wind, CloudRain } from 'lucide-react';

export const LiveMonitoring: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('AWS-101');
  const [observations, setObservations] = useState<Observation[]>([]);

  useEffect(() => {
    fetchStations().then(sts => {
      setStations(sts);
      if (sts.length > 0) setSelectedStationId(sts[0].stationId);
    }).catch(console.warn);
  }, []);

  const loadData = () => {
    if (selectedStationId) {
      fetchStationObservations(selectedStationId, 30).then(setObservations).catch(console.warn);
    }
  };

  useEffect(() => {
    loadData();
    const onUpdate = (data: any) => {
      loadData();
    };

    socket.on('weather_update', onUpdate);
    return () => {
      socket.off('weather_update', onUpdate);
    };
  }, [selectedStationId]);

  const selectedStation = stations.find(s => s.stationId === selectedStationId);
  const latestObs = observations[observations.length - 1];

  const chartData = observations.map(o => ({
    time: new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: o.temperature,
    humidity: o.humidity,
    pressure: o.pressure,
    windSpeed: o.windSpeed,
    rainfall: o.rainfall
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-sky-400" />
            REAL-TIME TELEMETRY MONITORING
          </h1>
          <p className="text-xs text-slate-400">Live streaming 5-parameter weather data with expected physical range overlays</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase">Select Station:</label>
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100"
          >
            {stations.map(s => (
              <option key={s.stationId} value={s.stationId}>
                {s.stationId} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Reading Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
            <Thermometer className="w-4 h-4" /> TEMP
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.temperature ?? '--'}°C</span>
          <span className="text-[10px] text-slate-400 block mt-1">Expected: 28°C – 38°C</span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-semibold mb-1">
            <Droplets className="w-4 h-4" /> HUMIDITY
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.humidity ?? '--'}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Expected: 40% – 85%</span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-semibold mb-1">
            <Gauge className="w-4 h-4" /> PRESSURE
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.pressure ?? '--'}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Expected: 1005 – 1018 hPa</span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <Wind className="w-4 h-4" /> WIND SPEED
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.windSpeed ?? '--'} m/s</span>
          <span className="text-[10px] text-slate-400 block mt-1">Expected: 0 – 35 m/s</span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <CloudRain className="w-4 h-4" /> RAINFALL
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">{latestObs?.rainfall ?? '--'} mm</span>
          <span className="text-[10px] text-slate-400 block mt-1">Expected: ≥ 0.0 mm</span>
        </div>
      </div>

      {/* Streaming Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-sky-400" /> TEMPERATURE TREND (°C)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Line type="monotone" dataKey="temperature" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" /> HUMIDITY TREND (%)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Line type="monotone" dataKey="humidity" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <Wind className="w-4 h-4 text-amber-400" /> WIND SPEED TREND (M/S)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Line type="monotone" dataKey="windSpeed" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-emerald-400" /> RAINFALL (MM)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Line type="monotone" dataKey="rainfall" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
