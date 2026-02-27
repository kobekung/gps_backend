const repo = require('./users.repository')
const bcrypt = require('bcryptjs')

const getUsersByCompany = (company_id) => repo.findByCompany(company_id)

const createDriver = async (company_id, data) => {
  const { email, password, full_name, phone } = data
  console.log(company_id+"shgig")
  // const existing = await repo.findById(email)
  console.log("shbfgiegh")
  const hash = await bcrypt.hash(password, 12)
  return repo.create({ company_id, email, password_hash: hash, role: 'driver', full_name, phone })
}

const updateUser = async (id, data) => {
  const user = await repo.update(id, data)
  if (!user) throw { status: 404, message: 'User not found' }
  return user
}

module.exports = { getUsersByCompany, createDriver, updateUser }
