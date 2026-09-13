const SATURATION = 70
const LIGHTNESS = 80

const PASTEL_HUES = [0, 24, 48, 148, 164, 180, 196, 260, 280, 300, 320, 340]

function hashString(value: string): number {
  let hash = 2166136261

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100
  const l = lightness / 100
  const chroma = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12
    const value = l - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1)

    return Math.round(255 * value)
      .toString(16)
      .padStart(2, "0")
  }

  return `#${channel(0)}${channel(8)}${channel(4)}`
}

function colourAt(index: number): string {
  return hslToHex(PASTEL_HUES[index % PASTEL_HUES.length], SATURATION, LIGHTNESS)
}

function preferredIndex(name: string): number {
  return hashString(name) % PASTEL_HUES.length
}

function circularDistance(a: number, b: number, size: number): number {
  return Math.min(Math.abs(a - b), size - Math.abs(a - b))
}

function pickIndex(preferred: number, used: Set<number>): number {
  const size = PASTEL_HUES.length

  const take = (avoidAdjacent: boolean) => {
    for (let step = 0; step < size; step++) {
      const candidate = (preferred + step) % size

      if (used.has(candidate)) {
        continue
      }

      if (
        avoidAdjacent &&
        [...used].some((index) => circularDistance(candidate, index, size) <= 1)
      ) {
        continue
      }

      return candidate
    }

    return null
  }

  return take(used.size < size - 1) ?? take(false) ?? preferred
}

function colourForEntity(name: string): string {
  return colourAt(preferredIndex(name))
}

function coloursForEntities(names: string[]): Record<string, string> {
  const colours: Record<string, string> = {}
  const used = new Set<number>()
  const ordered = [...new Set(names)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

  for (const name of ordered) {
    const index = pickIndex(preferredIndex(name), used)
    used.add(index)
    colours[name] = colourAt(index)
  }

  return colours
}

export { colourForEntity, coloursForEntities }
