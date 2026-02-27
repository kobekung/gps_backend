const express = require('express')
const router = express.Router()
const controller = require('./subscriptions.controller')
const { authenticate, authorize } = require('../../middlewares/auth')

router.get('/', authenticate, authorize('admin', 'superadmin'), controller.getByCompany)
router.get('/active', authenticate, authorize('admin'), controller.getActive)
router.get('/company/:companyId', authenticate, authorize('superadmin'), controller.getByCompany)
router.post('/', authenticate, authorize('admin'),
  require('express-validator').body('package_id').isUUID(),
  require('../../middlewares/validate').validate,
  controller.subscribe
)
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), controller.cancel)

module.exports = router
