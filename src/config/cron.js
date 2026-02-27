const cron = require('node-cron');
const db = require('./db');

const initCrons = () => {
  // Run every day at 2 AM — clean old location history
  cron.schedule('0 2 * * *', async () => {
    console.log('⏰ Running location history cleanup...');
    try {
      // For each company, find their history_days and delete older records
      const companies = await db.query(`
        SELECT s.company_id, p.history_days
        FROM subscriptions s
        JOIN packages p ON s.package_id = p.id
        WHERE s.status = 'active' AND p.history_days > 0
      `);

      for (const row of companies.rows) {
        const deleted = await db.query(
          `DELETE FROM location_history
           WHERE vehicle_id IN (SELECT id FROM vehicles WHERE company_id = $1)
           AND recorded_at < NOW() - INTERVAL '${row.history_days} days'`,
          [row.company_id]
        );
        if (deleted.rowCount > 0) {
          console.log(`Deleted ${deleted.rowCount} old records for company ${row.company_id}`);
        }
      }

      // Also delete history for companies with NO active subscription (Basic / expired)
      await db.query(`
        DELETE FROM location_history
        WHERE vehicle_id IN (
          SELECT v.id FROM vehicles v
          JOIN companies c ON v.company_id = c.id
          LEFT JOIN subscriptions s ON s.company_id = c.id AND s.status = 'active' AND s.expired_at > NOW()
          LEFT JOIN packages p ON s.package_id = p.id
          WHERE p.history_days IS NULL OR p.history_days = 0
        )
      `);

      console.log('✅ Cleanup completed');
    } catch (err) {
      console.error('❌ Cleanup error:', err);
    }
  });

  // Every minute — mark expired subscriptions
  cron.schedule('* * * * *', async () => {
    await db.query(
      `UPDATE subscriptions SET status = 'expired'
       WHERE expired_at < NOW() AND status = 'active'`
    );
  });

  console.log('⏰ Cron jobs initialized');
};

module.exports = initCrons;
