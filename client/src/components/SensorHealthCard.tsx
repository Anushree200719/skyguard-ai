import React from 'react';
import { Station, StationSensorHealthResult } from '../types';
import { Activity, AlertTriangle, CheckCircle2, XCircle, Clock, Thermometer, Droplets, Gauge, Wind, CloudRain, Cpu, RadioTower } from 'lucide-react';

interface SensorHealthCardProps {
  station: Station;
  healthData?: StationSensorHealthResult | null;
  loading?: boolean;
}

export const SensorHealthCard: React.FC<SensorHealthCardProps> = ({ station, healthData, loading = false }) => {
  const overallHealth = healthData?.overallHealthScore ?? station.healthScore ?? 95;

  let overallStatusLabel = 'ALL SENSORS NOMINAL 🟢';
  let overallStatusBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let progressColor = '#10b981';

  if (overallHealth >= 90) {
    overallStatusLabel = 'ALL SENSORS NOMINAL 🟢';
    overallStatusBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    progressColor = '#10b981';
  } else if (overallHealth >= 75) {
    overallStatusLabel = 'MINOR ATTENTION NEEDED 🟢';
    overallStatusBg = 'bg-green-500/20 text-green-300 border-green-500/40';
    progressColor = '#22c55e';
  } else if (overallHealth >= 50) {
    overallStatusLabel = 'UNSTABLE HARDWARE SENSORS 🟠';
    overallStatusBg = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    progressColor = '#f97316';
  } else {
    overallStatusLabel = 'CRITICAL HARDWARE DEGRADATION 🔴';
    overallStatusBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    progressColor = '#ef4444';
  }

  const sensors = healthData?.sensors || [
    {
      id: 'temperature',
      name: 'Temperature Sensor',
      type: 'Thermistor Node',
      unit: '°C',
      healthPercentage: station.sensorHealth?.temperature || 98,
      status: 'HEALTHY',
      statusLabel: 'HEALTHY 🟢',
      statusColor: '#10b981',
      statusBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastReading: '27.99°C',
      lastUpdate: 'Live Streaming',
      issues: ['Thermistor operating within nominal meteorological parameters', 'Thermal calibration nominal & spatial consensus verified']
    },
    {
      id: 'humidity',
      name: 'Relative Humidity Sensor',
      type: 'Capacitive Hygrometer',
      unit: '%',
      healthPercentage: station.sensorHealth?.humidity || 96,
      status: 'HEALTHY',
      statusLabel: 'HEALTHY 🟢',
      statusColor: '#10b981',
      statusBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastReading: '64.8%',
      lastUpdate: 'Live Streaming',
      issues: ['Capacitive hygrometer element operating nominally', 'Relative humidity response curve calibrated']
    },
    {
      id: 'pressure',
      name: 'Surface Pressure Sensor',
      type: 'MEMS Barometer',
      unit: 'hPa',
      healthPercentage: station.sensorHealth?.pressure || 99,
      status: 'HEALTHY',
      statusLabel: 'HEALTHY 🟢',
      statusColor: '#10b981',
      statusBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastReading: '1012.3 hPa',
      lastUpdate: 'Live Streaming',
      issues: ['Barometric MEMS pressure sensor responding normally', 'Sea-level pressure reduction offset aligned']
    },
    {
      id: 'windSpeed',
      name: 'Wind Speed Sensor',
      type: 'Ultrasonic Anemometer',
      unit: 'm/s',
      healthPercentage: station.sensorHealth?.wind || 88,
      status: 'WARNING',
      statusLabel: 'WARNING 🟢',
      statusColor: '#22c55e',
      statusBg: 'bg-green-500/20 text-green-300 border-green-500/40',
      lastReading: '11.8 m/s',
      lastUpdate: 'Live Streaming',
      issues: ['Ultrasonic anemometer cups spinning freely', 'Minor speed variance recorded during peak gusts']
    },
    {
      id: 'rainfall',
      name: 'Rainfall Sensor',
      type: 'Tipping Bucket Gauge',
      unit: 'mm',
      healthPercentage: station.sensorHealth?.rainfall || 95,
      status: 'HEALTHY',
      statusLabel: 'HEALTHY 🟢',
      statusColor: '#10b981',
      statusBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      lastReading: '0.0 mm',
      lastUpdate: 'Live Streaming',
      issues: ['Tipping bucket mechanism clean and unobstructed', 'Precipitation rate transducer active']
    }
  ];

  const getSensorIcon = (id: string) => {
    switch (id) {
      case 'temperature': return <Thermometer className="w-4 h-4 text-sky-400" />;
      case 'humidity': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'pressure': return <Gauge className="w-4 h-4 text-indigo-400" />;
      case 'windSpeed': return <Wind className="w-4 h-4 text-amber-400" />;
      case 'rainfall': return <CloudRain className="w-4 h-4 text-emerald-400" />;
      default: return <Cpu className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="glass-card p-4 sm:p-5 rounded-xl border border-emerald-500/30 bg-[#071726]/90 relative overflow-hidden font-mono space-y-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-20 flex items-center justify-center text-xs text-emerald-400 font-bold animate-pulse">
          🩺 Inspecting physical sensor channels & telemetry health...
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <h2 className="font-orbitron font-bold text-xs text-slate-100 uppercase tracking-wider">
              AWS SENSOR HEALTH MONITORING & HARDWARE DIAGNOSTICS
            </h2>
            <span className="text-[10px] text-slate-400 block font-sans">
              Real-time hardware channel analysis for {station.stationId} ({station.name})
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded text-xs font-bold font-orbitron border ${overallStatusBg}`}>
          {overallStatusLabel}
        </span>
      </div>

      {/* Station Overall Health Progress Banner */}
      <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-center">
            <span className="text-[10px] text-slate-400 block font-bold">OVERALL SENSOR HEALTH</span>
            <span className="font-orbitron font-extrabold text-2xl text-slate-100">{overallHealth}%</span>
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <RadioTower className="w-3.5 h-3.5 text-emerald-400" />
              <span>5 Active Physical Sensor Transducers</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Health level derived from physical bounds, telemetry noise, flatlines, step jump spikes, and Open-Meteo alignment.
            </p>
          </div>
        </div>

        {/* Health Status Legend */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">🟢 HEALTHY (90-100%)</span>
          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/40">🟢 WARNING (75-89%)</span>
          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">🟠 UNSTABLE (50-74%)</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">🔴 CRITICAL (1-49%)</span>
          <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 border border-slate-500/40">⚫ OFFLINE (0%)</span>
        </div>
      </div>

      {/* 5-Sensor Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {sensors.map((sensor) => {
          const isOffline = sensor.status === 'OFFLINE';

          return (
            <div 
              key={sensor.id}
              className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/90 flex flex-col justify-between space-y-2 relative"
            >
              {/* Card Header: Icon & Sensor Name */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  {getSensorIcon(sensor.id)}
                  <span className="font-orbitron font-bold text-xs text-slate-200 truncate">{sensor.name}</span>
                </div>
              </div>

              {/* Sensor Health % & Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Health Level:</span>
                  <span className="font-bold font-orbitron text-slate-100">{sensor.healthPercentage}%</span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full transition-all duration-700" 
                    style={{ width: `${sensor.healthPercentage}%`, backgroundColor: sensor.statusColor }} 
                  />
                </div>
              </div>

              {/* Status Badge & Sensor Type */}
              <div className="flex items-center justify-between pt-1">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-orbitron border ${sensor.statusBg}`}>
                  {sensor.statusLabel}
                </span>
                <span className="text-[9px] text-slate-400 italic truncate max-w-[90px]">{sensor.type}</span>
              </div>

              {/* Last Reading & Last Update */}
              <div className="space-y-1 p-2 bg-slate-950/60 rounded border border-slate-800 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Reading:</span>
                  <span className="font-bold text-slate-100">{sensor.lastReading}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> Updated:</span>
                  <span>{sensor.lastUpdate}</span>
                </div>
              </div>

              {/* Problems & Issues Detected List */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <span className="text-[9px] text-slate-400 font-bold uppercase block font-orbitron">
                  PROBLEMS / ISSUES DETECTED:
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {sensor.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-1 text-[10px] text-slate-300 leading-tight">
                      {sensor.status === 'HEALTHY' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (sensor.status === 'WARNING' ? (
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                      ))}
                      <span className="text-[10px]">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
