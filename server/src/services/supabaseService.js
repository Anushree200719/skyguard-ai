/**
 * SkyGuard AI - Backend Supabase Database Service
 * Provides non-blocking, high-performance PostgreSQL persistence for stations,
 * streaming telemetry observations, ML anomalies, trust scores, and smart alerts.
 */
const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
  constructor() {
    this.client = null;
    this.init();
  }

  init() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://zvnbfjwdivcrzzpwwgfs.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey && !supabaseKey.includes('YOUR_')) {
      try {
        this.client = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false }
        });
        console.log('⚡ [Supabase] Backend client initialized successfully.');
      } catch (err) {
        console.warn('⚠️ [Supabase] Backend initialization note:', err.message);
      }
    } else {
      console.log('ℹ️ [Supabase] Running with non-blocking Standalone MemoryStore fallback (Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL to connect).');
    }
  }

  isAvailable() {
    return !!this.client;
  }

  // ---------------------------------------------------------------------------
  // 1. AWS STATIONS
  // ---------------------------------------------------------------------------
  async fetchStations() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('stations')
        .select('*')
        .order('station_id', { ascending: true });
      
      if (error || !data) return null;

      return data.map(st => ({
        stationId: st.station_id,
        name: st.name,
        location: st.location,
        latitude: st.latitude,
        longitude: st.longitude,
        elevation: st.elevation,
        status: st.status,
        healthScore: st.health_score,
        rulDays: st.rul_days,
        trustScore: st.trust_score,
        lastSeen: st.updated_at || st.created_at
      }));
    } catch (e) {
      console.warn('[Supabase] fetchStations notice:', e.message);
      return null;
    }
  }

  async fetchStationById(stationId) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('stations')
        .select('*')
        .eq('station_id', stationId)
        .single();
      
      if (error || !data) return null;

      return {
        stationId: data.station_id,
        name: data.name,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        elevation: data.elevation,
        status: data.status,
        healthScore: data.health_score,
        rulDays: data.rul_days,
        trustScore: data.trust_score,
        lastSeen: data.updated_at || data.created_at
      };
    } catch (e) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 2. TELEMETRY OBSERVATIONS
  // ---------------------------------------------------------------------------
  async insertTelemetry(obs) {
    if (!this.client) return null;
    try {
      const record = {
        station_id: obs.stationId,
        timestamp: obs.timestamp ? new Date(obs.timestamp).toISOString() : new Date().toISOString(),
        temperature: obs.temperature ?? null,
        humidity: obs.humidity ?? null,
        pressure: obs.pressure ?? null,
        wind_speed: obs.windSpeed ?? null,
        wind_direction: obs.windDirection ?? null,
        rainfall: obs.rainfall ?? null,
        corrected_temperature: obs.correctedTemperature ?? obs.temperature,
        quality_flag: obs.qualityFlag || 'VALID',
        anomaly_score: obs.anomalyScore || 0.0
      };

      const { data, error } = await this.client
        .from('telemetry_observations')
        .insert([record])
        .select();

      if (error) console.warn('[Supabase] insertTelemetry notice:', error.message);
      return data ? data[0] : null;
    } catch (e) {
      return null;
    }
  }

  async fetchHistoricalTelemetry(stationId, startTime) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('telemetry_observations')
        .select('*')
        .eq('station_id', stationId)
        .gte('timestamp', new Date(startTime).toISOString())
        .order('timestamp', { ascending: true });

      if (error || !data) return null;

      return data.map(d => ({
        stationId: d.station_id,
        timestamp: d.timestamp,
        temperature: d.temperature,
        humidity: d.humidity,
        pressure: d.pressure,
        windSpeed: d.wind_speed,
        windDirection: d.wind_direction,
        rainfall: d.rainfall,
        correctedTemperature: d.corrected_temperature,
        qualityFlag: d.quality_flag,
        anomalyScore: d.anomaly_score
      }));
    } catch (e) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. ANOMALIES
  // ---------------------------------------------------------------------------
  async insertAnomaly(anom) {
    if (!this.client) return null;
    try {
      const record = {
        station_id: anom.stationId,
        timestamp: anom.timestamp ? new Date(anom.timestamp).toISOString() : new Date().toISOString(),
        sensor: anom.sensor || 'temperature',
        anomaly_type: anom.anomalyType || 'POSSIBLE_SENSOR_FAULT',
        severity: anom.severity || 'HIGH',
        anomaly_score: anom.anomalyScore || 0.0,
        confidence: anom.confidence || 0.94,
        original_value: anom.originalValue ?? null,
        corrected_value: anom.correctedValue ?? null,
        expected_range: anom.expectedRange || null,
        probable_cause: anom.probableCause || null,
        short_explanation: anom.shortExplanation || null
      };

      const { data, error } = await this.client
        .from('anomalies')
        .insert([record])
        .select();

      if (error) console.warn('[Supabase] insertAnomaly notice:', error.message);
      return data ? data[0] : null;
    } catch (e) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. ALERTS
  // ---------------------------------------------------------------------------
  async insertAlert(alert) {
    if (!this.client) return null;
    try {
      const record = {
        station_id: alert.stationId,
        station_name: alert.stationName || alert.stationId,
        sensor: alert.sensor || 'overall',
        title: alert.title,
        message: alert.message,
        level: alert.level || 'WARNING',
        explanation: alert.explanation || alert.aiExplanation || null,
        ai_confidence: alert.aiConfidence || 0.94,
        dedup_key: alert.dedupKey || null,
        acknowledged: alert.acknowledged || false,
        timestamp: alert.timestamp ? new Date(alert.timestamp).toISOString() : new Date().toISOString()
      };

      const { data, error } = await this.client
        .from('alerts')
        .insert([record])
        .select();

      if (error) console.warn('[Supabase] insertAlert notice:', error.message);
      return data ? data[0] : null;
    } catch (e) {
      return null;
    }
  }

  async acknowledgeAlert(alertId) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('alerts')
        .update({ acknowledged: true })
        .eq('id', alertId)
        .select();

      if (error) console.warn('[Supabase] acknowledgeAlert notice:', error.message);
      return data ? data[0] : null;
    } catch (e) {
      return null;
    }
  }
}

const supabaseService = new SupabaseService();
module.exports = supabaseService;
