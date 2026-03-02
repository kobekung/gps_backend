// src/modules/auth/auth.routes.js
const express = require('express')
const router = express.Router()
const controller = require('./auth.controller')
const { authenticate } = require('../../middlewares/auth')
const { body } = require('express-validator')
const { validate } = require('../../middlewares/validate')

// ของเดิม
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, controller.login)
router.get('/me', authenticate, controller.getMe)

// เพิ่มใหม่: Login ด้วย UUID ของ Device
router.post('/device-login', 
  [body('app_uuid').notEmpty()], 
  validate, 
  controller.deviceLogin
)

module.exports = router