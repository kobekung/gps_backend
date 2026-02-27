require('dotenv').config()
const db = require('./db')

const SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  code          VARCHAR(50) UNIQUE,
  logo_url      TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('superadmin','admin','driver')),
  full_name     VARCHAR(255),
  phone         VARCHAR(20),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- PACKAGES
CREATE TABLE IF NOT EXISTS packages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             VARCHAR(100) NOT NULL,
  description      TEXT,
  price_monthly    DECIMAL(10,2),
  max_vehicles     INT DEFAULT 10,
  history_days     INT DEFAULT 0,
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  package_id    UUID REFERENCES packages(id),
  started_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  expired_at    TIMESTAMP NOT NULL,
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  license_plate VARCHAR(20),
  vehicle_type  VARCHAR(50),
  color         VARCHAR(30),
  icon_type     VARCHAR(50) DEFAULT 'car',
  photo_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- DRIVER DEVICES (UUID จาก App)
CREATE TABLE IF NOT EXISTS driver_devices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  app_uuid        VARCHAR(255) UNIQUE,
  is_verified     BOOLEAN DEFAULT false,
  verified_by     UUID REFERENCES users(id),
  verified_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- DRIVER SESSIONS
CREATE TABLE IF NOT EXISTS driver_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  color           VARCHAR(30),
  icon_type       VARCHAR(50),
  photo_url       TEXT,
  checked_in_at   TIMESTAMP DEFAULT NOW(),
  checked_out_at  TIMESTAMP,
  status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','ended'))
);

-- VEHICLE LOCATIONS (latest only - overwrite)
CREATE TABLE IF NOT EXISTS vehicle_locations (
  vehicle_id    UUID PRIMARY KEY REFERENCES vehicles(id) ON DELETE CASCADE,
  session_id    UUID REFERENCES driver_sessions(id),
  latitude      DECIMAL(10,8) NOT NULL,
  longitude     DECIMAL(11,8) NOT NULL,
  speed         DECIMAL(5,2) DEFAULT 0,
  heading       DECIMAL(5,2) DEFAULT 0,
  accuracy      DECIMAL(6,2),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- LOCATION HISTORY (only for paid packages)
CREATE TABLE IF NOT EXISTS location_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id    UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  session_id    UUID REFERENCES driver_sessions(id),
  latitude      DECIMAL(10,8) NOT NULL,
  longitude     DECIMAL(11,8) NOT NULL,
  speed         DECIMAL(5,2) DEFAULT 0,
  heading       DECIMAL(5,2) DEFAULT 0,
  accuracy      DECIMAL(6,2),
  recorded_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_location_history_vehicle_time
  ON location_history(vehicle_id, recorded_at DESC);

-- ROUTES (KML/GeoJSON)
CREATE TABLE IF NOT EXISTS routes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  color         VARCHAR(20) DEFAULT '#FF0000',
  geojson       JSONB NOT NULL,
  kml_raw       TEXT,
  distance_km   DECIMAL(10,3),
  is_visible    BOOLEAN DEFAULT true,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
`

async function migrate() {
  try {
    console.log('Running migrations...')
    await db.query(SQL)
    console.log('✅ Migration complete')
    process.exit(0)
  } catch (err) {
    console.error('❌ Migration failed:', err)
    process.exit(1)
  }
}

migrate()
