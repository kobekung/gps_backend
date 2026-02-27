const service = require('./auth.service')
const { success, error } = require('../../utils/response')

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    console.log(email, password);
    
    const result = await service.login(email, password)
    return success(res, result, 'Login successful')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const getMe = async (req, res) => {
  try {
    const user = await service.getMe(req.user.id)
    return success(res, user)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { login, getMe }
