const express = require('express')
const router = express.Router()
const controller = require('./locations.controller')
const { authenticate, authorize } = require('../../middlewares/auth')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

// Driver: send GPS ping
router.post('/ping', authenticate, authorize('driver'),
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('app_uuid').notEmpty(),
  ],
  validate, controller.ping
)

// Admin/Superadmin: get all live locations for company
router.get('/live', authenticate, authorize('admin', 'superadmin'), controller.getLive)

// Admin: get history for specific vehicle
router.get('/history/:vehicleId', authenticate, authorize('admin', 'superadmin'), controller.getHistory)

module.exports = router
