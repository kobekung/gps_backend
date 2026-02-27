# GPS Fleet Tracking Backend

## 🏗️ Structure
```
src/
├── app.js                    # Entry point
├── websocket.js              # WebSocket server
├── cron.js                   # Scheduled jobs
├── database/
│   ├── db.js                 # PG connection pool
│   ├── migrate.js            # Run migrations
│   └── seed.js               # Seed initial data
├── config/
│   ├── jwt.js
│   └── upload.js             # Multer config
├── utils/
│   ├── response.js           # Standard API responses
│   └── kmlParser.js          # KML → GeoJSON converter
├── middlewares/
│   ├── auth.js               # JWT authenticate + authorize
│   ├── validate.js           # express-validator
│   └── sameCompany.js        # Company isolation
└── modules/
    ├── auth/                 # Login, Me
    ├── companies/            # SuperAdmin: CRUD companies
    ├── users/                # Admin: manage drivers
    ├── packages/             # Subscription packages
    ├── subscriptions/        # Company subscriptions
    ├── vehicles/             # Vehicle management
    ├── drivers/              # Device UUID registration & verify
    ├── sessions/             # Check-in / Check-out
    ├── locations/            # GPS ping, live map, history
    └── routes/               # KML import, GeoJSON, draw routes
```

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Setup env
cp .env.example .env
# Edit .env with your DB credentials

# 3. Migrate DB
npm run migrate

# 4. Seed initial data (superadmin + packages)
npm run seed

# 5. Run dev
npm run dev
```

## 📡 API Endpoints

### Auth
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | All | Login |
| GET | /api/auth/me | All | Get current user |

### Companies (SuperAdmin only)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/companies | List all |
| GET | /api/companies/:id | Get one |
| POST | /api/companies | Create company + admin |
| PATCH | /api/companies/:id | Update |

### Packages
| Method | Path | Role |
|--------|------|------|
| GET | /api/packages | All |
| POST | /api/packages | SuperAdmin |
| PATCH | /api/packages/:id | SuperAdmin |

### Subscriptions
| Method | Path | Role |
|--------|------|------|
| GET | /api/subscriptions | Admin |
| GET | /api/subscriptions/active | Admin |
| POST | /api/subscriptions | Admin (subscribe) |
| DELETE | /api/subscriptions/:id | Admin |

### Vehicles
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/vehicles | List (with live location) |
| POST | /api/vehicles | Create (checks subscription limit) |
| PATCH | /api/vehicles/:id | Update |
| POST | /api/vehicles/:id/photo | Upload vehicle photo |

### Drivers / Devices
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | /api/drivers/devices | Admin | List all device UUIDs |
| POST | /api/drivers/devices/register | Driver | Register app UUID |
| POST | /api/drivers/devices/verify | Admin | Verify + assign vehicle |

### Sessions (Check-in/out)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | /api/sessions/my | Driver | My active session |
| POST | /api/sessions/checkin | Driver | Check in + photo |
| PATCH | /api/sessions/:id/checkout | Driver | Check out |
| GET | /api/sessions/active | Admin | All active sessions |

### Locations
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/locations/ping | Driver | Send GPS (5-10s interval) |
| GET | /api/locations/live | Admin | Live map data |
| GET | /api/locations/history/:vehicleId | Admin | History (with ?from=&to=) |

### Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/routes | List all routes |
| POST | /api/routes/import/kml | Upload KML from Google Maps |
| POST | /api/routes/geojson | Create from GeoJSON |
| GET | /api/routes/:id/export | Export as GeoJSON file |
| PATCH | /api/routes/:id | Update name/color/visibility |
| DELETE | /api/routes/:id | Delete |

## 🔌 WebSocket
Connect: `ws://localhost:3000/ws?token=<JWT>`

Events received:
- `connected` — on connect
- `location_update` — when any vehicle in your company moves

## 📍 Driver GPS Flow
1. Login → get JWT
2. Register device UUID → `POST /api/drivers/devices/register`
3. Admin verifies UUID → links to vehicle
4. Check-in → `POST /api/sessions/checkin` (with photo)
5. Ping GPS every 5-10s → `POST /api/locations/ping`
6. Check-out → `PATCH /api/sessions/:id/checkout`

## 🗺️ KML Import Flow (Google Maps → App)
1. Go to Google Maps → My Maps
2. Draw route → Export as KML
3. Upload to `POST /api/routes/import/kml`
4. Route appears on live map automatically
"# gps_backend" 
