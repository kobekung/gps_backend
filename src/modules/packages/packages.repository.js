const db = require('../../database/db')

const findAll = async () => {
  const { rows } = await db.query('SELECT * FROM packages WHERE is_active = true ORDER BY price_monthly')
  return rows
}

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM packages WHERE id = $1', [id])
  return rows[0] || null
}

const create = async (data) => {
  const { name, description, price_monthly, max_vehicles, history_days } = data
  const { rows } = await db.query(
    'INSERT INTO packages (name, description, price_monthly, max_vehicles, history_days) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, description, price_monthly, max_vehicles, history_days]
  )
  return rows[0]
}

const update = async (id, data) => {
  const { name, description, price_monthly, max_vehicles, history_days, is_active } = data
  const { rows } = await db.query(
    'UPDATE packages SET name=COALESCE($1,name), description=COALESCE($2,description), price_monthly=COALESCE($3,price_monthly), max_vehicles=COALESCE($4,max_vehicles), history_days=COALESCE($5,history_days), is_active=COALESCE($6,is_active) WHERE id=$7 RETURNING *',
    [name, description, price_monthly, max_vehicles, history_days, is_active, id]
  )
  return rows[0] || null
}

module.exports = { findAll, findById, create, update }
