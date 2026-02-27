const { error } = require('../utils/response')

// Ensure admin can only access their own company's data
const sameCompany = (req, res, next) => {
  if (req.user.role === 'superadmin') return next()
  const requestedCompanyId = req.params.companyId || req.body.company_id
  if (requestedCompanyId && requestedCompanyId !== req.user.company_id) {
    return error(res, 'Forbidden: cannot access other company data', 403)
  }
  next()
}

module.exports = { sameCompany }
