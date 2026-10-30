/**
 * Road Routing Service using OSRM Driving Engine
 * Provides accurate street/road paths suitable for bus, mini-bus, van, and cars.
 * Connects start, intermediate pickup stops, and destination terminus along real paved roads.
 */

// In-memory cache to prevent repeated network requests for identical stop sequences
const routeCache = new Map();

/**
 * Fetch vehicular driving route along paved roads for given coordinate sequence.
 * @param {Array<{lat: number, lng: number}>} points - List of stops in sequence
 * @returns {Promise<{roadCoords: Array<[number, number]>, distanceMeters: number, distanceText: string, durationSeconds: number, durationText: string, isRoad: boolean}>}
 */
export async function fetchRoadDrivingRoute(points) {
  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  // Filter only valid numeric lat/lng
  const validPoints = points.filter(
    (p) =>
      p &&
      typeof p.lat === 'number' &&
      typeof p.lng === 'number' &&
      !isNaN(p.lat) &&
      !isNaN(p.lng) &&
      p.lat !== 0 &&
      p.lng !== 0
  );

  if (validPoints.length < 2) {
    return null;
  }

  // OSRM expects: longitude,latitude separated by semicolons
  const coordsKey = validPoints
    .map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`)
    .join(';');

  if (routeCache.has(coordsKey)) {
    return routeCache.get(coordsKey);
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${coordsKey}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM coordinates are [lng, lat], convert to Leaflet [lat, lng]
        const roadLatLngs = route.geometry.coordinates.map(([lng, lat]) => [
          Math.round(lat * 1000000) / 1000000,
          Math.round(lng * 1000000) / 1000000,
        ]);

        const distKm = (route.distance / 1000).toFixed(1);
        const durMins = Math.max(1, Math.round(route.duration / 60));

        const result = {
          roadCoords: roadLatLngs,
          distanceMeters: route.distance,
          distanceText: `${distKm} km`,
          durationSeconds: route.duration,
          durationText: `~${durMins} mins`,
          isRoad: true,
        };

        routeCache.set(coordsKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Road routing request failed, falling back to direct road estimate:', err);
  }

  // Graceful fallback: interpolate between points
  const fallbackCoords = [];
  let totalDistKm = 0;

  for (let i = 0; i < validPoints.length - 1; i++) {
    const p1 = validPoints[i];
    const p2 = validPoints[i + 1];

    const dLat = p2.lat - p1.lat;
    const dLng = p2.lng - p1.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // Approx km
    totalDistKm += dist;

    const steps = 12;
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      fallbackCoords.push([p1.lat + dLat * t, p1.lng + dLng * t]);
    }
  }
  const last = validPoints[validPoints.length - 1];
  fallbackCoords.push([last.lat, last.lng]);

  const fallbackResult = {
    roadCoords: fallbackCoords,
    distanceMeters: Math.round(totalDistKm * 1000),
    distanceText: `${Math.max(0.5, totalDistKm).toFixed(1)} km`,
    durationSeconds: Math.round(totalDistKm * 180),
    durationText: `~${Math.max(2, Math.round(totalDistKm * 3))} mins`,
    isRoad: false,
  };

  return fallbackResult;
}
