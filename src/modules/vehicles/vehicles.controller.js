const service = require('./vehicles.service')
const { success, error } = require('../../utils/response')
const { imageUpload } = require('../../config/upload')

const getAll = async (req, res) => {
  try { return success(res, await service.getByCompany(req.user.company_id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const getById = async (req, res) => {
  try { return success(res, await service.getById(req.params.id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const create = async (req, res) => {
  try {
    const data = await service.create(req.user.company_id, req.body)
    return success(res, data, 'Vehicle created', 201)
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const update = async (req, res) => {
  try {
    const data = await service.update(req.params.id, req.body)
    return success(res, data, 'Vehicle updated')
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return error(res, 'No file uploaded', 400)
    const photo_url = `/uploads/${req.file.filename}`
    const data = await service.update(req.params.id, { photo_url })
    return success(res, data, 'Photo uploaded')
  } catch (err) { return error(res, err.message, err.status || 500) }
}

module.exports = { getAll, getById, create, update, uploadPhoto }
