const service = require('./sessions.service')
const { success, error } = require('../../utils/response')
const { imageUpload } = require('../../config/upload')

const getActive = async (req, res) => {
  try { return success(res, await service.getActiveSession(req.user.id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const getActiveSessions = async (req, res) => {
  try { return success(res, await service.getActiveSessions(req.user.company_id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const checkIn = async (req, res) => {
  try {
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null
    const data = await service.checkIn(req.user.id, { ...req.body, photo_url })
    return success(res, data, 'Checked in successfully', 201)
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const checkOut = async (req, res) => {
  try {
    const data = await service.checkOut(req.params.sessionId, req.user.id)
    return success(res, data, 'Checked out successfully')
  } catch (err) { return error(res, err.message, err.status || 500) }
}

module.exports = { getActive, getActiveSessions, checkIn, checkOut }
