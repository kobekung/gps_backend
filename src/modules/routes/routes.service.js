const repo = require('./routes.repository')
const { kmlToGeoJSON } = require('../../utils/kmlParser')

const getByCompany = (company_id) => repo.findByCompany(company_id)

const getById = async (id) => {
  const route = await repo.findById(id)
  if (!route) throw { status: 404, message: 'Route not found' }
  return route
}

const createFromKML = async (company_id, created_by, name, description, color, kmlBuffer) => {
  const kmlString = kmlBuffer.toString('utf-8')
  const { geojson, distanceKm } = await kmlToGeoJSON(kmlString)
  return repo.create({ company_id, created_by, name, description, color, geojson, kml_raw: kmlString, distance_km: distanceKm })
}

const createFromGeoJSON = async (company_id, created_by, data) => {
  const { name, description, color, geojson } = data
  return repo.create({ company_id, created_by, name, description, color, geojson, distance_km: 0 })
}

const update = async (id, data) => {
  const route = await repo.update(id, data)
  if (!route) throw { status: 404, message: 'Route not found' }
  return route
}

const remove = async (id) => {
  await repo.remove(id)
  return { deleted: true }
}

const exportGeoJSON = async (id) => {
  const route = await repo.findById(id)
  if (!route) throw { status: 404, message: 'Route not found' }
  return route.geojson
}

module.exports = { getByCompany, getById, createFromKML, createFromGeoJSON, update, remove, exportGeoJSON }
