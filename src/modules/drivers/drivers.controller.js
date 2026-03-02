const service = require('./drivers.service')
const { success, error } = require('../../utils/response')

const getDevices = async (req, res) => {
  try { return success(res, await service.getDevicesByCompany(req.user.company_id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const registerDevice = async (req, res) => {
  try {
    const { app_uuid } = req.body
    const data = await service.registerDevice(req.user.id, app_uuid)
    return success(res, data, 'Device registered')
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const verifyDevice = async (req, res) => {
  try {
    const { app_uuid, vehicle_id } = req.body
    
    // 🔴 สิ่งที่แก้: เพิ่ม req.user.company_id ในตำแหน่งที่ 3 และ req.user.id (คนอนุมัติ) ในตำแหน่งที่ 4
    const data = await service.verifyDevice(
      app_uuid, 
      vehicle_id, 
      req.user.company_id, 
      req.user.id
    )
    
    return success(res, data, 'Device verified')
  } catch (err) { 
    return error(res, err.message, err.status || 500) 
  }
}

module.exports = { getDevices, registerDevice, verifyDevice }