const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')

const uploadDir = process.env.UPLOAD_LOCAL_PATH || './uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Only JPEG/PNG/WEBP images allowed'), false)
}

const kmlFilter = (req, file, cb) => {
  if (file.originalname.endsWith('.kml') || file.mimetype === 'application/vnd.google-earth.kml+xml') {
    cb(null, true)
  } else {
    cb(new Error('Only KML files allowed'), false)
  }
}

module.exports = {
  imageUpload: multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }),
  kmlUpload: multer({ storage: multer.memoryStorage(), fileFilter: kmlFilter, limits: { fileSize: 10 * 1024 * 1024 } }),
}
