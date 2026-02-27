require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')

const { setupWebSocket } = require('./websocket')
const { startCronJobs } = require('./cron')

// Route imports
const authRoutes = require('./modules/auth/auth.routes')
const companiesRoutes = require('./modules/companies/companies.routes')
const usersRoutes = require('./modules/users/users.routes')
const packagesRoutes = require('./modules/packages/packages.routes')
const subscriptionsRoutes = require('./modules/subscriptions/subscriptions.routes')
const vehiclesRoutes = require('./modules/vehicles/vehicles.routes')
const driversRoutes = require('./modules/drivers/drivers.routes')
const sessionsRoutes = require('./modules/sessions/sessions.routes')
const locationsRoutes = require('./modules/locations/locations.routes')
const routesRoutes = require('./modules/routes/routes.routes')

const app = express()
const server = http.createServer(app)

// ─── Middlewares ─────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }))
app.use('/api/locations/ping', rateLimit({ windowMs: 1000, max: 5 })) // 5 pings/sec per IP

// Static files (uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ─── Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/companies', companiesRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/packages', packagesRoutes)
app.use('/api/subscriptions', subscriptionsRoutes)
app.use('/api/vehicles', vehiclesRoutes)
app.use('/api/drivers', driversRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/locations', locationsRoutes)
app.use('/api/routes', routesRoutes)

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// ─── Start ───────────────────────────────────────
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  setupWebSocket(server)
  startCronJobs()
})

module.exports = app
