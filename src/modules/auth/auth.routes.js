const express = require('express')
const router = express.Router()
const controller = require('./auth.controller')
const { authenticate } = require('../../middlewares/auth')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

// POST /api/auth/login
router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  controller.login
)

// GET /api/auth/me
router.get('/me', authenticate, controller.getMe)

module.exports = router
