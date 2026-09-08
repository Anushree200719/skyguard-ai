import React, { useState, useEffect, useRef } from 'react';
import { fetchStations, fetchStationObservations, fetchStationLiveWeather } from '../services/api';
import { socket } from '../services/socket';
import { Station, Observation } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { LineChart as ChartIcon, Thermometer, Droplets, Gauge, Wind, CloudRain, Sun, Eye, Layers, Compass, Satellite, RefreshCw, Sliders, Search, ChevronDown, Check, X, MapPin, RadioTower } from 'lucide-react';
import { WhatIfSimulatorModal } from '../components/WhatIfSimulatorModal';

const STATION_DICTIONARY: Record<string, Partial<Station>> = {
  'AWS-101': { stationId: 'AWS-101', name: 'New Delhi IMD Headquarters', location: 'New Delhi, Delhi', latitude: 28.6139, longitude: 77.2090, elevation: 216 },
  'AWS-102': { stationId: 'AWS-102', name: 'Gurugram Cyber City AWS', location: 'Gurugram, Haryana', latitude: 28.4595, longitude: 77.0266, elevation: 220 },
  'AWS-103': { stationId: 'AWS-103', name: 'Noida Sector 62 AWS', location: 'Noida, Uttar Pradesh', latitude: 28.6280, longitude: 77.3649, elevation: 200 },
  'AWS-104': { stationId: 'AWS-104', name: 'Faridabad Industrial AWS', location: 'Faridabad, Haryana', latitude: 28.4089, longitude: 77.3178, elevation: 198 },
  'AWS-201': { stationId: 'AWS-201', name: 'Mumbai Colaba Observatory', location: 'Mumbai, Maharashtra', latitude: 18.9067, longitude: 72.8147, elevation: 15 },
  'AWS-202': { stationId: 'AWS-202', name: 'Pune Shivajinagar AWS', location: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567, elevation: 560 },
  'AWS-301': { stationId: 'AWS-301', name: 'Bengaluru IMD Center', location: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946, elevation: 920 },
  'AWS-401': { stationId: 'AWS-401', name: 'Chennai Nungambakkam AWS', location: 'Chennai, Tamil Nadu', latitude: 13.0604, longitude: 80.2496, elevation: 16 },
  'AWS-501': { stationId: 'AWS-501', name: 'Kolkata Alipore AWS', location: 'Kolkata, West Bengal', latitude: 22.5312, longitude: 88.3364, elevation: 9 },
  'AWS-601': { stationId: 'AWS-601', name: 'Hyderabad Begumpet AWS', location: 'Hyderabad, Telangana', latitude: 17.4435, longitude: 78.4688, elevation: 531 },
  'AWS-701': { stationId: 'AWS-701', name: 'Nagpur Central Meteorology Station', location: 'Nagpur, Maharashtra', latitude: 21.1492, longitude: 79.1613, elevation: 310 }
};

export const LiveMonitoring: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('AWS-701');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [openMeteoData, setOpenMeteoData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);

  // Searchable Station Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 1. Fetch available station list on mount
  useEffect(() => {
    let isMounted = true;
    fetchStations().then(sts => {
      if (!isMounted || !sts || sts.length === 0) return;
      setStations(sts);
      setSelectedStationId(prev => {
        const exists = sts.some(s => s.stationId === prev);
        return exists ? prev : sts[0].stationId;
      });
    }).catch(console.warn);

    return () => { isMounted = false; };
  }, []);

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

  // 2. Fetch observations & Open-Meteo data accurately when selectedStationId changes
  useEffect(() => {
    let isMounted = true;
    if (!selectedStationId) return;

    setOpenMeteoData(null);
    setLoadingWeather(true);

    // Run telemetry fetch and Open-Meteo satellite fetch in parallel for exact station
    Promise.allSettled([
      fetchStationObservations(selectedStationId, 30),
      fetchStationLiveWeather(selectedStationId)
    ]).then(([obsResult, weatherResult]) => {
      if (!isMounted) return;

      if (obsResult.status === 'fulfilled' && obsResult.value) {
        setObservations(obsResult.value);
      }
      if (weatherResult.status === 'fulfilled' && weatherResult.value?.openMeteo) {
        setOpenMeteoData(weatherResult.value.openMeteo);
      }
      setLoadingWeather(false);
    });

    const onUpdate = (data: any) => {
      if (!isMounted) return;
      if (data?.observations) {
        const stObs = data.observations.find((o: any) => o.stationId === selectedStationId);
        if (stObs) {
          setObservations(prev => {
            if (prev.length > 0 && prev[prev.length - 1].timestamp === stObs.timestamp) {
              return prev;
            }
            return [...prev.slice(-29), stObs];
          });
        }
      }
    };

    socket.on('weather_update', onUpdate);
    return () => {
      isMounted = false;
      socket.off('weather_update', onUpdate);
    };
  }, [selectedStationId]);

  // Precise Station Lookup with Dictionary Fallback
  const dictStation = STATION_DICTIONARY[selectedStationId];
  const selectedStation: Station = stations.find(s => s.stationId === selectedStationId) || {
    stationId: selectedStationId,
    name: dictStation?.name || selectedStationId,
    location: dictStation?.location || 'AWS Site',
    latitude: dictStation?.latitude || 21.1492,
    longitude: dictStation?.longitude || 79.1613,
    elevation: dictStation?.elevation || 210,
    status: 'NORMAL',
    healthScore: 98,
    sensorHealth: { temperature: 95, humidity: 95, pressure: 95, wind: 95, rainfall: 95 },
    rulDays: 420,
    lastSeen: new Date().toISOString()
  };

  // Station list for search menu
  const displayStations: Partial<Station>[] = stations.length > 0 ? stations : Object.values(STATION_DICTIONARY);
  const filteredStations = displayStations.filter(s =>
    (s.stationId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const latestObs = observations[observations.length - 1];
  const currentMeteo = openMeteoData?.current;
  const dailyMeteo = openMeteoData?.daily;

  const chartData = (observations || []).map(o => {
    let timeStr = '--:--:--';
    try {
      if (o?.timestamp) {
        timeStr = new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    } catch (e) {
      timeStr = '--:--:--';
    }
    return {
      time: timeStr,
      temperature: o?.temperature ?? null,
      humidity: o?.humidity ?? null,
      pressure: o?.pressure ?? null,
      windSpeed: o?.windSpeed ?? null,
      rainfall: o?.rainfall ?? null
    };
  });

  const hourlyChartData = (openMeteoData?.hourly?.time && Array.isArray(openMeteoData.hourly.time)) 
    ? openMeteoData.hourly.time.slice(0, 24).map((t: string, idx: number) => ({
        hour: typeof t === 'string' ? t.slice(11, 16) : `${idx}:00`,
        temp: openMeteoData?.hourly?.temperature_2m?.[idx] ?? null,
        humidity: openMeteoData?.hourly?.relative_humidity_2m?.[idx] ?? null,
        apparentTemp: openMeteoData?.hourly?.apparent_temperature?.[idx] ?? null,
        pressure: openMeteoData?.hourly?.surface_pressure?.[idx] ?? null,
        soilTemp: openMeteoData?.hourly?.soil_temperature_0cm?.[idx] ?? openMeteoData?.hourly?.soil_temperature_6cm?.[idx] ?? null
      })) 
    : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-sky-400 flex-shrink-0" />
            REAL-TIME TELEMETRY & OPEN-METEO SATELLITE RADAR
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Live multi-sensor telemetry stream augmented with real-world Open-Meteo satellite observations</p>
        </div>

        {/* Action Controls Container */}
        <div className="flex flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsWhatIfOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-mono font-bold transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>WHAT-IF SIMULATOR</span>
          </button>

          <button
            onClick={() => loadOpenMeteo(selectedStationId)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-lg text-xs font-mono transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 flex-shrink-0 ${loadingWeather ? 'animate-spin' : ''}`} />
            <span>SYNC METEO</span>
          </button>

          {/* MOBILE & DESKTOP FULLY RESPONSIVE SEARCHABLE STATION DROPDOWN */}
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 rounded-lg px-3 py-2 text-xs text-left transition-all font-mono shadow-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <RadioTower className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="font-bold text-sky-300">{selectedStation.stationId}</span>
                <span className="text-slate-200 truncate">— {selectedStation.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Backdrop Overlay */}
            {isDropdownOpen && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}

            {/* POPUP DROPDOWN MENU (Centered Fixed Modal on Mobile, Absolute Dropdown on Desktop) */}
            {isDropdownOpen && (
              <div className="fixed inset-x-3 top-20 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-96 bg-slate-950/98 backdrop-blur-2xl border border-sky-500/40 rounded-xl shadow-2xl z-50 overflow-hidden font-mono text-xs max-h-[75vh] flex flex-col">
                {/* Search Bar Input */}
                <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2">
                  <Search className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search station by ID, city, or state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent border-none text-slate-100 text-xs focus:outline-none placeholder-slate-500 font-mono"
                  />
                  {searchQuery ? (
                    <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-200">
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => setIsDropdownOpen(false)} className="p-1 text-slate-400 hover:text-slate-200 sm:hidden">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Stations List Selection */}
                <div className="overflow-y-auto divide-y divide-slate-800/80 flex-1">
                  {filteredStations.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No stations match "{searchQuery}"
                    </div>
                  ) : (
                    filteredStations.map((st) => {
                      const stId = st.stationId || '';
                      const isSelected = stId === selectedStationId;
                      return (
                        <button
                          key={stId}
                          onClick={() => {
                            setSelectedStationId(stId);
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className={`w-full p-3 text-left flex items-center justify-between transition-all touch-manipulation min-h-[48px] ${
                            isSelected
                              ? 'bg-sky-500/20 border-l-4 border-sky-400 text-slate-100 font-semibold'
                              : 'hover:bg-slate-900 text-slate-300 hover:text-slate-100 active:bg-slate-800'
                          }`}
                        >
                          <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sky-400">{stId}</span>
                              <span className="font-medium text-slate-200">{st.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                              <span className="truncate">{st.location}</span>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-sky-400 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WhatIfSimulatorModal isOpen={isWhatIfOpen} onClose={() => setIsWhatIfOpen(false)} />

      {/* Primary 5 Real-Time Sensor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="glass-card p-2.5 sm:p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
            <Thermometer className="w-4 h-4" /> TEMPERATURE
          </div>
          <span className="font-orbitron font-bold text-lg sm:text-xl text-slate-100">
            {latestObs?.temperature !== undefined ? `${latestObs.temperature}°C` : (currentMeteo?.temperature_2m !== undefined ? `${currentMeteo.temperature_2m}°C` : '28.0°C')}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Apparent: {currentMeteo?.apparent_temperature !== undefined ? `${currentMeteo.apparent_temperature}°C` : (openMeteoData?.hourly?.apparent_temperature?.[0] !== undefined ? `${openMeteoData.hourly.apparent_temperature[0]}°C` : '--')}
          </span>
        </div>

        <div className="glass-card p-2.5 sm:p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-semibold mb-1">
            <Droplets className="w-4 h-4" /> HUMIDITY
          </div>
          <span className="font-orbitron font-bold text-lg sm:text-xl text-slate-100">
            {latestObs?.humidity !== undefined ? `${latestObs.humidity}%` : (currentMeteo?.relative_humidity_2m !== undefined ? `${currentMeteo.relative_humidity_2m}%` : '65%')}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Vap. Deficit: {openMeteoData?.hourly?.vapour_pressure_deficit?.[0] !== undefined ? `${openMeteoData.hourly.vapour_pressure_deficit[0]} kPa` : '--'}
          </span>
        </div>

        <div className="glass-card p-2.5 sm:p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-semibold mb-1">
            <Gauge className="w-4 h-4" /> SURFACE PRESSURE
          </div>
          <span className="font-orbitron font-bold text-lg sm:text-xl text-slate-100">
            {latestObs?.pressure !== undefined ? latestObs.pressure : (currentMeteo?.surface_pressure ? currentMeteo.surface_pressure.toFixed(1) : '1012.0')}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            MSL: {currentMeteo?.pressure_msl ? `${currentMeteo.pressure_msl.toFixed(1)} hPa` : (openMeteoData?.hourly?.pressure_msl?.[0] ? `${openMeteoData.hourly.pressure_msl[0].toFixed(1)} hPa` : '--')}
          </span>
        </div>

        <div className="glass-card p-2.5 sm:p-3 rounded-xl border border-sky-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <Wind className="w-4 h-4" /> WIND SPEED & GUSTS
          </div>
          <span className="font-orbitron font-bold text-lg sm:text-xl text-slate-100">
            {latestObs?.windSpeed !== undefined ? `${latestObs.windSpeed} m/s` : (currentMeteo?.wind_speed_10m !== undefined ? `${currentMeteo.wind_speed_10m} m/s` : '12.0 m/s')}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Gusts: {currentMeteo?.wind_gusts_10m !== undefined ? `${currentMeteo.wind_gusts_10m} km/h` : '--'}
          </span>
        </div>

        <div className="glass-card p-2.5 sm:p-3 rounded-xl border border-sky-500/20 text-center col-span-2 md:col-span-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <CloudRain className="w-4 h-4" /> PRECIPITATION / RAIN
          </div>
          <span className="font-orbitron font-bold text-lg sm:text-xl text-slate-100">
            {latestObs?.rainfall !== undefined ? `${latestObs.rainfall} mm` : (currentMeteo?.precipitation !== undefined ? `${currentMeteo.precipitation} mm` : '0.0 mm')}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Cloud Cover: {currentMeteo?.cloud_cover !== undefined ? `${currentMeteo.cloud_cover}%` : '--'}
          </span>
        </div>
      </div>

      {/* OPEN-METEO SATELLITE & GEOPHYSICAL RADAR CARD */}
      <div className="glass-card p-3.5 sm:p-5 rounded-xl border border-cyan-500/30 bg-[#0a1426]/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-cyan-400 animate-pulse flex-shrink-0" />
            <h2 className="font-orbitron font-bold text-xs text-slate-100 uppercase tracking-wider">
              LIVE OPEN-METEO SATELLITE RADAR & GEOPHYSICAL TELEMETRY
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            COORDINATES: {selectedStation?.latitude !== undefined ? selectedStation.latitude.toFixed(4) : '21.1492'}°N, {selectedStation?.longitude !== undefined ? selectedStation.longitude.toFixed(4) : '79.1613'}°E ({selectedStation?.name || selectedStationId})
          </span>
        </div>

        {loadingWeather && !openMeteoData ? (
          <div className="p-6 text-center text-xs font-mono text-cyan-400 animate-pulse">
            📡 Fetching live Open-Meteo satellite weather telemetry for {selectedStation.name}...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 sm:gap-3 text-xs font-mono">
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> SOLAR RADIATION
              </span>
              <span className="font-bold text-slate-100 text-sm mt-1 block">
                {dailyMeteo?.shortwave_radiation_sum?.[0] !== undefined ? `${dailyMeteo.shortwave_radiation_sum[0]} MJ/m²` : '--'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">
                UV Max: {dailyMeteo?.uv_index_max?.[0] !== undefined ? dailyMeteo.uv_index_max[0] : '--'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" /> EVAPOTRANSPIRATION
              </span>
              <span className="font-bold text-slate-100 text-sm mt-1 block">
                {dailyMeteo?.et0_fao_evapotranspiration?.[0] !== undefined ? `${dailyMeteo.et0_fao_evapotranspiration[0]} mm` : '--'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">
                Vap. Def: {openMeteoData?.hourly?.vapour_pressure_deficit?.[0] !== undefined ? `${openMeteoData.hourly.vapour_pressure_deficit[0]} kPa` : '--'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-400" /> SOIL TEMP (0 / 6 / 54cm)
              </span>
              <span className="font-bold text-slate-100 text-xs mt-1 block">
                {openMeteoData?.hourly?.soil_temperature_0cm?.[0] !== undefined ? `${openMeteoData.hourly.soil_temperature_0cm[0]}°` : '--'} / {openMeteoData?.hourly?.soil_temperature_6cm?.[0] !== undefined ? `${openMeteoData.hourly.soil_temperature_6cm[0]}°` : '--'} / {openMeteoData?.hourly?.soil_temperature_54cm?.[0] !== undefined ? `${openMeteoData.hourly.soil_temperature_54cm[0]}°C` : '--'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" /> SOIL MOISTURE (1-3 / 9-27cm)
              </span>
              <span className="font-bold text-slate-100 text-xs mt-1 block">
                {openMeteoData?.hourly?.soil_moisture_1_to_3cm?.[0] !== undefined ? `${(openMeteoData.hourly.soil_moisture_1_to_3cm[0] * 100).toFixed(1)}%` : '--'} / {openMeteoData?.hourly?.soil_moisture_9_to_27cm?.[0] !== undefined ? `${(openMeteoData.hourly.soil_moisture_9_to_27cm[0] * 100).toFixed(1)}%` : '--'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-sky-400" /> DAYLIGHT & SUNSHINE
              </span>
              <span className="font-bold text-slate-100 text-xs mt-1 block">
                {dailyMeteo?.daylight_duration?.[0] !== undefined ? `${(dailyMeteo.daylight_duration[0] / 3600).toFixed(1)}h` : '--'} daylight / {dailyMeteo?.sunshine_duration?.[0] !== undefined ? `${(dailyMeteo.sunshine_duration[0] / 3600).toFixed(1)}h` : '--'} sun
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" /> WIND (80m / 180m)
              </span>
              <span className="font-bold text-slate-100 text-xs mt-1 block">
                {openMeteoData?.hourly?.wind_speed_80m?.[0] !== undefined ? `${openMeteoData.hourly.wind_speed_80m[0]} km/h` : '--'} / {openMeteoData?.hourly?.wind_speed_180m?.[0] !== undefined ? `${openMeteoData.hourly.wind_speed_180m[0]} km/h` : '--'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Open-Meteo Hourly Forecast Temperature & Apparent Temp Curve */}
        <div className="glass-card p-3 sm:p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-sky-400" /> OPEN-METEO 24-HOUR TEMPERATURE & APPARENT (°C)
          </h2>
          <div className="h-48 sm:h-56">
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
        <div className="glass-card p-3 sm:p-4 rounded-xl border border-sky-500/20">
          <h2 className="font-orbitron font-bold text-xs text-slate-100 mb-3 flex items-center gap-2">
            <Wind className="w-4 h-4 text-amber-400" /> REAL-TIME WIND SPEED TELEMETRY (M/S)
          </h2>
          <div className="h-48 sm:h-56">
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
