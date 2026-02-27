const service = require('./companies.service')
const { success, error } = require('../../utils/response')

const getAll = async (req, res) => {
  try {
    const data = await service.getAllCompanies()
    return success(res, data)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const getById = async (req, res) => {
  try {
    const data = await service.getCompanyById(req.params.id)
    return success(res, data)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const create = async (req, res) => {
  try {
    const data = await service.createCompanyWithAdmin(req.body)
    return success(res, data, 'Company and admin created', 201)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const update = async (req, res) => {
  try {
    const data = await service.updateCompany(req.params.id, req.body)
    return success(res, data, 'Company updated')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { getAll, getById, create, update }
