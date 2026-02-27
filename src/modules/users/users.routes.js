const express = require('express')
const router = express.Router()
const controller = require('./users.controller')
const { authenticate, authorize } = require('../../middlewares/auth')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

// GET /api/users — admin sees own company, superadmin can pass ?companyId
router.get('/', authenticate, authorize('admin', 'superadmin'), controller.getByCompany)

// GET /api/users/company/:companyId — superadmin
router.get('/company/:companyId', authenticate, authorize('superadmin'), controller.getByCompany)

// POST /api/users/drivers — admin creates driver
router.post('/drivers', authenticate, authorize('admin'),
  [body('email').isEmail(), body('password').isLength({ min: 8 }), body('full_name').notEmpty()],
  validate,
  controller.createDriver
)

// PATCH /api/users/:id
router.patch('/:id', authenticate, authorize('admin', 'superadmin'), controller.updateUser)

module.exports = router
