const express = require('express')
const router = express.Router()
const controller = require('./companies.controller')
const { authenticate, authorize } = require('../../middlewares/auth')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

const isSuperAdmin = [authenticate, authorize('superadmin')]

// GET /api/companies
router.get('/', isSuperAdmin, controller.getAll)

// GET /api/companies/:id
router.get('/:id', isSuperAdmin, controller.getById)

// POST /api/companies
router.post('/', isSuperAdmin,
  [
    body('name').notEmpty(),
    body('admin_email').isEmail(),
    body('admin_password').isLength({ min: 8 }),
    body('admin_name').notEmpty(),
  ],
  validate,
  controller.create
)

// PATCH /api/companies/:id
router.patch('/:id', isSuperAdmin, controller.update)

module.exports = router
