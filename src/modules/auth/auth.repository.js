const db = require('../../database/db')

const findByEmail = async (email) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [email]
  )
  return rows[0] || null
}

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT u.id, u.email, u.role, u.full_name, u.phone, u.company_id, u.is_active,
            c.name as company_name
     FROM users u
     LEFT JOIN companies c ON c.id = u.company_id
     WHERE u.id = $1`,
    [id]
  )
  return rows[0] || null
}

module.exports = { findByEmail, findById }
