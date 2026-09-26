import React, { useState, useEffect, useRef } from 'react';
import { fetchStations, fetchStationObservations, fetchStationLiveWeather, fetchStationTrustScore, fetchStationOpenMeteoComparison, fetchStationSensorHealthDiagnostics, fetchStationXAIExplanation } from '../services/api';
import { socket } from '../services/socket';
import { Station, Observation, TrustScoreDetails, OpenMeteoComparisonResult, StationSensorHealthResult, XAIExplanationResult } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { LineChart as ChartIcon, Thermometer, Droplets, Gauge, Wind, CloudRain, Sun, Eye, Layers, Compass, Satellite, RefreshCw, Sliders, Search, ChevronDown, Check, X, MapPin, RadioTower, Sparkles, FileText } from 'lucide-react';
import { WhatIfSimulatorModal } from '../components/WhatIfSimulatorModal';
import { StationTrustCard } from '../components/StationTrustCard';
import { OpenMeteoComparisonCard } from '../components/OpenMeteoComparisonCard';
import { SensorHealthCard } from '../components/SensorHealthCard';
import { ExplainabilityModal } from '../components/ExplainabilityModal';

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
  const [trustDetails, setTrustDetails] = useState<TrustScoreDetails | null>(null);
  const [loadingTrust, setLoadingTrust] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<OpenMeteoComparisonResult | null>(null);
  const [loadingComparison, setLoadingComparison] = useState<boolean>(false);
  const [sensorHealthData, setSensorHealthData] = useState<StationSensorHealthResult | null>(null);
  const [loadingSensorHealth, setLoadingSensorHealth] = useState<boolean>(false);
  const [xaiExplanation, setXAIExplanation] = useState<XAIExplanationResult | null>(null);
  const [loadingXAI, setLoadingXAI] = useState<boolean>(false);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    let isMounted = true;
    if (!selectedStationId) return;

    setOpenMeteoData(null);
    setLoadingWeather(true);
    setLoadingTrust(true);
    setLoadingComparison(true);
    setLoadingSensorHealth(true);

    Promise.allSettled([
      fetchStationObservations(selectedStationId, 30),
      fetchStationLiveWeather(selectedStationId),
      fetchStationTrustScore(selectedStationId),
      fetchStationOpenMeteoComparison(selectedStationId),
      fetchStationSensorHealthDiagnostics(selectedStationId),
      fetchStationXAIExplanation(selectedStationId)
    ]).then(([obsResult, weatherResult, trustResult, compResult, healthResult, xaiResult]) => {
      if (!isMounted) return;

      if (obsResult.status === 'fulfilled' && obsResult.value) setObservations(obsResult.value);
      if (weatherResult.status === 'fulfilled' && weatherResult.value?.openMeteo) setOpenMeteoData(weatherResult.value.openMeteo);
      if (trustResult.status === 'fulfilled' && trustResult.value) setTrustDetails(trustResult.value);
      if (compResult.status === 'fulfilled' && compResult.value) setComparisonData(compResult.value);
      if (healthResult.status === 'fulfilled' && healthResult.value) setSensorHealthData(healthResult.value);
      if (xaiResult.status === 'fulfilled' && xaiResult.value) setXAIExplanation(xaiResult.value);

      setLoadingWeather(false);
      setLoadingTrust(false);
      setLoadingComparison(false);
      setLoadingSensorHealth(false);
      setLoadingXAI(false);
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
    <div className="space-y-4">
      {/* Header Container */}
      <div className="gov-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t-4 border-t-blue-900">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            <span>LIVE TELEMETRY STREAM</span>
            <span>•</span>
            <span>OPEN-METEO RADAR SYNC</span>
          </div>
          <h1 className="text-xl font-bold text-blue-950 flex items-center gap-2 mt-0.5">
            <ChartIcon className="w-5 h-5 text-blue-900 flex-shrink-0" />
            REAL-TIME AWS TELEMETRY MONITORING
          </h1>
          <p className="text-xs text-slate-600">Multi-sensor telemetry streaming augmented with satellite meteorological consensus</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExplainOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold uppercase transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SHAP EXPLANATION</span>
          </button>

          <button
            onClick={() => setIsWhatIfOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold uppercase transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-900" />
            <span>WHAT-IF SIMULATOR</span>
          </button>

          <button
            onClick={() => loadOpenMeteo(selectedStationId)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold uppercase transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-900 ${loadingWeather ? 'animate-spin' : ''}`} />
            <span>SYNC METEO</span>
          </button>

          {/* SEARCHABLE STATION DROPDOWN */}
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-mono"
            >
              <div className="flex items-center gap-1.5 truncate">
                <RadioTower className="w-4 h-4 text-blue-900 flex-shrink-0" />
                <span className="font-bold text-blue-900">{selectedStation.stationId}</span>
                <span className="text-slate-700 truncate">— {selectedStation.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-white border border-slate-300 rounded shadow-xl z-50 overflow-hidden font-mono text-xs max-h-72 flex flex-col text-slate-900">
                <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search station..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                  {filteredStations.map((st) => {
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
                        className={`w-full p-2 text-left flex items-center justify-between ${
                          isSelected ? 'bg-blue-50 text-blue-950 font-bold border-l-2 border-blue-900' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-bold text-blue-900">{stId}</span> — {st.name}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-900 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WhatIfSimulatorModal isOpen={isWhatIfOpen} onClose={() => setIsWhatIfOpen(false)} />

      {/* TRUST CARD */}
      <StationTrustCard station={selectedStation} trustDetails={trustDetails} loading={loadingTrust} />

      {/* SATELLITE COMPARISON CARD */}
      <OpenMeteoComparisonCard station={selectedStation} comparisonData={comparisonData} loading={loadingComparison} />

      {/* HARDWARE DIAGNOSTICS CARD */}
      <SensorHealthCard station={selectedStation} healthData={sensorHealthData} loading={loadingSensorHealth} />

      {/* 5 Real-Time Sensor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="gov-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-900 text-xs font-bold mb-1">
            <Thermometer className="w-4 h-4" /> TEMPERATURE
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">
            {latestObs?.temperature !== undefined ? `${latestObs.temperature}°C` : (currentMeteo?.temperature_2m !== undefined ? `${currentMeteo.temperature_2m}°C` : '28.0°C')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            Apparent: {currentMeteo?.apparent_temperature !== undefined ? `${currentMeteo.apparent_temperature}°C` : '--'}
          </span>
        </div>

        <div className="gov-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-cyan-800 text-xs font-bold mb-1">
            <Droplets className="w-4 h-4" /> HUMIDITY
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">
            {latestObs?.humidity !== undefined ? `${latestObs.humidity}%` : (currentMeteo?.relative_humidity_2m !== undefined ? `${currentMeteo.relative_humidity_2m}%` : '65%')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            Vapor Deficit: {openMeteoData?.hourly?.vapour_pressure_deficit?.[0] !== undefined ? `${openMeteoData.hourly.vapour_pressure_deficit[0]} kPa` : '--'}
          </span>
        </div>

        <div className="gov-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-indigo-900 text-xs font-bold mb-1">
            <Gauge className="w-4 h-4" /> PRESSURE
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">
            {latestObs?.pressure !== undefined ? latestObs.pressure : (currentMeteo?.surface_pressure ? currentMeteo.surface_pressure.toFixed(1) : '1012.0')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            MSL: {currentMeteo?.pressure_msl ? `${currentMeteo.pressure_msl.toFixed(1)} hPa` : '--'}
          </span>
        </div>

        <div className="gov-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-800 text-xs font-bold mb-1">
            <Wind className="w-4 h-4" /> WIND SPEED
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">
            {latestObs?.windSpeed !== undefined ? `${latestObs.windSpeed} m/s` : (currentMeteo?.wind_speed_10m !== undefined ? `${currentMeteo.wind_speed_10m} m/s` : '12.0 m/s')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            Gusts: {currentMeteo?.wind_gusts_10m !== undefined ? `${currentMeteo.wind_gusts_10m} km/h` : '--'}
          </span>
        </div>

        <div className="gov-card p-3 text-center col-span-2 md:col-span-1">
          <div className="flex items-center justify-center gap-1 text-emerald-800 text-xs font-bold mb-1">
            <CloudRain className="w-4 h-4" /> RAINFALL
          </div>
          <span className="font-mono font-bold text-xl text-slate-900">
            {latestObs?.rainfall !== undefined ? `${latestObs.rainfall} mm` : (currentMeteo?.precipitation !== undefined ? `${currentMeteo.precipitation} mm` : '0.0 mm')}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            Cloud Cover: {currentMeteo?.cloud_cover !== undefined ? `${currentMeteo.cloud_cover}%` : '--'}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="gov-card p-4">
          <h2 className="font-bold text-xs text-blue-950 uppercase mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-900" /> OPEN-METEO 24-HOUR FORECAST (°C)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', color: '#0f172a' }} />
                <Area type="monotone" dataKey="temp" name="Temperature" stroke="#1d4ed8" fill="#dbeafe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gov-card p-4">
          <h2 className="font-bold text-xs text-blue-950 uppercase mb-3 flex items-center gap-2">
            <Wind className="w-4 h-4 text-amber-800" /> REAL-TIME WIND TELEMETRY (M/S)
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', color: '#0f172a' }} />
                <Line type="monotone" dataKey="windSpeed" name="Wind Speed (m/s)" stroke="#b45309" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ExplainabilityModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        explanation={xaiExplanation}
        loading={loadingXAI}
      />
    </div>
  );
};
