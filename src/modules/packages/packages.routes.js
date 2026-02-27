const express = require('express')
const router = express.Router()
const controller = require('./packages.controller')
const { authenticate, authorize } = require('../../middlewares/auth')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

// GET /api/packages — all authenticated users can view
router.get('/', authenticate, controller.getAll)
router.get('/:id', authenticate, controller.getById)

// Superadmin only
router.post('/', authenticate, authorize('superadmin'),
  [body('name').notEmpty(), body('price_monthly').isNumeric(), body('history_days').isInt({ min: 0 })],
  validate, controller.create
)
router.patch('/:id', authenticate, authorize('superadmin'), controller.update)

module.exports = router
