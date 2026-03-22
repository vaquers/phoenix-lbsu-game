export function pixelKey(x: number, y: number): string {
  return `${x}:${y}`
}

export function parsePixelKey(key: string): [number, number] {
  const sep = key.indexOf(':')
  return [
    parseInt(key.substring(0, sep), 10),
    parseInt(key.substring(sep + 1), 10),
  ]
}

export function flatArrayToSparseMap(
  pixels: string[],
  width: number,
): Map<string, string> {
  const map = new Map<string, string>()
  for (let i = 0; i < pixels.length; i++) {
    const color = pixels[i]
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === '') {
      continue
    }
    const x = i % width
    const y = Math.floor(i / width)
    map.set(pixelKey(x, y), color)
  }
  return map
}
