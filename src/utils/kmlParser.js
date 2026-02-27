const xml2js = require('xml2js')

async function kmlToGeoJSON(kmlString) {
  const parser = new xml2js.Parser({ explicitArray: false })
  const result = await parser.parseStringPromise(kmlString)

  const kml = result.kml
  const document = kml.Document || kml
  const placemarks = []

  const extractPlacemarks = (folder) => {
    if (!folder) return
    if (folder.Placemark) {
      const pm = Array.isArray(folder.Placemark) ? folder.Placemark : [folder.Placemark]
      placemarks.push(...pm)
    }
    if (folder.Folder) {
      const folders = Array.isArray(folder.Folder) ? folder.Folder : [folder.Folder]
      folders.forEach(extractPlacemarks)
    }
  }
  extractPlacemarks(document)

  const features = []
  for (const pm of placemarks) {
    const name = pm.name || 'Unnamed'
    const geom = pm.LineString || pm.MultiGeometry?.LineString

    if (geom) {
      const coordsRaw = Array.isArray(geom) ? geom[0].coordinates : geom.coordinates
      const coordinates = coordsRaw
        .trim()
        .split(/\s+/)
        .map(c => {
          const [lng, lat, alt] = c.split(',').map(Number)
          return [lng, lat]
        })
        .filter(c => !isNaN(c[0]) && !isNaN(c[1]))

      features.push({
        type: 'Feature',
        properties: { name },
        geometry: { type: 'LineString', coordinates },
      })
    }
  }

  // Calculate rough distance in km
  let distanceKm = 0
  if (features.length > 0 && features[0].geometry.coordinates.length > 1) {
    const coords = features[0].geometry.coordinates
    for (let i = 1; i < coords.length; i++) {
      distanceKm += haversine(coords[i - 1], coords[i])
    }
  }

  return {
    geojson: { type: 'FeatureCollection', features },
    distanceKm: parseFloat(distanceKm.toFixed(3)),
  }
}

function haversine([lng1, lat1], [lng2, lat2]) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

module.exports = { kmlToGeoJSON }
