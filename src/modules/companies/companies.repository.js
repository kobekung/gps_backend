const db = require('../../database/db')

const findAll = async () => {
  const { rows } = await db.query(`
    SELECT c.*, 
           COUNT(DISTINCT u.id) FILTER (WHERE u.role='admin') as admin_count,
           COUNT(DISTINCT v.id) as vehicle_count,
           s.status as subscription_status,
           p.name as package_name,
           s.expired_at
    FROM companies c
    LEFT JOIN users u ON u.company_id = c.id
    LEFT JOIN vehicles v ON v.company_id = c.id
    LEFT JOIN subscriptions s ON s.company_id = c.id AND s.status = 'active'
    LEFT JOIN packages p ON p.id = s.package_id
    GROUP BY c.id, s.status, p.name, s.expired_at
    ORDER BY c.created_at DESC
  `)
  return rows
}

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM companies WHERE id = $1', [id])
  return rows[0] || null
}

const create = async (data) => {
  const { name, code, logo_url } = data
  const { rows } = await db.query(
    'INSERT INTO companies (name, code, logo_url) VALUES ($1, $2, $3) RETURNING *',
    [name, code, logo_url]
  )
  return rows[0]
}

const update = async (id, data) => {
  const { name, code, logo_url, is_active } = data
  const { rows } = await db.query(
    `UPDATE companies SET name=COALESCE($1,name), code=COALESCE($2,code),
     logo_url=COALESCE($3,logo_url), is_active=COALESCE($4,is_active),
     updated_at=NOW() WHERE id=$5 RETURNING *`,
    [name, code, logo_url, is_active, id]
  )
  return rows[0] || null
}

module.exports = { findAll, findById, create, update }
