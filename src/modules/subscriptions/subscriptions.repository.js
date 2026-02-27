const db = require('../../database/db')

const findByCompany = async (company_id) => {
  const { rows } = await db.query(`
    SELECT s.*, p.name as package_name, p.history_days, p.max_vehicles
    FROM subscriptions s
    JOIN packages p ON p.id = s.package_id
    WHERE s.company_id = $1
    ORDER BY s.created_at DESC
  `, [company_id])
  return rows
}

const getActive = async (company_id) => {
  const { rows } = await db.query(`
    SELECT s.*, p.history_days, p.max_vehicles, p.name as package_name
    FROM subscriptions s
    JOIN packages p ON p.id = s.package_id
    WHERE s.company_id = $1 AND s.status = 'active' AND s.expired_at > NOW()
    LIMIT 1
  `, [company_id])
  return rows[0] || null
}

const create = async (data) => {
  const { company_id, package_id, months } = data
  const { rows } = await db.query(`
    INSERT INTO subscriptions (company_id, package_id, started_at, expired_at)
    VALUES ($1, $2, NOW(), NOW() + INTERVAL '1 month' * $3)
    RETURNING *
  `, [company_id, package_id, months])
  return rows[0]
}

const cancel = async (id) => {
  const { rows } = await db.query(
    "UPDATE subscriptions SET status='cancelled' WHERE id=$1 RETURNING *", [id]
  )
  return rows[0] || null
}

// Cron: expire old subscriptions
const expireOld = async () => {
  await db.query("UPDATE subscriptions SET status='expired' WHERE expired_at < NOW() AND status='active'")
}

module.exports = { findByCompany, getActive, create, cancel, expireOld }
