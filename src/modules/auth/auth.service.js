const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtConfig = require('../../config/jwt')
const repo = require('./auth.repository')
const db = require('../../database/db')

const login = async (email, password) => {
  const user = await repo.findByEmail(email)
  if (!user) throw { status: 401, message: 'Invalid email or password' }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw { status: 401, message: 'Invalid email or password' }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
    full_name: user.full_name,
  }

  const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })
  return { token, user: payload }
}

const getMe = async (userId) => {
  const user = await repo.findById(userId)
  if (!user) throw { status: 404, message: 'User not found' }
  return user
}
const deviceLogin = async (app_uuid) => {
  // 1. ค้นหาอุปกรณ์ด้วย UUID
  const { rows: devices } = await db.query('SELECT * FROM driver_devices WHERE app_uuid = $1', [app_uuid])
  
  // 2. ถ้าเครื่องนี้เพิ่งเคยเปิดแอปครั้งแรก ให้บันทึกรอแอดมินยืนยัน
  if (devices.length === 0) {
    await db.query('INSERT INTO driver_devices (app_uuid, is_verified) VALUES ($1, false)', [app_uuid])
    return { status: 'pending' }
  }

  const device = devices[0]

  // 3. ถ้าเครื่องมีในระบบ แต่แอดมินยังไม่กดยืนยัน
  if (!device.is_verified) {
    return { status: 'pending' }
  }

  // 4. ถ้ายืนยันแล้ว ดึงข้อมูล User มาออก Token
  const user = await repo.findById(device.user_id)
  if (!user) throw { status: 404, message: 'Driver profile not found' }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
    full_name: user.full_name,
    vehicle_id: device.vehicle_id // แนบ vehicle_id ไปใน token ให้เลยเพื่อความสะดวก
  }

  const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })
  return { token, user: payload, status: 'success' }
}

module.exports = { login, getMe, deviceLogin }
