const service = require('./packages.service')
const { success, error } = require('../../utils/response')

const getAll = async (req, res) => {
  try { return success(res, await service.getAll()) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const getById = async (req, res) => {
  try { return success(res, await service.getById(req.params.id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const create = async (req, res) => {
  try { return success(res, await service.create(req.body), 'Package created', 201) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const update = async (req, res) => {
  try { return success(res, await service.update(req.params.id, req.body), 'Package updated') }
  catch (err) { return error(res, err.message, err.status || 500) }
}

module.exports = { getAll, getById, create, update }
