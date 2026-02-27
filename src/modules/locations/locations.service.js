const repo = require('./locations.repository')
const subRepo = require('../subscriptions/subscriptions.repository')
const driverRepo = require('../drivers/drivers.repository')
const sessionRepo = require('../sessions/sessions.repository')

const pingLocation = async (driver_id, data) => {
  // Get active session
  const session = await sessionRepo.getActive(driver_id)
  if (!session) throw { status: 400, message: 'No active session. Please check in first.' }

  const locationData = { ...data, vehicle_id: session.vehicle_id, session_id: session.id }

  // Always update latest location
  await repo.upsertLocation(locationData)

  // Check subscription for history
  const device = await driverRepo.findDeviceByAppUUID(data.app_uuid)
  if (device) {
    // Get company via vehicle
    const { rows } = await require('../../database/db').query(
      'SELECT company_id FROM vehicles WHERE id=$1', [session.vehicle_id]
    )
    if (rows[0]) {
      const sub = await subRepo.getActive(rows[0].company_id)
      if (sub && sub.history_days > 0) {
        await repo.insertHistory(locationData)
      }
    }
  }
  return { ok: true }
}

const getLive = (company_id) => repo.getLiveByCompany(company_id)

const getHistory = async (vehicle_id, from, to) => {
  return repo.getHistory(vehicle_id, from || new Date(Date.now() - 86400000), to || new Date())
}

module.exports = { pingLocation, getLive, getHistory }
