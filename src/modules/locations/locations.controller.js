const service = require('./locations.service')
const { success, error } = require('../../utils/response')

const ping = async (req, res) => {
  try {
    await service.pingLocation(req.user.id, req.body)
    return success(res, null, 'Location updated')
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const getLive = async (req, res) => {
  try { return success(res, await service.getLive(req.user.company_id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const getHistory = async (req, res) => {
  try {
    const { from, to } = req.query
    const data = await service.getHistory(req.params.vehicleId, from, to)
    return success(res, data)
  } catch (err) { return error(res, err.message, err.status || 500) }
}

module.exports = { ping, getLive, getHistory }
