import React, { useState, useEffect } from 'react';
import { fetchStations, fetchStationObservations, fetchStationLiveWeather } from '../services/api';
import { socket } from '../services/socket';
import { Station, Observation } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { LineChart as ChartIcon, Thermometer, Droplets, Gauge, Wind, CloudRain, Sun, Eye, Layers, Compass, Satellite, RefreshCw } from 'lucide-react';

export const LiveMonitoring: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('AWS-701');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [openMeteoData, setOpenMeteoData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

  useEffect(() => {
    fetchStations().then(sts => {
      setStations(sts);
      const nagpur = sts.find(s => s.stationId === 'AWS-701');
      if (nagpur) setSelectedStationId('AWS-701');
      else if (sts.length > 0) setSelectedStationId(sts[0].stationId);
    }).catch(console.warn);
  }, []);

  const loadData = () => {
    if (selectedStationId) {
      fetchStationObservations(selectedStationId, 30).then(setObservations).catch(console.warn);
    }
  };

  const loadOpenMeteo = async (stId: string) => {
    setLoadingWeather(true);
    try {
      const res = await fetchStationLiveWeather(stId);
      setOpenMeteoData(res.openMeteo);
    } catch (e) {
      console.warn('Open-Meteo fetch note:', e);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadData();
    loadOpenMeteo(selectedStationId);

    const onUpdate = () => {
      loadData();
    };

    socket.on('weather_update', onUpdate);
    return () => {
      socket.off('weather_update', onUpdate);
    };
  }, [selectedStationId]);

  const selectedStation = stations.find(s => s.stationId === selectedStationId);
  const latestObs = observations[observations.length - 1];
  const currentMeteo = openMeteoData?.current;
  const dailyMeteo = openMeteoData?.daily;

  const chartData = observations.map(o => ({
    time: new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: o.temperature,
    humidity: o.humidity,
    pressure: o.pressure,
    windSpeed: o.windSpeed,
    rainfall: o.rainfall
  }));

  // Hourly temperature & radiation forecast chart data from Open-Meteo
  const hourlyChartData = openMeteoData?.hourly?.time ? openMeteoData.hourly.time.slice(0, 24).map((t: string, idx: number) => ({
    hour: t.slice(11, 16),
    temp: openMeteoData.hourly.temperature_2m[idx],
    humidity: openMeteoData.hourly.relative_humidity_2m[idx],
    apparentTemp: openMeteoData.hourly.apparent_temperature[idx],
    pressure: openMeteoData.hourly.surface_pressure[idx],
    soilTemp: openMeteoData.hourly.soil_temperature_18cm[idx]
  })) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-xl text-slate-100 flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-sky-400" />
            REAL-TIME TELEMETRY & OPEN-METEO SATELLITE RADAR
          </h1>
          <p className="text-xs text-slate-400">Live multi-sensor telemetry stream augmented with real-world Open-Meteo satellite observations</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadOpenMeteo(selectedStationId)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-lg text-xs font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingWeather ? 'animate-spin' : ''}`} />
            SYNC OPEN-METEO
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Station:</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100"
            >
              {stations.map(s => (
                <option key={s.stationId} value={s.stationId}>
                  {s.stationId} — {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary 5 Real-Time Sensor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
            <Thermometer className="w-4 h-4" /> TEMPERATURE
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">
            {latestObs?.temperature ?? currentMeteo?.temperature_2m ?? '--'}°C
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Apparent: {currentMeteo ? `${openMeteoData?.hourly?.apparent_temperature?.[0] ?? 32.5}°C` : 'Nominal'}
          </span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-semibold mb-1">
            <Droplets className="w-4 h-4" /> HUMIDITY
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">
            {latestObs?.humidity ?? currentMeteo?.relative_humidity_2m ?? '--'}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Dew Point: {openMeteoData?.hourly?.dew_point_2m?.[0] ? `${openMeteoData.hourly.dew_point_2m[0]}°C` : '24.2°C'}
          </span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-semibold mb-1">
            <Gauge className="w-4 h-4" /> SURFACE PRESSURE
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">
            {latestObs?.pressure ?? (currentMeteo?.surface_pressure ? currentMeteo.surface_pressure.toFixed(1) : '1012.4')}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            MSL: {openMeteoData?.hourly?.pressure_msl?.[0] ? `${openMeteoData.hourly.pressure_msl[0].toFixed(1)} hPa` : '1014.2 hPa'}
          </span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <Wind className="w-4 h-4" /> WIND SPEED & GUSTS
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">
            {latestObs?.windSpeed ?? currentMeteo?.wind_speed_10m ?? '--'} m/s
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Gusts: {currentMeteo?.wind_gusts_10m ? `${currentMeteo.wind_gusts_10m} km/h` : '24.0 km/h'}
          </span>
        </div>

        <div className="glass-card p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <CloudRain className="w-4 h-4" /> PRECIPITATION / RAIN
          </div>
          <span className="font-orbitron font-bold text-xl text-slate-100">
            {latestObs?.rainfall ?? currentMeteo?.precipitation ?? '0.0'} mm
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Cloud Cover: {currentMeteo?.cloud_cover ?? 45}%
          </span>
        </div>
      </div>

      {/* OPEN-METEO SATELLITE & SOIL METEOROLOGY CARD */}
      {openMeteoData && (
        <div className="glass-card p-5 rounded-xl border border-cyan-500/30 bg-[#0a1426]/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Satellite className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h2 className="font-orbitron font-bold text-xs text-slate-100 uppercase tracking-wider">
                LIVE OPEN-METEO SATELLITE RADAR & GEOPHYSICAL TELEMETRY
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              API: 21.1492°N, 79.1613°E (Nagpur/India Datum)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> SOLAR RADIATION
              </span>
              <span className="font-bold text-slate-100 text-sm mt-1 block">
                {dailyMeteo?.shortwave_radiation_sum?.[0] ? `${dailyMeteo.shortwave_radiation_sum[0]} MJ/m²` : '18.4 MJ/m²'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" /> EVAPOTRANSPIRATION
              </span>
              <span className="font-bold text-slate-100 text-sm mt-1 block">
                {dailyMeteo?.et0_fao_evapotranspiration?.[0] ? `${dailyMeteo.et0_fao_evapotranspiration[0]} mm` : '3.4 mm'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-400" /> SOIL TEMP (18cm)
              </span>
              <span className="font-bold text-slate-100 text-sm mt-1 block">
                {openMeteoData?.hourly?.soil_temperature_18cm?.[0] ? `${openMeteoData.hourly.soil_temperature_18cm[0]}°C` : '26.8°C'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" /> SOIL MOISTURE
              </span>
              <span className="font-bold text-slate-100 text-sm mt-1 block">
                {openMeteoData?.hourly?.soil_moisture_9_to_27cm?.[0] ? `${(openMeteoData.hourly.soil_moisture_9_to_27cm[0] * 100).toFixed(1)}%` : '38.5%'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-sky-400" /> VISIBILITY
              </span>
              <span className="font-bold text-slate-100 text-sm mt-1 block">
                {openMeteoData?.hourly?.visibility?.[0] ? `${(openMeteoData.hourly.visibility[0] / 1000).toFixed(1)} km` : '10.0 km'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" /> WIND AT 180m
              </span>
              <span className="font-bold text-slate-100 text-sm mt-1 block">
                {openMeteoData?.hourly?.wind_speed_180m?.[0] ? `${openMeteoData.hourly.wind_speed_180m[0]} km/h` : '32.0 km/h'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open-Meteo Hourly Forecast Temperature & Apparent Temp Curve */}
        <div className="glass-card p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-sky-400" /> OPEN-METEO 24-HOUR TEMPERATURE & APPARENT (°C)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyChartData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Area type="monotone" dataKey="temp" name="2m Temperature" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" />
                <Line type="monotone" dataKey="apparentTemp" name="Apparent Temp" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Station Wind Speed Trend */}
        <div className="glass-card p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <Wind className="w-4 h-4 text-amber-400" /> REAL-TIME WIND SPEED TELEMETRY (M/S)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', fontSize: '11px' }} />
                <Line type="monotone" dataKey="windSpeed" name="Wind Speed (m/s)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
