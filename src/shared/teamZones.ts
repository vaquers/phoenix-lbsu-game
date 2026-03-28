export const TEAM_ZONE_COUNT = 31

export type ZoneBounds = {
  id: number
  x0: number
  x1: number
  y0: number
  y1: number
}

let cachedKey = ''
let cachedZones: ZoneBounds[] = []

/**
 * Build near-square rectangular zones by rows.
 * Strategy: choose row count close to sqrt(N) and distribute columns per row.
 * For N=31 and square board, this yields 5 rows with [7,6,6,6,6] columns.
 */
function buildZones(width: number, height: number): ZoneBounds[] {
  const zones: ZoneBounds[] = []
  const rows = Math.max(1, Math.round(Math.sqrt(TEAM_ZONE_COUNT)))
  const baseCols = Math.floor(TEAM_ZONE_COUNT / rows)
  const extra = TEAM_ZONE_COUNT % rows

  const baseRowH = Math.floor(height / rows)
  const extraRowH = height % rows

  let zoneId = 0
  let y = 0
  for (let r = 0; r < rows; r++) {
    const cols = baseCols + (r < extra ? 1 : 0)
    const rowH = baseRowH + (r < extraRowH ? 1 : 0)
    const baseColW = Math.floor(width / cols)
    const extraColW = width % cols

    let x = 0
    for (let c = 0; c < cols; c++) {
      const colW = baseColW + (c < extraColW ? 1 : 0)
      zones.push({ id: zoneId++, x0: x, x1: x + colW, y0: y, y1: y + rowH })
      x += colW
      if (zoneId >= TEAM_ZONE_COUNT) break
    }
    y += rowH
    if (zoneId >= TEAM_ZONE_COUNT) break
  }
  return zones
}

function getZones(width: number, height: number): ZoneBounds[] {
  const key = `${width}x${height}`
  if (key !== cachedKey || cachedZones.length === 0) {
    cachedKey = key
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
  const zone = zones.find((z) => x >= z.x0 && x < z.x1 && y >= z.y0 && y < z.y1)
  return zone ? zone.id : null
}
