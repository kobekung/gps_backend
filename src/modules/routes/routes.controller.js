const service = require('./routes.service')
const { success, error } = require('../../utils/response')

const getAll = async (req, res) => {
  try { return success(res, await service.getByCompany(req.user.company_id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const getById = async (req, res) => {
  try { return success(res, await service.getById(req.params.id)) }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const uploadKML = async (req, res) => {
  try {
    if (!req.file) return error(res, 'No KML file uploaded', 400)
    const { name, description, color } = req.body
    const data = await service.createFromKML(
      req.user.company_id, req.user.id,
      name || 'Unnamed Route', description, color || '#FF0000',
      req.file.buffer
    )
    return success(res, data, 'Route imported from KML', 201)
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const createGeoJSON = async (req, res) => {
  try {
    const data = await service.createFromGeoJSON(req.user.company_id, req.user.id, req.body)
    return success(res, data, 'Route created', 201)
  } catch (err) { return error(res, err.message, err.status || 500) }
}

const update = async (req, res) => {
  try { return success(res, await service.update(req.params.id, req.body), 'Route updated') }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const remove = async (req, res) => {
  try { return success(res, await service.remove(req.params.id), 'Route deleted') }
  catch (err) { return error(res, err.message, err.status || 500) }
}

const exportGeoJSON = async (req, res) => {
  try {
    const geojson = await service.exportGeoJSON(req.params.id)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="route-${req.params.id}.geojson"`)
    return res.json(geojson)
  } catch (err) { return error(res, err.message, err.status || 500) }
}

module.exports = { getAll, getById, uploadKML, createGeoJSON, update, remove, exportGeoJSON }
