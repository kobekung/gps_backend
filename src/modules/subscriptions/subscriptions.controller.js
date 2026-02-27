const service = require('./subscriptions.service')
const { success, error } = require('../../utils/response')

const getByCompany = async (req, res) => {
  try {
    const company_id = req.user.role === 'superadmin' ? req.params.companyId : req.user.company_id
    return success(res, await service.getByCompany(company_id))
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const getActive = async (req, res) => {
  try {
    return success(res, await service.getActive(req.user.company_id))
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const subscribe = async (req, res) => {
  try {
    const company_id = req.user.company_id
    const { package_id, months } = req.body
    const data = await service.subscribe(company_id, package_id, months)
    return success(res, data, 'Subscription created', 201)
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const cancel = async (req, res) => {
  try {
    return success(res, await service.cancel(req.params.id), 'Subscription cancelled')
  } catch (err) { return error(res, err.message, err.status || 500) }
}

module.exports = { getByCompany, getActive, subscribe, cancel }
