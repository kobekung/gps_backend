const repo = require('./vehicles.repository')
const subRepo = require('../subscriptions/subscriptions.repository')

const getByCompany = (company_id) => repo.findByCompany(company_id)

const getById = async (id) => {
  const v = await repo.findById(id)
  if (!v) throw { status: 404, message: 'Vehicle not found' }
  return v
}

const create = async (company_id, data) => {
  const sub = await subRepo.getActive(company_id)
  if (!sub) throw { status: 403, message: 'No active subscription' }
  const vehicles = await repo.findByCompany(company_id)
  if (vehicles.length >= sub.max_vehicles) {
    throw { status: 403, message: `Vehicle limit reached (${sub.max_vehicles} max for your plan)` }
  }
  return repo.create({ ...data, company_id })
}

const update = async (id, data) => {
  const v = await repo.update(id, data)
  if (!v) throw { status: 404, message: 'Vehicle not found' }
  return v
}

module.exports = { getByCompany, getById, create, update }
