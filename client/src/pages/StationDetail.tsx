import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStationById, fetchStationObservations } from '../services/api';
import { Station, Observation } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowLeft, Thermometer, Droplets, Gauge, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

export const StationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<Station | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);

  useEffect(() => {
    if (id) {
      fetchStationById(id).then(setStation).catch(console.warn);
      fetchStationObservations(id, 40).then(setObservations).catch(console.warn);
    }
  }, [id]);

  if (!station) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-sm">
        Loading station telemetry data for {id}...
      </div>
    );
  }

  const chartData = observations.map((obs) => ({
    time: new Date(obs.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: obs.temperature,
    correctedTemperature: obs.correctedTemperature || obs.temperature,
    humidity: obs.humidity,
    pressure: obs.pressure
  }));

  const latestObs = observations[observations.length - 1];

  return (
    <div className="space-y-6">
      <Link to="/stations" className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300">
        <ArrowLeft className="w-4 h-4" />
        BACK TO AWS NETWORK INVENTORY
      </Link>

      {/* Header Info */}
      <div className="glass-card p-6 rounded-xl border border-sky-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-orbitron font-bold text-2xl text-slate-100">{station.stationId}</h1>
            <span className={`text-xs font-bold px-2.5 py-1 rounded ${
              station.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              (station.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              (station.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'))
            }`}>
              STATUS: {station.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-300 mt-1">{station.name}</p>
          <p className="text-xs text-slate-400">{station.location} (Lat: {station.latitude}°, Lon: {station.longitude}°, Elev: {station.elevation}m)</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">HEALTH SCORE</span>
            <span className="font-orbitron font-bold text-xl text-emerald-400">{station.healthScore}%</span>
          </div>
          <div className="text-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">CURRENT TEMP</span>
            <span className="font-orbitron font-bold text-xl text-sky-400">{latestObs?.temperature ?? '--'}°C</span>
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature History Chart */}
        <div className="glass-card p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-sm text-slate-100 mb-4 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-sky-400" />
            TEMPERATURE HISTORY (°C) & ACTUAL vs ESTIMATED CORRECTED
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '12px' }} />
                <Line type="monotone" dataKey="temperature" name="Raw Observed" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="correctedTemperature" name="Corrected Estimate" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Relative Humidity Chart */}
        <div className="glass-card p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-sm text-slate-100 mb-4 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-400" />
            RELATIVE HUMIDITY HISTORY (%)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '12px' }} />
                <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
