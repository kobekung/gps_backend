const express = require('express')
const router = express.Router()
const controller = require('./sessions.controller')
const { authenticate, authorize } = require('../../middlewares/auth')
const { imageUpload } = require('../../config/upload')

// Driver endpoints
router.get('/my', authenticate, authorize('driver'), controller.getActive)
router.post('/checkin', authenticate, authorize('driver'), imageUpload.single('photo'), controller.checkIn)
router.patch('/:sessionId/checkout', authenticate, authorize('driver'), controller.checkOut)

// Admin: view all active sessions in company
router.get('/active', authenticate, authorize('admin'), controller.getActiveSessions)

module.exports = router
