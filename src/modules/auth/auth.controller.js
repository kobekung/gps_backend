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
const deviceLogin = async (req, res) => {
  try {
    const { app_uuid } = req.body
    const result = await service.deviceLogin(app_uuid)
    
    if (result.status === 'pending') {
      return res.status(202).json({ 
        success: false, 
        message: 'Device registered. Waiting for admin verification.' 
      })
    }
    
    return success(res, result, 'Auto login successful')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { login, getMe, deviceLogin }
