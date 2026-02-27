const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtConfig = require('../../config/jwt')
const repo = require('./auth.repository')

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

module.exports = { login, getMe }
