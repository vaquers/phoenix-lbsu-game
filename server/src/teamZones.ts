export const TEAM_ZONE_COUNT = 31

export type ZoneBounds = {
  id: number
  x0: number
  x1: number
  y0: number
  y1: number
}

let cachedWidth = 0
let cachedZones: ZoneBounds[] = []

function buildZones(width: number, height: number): ZoneBounds[] {
  const base = Math.floor(width / TEAM_ZONE_COUNT)
  const remainder = width % TEAM_ZONE_COUNT
  const zones: ZoneBounds[] = []
  let x = 0
  for (let i = 0; i < TEAM_ZONE_COUNT; i++) {
    const w = base + (i < remainder ? 1 : 0)
    zones.push({ id: i, x0: x, x1: x + w, y0: 0, y1: height })
    x += w
  }
  return zones
}

function getZones(width: number, height: number): ZoneBounds[] {
  if (width !== cachedWidth || cachedZones.length === 0) {
    cachedWidth = width
    cachedZones = buildZones(width, height)
  }
  return cachedZones
}

export function getZoneBounds(zoneId: number, width: number, height: number): ZoneBounds | null {
  const zones = getZones(width, height)
  return zones[zoneId] ?? null
}

export function getZoneByPixel(x: number, y: number, width: number, height: number): number | null {
  if (x < 0 || y < 0 || x >= width || y >= height) return null
  const zones = getZones(width, height)
  const zone = zones.find((z) => x >= z.x0 && x < z.x1)
  return zone ? zone.id : null
}
