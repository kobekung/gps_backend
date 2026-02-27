require('dotenv').config()
const db = require('./db')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

async function seed() {
  try {
    // Seed packages
    await db.query(`
      INSERT INTO packages (name, description, price_monthly, max_vehicles, history_days)
      VALUES
        ('Basic', 'Live tracking only, no history', 299.00, 5, 0),
        ('History 7', 'Live + 7 days history', 599.00, 10, 7),
        ('History 30', 'Live + 30 days history', 999.00, 25, 30),
        ('History 90', 'Live + 90 days history', 1999.00, 100, 90)
      ON CONFLICT DO NOTHING
    `)

    // Seed superadmin
    const hash = await bcrypt.hash('superadmin123', 12)
    await db.query(`
      INSERT INTO users (email, password_hash, role, full_name)
      VALUES ('superadmin@gps.com', $1, 'superadmin', 'Super Admin')
      ON CONFLICT (email) DO NOTHING
    `, [hash])

    console.log('✅ Seed complete')
    console.log('   SuperAdmin: superadmin@gps.com / superadmin123')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  }
}

seed()
