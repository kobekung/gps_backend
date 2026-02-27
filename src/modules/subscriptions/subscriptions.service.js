const repo = require('./subscriptions.repository')
const pkgRepo = require('../packages/packages.repository')

const getByCompany = (company_id) => repo.findByCompany(company_id)

const getActive = (company_id) => repo.getActive(company_id)

const subscribe = async (company_id, package_id, months = 1) => {
  const pkg = await pkgRepo.findById(package_id)
  if (!pkg) throw { status: 404, message: 'Package not found' }
  return repo.create({ company_id, package_id, months })
}

const cancel = async (id) => {
  const sub = await repo.cancel(id)
  if (!sub) throw { status: 404, message: 'Subscription not found' }
  return sub
}

module.exports = { getByCompany, getActive, subscribe, cancel }
