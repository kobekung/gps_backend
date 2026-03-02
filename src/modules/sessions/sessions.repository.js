const db = require('../../database/db')

const getActive = async (driver_id) => {
  const { rows } = await db.query(
    "SELECT * FROM driver_sessions WHERE driver_id=$1 AND status='active' LIMIT 1",
    [driver_id]
  )
  return rows[0] || null
}

const getByCompany = async (company_id) => {
  // ดึง icon_type, color มาจากตาราง vehicles แทน
  const { rows } = await db.query(`
    SELECT ds.*, u.full_name as driver_name, v.license_plate, v.icon_type, v.color
    FROM driver_sessions ds
    JOIN users u ON u.id = ds.driver_id
    LEFT JOIN vehicles v ON v.id = ds.vehicle_id
    WHERE u.company_id = $1 AND ds.status = 'active'
    ORDER BY ds.checked_in_at DESC
  `, [company_id])
  return rows
}

const create = async (data) => {
  // เอา color, icon_type, photo_url ออก เพราะค่าพวกนี้ไปอยู่ที่ vehicles แล้ว
  const { driver_id, vehicle_id } = data 

  // End any existing active session first
  await db.query(
    "UPDATE driver_sessions SET status='ended', checked_out_at=NOW() WHERE driver_id=$1 AND status='active'",
    [driver_id]
  )
  
  // Insert แค่ driver_id และ vehicle_id
  const { rows } = await db.query(
    'INSERT INTO driver_sessions (driver_id, vehicle_id) VALUES ($1,$2) RETURNING *',
    [driver_id, vehicle_id]
  )
  return rows[0]
}

const end = async (session_id, driver_id) => {
  const { rows } = await db.query(
    "UPDATE driver_sessions SET status='ended', checked_out_at=NOW() WHERE id=$1 AND driver_id=$2 RETURNING *",
    [session_id, driver_id]
  )
  return rows[0] || null
}

module.exports = { getActive, getByCompany, create, end }