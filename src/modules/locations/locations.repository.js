const db = require('../../database/db')

const upsertLocation = async (data) => {
  const { vehicle_id, session_id, latitude, longitude, speed, heading, accuracy } = data
  await db.query(`
    INSERT INTO vehicle_locations (vehicle_id, session_id, latitude, longitude, speed, heading, accuracy, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
    ON CONFLICT (vehicle_id) DO UPDATE SET
      session_id=$2, latitude=$3, longitude=$4,
      speed=$5, heading=$6, accuracy=$7, updated_at=NOW()
  `, [vehicle_id, session_id, latitude, longitude, speed, heading, accuracy])
}

const insertHistory = async (data) => {
  const { vehicle_id, session_id, latitude, longitude, speed, heading, accuracy } = data
  await db.query(
    'INSERT INTO location_history (vehicle_id, session_id, latitude, longitude, speed, heading, accuracy) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [vehicle_id, session_id, latitude, longitude, speed, heading, accuracy]
  )
}

const getLiveByCompany = async (company_id) => {
  const { rows } = await db.query(`
    SELECT v.id, v.license_plate, v.vehicle_type, v.color, v.icon_type, v.photo_url,
           vl.latitude, vl.longitude, vl.speed, vl.heading, vl.updated_at,
           ds.status as session_status, ds.photo_url as driver_photo,
           u.full_name as driver_name
    FROM vehicles v
    JOIN vehicle_locations vl ON vl.vehicle_id = v.id
    LEFT JOIN driver_sessions ds ON ds.vehicle_id = v.id AND ds.status = 'active'
    LEFT JOIN users u ON u.id = ds.driver_id
    WHERE v.company_id = $1 AND v.is_active = true
  `, [company_id])
  return rows
}

const getHistory = async (vehicle_id, from, to) => {
  const { rows } = await db.query(
    'SELECT * FROM location_history WHERE vehicle_id=$1 AND recorded_at BETWEEN $2 AND $3 ORDER BY recorded_at ASC',
    [vehicle_id, from, to]
  )
  return rows
}

const cleanOldHistory = async (history_days) => {
  await db.query(
    'DELETE FROM location_history WHERE recorded_at < NOW() - INTERVAL \'1 day\' * $1',
    [history_days]
  )
}

module.exports = { upsertLocation, insertHistory, getLiveByCompany, getHistory, cleanOldHistory }
