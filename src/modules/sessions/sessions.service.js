const repo = require('./sessions.repository')
const driverRepo = require('../drivers/drivers.repository')

const getActiveSession = (driver_id) => repo.getActive(driver_id)

const getActiveSessions = (company_id) => repo.getByCompany(company_id)

const checkIn = async (driver_id, data) => {
  // Verify driver device
  const device = await driverRepo.findDeviceByAppUUID(data.app_uuid)
  if (!device || !device.is_verified) {
    throw { status: 403, message: 'Device not verified. Please contact admin.' }
  }
  return repo.create({ driver_id, vehicle_id: device.vehicle_id, ...data })
}

const checkOut = async (session_id, driver_id) => {
  const session = await repo.end(session_id, driver_id)
  if (!session) throw { status: 404, message: 'Active session not found' }
  return session
}

module.exports = { getActiveSession, getActiveSessions, checkIn, checkOut }
