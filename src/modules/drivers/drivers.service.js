const repo = require('./drivers.repository')
const bcrypt = require('bcryptjs')
const db = require('../../database/db')
const usersRepo = require('../users/users.repository')

const getDevicesByCompany = (company_id) => repo.findDevicesByCompany(company_id)

const registerDevice = async (user_id, app_uuid) => {
  return repo.registerDevice(user_id, app_uuid)
}

// const verifyDevice = async (app_uuid, vehicle_id, verified_by) => {
//   const device = await repo.verifyDevice(app_uuid, vehicle_id, verified_by)
//   if (!device) throw { status: 404, message: 'Device with that UUID not found' }
//   return device
// }
const verifyDevice = async (app_uuid, vehicle_id, company_id, verified_by) => {
  // 🔴 สิ่งที่แก้: เอา .substring(0,8) ออก เพื่อใช้ app_uuid เต็มๆ ป้องกันการซ้ำ
  const dummyEmail = `driver_${app_uuid}@system.local`
  const dummyPassword = await bcrypt.hash(app_uuid, 10)
  
  const newUser = await usersRepo.create({
    company_id: company_id,
    email: dummyEmail,
    password_hash: dummyPassword,
    role: 'driver',
    full_name: null, // ปล่อยว่างไว้ให้คนขับไปตั้งเอง
    phone: null
  })

  // อัปเดตตาราง driver_devices 
  const device = await db.query(`
    UPDATE driver_devices 
    SET is_verified = true, verified_by = $1, verified_at = NOW(), user_id = $2, vehicle_id = $3
    WHERE app_uuid = $4 RETURNING *
  `, [verified_by, newUser.id, vehicle_id, app_uuid])

  return device.rows[0]
}

module.exports = { getDevicesByCompany, registerDevice, verifyDevice }
