const repo = require('./packages.repository')

const getAll = () => repo.findAll()

const getById = async (id) => {
  const pkg = await repo.findById(id)
  if (!pkg) throw { status: 404, message: 'Package not found' }
  return pkg
}

const create = (data) => repo.create(data)

const update = async (id, data) => {
  const pkg = await repo.update(id, data)
  if (!pkg) throw { status: 404, message: 'Package not found' }
  return pkg
}

module.exports = { getAll, getById, create, update }
