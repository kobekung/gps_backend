const db = require('../../database/db')

const findDevicesByCompany = async (company_id) => {
  const { rows } = await db.query(`
    SELECT dd.*, u.full_name, u.email, v.license_plate
    FROM driver_devices dd
    JOIN users u ON u.id = dd.user_id
    LEFT JOIN vehicles v ON v.id = dd.vehicle_id
    WHERE u.company_id = $1
    ORDER BY dd.created_at DESC
  `, [company_id])
  return rows
}

const findDeviceByAppUUID = async (app_uuid) => {
  const { rows } = await db.query('SELECT * FROM driver_devices WHERE app_uuid = $1', [app_uuid])
  return rows[0] || null
}

const registerDevice = async (user_id, app_uuid) => {
  const { rows } = await db.query(
    'INSERT INTO driver_devices (user_id, app_uuid) VALUES ($1,$2) ON CONFLICT (app_uuid) DO UPDATE SET user_id=$1 RETURNING *',
    [user_id, app_uuid]
  )
  return rows[0]
}

const verifyDevice = async (app_uuid, vehicle_id, verified_by) => {
  const { rows } = await db.query(
    'UPDATE driver_devices SET is_verified=true, vehicle_id=$1, verified_by=$2, verified_at=NOW() WHERE app_uuid=$3 RETURNING *',
    [vehicle_id, verified_by, app_uuid]
  )
  
  return rows[0] || null
}

module.exports = { findDevicesByCompany, findDeviceByAppUUID, registerDevice, verifyDevice }
