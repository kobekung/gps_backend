require('dotenv').config();
const db = require('./db');

const migrate = async () => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Extensions
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ENUMS
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'driver');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE session_status AS ENUM ('active', 'ended');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // Companies
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name          VARCHAR(255) NOT NULL,
        code          VARCHAR(50) UNIQUE,
        logo_url      TEXT,
        is_active     BOOLEAN DEFAULT true,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      )
    `);

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id    UUID REFERENCES companies(id) ON DELETE SET NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role          user_role NOT NULL,
        full_name     VARCHAR(255),
        phone         VARCHAR(20),
        is_active     BOOLEAN DEFAULT true,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      )
    `);

    // Packages
    await client.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name             VARCHAR(100) NOT NULL,
        description      TEXT,
        price_monthly    DECIMAL(10,2) NOT NULL DEFAULT 0,
        max_vehicles     INT NOT NULL DEFAULT 10,
        history_days     INT NOT NULL DEFAULT 0,
        is_active        BOOLEAN DEFAULT true,
        created_at       TIMESTAMP DEFAULT NOW()
      )
    `);

    // Subscriptions
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
        package_id    UUID REFERENCES packages(id),
        started_at    TIMESTAMP NOT NULL DEFAULT NOW(),
        expired_at    TIMESTAMP NOT NULL,
        status        subscription_status DEFAULT 'active',
        created_at    TIMESTAMP DEFAULT NOW()
      )
    `);

    // Vehicles
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
        license_plate VARCHAR(20),
        vehicle_type  VARCHAR(50),
        color         VARCHAR(30),
        icon_type     VARCHAR(50),
        photo_url     TEXT,
        is_active     BOOLEAN DEFAULT true,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      )
    `);

    // Driver Devices (UUID linking)
    await client.query(`
      CREATE TABLE IF NOT EXISTS driver_devices (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id      UUID REFERENCES vehicles(id) ON DELETE SET NULL,
        app_uuid        VARCHAR(255) UNIQUE NOT NULL,
        is_verified     BOOLEAN DEFAULT false,
        verified_by     UUID REFERENCES users(id),
        verified_at     TIMESTAMP,
        created_at      TIMESTAMP DEFAULT NOW()
      )
    `);

    // Driver Sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS driver_sessions (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        driver_id       UUID REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id      UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        color           VARCHAR(30),
        icon_type       VARCHAR(50),
        photo_url       TEXT,
        checked_in_at   TIMESTAMP DEFAULT NOW(),
        checked_out_at  TIMESTAMP,
        status          session_status DEFAULT 'active'
      )
    `);

    // Vehicle Locations (latest only - overwrite)
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_locations (
        vehicle_id    UUID PRIMARY KEY REFERENCES vehicles(id) ON DELETE CASCADE,
        session_id    UUID REFERENCES driver_sessions(id),
        driver_id     UUID REFERENCES users(id),
        latitude      DECIMAL(10, 8) NOT NULL,
        longitude     DECIMAL(11, 8) NOT NULL,
        speed         DECIMAL(5,2) DEFAULT 0,
        heading       DECIMAL(5,2) DEFAULT 0,
        accuracy      DECIMAL(6,2),
        updated_at    TIMESTAMP DEFAULT NOW()
      )
    `);

    // Location History (package with history_days > 0)
    await client.query(`
      CREATE TABLE IF NOT EXISTS location_history (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vehicle_id    UUID REFERENCES vehicles(id) ON DELETE CASCADE,
        session_id    UUID REFERENCES driver_sessions(id),
        driver_id     UUID REFERENCES users(id),
        latitude      DECIMAL(10, 8) NOT NULL,
        longitude     DECIMAL(11, 8) NOT NULL,
        speed         DECIMAL(5,2) DEFAULT 0,
        heading       DECIMAL(5,2) DEFAULT 0,
        accuracy      DECIMAL(6,2),
        recorded_at   TIMESTAMP DEFAULT NOW()
      )
    `);

    // Routes
    await client.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
        name          VARCHAR(255) NOT NULL,
        description   TEXT,
        color         VARCHAR(20) DEFAULT '#FF0000',
        geojson       JSONB NOT NULL,
        is_visible    BOOLEAN DEFAULT true,
        created_by    UUID REFERENCES users(id),
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      )
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_location_history_vehicle_time 
        ON location_history(vehicle_id, recorded_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
      CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_driver ON driver_sessions(driver_id);
      CREATE INDEX IF NOT EXISTS idx_driver_devices_uuid ON driver_devices(app_uuid);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');

    // Seed default packages
    await client.query(`
      INSERT INTO packages (name, description, price_monthly, max_vehicles, history_days)
      VALUES 
        ('Basic', 'ติดตามแบบ Real-time ไม่เก็บประวัติ', 299, 5, 0),
        ('History 7', 'เก็บประวัติ GPS 7 วัน', 599, 10, 7),
        ('History 30', 'เก็บประวัติ GPS 30 วัน', 999, 20, 30),
        ('History 90', 'เก็บประวัติ GPS 90 วัน', 1999, 50, 90)
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Default packages seeded');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    process.exit(0);
  }
};

migrate();
