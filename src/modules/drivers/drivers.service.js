const repo = require('./drivers.repository')

const getDevicesByCompany = (company_id) => repo.findDevicesByCompany(company_id)

const registerDevice = async (user_id, app_uuid) => {
  return repo.registerDevice(user_id, app_uuid)
}

const verifyDevice = async (app_uuid, vehicle_id, verified_by) => {
  const device = await repo.verifyDevice(app_uuid, vehicle_id, verified_by)
  if (!device) throw { status: 404, message: 'Device with that UUID not found' }
  return device
}

module.exports = { getDevicesByCompany, registerDevice, verifyDevice }
