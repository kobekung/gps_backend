const db = require('../../database/db')

const findByCompany = async (company_id) => {
  const { rows } = await db.query(
    'SELECT id, email, role, full_name, phone, is_active, created_at FROM users WHERE company_id = $1 ORDER BY created_at DESC',
    [company_id]
  )
  return rows
}

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id])
  return rows[0] || null
}

const create = async (data) => {
  const { company_id, email, password_hash, role, full_name, phone } = data
  const { rows } = await db.query(
    'INSERT INTO users (company_id, email, password_hash, role, full_name, phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, role, full_name, phone',
    [company_id, email, password_hash, role, full_name, phone]
  )
  return rows[0]
}

const update = async (id, data) => {
  const { full_name, phone, is_active } = data
  const { rows } = await db.query(
    'UPDATE users SET full_name=COALESCE($1,full_name), phone=COALESCE($2,phone), is_active=COALESCE($3,is_active), updated_at=NOW() WHERE id=$4 RETURNING id, email, role, full_name, phone, is_active',
    [full_name, phone, is_active, id]
  )
  return rows[0] || null
}

module.exports = { findByCompany, findById, create, update }
