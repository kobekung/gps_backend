const db = require('../../database/db')

const findByCompany = async (company_id) => {
  const { rows } = await db.query(`
    SELECT v.*, 
           vl.latitude, vl.longitude, vl.speed, vl.heading, vl.updated_at as location_updated_at,
           ds.status as session_status, ds.driver_id,
           u.full_name as driver_name
    FROM vehicles v
    LEFT JOIN vehicle_locations vl ON vl.vehicle_id = v.id
    LEFT JOIN driver_sessions ds ON ds.vehicle_id = v.id AND ds.status = 'active'
    LEFT JOIN users u ON u.id = ds.driver_id
    WHERE v.company_id = $1 AND v.is_active = true
    ORDER BY v.created_at DESC
  `, [company_id])
  return rows
}

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM vehicles WHERE id = $1', [id])
  return rows[0] || null
}

const create = async (data) => {
  const { company_id, license_plate, vehicle_type, color, icon_type } = data
  const { rows } = await db.query(
    'INSERT INTO vehicles (company_id, license_plate, vehicle_type, color, icon_type) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [company_id, license_plate, vehicle_type, color, icon_type]
  )
  return rows[0]
}

const update = async (id, data) => {
  const { license_plate, vehicle_type, color, icon_type, photo_url, is_active } = data
  const { rows } = await db.query(
    'UPDATE vehicles SET license_plate=COALESCE($1,license_plate), vehicle_type=COALESCE($2,vehicle_type), color=COALESCE($3,color), icon_type=COALESCE($4,icon_type), photo_url=COALESCE($5,photo_url), is_active=COALESCE($6,is_active), updated_at=NOW() WHERE id=$7 RETURNING *',
    [license_plate, vehicle_type, color, icon_type, photo_url, is_active, id]
  )
  return rows[0] || null
}

module.exports = { findByCompany, findById, create, update }
