const cron = require('node-cron')
const db = require('./database/db')
const subRepo = require('./modules/subscriptions/subscriptions.repository')

function startCronJobs() {
  // Every hour: expire old subscriptions
  cron.schedule('0 * * * *', async () => {
    await subRepo.expireOld()
    console.log('[CRON] Expired subscriptions cleaned')
  })

  // Every day at midnight: clean location history beyond package limit
  cron.schedule('0 0 * * *', async () => {
    try {
      // For each company, clean history beyond their history_days
      const { rows } = await db.query(`
        SELECT s.company_id, p.history_days
        FROM subscriptions s
        JOIN packages p ON p.id = s.package_id
        WHERE s.status = 'active' AND p.history_days > 0
      `)
      for (const row of rows) {
        await db.query(`
          DELETE FROM location_history 
          WHERE vehicle_id IN (
            SELECT id FROM vehicles WHERE company_id = $1
          ) AND recorded_at < NOW() - INTERVAL '1 day' * $2
        `, [row.company_id, row.history_days])
      }
      // Also clean history for Basic (history_days=0) companies — delete all their history
      await db.query(`
        DELETE FROM location_history 
        WHERE vehicle_id IN (
          SELECT v.id FROM vehicles v
          JOIN companies c ON c.id = v.company_id
          JOIN subscriptions s ON s.company_id = c.id
          JOIN packages p ON p.id = s.package_id
          WHERE s.status='active' AND p.history_days = 0
        )
      `)
      console.log('[CRON] Location history cleaned')
    } catch (err) {
      console.error('[CRON] Error cleaning history:', err.message)
    }
  })
}

module.exports = { startCronJobs }
