const express = require('express')
const router = express.Router()
const controller = require('./vehicles.controller')
const { authenticate, authorize } = require('../../middlewares/auth')
const { imageUpload } = require('../../config/upload')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

const isAdmin = [authenticate, authorize('admin', 'superadmin')]

router.get('/', isAdmin, controller.getAll)
router.get('/:id', authenticate, controller.getById)
router.post('/', isAdmin,
  [body('license_plate').notEmpty(), body('vehicle_type').notEmpty()],
  validate, controller.create
)
router.patch('/:id', isAdmin, controller.update)
router.post('/:id/photo', authenticate, imageUpload.single('photo'), controller.uploadPhoto)

module.exports = router
