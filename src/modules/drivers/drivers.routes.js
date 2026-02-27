const express = require('express')
const router = express.Router()
const controller = require('./drivers.controller')
const { authenticate, authorize } = require('../../middlewares/auth')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

// Admin: view all devices in company
router.get('/devices', authenticate, authorize('admin'), controller.getDevices)

// Admin: verify a driver device
router.post('/devices/verify', authenticate, authorize('admin'),
  [body('app_uuid').notEmpty(), body('vehicle_id').isUUID()],
  validate, controller.verifyDevice
)

// Driver: register own device UUID
router.post('/devices/register', authenticate, authorize('driver'),
  [body('app_uuid').notEmpty()],
  validate, controller.registerDevice
)

module.exports = router
