const repo = require('./sessions.repository')
const driverRepo = require('../drivers/drivers.repository')
const db = require('../../database/db') // นำเข้า db เพื่ออัปเดตตารางรถ

const getActiveSession = (driver_id) => repo.getActive(driver_id)

const getActiveSessions = (company_id) => repo.getByCompany(company_id)

const checkIn = async (driver_id, data) => {
  // 1. ตรวจสอบว่าเครื่องนี้ยืนยันหรือยัง
  const device = await driverRepo.findDeviceByAppUUID(data.app_uuid)
  if (!device || !device.is_verified) {
    throw { status: 403, message: 'Device not verified. Please contact admin.' }
  }

  // 2. นำสี, ไอคอน, และรูปภาพ ไปอัปเดตให้กับรถคันนี้ (ในตาราง vehicles)
  const { color, icon_type, photo_url } = data
  if (color || icon_type || photo_url) {
    await db.query(
      `UPDATE vehicles 
       SET color = COALESCE($1, color), 
           icon_type = COALESCE($2, icon_type), 
           photo_url = COALESCE($3, photo_url),
           updated_at = NOW()
       WHERE id = $4`,
      [color, icon_type, photo_url, device.vehicle_id]
    )
  }

  // 3. สร้าง Session เริ่มรอบ (ส่งไปแค่ driver_id กับ vehicle_id ตามที่แก้ไว้)
  return repo.create({ driver_id, vehicle_id: device.vehicle_id })
}

const checkOut = async (session_id, driver_id) => {
  const session = await repo.end(session_id, driver_id)
  if (!session) throw { status: 404, message: 'Active session not found' }
  return session
}

module.exports = { getActiveSession, getActiveSessions, checkIn, checkOut }