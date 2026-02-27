const db = require('../../database/db')

const findByCompany = async (company_id) => {
  const { rows } = await db.query(
    'SELECT id, name, description, color, distance_km, is_visible, created_at FROM routes WHERE company_id=$1 ORDER BY created_at DESC',
    [company_id]
  )
  return rows
}

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM routes WHERE id=$1', [id])
  return rows[0] || null
}

const create = async (data) => {
  const { company_id, name, description, color, geojson, kml_raw, distance_km, created_by } = data
  const { rows } = await db.query(
    'INSERT INTO routes (company_id, name, description, color, geojson, kml_raw, distance_km, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
    [company_id, name, description, color, JSON.stringify(geojson), kml_raw, distance_km, created_by]
  )
  return rows[0]
}

const update = async (id, data) => {
  const { name, description, color, is_visible } = data
  const { rows } = await db.query(
    'UPDATE routes SET name=COALESCE($1,name), description=COALESCE($2,description), color=COALESCE($3,color), is_visible=COALESCE($4,is_visible), updated_at=NOW() WHERE id=$5 RETURNING *',
    [name, description, color, is_visible, id]
  )
  return rows[0] || null
}

const remove = async (id) => {
  await db.query('DELETE FROM routes WHERE id=$1', [id])
}

module.exports = { findByCompany, findById, create, update, remove }
