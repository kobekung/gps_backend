const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')
const { error } = require('../utils/response')

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'No token provided', 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, jwtConfig.secret)
    req.user = decoded
    next()
  } catch (err) {
    return error(res, 'Invalid or expired token', 401)
  }
}

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return error(res, 'Forbidden: insufficient permissions', 403)
  }
  next()
}

module.exports = { authenticate, authorize }
