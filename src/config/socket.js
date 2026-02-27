const jwt = require('jsonwebtoken');
const db = require('../config/db');

const initSocket = (io) => {
  // Auth middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await db.query(
        'SELECT id, role, company_id FROM users WHERE id = $1 AND is_active = true',
        [decoded.id]
      );

      if (!result.rows[0]) return next(new Error('User not found'));
      socket.user = result.rows[0];
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`Socket connected: ${user.id} (${user.role})`);

    // Admin joins company room to receive live updates
    if (user.role === 'admin' || user.role === 'superadmin') {
      socket.join(`company_${user.company_id}`);
      console.log(`Admin joined room: company_${user.company_id}`);
    }

    // Driver joins their own room
    if (user.role === 'driver') {
      socket.join(`driver_${user.id}`);
    }

    // Driver can also push location via socket (alternative to HTTP POST)
    socket.on('location_update', async (data) => {
      try {
        const { latitude, longitude, speed, heading, accuracy } = data;

        const session = await db.query(
          `SELECT ds.id, ds.vehicle_id, u.company_id
           FROM driver_sessions ds
           JOIN users u ON u.id = ds.driver_id
           WHERE ds.driver_id = $1 AND ds.status = 'active' LIMIT 1`,
          [user.id]
        );

        if (!session.rows[0]) {
          socket.emit('error', { message: 'No active session' });
          return;
        }

        const { id: sessionId, vehicle_id, company_id } = session.rows[0];

        // Upsert location
        await db.query(
          `INSERT INTO vehicle_locations (vehicle_id, session_id, driver_id, latitude, longitude, speed, heading, accuracy, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (vehicle_id) DO UPDATE SET
             latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
             speed = EXCLUDED.speed, heading = EXCLUDED.heading,
             accuracy = EXCLUDED.accuracy, updated_at = NOW()`,
          [vehicle_id, sessionId, user.id, latitude, longitude, speed || 0, heading || 0, accuracy || null]
        );

        // Broadcast to admin room
        io.to(`company_${company_id}`).emit('location_update', {
          vehicle_id,
          driver_id: user.id,
          latitude,
          longitude,
          speed: speed || 0,
          heading: heading || 0,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Socket location error:', err);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user.id}`);
    });
  });
};

module.exports = initSocket;
