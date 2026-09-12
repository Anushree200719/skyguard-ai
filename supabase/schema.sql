-- ============================================================================
-- SKYGUARD AI - SUPABASE POSTGRESQL DATABASE SCHEMA & RLS POLICIES
-- Project URL: https://zvnbfjwdivcrzzpwwgfs.supabase.co
-- ============================================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. AWS STATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  elevation DOUBLE PRECISION DEFAULT 0.0,
  status VARCHAR(50) DEFAULT 'NORMAL',
  health_score INT DEFAULT 98,
  rul_days INT DEFAULT 420,
  trust_score INT DEFAULT 95,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. TELEMETRY OBSERVATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.telemetry_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id VARCHAR(50) NOT NULL REFERENCES public.stations(station_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  pressure DOUBLE PRECISION,
  wind_speed DOUBLE PRECISION,
  wind_direction INT,
  rainfall DOUBLE PRECISION,
  corrected_temperature DOUBLE PRECISION,
  quality_flag VARCHAR(50) DEFAULT 'VALID',
  anomaly_score DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- High-performance B-tree index for time-series range queries
CREATE INDEX IF NOT EXISTS idx_telemetry_station_timestamp 
ON public.telemetry_observations (station_id, timestamp DESC);

-- ----------------------------------------------------------------------------
-- 3. ANOMALIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id VARCHAR(50) NOT NULL REFERENCES public.stations(station_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sensor VARCHAR(50) DEFAULT 'temperature',
  anomaly_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  anomaly_score DOUBLE PRECISION DEFAULT 0.0,
  confidence DOUBLE PRECISION DEFAULT 0.94,
  original_value DOUBLE PRECISION,
  corrected_value DOUBLE PRECISION,
  expected_range VARCHAR(100),
  probable_cause TEXT,
  short_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomalies_station_timestamp 
ON public.anomalies (station_id, timestamp DESC);

-- ----------------------------------------------------------------------------
-- 4. TRUST SCORES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id VARCHAR(50) NOT NULL REFERENCES public.stations(station_id) ON DELETE CASCADE,
  overall_score INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  formula_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trust_scores_station_created 
ON public.trust_scores (station_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. ALERTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id VARCHAR(50) NOT NULL REFERENCES public.stations(station_id) ON DELETE CASCADE,
  station_name VARCHAR(255),
  sensor VARCHAR(50) DEFAULT 'overall',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  level VARCHAR(50) NOT NULL,
  explanation TEXT,
  ai_confidence DOUBLE PRECISION DEFAULT 0.94,
  dedup_key VARCHAR(255),
  acknowledged BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_station_ack_timestamp 
ON public.alerts (station_id, acknowledged, timestamp DESC);

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) & POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Narrowly scoped Public Read Access policies for browser frontend
CREATE POLICY "Public Read Stations" ON public.stations FOR SELECT USING (true);
CREATE POLICY "Public Read Telemetry" ON public.telemetry_observations FOR SELECT USING (true);
CREATE POLICY "Public Read Anomalies" ON public.anomalies FOR SELECT USING (true);
CREATE POLICY "Public Read TrustScores" ON public.trust_scores FOR SELECT USING (true);
CREATE POLICY "Public Read Alerts" ON public.alerts FOR SELECT USING (true);

-- Public update policy for acknowledging alerts
CREATE POLICY "Public Update Alert Acknowledge" ON public.alerts 
FOR UPDATE USING (true) WITH CHECK (true);

-- Backend Service Role Mutation Policies (Service Role / Full API Access)
CREATE POLICY "Service Role Insert Stations" ON public.stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Service Role Update Stations" ON public.stations FOR UPDATE USING (true);

CREATE POLICY "Service Role Insert Telemetry" ON public.telemetry_observations FOR INSERT WITH CHECK (true);
CREATE POLICY "Service Role Insert Anomalies" ON public.anomalies FOR INSERT WITH CHECK (true);
CREATE POLICY "Service Role Insert TrustScores" ON public.trust_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Service Role Insert Alerts" ON public.alerts FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. INITIAL AWS STATIONS SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO public.stations (station_id, name, location, latitude, longitude, elevation, status, health_score, rul_days, trust_score)
VALUES
  ('AWS-101', 'New Delhi IMD Headquarters', 'New Delhi, Delhi', 28.6139, 77.2090, 216, 'NORMAL', 98, 420, 98),
  ('AWS-102', 'Gurugram Cyber City AWS', 'Gurugram, Haryana', 28.4595, 77.0266, 220, 'NORMAL', 95, 380, 95),
  ('AWS-103', 'Noida Sector 62 AWS', 'Noida, Uttar Pradesh', 28.6280, 77.3649, 200, 'NORMAL', 94, 350, 94),
  ('AWS-104', 'Faridabad Industrial AWS', 'Faridabad, Haryana', 28.4089, 77.3178, 198, 'NORMAL', 92, 310, 92),
  ('AWS-201', 'Mumbai Colaba Observatory', 'Mumbai, Maharashtra', 18.9067, 72.8147, 15, 'NORMAL', 99, 490, 99),
  ('AWS-202', 'Pune Shivajinagar AWS', 'Pune, Maharashtra', 18.5204, 73.8567, 560, 'NORMAL', 96, 410, 96),
  ('AWS-301', 'Bengaluru IMD Center', 'Bengaluru, Karnataka', 12.9716, 77.5946, 920, 'NORMAL', 100, 520, 100),
  ('AWS-401', 'Chennai Nungambakkam AWS', 'Chennai, Tamil Nadu', 13.0604, 80.2496, 16, 'NORMAL', 97, 430, 97),
  ('AWS-501', 'Kolkata Alipore AWS', 'Kolkata, West Bengal', 22.5312, 88.3364, 9, 'NORMAL', 95, 370, 95),
  ('AWS-601', 'Hyderabad Begumpet AWS', 'Hyderabad, Telangana', 17.4435, 78.4688, 531, 'NORMAL', 98, 460, 98),
  ('AWS-701', 'Nagpur Central Meteorology Station', 'Nagpur, Maharashtra', 21.1492, 79.1613, 310, 'NORMAL', 99, 480, 99)
ON CONFLICT (station_id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  elevation = EXCLUDED.elevation,
  updated_at = NOW();
