const express = require('express')
const router = express.Router()
const controller = require('./routes.controller')
const { authenticate, authorize } = require('../../middlewares/auth')
const { kmlUpload } = require('../../config/upload')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

const isAdmin = [authenticate, authorize('admin', 'superadmin')]

router.get('/', isAdmin, controller.getAll)
router.get('/:id', isAdmin, controller.getById)
router.get('/:id/export', isAdmin, controller.exportGeoJSON)

// Import KML from Google Maps export
router.post('/import/kml', isAdmin, kmlUpload.single('kml'), controller.uploadKML)

// Create from GeoJSON directly
router.post('/geojson', isAdmin,
  [body('name').notEmpty(), body('geojson').notEmpty()],
  validate, controller.createGeoJSON
)

router.patch('/:id', isAdmin, controller.update)
router.delete('/:id', isAdmin, controller.remove)

module.exports = router
