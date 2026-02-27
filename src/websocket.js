const WebSocket = require('ws')
const jwt = require('jsonwebtoken')
const jwtConfig = require('./config/jwt')

let wss = null
const clients = new Map() // companyId -> Set of ws clients

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server, path: '/ws' })

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost')
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(4001, 'No token')
      return
    }

    try {
      const user = jwt.verify(token, jwtConfig.secret)
      ws.user = user
      ws.isAlive = true

      // Group by company
      if (!clients.has(user.company_id)) clients.set(user.company_id, new Set())
      clients.get(user.company_id).add(ws)

      ws.on('pong', () => { ws.isAlive = true })
      ws.on('close', () => {
        if (clients.has(user.company_id)) {
          clients.get(user.company_id).delete(ws)
        }
      })
      ws.send(JSON.stringify({ event: 'connected', message: 'WebSocket connected' }))
    } catch (err) {
      ws.close(4001, 'Invalid token')
    }
  })

  // Heartbeat
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate()
      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  wss.on('close', () => clearInterval(interval))
  console.log('✅ WebSocket server ready at /ws')
  return wss
}

// Broadcast location update to all admins in same company
function broadcastLocation(company_id, payload) {
  if (!clients.has(company_id)) return
  const message = JSON.stringify({ event: 'location_update', data: payload })
  clients.get(company_id).forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(message)
  })
}

module.exports = { setupWebSocket, broadcastLocation }
