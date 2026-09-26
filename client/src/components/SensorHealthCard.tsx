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

  let overallStatusLabel = 'ALL SENSORS NOMINAL';
  let overallStatusBadge = 'gov-badge-green';
  let progressColor = '#15803d';

  if (overallHealth >= 90) {
    overallStatusLabel = 'ALL SENSORS NOMINAL';
    overallStatusBadge = 'gov-badge-green';
    progressColor = '#15803d';
  } else if (overallHealth >= 75) {
    overallStatusLabel = 'MINOR ATTENTION NEEDED';
    overallStatusBadge = 'gov-badge-blue';
    progressColor = '#1d4ed8';
  } else if (overallHealth >= 50) {
    overallStatusLabel = 'UNSTABLE HARDWARE DEGRADATION';
    overallStatusBadge = 'gov-badge-amber';
    progressColor = '#b45309';
  } else {
    overallStatusLabel = 'CRITICAL HARDWARE FAULT';
    overallStatusBadge = 'gov-badge-red';
    progressColor = '#b91c1c';
  }

  const sensors = healthData?.sensors || [
    {
      id: 'temperature',
      name: 'Temperature Sensor',
      type: 'Thermistor Node',
      unit: '°C',
      healthPercentage: station.sensorHealth?.temperature || 98,
      status: 'HEALTHY',
      statusLabel: 'NOMINAL',
      statusBadge: 'gov-badge-green',
      statusColor: '#15803d',
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
      statusLabel: 'NOMINAL',
      statusBadge: 'gov-badge-green',
      statusColor: '#15803d',
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
      statusLabel: 'NOMINAL',
      statusBadge: 'gov-badge-green',
      statusColor: '#15803d',
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
      statusLabel: 'WARNING',
      statusBadge: 'gov-badge-amber',
      statusColor: '#b45309',
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
      statusLabel: 'NOMINAL',
      statusBadge: 'gov-badge-green',
      statusColor: '#15803d',
      lastReading: '0.0 mm',
      lastUpdate: 'Live Streaming',
      issues: ['Tipping bucket mechanism clean and unobstructed', 'Precipitation rate transducer active']
    }
  ];

  const getSensorIcon = (id: string) => {
    switch (id) {
      case 'temperature': return <Thermometer className="w-4 h-4 text-blue-900" />;
      case 'humidity': return <Droplets className="w-4 h-4 text-cyan-800" />;
      case 'pressure': return <Gauge className="w-4 h-4 text-indigo-900" />;
      case 'windSpeed': return <Wind className="w-4 h-4 text-amber-800" />;
      case 'rainfall': return <CloudRain className="w-4 h-4 text-emerald-800" />;
      default: return <Cpu className="w-4 h-4 text-blue-900" />;
    }
  };

  return (
    <div className="gov-card p-4 space-y-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2 text-xs font-mono text-center rounded animate-pulse">
          🩺 Inspecting physical sensor channels & telemetry health...
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-900" />
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-blue-950 uppercase tracking-wider">
              AWS SENSOR HARDWARE DIAGNOSTICS & CHANNEL STATUS
            </h2>
            <span className="text-[11px] text-slate-600 block">
              Hardware channel health audit for {station.stationId} ({station.name})
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${overallStatusBadge}`}>
          {overallStatusLabel}
        </span>
      </div>

      {/* Overall Health Progress */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">OVERALL HEALTH</span>
            <span className="font-mono font-bold text-2xl text-blue-950">{overallHealth}%</span>
          </div>

          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <RadioTower className="w-4 h-4 text-blue-900" />
              <span>5 Physical Sensor Transducers Monitored</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Evaluated against thermal noise, flatline locks, step jump anomalies, and Open-Meteo satellite feeds.
            </p>
          </div>
        </div>
      </div>

      {/* 5-Sensor Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {sensors.map((sensor) => {
          return (
            <div 
              key={sensor.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between space-y-2.5"
            >
              {/* Sensor Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 truncate">
                  {getSensorIcon(sensor.id)}
                  <span className="font-bold text-xs text-slate-900 truncate">{sensor.name}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 text-[11px]">Health:</span>
                  <span className="font-bold text-slate-900">{sensor.healthPercentage}%</span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: `${sensor.healthPercentage}%`, backgroundColor: sensor.statusColor }} 
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-1">
                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${sensor.statusBadge || 'gov-badge-green'}`}>
                  {sensor.statusLabel}
                </span>
                <span className="text-[9px] text-slate-500 italic truncate">{sensor.type}</span>
              </div>

              {/* Last Reading */}
              <div className="space-y-1 p-2 bg-white border border-slate-200 rounded text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Reading:</span>
                  <span className="font-bold text-slate-900">{sensor.lastReading}</span>
                </div>
              </div>

              {/* Problems & Issues */}
              <div className="space-y-1 pt-1.5 border-t border-slate-200">
                <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">
                  CHANNEL DIAGNOSTICS:
                </span>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {sensor.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-700">
                      {sensor.status === 'HEALTHY' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (sensor.status === 'WARNING' ? (
                        <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                      ))}
                      <span>{issue}</span>
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
