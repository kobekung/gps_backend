const repo = require('./companies.repository')
const usersRepo = require('../users/users.repository')
const bcrypt = require('bcryptjs')

const getAllCompanies = () => repo.findAll()

const getCompanyById = async (id) => {
  const company = await repo.findById(id)
  if (!company) throw { status: 404, message: 'Company not found' }
  return company
}

const createCompanyWithAdmin = async (data) => {
  const { name, code, logo_url, admin_name, admin_email, admin_password } = data
  const company = await repo.create({ name, code, logo_url })
  const hash = await bcrypt.hash(admin_password, 12)
  const admin = await usersRepo.create({
    company_id: company.id,
    email: admin_email,
    password_hash: hash,
    role: 'admin',
    full_name: admin_name,
  })
  return { company, admin: { id: admin.id, email: admin.email, role: admin.role } }
}

const updateCompany = async (id, data) => {
  const company = await repo.update(id, data)
  if (!company) throw { status: 404, message: 'Company not found' }
  return company
}

module.exports = { getAllCompanies, getCompanyById, createCompanyWithAdmin, updateCompany }
